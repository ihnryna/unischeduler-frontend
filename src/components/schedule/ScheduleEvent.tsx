import type {CalendarEvent, EventType} from '../../types/schedule'
import {HOUR_HEIGHT} from '../../features/schedule/scheduleConfig'
import {useSubjectColors} from '../../features/schedule/subjectColors'
import {formatTime} from '../../utils/formatTime'
import {formatWeeksList} from '../../utils/dateUtils'

type ScheduleEventProps = {
    event: CalendarEvent
    /**
     * When set, the card is a button that opens the event's edit form (own personal
     * events only; university classes are always read-only).
     */
    onEdit?: () => void
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

function hoursFromStartOfDay(value: string) {
    const date = new Date(value)
    return date.getHours() + date.getMinutes() / 60
}

/**
 * One event card in the week grid, positioned by its start/end time. Read-only by default;
 * with `onEdit` it becomes a button that opens the edit form (FE-23).
 */
export function ScheduleEvent({event, onEdit}: Readonly<ScheduleEventProps>) {
    const startsAt = hoursFromStartOfDay(event.startsAt)
    const endsAt = hoursFromStartOfDay(event.endsAt)
    const {colors} = useSubjectColors()

    const cardBackground =
        colors[event.name] ??
        (event.eventType === 'PERSONAL' ? '#c7d8ff' : '#d9c7f0')

    const className = `lesson-card lesson-${eventColors[event.eventType]}`
    const style = {
        top: (startsAt - 8) * HOUR_HEIGHT + 4,
        height: (endsAt - startsAt) * HOUR_HEIGHT - 8,
        backgroundColor: cardBackground,
    }

    const content = (
        <>
            <span className="lesson-time">
                {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
            </span>
            <strong className="lesson-title">{event.name}</strong>
            <span className="lesson-type">{eventLabels[event.eventType]}</span>
            {event.location && (
                <span className="lesson-detail">
                    <span aria-hidden="true">-</span>
                    {event.location}
                </span>
            )}
            {event.teacher && (
                <span className="lesson-teacher">{event.teacher}</span>
            )}
            {event.weeks && event.weeks.length > 0 && (
                <span className="lesson-weeks" title={`Тижні: ${event.weeks.join(', ')}`}>
                    🗓️ {formatWeeksList(event.weeks)} тиж.
                </span>
            )}
        </>
    )

    if (onEdit) {
        return (
            <button
                type="button"
                className={`${className} lesson-card-editable`}
                style={style}
                onClick={onEdit}
                aria-haspopup="dialog"
                title="Редагувати подію"
            >
                <span className="visually-hidden">Редагувати подію: </span>
                <span className="lesson-edit-icon" aria-hidden="true">✎</span>
                {content}
            </button>
        )
    }

    return (
        <article className={className} style={style}>
            {content}
        </article>
    )
}
