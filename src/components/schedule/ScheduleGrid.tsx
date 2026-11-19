import {useRef} from 'react'

import type {CalendarEvent} from '../../types/schedule'
import type {EventMove} from '../../features/schedule/eventMove'
import {getHourRange, getHourRows} from '../../features/schedule/gridHours'
import {useEventDrag} from '../../features/schedule/useEventDrag'
import {getWeekDays} from '../../utils/dateUtils'
import {ScheduleEvent} from './ScheduleEvent'

type ScheduleGridProps = {
    events: CalendarEvent[]
    selectedDay: number | null
    onSelectDay: (dayIndex: number) => void
    weekOffset: number
    /** Opens an event's details when its card is clicked. Without it the cards are static. */
    onOpenEvent?: (event: CalendarEvent) => void
    onDeleteEvent?: (event: CalendarEvent) => void
    /** Which events show a delete button. Without it (or `onDeleteEvent`) none do. */
    canDeleteEvent?: (event: CalendarEvent) => boolean
    /**
     * Saves an event dragged to a new day/time of the shown week. Resolve it once the
     * schedule shows the result: the drop preview stays until then. Without it (or
     * `canMoveEvent`) nothing can be dragged.
     */
    onMoveEvent?: (event: CalendarEvent, move: EventMove) => Promise<unknown>
    /** Which events can be dragged. */
    canMoveEvent?: (event: CalendarEvent) => boolean
}

const eventKey = (event: CalendarEvent) => `${event.eventType}-${event.eventId}`

export function ScheduleGrid({
    events,
    selectedDay,
    onSelectDay,
    weekOffset,
    onOpenEvent,
    onDeleteEvent,
    canDeleteEvent,
    onMoveEvent,
    canMoveEvent,
}: Readonly<ScheduleGridProps>) {
    const weekDays = getWeekDays(weekOffset)
    const bodyRef = useRef<HTMLDivElement>(null)

    const getDayIndex = (event: CalendarEvent) => {
        const sundayBasedDay = new Date(event.startsAt).getDay()
        return (sundayBasedDay + 6) % 7
    }

    const visibleEvents = events.filter(
        (event) => selectedDay === null || getDayIndex(event) === selectedDay,
    )

    // Range from all events, not only the selected day, so the grid does not jump
    // when a day is selected.
    const hourRange = getHourRange(events)
    const hours = getHourRows(hourRange)

    const {preview, isDragging, getDragHandlers} = useEventDrag({
        containerRef: bodyRef,
        hourRange,
        weekDays,
        canMove: canMoveEvent,
        onMove: onMoveEvent,
    })
    const previewKey = preview ? eventKey(preview.event) : null

    return (
        <section className={`calendar${isDragging ? ' calendar-dragging' : ''}`} id="calendar">
            <div className="calendar-header">
                <div className="time-header" aria-hidden="true" />

                {weekDays.map((day) => (
                    <button
                        className={`day-header ${
                            selectedDay === day.dayIndex ? 'selected' : ''
                        } ${day.isToday ? 'is-today' : ''}`}
                        key={day.isoDate}
                        onClick={() => onSelectDay(day.dayIndex)}
                        aria-pressed={selectedDay === day.dayIndex}
                        title={day.isToday ? `${day.fullName} (Сьогодні)` : day.fullName}
                    >
                        <span>{day.name}</span>
                        <strong>{day.date}</strong>
                    </button>
                ))}
            </div>

            <div className="calendar-body" ref={bodyRef}>
                <div className="time-column">
                    {hours.map((hour) => (
                        <div className="time-label" key={hour}>
                            {String(hour).padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                {weekDays.map((day) => (
                    <div
                        className={`day-column ${
                            selectedDay === day.dayIndex ? 'day-column-selected' : ''
                        } ${day.isToday ? 'day-column-today' : ''}`}
                        key={day.isoDate}
                        data-day-index={day.dayIndex}
                    >
                        {hours.map((hour) => (
                            <div className="hour-slot" key={hour} />
                        ))}

                        {visibleEvents
                            .filter((event) => getDayIndex(event) === day.dayIndex)
                            .map((event) => (
                                <ScheduleEvent
                                    key={eventKey(event)}
                                    event={event}
                                    firstHour={hourRange.first}
                                    onOpen={onOpenEvent ? () => onOpenEvent(event) : undefined}
                                    onDelete={
                                        onDeleteEvent && canDeleteEvent?.(event)
                                            ? () => onDeleteEvent(event)
                                            : undefined
                                    }
                                    dragHandlers={getDragHandlers(event)}
                                    dragState={
                                        eventKey(event) === previewKey ? 'source' : undefined
                                    }
                                />
                            ))}

                        {preview?.dayIndex === day.dayIndex && (
                            <ScheduleEvent
                                event={{...preview.event, ...preview.move}}
                                firstHour={hourRange.first}
                                dragState={preview.isSaving ? 'saving' : 'preview'}
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
