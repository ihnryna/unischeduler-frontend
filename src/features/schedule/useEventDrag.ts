import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from 'react'

import type {CalendarEvent} from '../../types/schedule'
import {computeMovedTimes, isSameTimes, type EventMove} from './eventMove'
import type {HourRange} from './gridHours'

/** Mouse/pen: pixels the pointer must travel before a press becomes a drag (else a click). */
const DRAG_THRESHOLD_PX = 5
/** Touch: hold this long to pick a card up; moving earlier scrolls the page instead. */
const TOUCH_HOLD_MS = 350
const TOUCH_SLOP_PX = 8
/** Cards are drawn 4px below their start time (see `ScheduleEvent`). */
const CARD_TOP_INSET_PX = 4

/** Props spread onto a draggable card. */
export type EventDragHandlers = {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void
}

/** Where the card being dragged would land; drawn as a preview in that day's column. */
export type EventDragPreview = {
    event: CalendarEvent
    dayIndex: number
    move: EventMove
    /** True after the drop, while the change is being saved. */
    isSaving: boolean
}

type UseEventDragOptions = {
    /** Element holding the day columns (`[data-day-index]`) and `.hour-slot` rows. */
    containerRef: RefObject<HTMLElement | null>
    hourRange: HourRange
    weekDays: {dayIndex: number; isoDate: string}[]
    /** Which events can be dragged. Without it (or `onMove`) none can. */
    canMove?: (event: CalendarEvent) => boolean
    /**
     * Saves the move. The preview stays (in its saving state) until the promise settles, so
     * the caller should resolve only after the schedule has been reloaded.
     */
    onMove?: (event: CalendarEvent, move: EventMove) => Promise<unknown>
}

type DragSession = {
    event: CalendarEvent
    pointerId: number
    pointerType: string
    startX: number
    startY: number
    lastX: number
    lastY: number
    /** Distance from the card's top edge to the pointer, so the card does not jump. */
    offsetY: number
    isActive: boolean
    holdTimer: number | null
    target: {dayIndex: number; move: EventMove} | null
    removeListeners: () => void
}

/**
 * Pointer-based drag-and-drop of cards in the week grid. A mouse or pen drag starts after
 * a few pixels of movement; on touch screens the card is picked up after a short hold, so
 * normal swipes still scroll. While dragging, the returned `preview` says where the card
 * would land (snapped to 15 minutes, duration kept); Esc cancels. A short press is left
 * alone, so the card's click (open details) keeps working, and the click that ends a drag
 * is swallowed. Nothing is changed until `onMove` saves the drop (no optimistic update).
 */
