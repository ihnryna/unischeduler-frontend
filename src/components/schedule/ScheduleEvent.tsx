import type {CalendarEvent, EventType} from '../../types/schedule'
import {getEventHours} from '../../features/schedule/gridHours'
import {CLASS_KIND_LABELS, getClassKind} from '../../features/schedule/classDetails'
import {useSubjectColors} from '../../features/schedule/subjectColors'
import {formatTime} from '../../utils/formatTime'
import {getMeetingHref} from '../../features/events/personalEventValidation'
import type {EventDragHandlers} from '../../features/schedule/useEventDrag'

type ScheduleEventProps = {
    event: CalendarEvent
    /** First hour row of the grid (e.g. 8 for 08:00); the card is positioned relative to it. */
    firstHour: number
    /** When set, the card is a button that opens the event's details (FE-18). */
    onOpen?: () => void
    /** When set, a trash button opens the delete confirmation (own personal events). */
    onDelete?: () => void
    /** When set, the card can be dragged to another time or day (see `useEventDrag`). */
    dragHandlers?: EventDragHandlers
    /**
     * Drag-and-drop look: `source` fades the card being moved; `preview` is the outline of
     * where it would land, `saving` the same outline while the move is being saved.
     */
    dragState?: 'source' | 'preview' | 'saving'
}

const eventLabels: Record<EventType, string> = {
    COURSE_CLASS: 'Заняття',
    CLASS_OVERRIDE: 'Змінене заняття',
    PERSONAL: 'Особиста подія',
}

const eventColors: Record<EventType, string> = {
    COURSE_CLASS: 'purple',
    CLASS_OVERRIDE: 'mint',
    PERSONAL: 'blue',
}

/**
 * One event card in the week grid, positioned by its start/end time. It shows the name, the
 * class type, the place and the teacher, centred vertically and aligned to the start; everything
 * else is in the details modal. Read-only by default; with
 * `onOpen` the whole card is a button that opens the event's details (FE-18). A meeting-link
 * location is rendered as a separate "Онлайн-зустріч" link. A class the student hid (shown
 * only when the page asks for hidden classes) is drawn faded with a struck-through name.
 */
export function ScheduleEvent({
    event,
    firstHour,
    onOpen,
    onDelete,
    dragHandlers,
    dragState,
}: Readonly<ScheduleEventProps>) {
    const {start, end} = getEventHours(event)
    const {colors} = useSubjectColors()

    const cardBackground =
        colors[event.name] ??
        (event.eventType === 'PERSONAL' ? '#c7d8ff' : '#d9c7f0')

    const isHidden = Boolean(event.occurrence?.isHidden)
    const className = [
        'lesson-card',
        `lesson-${eventColors[event.eventType]}`,
        isHidden && 'lesson-card-hidden',
        dragHandlers && 'lesson-card-draggable',
        dragState === 'source' && 'lesson-card-drag-source',
        (dragState === 'preview' || dragState === 'saving') && 'lesson-card-drag-preview',
    ]
        .filter(Boolean)
        .join(' ')
    const openLabel = event.eventType === 'PERSONAL' ? 'Деталі події' : 'Деталі заняття'
    const meetingHref = getMeetingHref(event.location)
    // Row height comes from the --hour-height CSS custom property (layout.css), so the card
    // always lines up with the hour rows drawn by CSS.
    const style = {
        top: `calc(${start - firstHour} * var(--hour-height) + 4px)`,
        height: `calc(${end - start} * var(--hour-height) - 8px)`,
        backgroundColor: cardBackground,
    }

    // Class type: the kind of a university class (lecture, seminar, lab) when it is known,
    // otherwise the event type ("Заняття", "Змінене заняття", "Особиста подія").
    const classKind = event.eventType === 'PERSONAL' ? null : getClassKind(event)
    const typeLabel = classKind ? CLASS_KIND_LABELS[classKind] : eventLabels[event.eventType]

    // The card shows the name, type, place and teacher; time and the hidden state are in the
    // accessible label (and the tooltip), the rest is in the details modal.
    const timeRange = `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}`
    const accessibleSummary = [
        event.name,
        isHidden ? 'приховано вами' : typeLabel.toLowerCase(),
        timeRange,
    ].join(', ')

    const content = (
        <>
            <strong className="lesson-title">{event.name}</strong>
            <span className="lesson-type">{typeLabel}</span>
            {meetingHref ? (
                <a
                    className="lesson-detail lesson-link"
                    href={meetingHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={meetingHref}
                >
                    <span aria-hidden="true">↗ </span>
                    Онлайн-зустріч
                    <span className="visually-hidden"> (відкриється в новій вкладці)</span>
                </a>
            ) : event.location && (
                <span className="lesson-detail">{event.location}</span>
            )}
            {event.teacher && (
                <span className="lesson-teacher">{event.teacher}</span>
            )}
        </>
    )

    // Outline of where a dragged card would land: the new time is the point of it.
    if (dragState === 'preview' || dragState === 'saving') {
        return (
            <article className={className} style={style} aria-hidden="true">
                <span className="lesson-drag-time">
                    {dragState === 'saving' ? 'Зберігаємо… ' : ''}
                    {timeRange}
                </span>
                <strong className="lesson-title">{event.name}</strong>
            </article>
        )
    }

    if (onOpen || onDelete) {
        return (
            <article
                className={`${className} lesson-card-editable`}
                style={style}
                {...dragHandlers}
            >
                {onOpen && (
                    <button
                        type="button"
                        className="lesson-card-hit"
                        onClick={onOpen}
                        aria-haspopup="dialog"
                        title={`${event.name} · ${timeRange}`}
                    >
                        <span className="visually-hidden">{openLabel}: {accessibleSummary}</span>
                    </button>
                )}
                {onDelete && (
                    <span className="lesson-card-actions">
                        <button
                            type="button"
                            className="lesson-delete-btn"
                            onClick={onDelete}
                            aria-haspopup="dialog"
                            aria-label={`Видалити подію: ${event.name}`}
                            title="Видалити подію"
                        >
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 3.5h10"/>
                                <path d="M5.5 3.5V2h3v1.5"/>
                                <path d="M3.5 3.5l.6 8.5h5.8l.6-8.5"/>
                                <path d="M6 6v3.5M8 6v3.5"/>
                            </svg>
                        </button>
                    </span>
                )}
                {content}
            </article>
        )
    }

    return (
        <article className={className} style={style} title={`${event.name} · ${timeRange}`} aria-label={accessibleSummary}>
            {content}
        </article>
    )
}
