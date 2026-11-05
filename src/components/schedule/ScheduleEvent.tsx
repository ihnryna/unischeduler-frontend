import type {Lesson} from '../../types/schedule'
import {HOUR_HEIGHT} from '../../features/schedule/scheduleConfig'
import {formatTime} from "../../utils/formatTime.ts";

type ScheduleEventProps = {
    lesson: Lesson
}

export function ScheduleEvent({lesson}: Readonly<ScheduleEventProps>) {
    return (
        <article className={`lesson-card lesson-${lesson.color}`}
                 key={lesson.id}
                 style={{
                     top: (lesson.start - 8) * HOUR_HEIGHT + 4,
                     height: (lesson.end - lesson.start) * HOUR_HEIGHT - 8,
                 }}>
            <span className="lesson-time">
                {formatTime(lesson.start)} – {formatTime(lesson.end)}
            </span>
            <strong className="lesson-title">
                {lesson.title}
            </strong>
            <span className="lesson-type">{lesson.type}</span>
            <span className="lesson-detail">
                <span aria-hidden="true">-</span>
                {lesson.room}
            </span>
            <span className="lesson-teacher">{lesson.teacher}</span>
        </article>
    )
}