export function useEventDrag({
    containerRef,
    hourRange,
    weekDays,
    canMove,
    onMove,
}: UseEventDragOptions): {
    preview: EventDragPreview | null
    isDragging: boolean
    /** Handlers for the event's card, or `undefined` when it cannot be moved. */
    getDragHandlers: (event: CalendarEvent) => EventDragHandlers | undefined
} {
    const [preview, setPreview] = useState<EventDragPreview | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const sessionRef = useRef<DragSession | null>(null)
    const suppressClickRef = useRef(false)
    const isSavingRef = useRef(false)

    // Read the latest props from window listeners without re-binding them.
    const optionsRef = useRef({hourRange, weekDays, onMove})
    useEffect(() => {
        optionsRef.current = {hourRange, weekDays, onMove}
    })

    const endSession = useCallback(() => {
        const session = sessionRef.current
        if (!session) return
        if (session.holdTimer !== null) window.clearTimeout(session.holdTimer)
        session.removeListeners()
        sessionRef.current = null
        setIsDragging(false)
    }, [])

    // Clean up if the grid unmounts mid-drag.
    useEffect(() => endSession, [endSession])

    // A touch drag must stop the page from scrolling. Touch listeners added during a gesture
    // cannot cancel it, so a non-passive one stays on the grid and acts only while dragging.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const blockScroll = (touchEvent: TouchEvent) => {
            if (sessionRef.current?.isActive && touchEvent.cancelable) touchEvent.preventDefault()
        }
        container.addEventListener('touchmove', blockScroll, {passive: false})
        return () => container.removeEventListener('touchmove', blockScroll)
    }, [containerRef])

    const updateTarget = useCallback(() => {
        const session = sessionRef.current
        const container = containerRef.current
        if (!session?.isActive || !container) return

        const columns = Array.from(
            container.querySelectorAll<HTMLElement>('[data-day-index]'),
        )
            .map((element) => ({
                dayIndex: Number(element.dataset.dayIndex),
                rect: element.getBoundingClientRect(),
            }))
            .filter((column) => column.rect.width > 0)
        const hourSlot = container.querySelector<HTMLElement>('.hour-slot')
        const hourHeight = hourSlot?.getBoundingClientRect().height ?? 0
        if (columns.length === 0 || hourHeight <= 0) return

        const x = session.lastX
        const column =
            columns.find(({rect}) => x >= rect.left && x < rect.right) ??
            columns.reduce((nearest, current) => {
                const distance = (rect: DOMRect) =>
                    Math.min(Math.abs(x - rect.left), Math.abs(x - rect.right))
                return distance(current.rect) < distance(nearest.rect) ? current : nearest
            })
        const day = optionsRef.current.weekDays.find(({dayIndex}) => dayIndex === column.dayIndex)
        if (!day) return

        const {hourRange: range} = optionsRef.current
        const topPx = session.lastY - session.offsetY - column.rect.top - CARD_TOP_INSET_PX
        const move = computeMovedTimes(session.event, day.isoDate, range.first + topPx / hourHeight, range)

        const previous = session.target
        if (
            previous &&
            previous.dayIndex === column.dayIndex &&
            previous.move.startsAt === move.startsAt
        ) {
            return
        }
        session.target = {dayIndex: column.dayIndex, move}
        setPreview({event: session.event, dayIndex: column.dayIndex, move, isSaving: false})
    }, [containerRef])

    const activate = useCallback(() => {
        const session = sessionRef.current
        if (!session || session.isActive) return
        session.isActive = true
        setIsDragging(true)
        updateTarget()
    }, [updateTarget])

    const cancelDrag = useCallback(() => {
        const wasActive = sessionRef.current?.isActive
        endSession()
        if (wasActive) setPreview(null)
    }, [endSession])

    const finishDrag = useCallback(() => {
        const session = sessionRef.current
        if (!session) return
        const {isActive, target, event} = session
        endSession()
        if (!isActive) return // a plain click: let it through

        // The click that follows pointerup must not open the details modal.
        suppressClickRef.current = true
        window.setTimeout(() => {
            suppressClickRef.current = false
        }, 0)

        const save = optionsRef.current.onMove
        if (!target || !save || isSameTimes(event, target.move)) {
            setPreview(null)
            return
        }

        isSavingRef.current = true
        setPreview({event, dayIndex: target.dayIndex, move: target.move, isSaving: true})
        save(event, target.move)
            .catch(() => undefined)
            .finally(() => {
                isSavingRef.current = false
                setPreview(null)
            })
    }, [endSession])

    const getDragHandlers = useCallback(
        (event: CalendarEvent): EventDragHandlers | undefined => {
            if (!onMove || !canMove?.(event)) return undefined
            return {
                onPointerDown: (pointerEvent) => {
                    // Primary button only; links and the delete button keep their own action.
                    if (pointerEvent.button !== 0 || !pointerEvent.isPrimary) return
                    if ((pointerEvent.target as Element).closest('a, .lesson-delete-btn')) return
                    if (sessionRef.current || isSavingRef.current) return

                    const card = pointerEvent.currentTarget.getBoundingClientRect()
                    const {pointerId, pointerType, clientX, clientY} = pointerEvent

                    const onPointerMove = (moveEvent: PointerEvent) => {
                        const session = sessionRef.current
                        if (!session || moveEvent.pointerId !== session.pointerId) return
                        session.lastX = moveEvent.clientX
                        session.lastY = moveEvent.clientY
                        if (session.isActive) {
                            updateTarget()
                            return
                        }
                        const distance = Math.hypot(
                            moveEvent.clientX - session.startX,
                            moveEvent.clientY - session.startY,
                        )
                        if (session.pointerType === 'touch') {
                            if (distance > TOUCH_SLOP_PX) endSession() // the user is scrolling
                        } else if (distance >= DRAG_THRESHOLD_PX) {
                            activate()
                        }
                    }
                    const onPointerUp = (upEvent: PointerEvent) => {
                        if (upEvent.pointerId === sessionRef.current?.pointerId) finishDrag()
                    }
                    const onPointerCancel = (cancelEvent: PointerEvent) => {
                        if (cancelEvent.pointerId === sessionRef.current?.pointerId) cancelDrag()
                    }
                    const onKeyDown = (keyEvent: KeyboardEvent) => {
                        if (keyEvent.key === 'Escape' && sessionRef.current?.isActive) {
                            keyEvent.preventDefault()
                            cancelDrag()
                        }
                    }
                    // A long press on touch screens would open the context menu.
                    const onContextMenu = (menuEvent: Event) => {
                        if (sessionRef.current?.pointerType === 'touch') menuEvent.preventDefault()
                    }

                    window.addEventListener('pointermove', onPointerMove)
                    window.addEventListener('pointerup', onPointerUp)
                    window.addEventListener('pointercancel', onPointerCancel)
                    window.addEventListener('keydown', onKeyDown)
                    window.addEventListener('contextmenu', onContextMenu)

                    sessionRef.current = {
                        event,
                        pointerId,
                        pointerType,
                        startX: clientX,
                        startY: clientY,
                        lastX: clientX,
                        lastY: clientY,
                        offsetY: clientY - card.top,
                        isActive: false,
                        holdTimer:
                            pointerType === 'touch'
                                ? window.setTimeout(activate, TOUCH_HOLD_MS)
                                : null,
                        target: null,
                        removeListeners: () => {
                            window.removeEventListener('pointermove', onPointerMove)
                            window.removeEventListener('pointerup', onPointerUp)
                            window.removeEventListener('pointercancel', onPointerCancel)
                            window.removeEventListener('keydown', onKeyDown)
                            window.removeEventListener('contextmenu', onContextMenu)
                        },
                    }
                },
                onClickCapture: (clickEvent) => {
                    if (suppressClickRef.current) {
                        clickEvent.preventDefault()
                        clickEvent.stopPropagation()
                    }
                },
            }
        },
        [activate, canMove, cancelDrag, endSession, finishDrag, onMove, updateTarget],
    )

    return {preview, isDragging, getDragHandlers}
}
