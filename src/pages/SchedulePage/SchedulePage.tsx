import {useState} from 'react'

import {ScheduleGrid} from '../../components/schedule/ScheduleGrid'
import {useSchedule} from '../../features/schedule/useSchedule'
import {
    formatWeekRange,
    getAcademicWeekInfo,
    getMondayOfWeek,
    MONTH_SHORT_UA,
} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

export function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const {events, isLoading, error} = useSchedule(1, weekOffset)

    const monday = getMondayOfWeek()
    monday.setDate(monday.getDate() + weekOffset * 7)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const weekRangeLabel = formatWeekRange(monday, sunday)
    const academicWeekInfo = getAcademicWeekInfo(monday)

    // Дані для блоку "Найближче заняття" (перше заняття у вибраному тижні)
    const upcomingEvent = events[0] ?? null
    let upcomingDay = '--'
    let upcomingMonth = ''
    if (upcomingEvent) {
        const eventDate = new Date(upcomingEvent.startsAt)
        upcomingDay = String(eventDate.getDate())
        upcomingMonth = MONTH_SHORT_UA[eventDate.getMonth()]
    }

    // Дані для блоку "Тиждень у цифрах"
    const uniqueDaysCount = new Set(
        events.map((e) => new Date(e.startsAt).getDay()),
    ).size
    const totalHours = events.reduce((sum, e) => {
        const diffMs = new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()
        return sum + diffMs / (1000 * 60 * 60)
    }, 0)

    return (
        <>
            <div className="page-heading">
                <div>
                    <h1>Мій розклад</h1>
                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        window.alert('Створення особистої події додамо пізніше.')
                    }
                >
                    <span>＋</span> Нова подія
                </button>
            </div>

            <section className="week-toolbar">
                <div className="week-controls">
                    <button
                        className="icon-button"
                        onClick={() => setWeekOffset((value) => value - 1)}
                        aria-label="Попередній тиждень"
                    >
                        ←
                    </button>

                    <button
                        className="today-button"
                        onClick={() => {
                            setWeekOffset(0)
                            setSelectedDay(null)
                        }}
                    >
                        Сьогодні
                    </button>

                    <button
                        className="icon-button"
                        onClick={() => setWeekOffset((value) => value + 1)}
                        aria-label="Наступний тиждень"
                    >
                        →
                    </button>
                </div>

                <div className="week-center">
                    <div className="week-title-row">
                        <h2>{weekRangeLabel}</h2>
                        {weekOffset === 0 ? (
                            <span className="current-week-badge">Поточний тиждень</span>
                        ) : (
                            <span className="week-offset-badge">
                                {weekOffset > 0 ? `+${weekOffset}` : weekOffset} тиж. від поточного
                            </span>
                        )}
                    </div>
                </div>

                <div className="week-right">
                    <span className="week-parity-badge">
                        {academicWeekInfo.fullLabel}
                    </span>
                </div>
            </section>

            {isLoading && (
                <p className="demo-notice">Завантажуємо розклад…</p>
            )}

            {error && (
                <p className="demo-notice" role="alert">{error}</p>
            )}

            <ScheduleGrid
                events={events}
                selectedDay={selectedDay}
                onSelectDay={(dayIndex) => {
                    setSelectedDay((current) =>
                        current === dayIndex ? null : dayIndex,
                    )
                }}
                weekOffset={weekOffset}
            />

            <div className="bottom-widgets">
                <section className="widget" id="upcoming">
                    <div className="widget-heading">
                        <div>
                            <p className="eyebrow">НЕЗАБАРОМ</p>
                            <h2>Найближче заняття</h2>
                        </div>

                        <span className="status-dot"/>
                    </div>

                    {upcomingEvent ? (
                        <div className="upcoming-lesson">
                            <div className="upcoming-date">
                                <strong>{upcomingDay}</strong>
                                <span>{upcomingMonth}</span>
                            </div>

                            <div className="upcoming-details">
                                <strong>{upcomingEvent.name}</strong>
                                <span>
                                    {formatTime(upcomingEvent.startsAt)} ·{' '}
                                    {upcomingEvent.location ?? 'Онлайн'}
                                </span>
                                <span>
                                    {upcomingEvent.teacher ?? upcomingEvent.description ?? 'Навчальна група'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="upcoming-empty">
                            <p>На цьому тижні немає запланованих занять.</p>
                        </div>
                    )}
                </section>

                <section className="widget" id="overview">
                    <div className="widget-heading">
                        <div>
                            <p className="eyebrow">ШВИДКИЙ ОГЛЯД</p>
                            <h2>Тиждень у цифрах</h2>
                        </div>
                    </div>

                    <div className="overview-stats">
                        <div>
                            <strong>{events.length}</strong>
                            <span>подій</span>
                        </div>

                        <div>
                            <strong>{uniqueDaysCount}</strong>
                            <span>навчальних днів</span>
                        </div>

                        <div>
                            <strong>
                                {totalHours.toLocaleString('uk-UA', {
                                    maximumFractionDigits: 1,
                                })}
                            </strong>
                            <span>годин</span>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="page-footer">
                UNIScheduler <span>·</span> Твій час має значення
            </footer>
        </>
    )
}
