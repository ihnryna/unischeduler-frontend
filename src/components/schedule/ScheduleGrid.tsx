import type {CalendarEvent} from '../../types/schedule'
import {DAYS, HOURS} from '../../features/schedule/scheduleConfig'
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

                        {visibleEvents
                            .filter((event) => getDayIndex(event) === dayIndex)
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
