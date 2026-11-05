import type {Lesson} from '../../types/schedule'
import {DAYS, HOURS} from '../../features/schedule/scheduleConfig'
import {ScheduleEvent} from './ScheduleEvent'

type ScheduleGridProps = {
    lessons: Lesson[]
    selectedDay: number | null
    onSelectDay: (dayIndex: number) => void
    weekOffset: number
}

export function ScheduleGrid({
                                 lessons,
                                 selectedDay,
                                 onSelectDay,
                                 weekOffset,
                             }: Readonly<ScheduleGridProps>) {

    const visibleLessons = lessons.filter(
        (lesson) => selectedDay === null || lesson.day === selectedDay,
    )

    return (
        <section className="calendar" id="calendar">
            <div className="calendar-header">
                <div className="time-header">ЧАС</div>

                {DAYS.map((day, index) => (
                    <button
                        className={`day-header ${
                            selectedDay === index ? 'selected' : ''
                        }`}
                        key={day.name}
                        onClick={() => onSelectDay(index)}
                        aria-pressed={selectedDay === index}
                    >
                        <span>{day.name}</span>
                        <strong>{day.date + weekOffset * 7}</strong>
                    </button>
                ))}
            </div>

            <div className="calendar-body">
                <div className="time-column">
                    {HOURS.map((hour) => (
                        <div className="time-label" key={hour}>
                            {String(hour).padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                {DAYS.map((day, dayIndex) => (
                    <div
                        className={`day-column ${
                            selectedDay === dayIndex ? 'day-column-selected' : ''
                        }`}
                        key={day.name}
                    >
                        {HOURS.map((hour) => (
                            <div className="hour-slot" key={hour}/>
                        ))}

                        {visibleLessons
                            .filter((lesson) => lesson.day === dayIndex)
                            .map((lesson) => (
                                <ScheduleEvent
                                    key={lesson.id}
                                    lesson={lesson}
                                />
                            ))}
                    </div>
                ))}
            </div>
        </section>
    )
}