import type {CalendarEvent} from '../../types/schedule'
import {HOURS} from '../../features/schedule/scheduleConfig'
import {getWeekDays} from '../../utils/dateUtils'
import {ScheduleEvent} from './ScheduleEvent'

type ScheduleGridProps = {
    events: CalendarEvent[]
    selectedDay: number | null
    onSelectDay: (dayIndex: number) => void
    weekOffset: number
}

export function ScheduleGrid({
    events,
    selectedDay,
    onSelectDay,
    weekOffset,
}: Readonly<ScheduleGridProps>) {
    const weekDays = getWeekDays(weekOffset)

    const getDayIndex = (event: CalendarEvent) => {
        const sundayBasedDay = new Date(event.startsAt).getDay()
        return (sundayBasedDay + 6) % 7
    }

    const visibleEvents = events.filter(
        (event) => selectedDay === null || getDayIndex(event) === selectedDay,
    )

    return (
        <section className="calendar" id="calendar">
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

            <div className="calendar-body">
                <div className="time-column">
                    {HOURS.map((hour) => (
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
                    >
                        {HOURS.map((hour) => (
                            <div className="hour-slot" key={hour} />
                        ))}

                        {visibleEvents
                            .filter((event) => getDayIndex(event) === day.dayIndex)
                            .map((event) => (
                                <ScheduleEvent
                                    key={`${event.eventType}-${event.eventId}`}
                                    event={event}
                                />
                            ))}
                    </div>
                ))}
            </div>
        </section>
    )
}
