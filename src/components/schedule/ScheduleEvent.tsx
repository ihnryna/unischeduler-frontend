import type {CalendarEvent, EventType} from '../../types/schedule'
import {HOUR_HEIGHT} from '../../features/schedule/scheduleConfig'
import {useSubjectColors} from '../../features/schedule/subjectColors'
import {formatTime} from '../../utils/formatTime'
import {formatWeeksList} from '../../utils/dateUtils'
import {getMeetingHref} from '../../features/events/personalEventValidation'

type ScheduleEventProps = {
    event: CalendarEvent
    /** When set, the card is a button that opens the event's details (FE-18). */
    onOpen?: () => void
    /** When set, a trash button opens the delete confirmation (own personal events). */
    onDelete?: () => void
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
 * with `onOpen` the whole card is a button that opens the event's details (FE-18). A
 * meeting-link location is rendered as a separate "Онлайн-зустріч" link. A class the student
 * hid (shown only when the page asks for hidden classes) is drawn faded and labelled.
 */
export function ScheduleEvent({event, onOpen, onDelete}: Readonly<ScheduleEventProps>) {
    const startsAt = hoursFromStartOfDay(event.startsAt)
    const endsAt = hoursFromStartOfDay(event.endsAt)
    const {colors} = useSubjectColors()

    const cardBackground =
        colors[event.name] ??
        (event.eventType === 'PERSONAL' ? '#c7d8ff' : '#d9c7f0')

    const isHidden = Boolean(event.occurrence?.isHidden)
    const className = `lesson-card lesson-${eventColors[event.eventType]}${
        isHidden ? ' lesson-card-hidden' : ''
    }`
    const openLabel = event.eventType === 'PERSONAL' ? 'Деталі події' : 'Деталі заняття'
    const meetingHref = getMeetingHref(event.location)
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
            <span className="lesson-type">
                {isHidden ? 'Приховано вами' : eventLabels[event.eventType]}
            </span>
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

    if (onOpen || onDelete) {
        return (
            <article className={`${className} lesson-card-editable`} style={style}>
                {onOpen && (
                    <button
                        type="button"
                        className="lesson-card-hit"
                        onClick={onOpen}
                        aria-haspopup="dialog"
                        title={openLabel}
                    >
                        <span className="visually-hidden">{openLabel}: {event.name}</span>
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
        <article className={className} style={style}>
            {content}
        </article>
    )
}
