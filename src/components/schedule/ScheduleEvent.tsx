import type {CalendarEvent, EventType} from '../../types/schedule'
import {HOUR_HEIGHT} from '../../features/schedule/scheduleConfig'
import {formatTime} from "../../utils/formatTime.ts";

type ScheduleEventProps = {
    event: CalendarEvent
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

export function ScheduleEvent({event}: Readonly<ScheduleEventProps>) {
    const startsAt = hoursFromStartOfDay(event.startsAt)
    const endsAt = hoursFromStartOfDay(event.endsAt)

    return (
        <article className={`lesson-card lesson-${eventColors[event.eventType]}`}
                 style={{
                     top: (startsAt - 8) * HOUR_HEIGHT + 4,
                     height: (endsAt - startsAt) * HOUR_HEIGHT - 8,
                 }}>
            <span className="lesson-time">
                {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
            </span>
            <strong className="lesson-title">
                {event.name}
            </strong>
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
        </article>
    )
}
