import {useState} from 'react'

import {lessons} from '../../features/schedule/mockSchedule'
import {ScheduleGrid} from '../../components/schedule/ScheduleGrid'

export function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

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
                <div className="week-info">
                    <div className="week-icon">▦</div>

                    <div>
                        <h2>26 жовтня — 1 листопада</h2>

                        <p>
                            {weekOffset === 0
                                ? 'Поточний тиждень'
                                : `${weekOffset > 0 ? '+' : ''}${weekOffset} тиж. від поточного`}
                        </p>
                    </div>
                </div>

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
            </section>

            {weekOffset !== 0 && (
                <p className="demo-notice">
                    Демонстраційний режим: дані занять не змінюються між тижнями.
                </p>
            )}

            <ScheduleGrid
                lessons={lessons}
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

                    <div className="upcoming-lesson">
                        <div className="upcoming-date">
                            <strong>26</strong>
                            <span>ЖОВ</span>
                        </div>

                        <div className="upcoming-details">
                            <strong>Проєктування програмних систем</strong>
                            <span>09:00 · Аудиторія 3-214</span>
                            <span>В. Бублик</span>
                        </div>
                    </div>
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
                            <strong>{lessons.length}</strong>
                            <span>подій</span>
                        </div>

                        <div>
                            <strong>5</strong>
                            <span>навчальних днів</span>
                        </div>

                        <div>
                            <strong>16,5</strong>
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