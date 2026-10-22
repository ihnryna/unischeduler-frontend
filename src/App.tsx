import { useState } from 'react'
import { ACTIVE_THEME } from "./themes/theme";
import './App.css'

type Lesson = {
    id: number
    day: number
    start: number
    end: number
    title: string
    type: string
    room: string
    teacher: string
    color: 'purple' | 'mint' | 'peach' | 'blue'
}

const lessons: Lesson[] = [
    {
        id: 1,
        day: 0,
        start: 9,
        end: 10.5,
        title: 'Проєктування програмних систем',
        type: 'Лекція',
        room: '3-214',
        teacher: 'В. Бублик',
        color: 'purple',
    },
    {
        id: 2,
        day: 0,
        start: 12,
        end: 13.5,
        title: 'Інженерія програмного забезпечення',
        type: 'Практика',
        room: '4-105',
        teacher: 'О. Петренко',
        color: 'mint',
    },
    {
        id: 3,
        day: 1,
        start: 10,
        end: 11.5,
        title: 'Сучасний C++',
        type: 'Лекція',
        room: '1-8',
        teacher: 'В. Бублик',
        color: 'peach',
    },
    {
        id: 4,
        day: 1,
        start: 14,
        end: 15.5,
        title: 'Бази даних',
        type: 'Лабораторна',
        room: '3-301',
        teacher: 'І. Коваль',
        color: 'purple',
    },
    {
        id: 5,
        day: 2,
        start: 9,
        end: 10.5,
        title: 'Комп’ютерні мережі',
        type: 'Практика',
        room: '2-208',
        teacher: 'М. Савчук',
        color: 'blue',
    },
    {
        id: 6,
        day: 2,
        start: 12,
        end: 13.5,
        title: 'Проєкт UNIScheduler',
        type: 'Командна робота',
        room: 'Онлайн',
        teacher: 'Команда',
        color: 'mint',
    },
    {
        id: 7,
        day: 3,
        start: 11,
        end: 12.5,
        title: 'Англійська мова',
        type: 'Практика',
        room: '5-402',
        teacher: 'N. Smith',
        color: 'peach',
    },
    {
        id: 8,
        day: 3,
        start: 14,
        end: 15.5,
        title: 'Алгоритми та структури даних',
        type: 'Лекція',
        room: '3-102',
        teacher: 'А. Мельник',
        color: 'purple',
    },
    {
        id: 9,
        day: 4,
        start: 9,
        end: 10.5,
        title: 'Тестування програмного забезпечення',
        type: 'Лабораторна',
        room: '4-210',
        teacher: 'О. Петренко',
        color: 'blue',
    },
    {
        id: 10,
        day: 4,
        start: 12,
        end: 13.5,
        title: 'Архітектура програмного забезпечення',
        type: 'Семінар',
        room: '3-216',
        teacher: 'І. Коваль',
        color: 'mint',
    },
    {
        id: 11,
        day: 5,
        start: 10,
        end: 11.5,
        title: 'Самостійна робота',
        type: 'Навчальний блок',
        room: 'Бібліотека',
        teacher: '—',
        color: 'peach',
    },
]

const days = [
    { name: 'Пн', date: 26 },
    { name: 'Вт', date: 27 },
    { name: 'Ср', date: 28 },
    { name: 'Чт', date: 29 },
    { name: 'Пт', date: 30 },
    { name: 'Сб', date: 31 },
    { name: 'Нд', date: 1 },
]

const hours = Array.from({ length: 11 }, (_, index) => index + 8)
const HOUR_HEIGHT = 64

function formatTime(time: number) {
    const hours = Math.floor(time)
    const minutes = time % 1 === 0 ? '00' : '30'

    return `${String(hours).padStart(2, '0')}:${minutes}`
}

function App() {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

    const visibleLessons = lessons.filter(
        (lesson) => selectedDay === null || lesson.day === selectedDay,
    )

    return (
        <main className="app" data-theme={ACTIVE_THEME}>
            <header className="topbar">
                <a className="brand" href="#" aria-label="UNIScheduler — головна">
                    <span className="brand-logo">UNI</span>

                    <span className="brand-text">
            <strong>UNIScheduler  </strong>
          </span>
                </a>

                <div className="topbar-right">
                    <span className="semester-label">Осінній семестр · 2026</span>
                    <button className="profile-button" aria-label="Профіль користувача">
                        ІГ
                    </button>
                </div>
            </header>

            <div className="app-layout">
                <aside className="sidebar">
                    <p className="sidebar-label">МЕНЮ</p>

                    <nav className="navigation" aria-label="Основна навігація">
                        <a className="nav-link active" href="#calendar">
                            <span className="nav-icon">▦</span>
                            Мій розклад
                        </a>
                        <a className="nav-link" href="#upcoming">
                            <span className="nav-icon">◷</span>
                            Найближчі заняття
                        </a>
                        <a className="nav-link" href="#overview">
                            <span className="nav-icon">▤</span>
                            Огляд тижня
                        </a>
                    </nav>

                    <div className="sidebar-divider" />

                    <p className="sidebar-label">ЦЬОГО ТИЖНЯ</p>

                    <div className="sidebar-stat">
                        <span className="stat-icon purple-icon">▦</span>
                        <span>
              <strong>{lessons.length}</strong>
              <small> навчальних блоків</small>
            </span>
                    </div>

                    <div className="sidebar-stat">
                        <span className="stat-icon mint-icon">◷</span>
                        <span>
              <strong>16,5 год</strong>
              <small> у розкладі</small>
            </span>
                    </div>

                    <div className="sidebar-footer">
                        Зроблено спудеями для спудеїв
                    </div>
                </aside>

                <section className="main-content">
                    <div className="page-heading">
                        <div>
                            {/*<p className="eyebrow">ОСОБИСТИЙ КАБІНЕТ / КАЛЕНДАР</p>*/}
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

                    <section className="calendar" id="calendar">
                        <div className="calendar-header">
                            <div className="time-header">ЧАС</div>

                            {days.map((day, index) => (
                                <button
                                    className={`day-header ${
                                        selectedDay === index ? 'selected' : ''
                                    }`}
                                    key={day.name}
                                    onClick={() =>
                                        setSelectedDay(selectedDay === index ? null : index)
                                    }
                                    aria-pressed={selectedDay === index}
                                >
                                    <span>{day.name}</span>
                                    <strong>{day.date + weekOffset * 7}</strong>
                                </button>
                            ))}
                        </div>

                        <div className="calendar-body">
                            <div className="time-column">
                                {hours.map((hour) => (
                                    <div className="time-label" key={hour}>
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                ))}
                            </div>

                            {days.map((day, dayIndex) => (
                                <div
                                    className={`day-column ${
                                        selectedDay === dayIndex ? 'day-column-selected' : ''
                                    }`}
                                    key={day.name}
                                >
                                    {hours.map((hour) => (
                                        <div className="hour-slot" key={hour} />
                                    ))}

                                    {visibleLessons
                                        .filter((lesson) => lesson.day === dayIndex)
                                        .map((lesson) => (
                                            <article
                                                className={`lesson-card lesson-${lesson.color}`}
                                                key={lesson.id}
                                                style={{
                                                    top: (lesson.start - 8) * HOUR_HEIGHT + 4,
                                                    height:
                                                        (lesson.end - lesson.start) * HOUR_HEIGHT - 8,
                                                }}
                                            >
                        <span className="lesson-time">
                          {formatTime(lesson.start)} – {formatTime(lesson.end)}
                        </span>
                                                <strong className="lesson-title">
                                                    {lesson.title}
                                                </strong>
                                                <span className="lesson-type">{lesson.type}</span>
                                                <span className="lesson-detail">
                          <span aria-hidden="true">⌖</span> {lesson.room}
                        </span>
                                                <span className="lesson-teacher">
                          {lesson.teacher}
                        </span>
                                            </article>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="bottom-widgets">
                        <section className="widget" id="upcoming">
                            <div className="widget-heading">
                                <div>
                                    <p className="eyebrow">НЕЗАБАРОМ</p>
                                    <h2>Найближче заняття</h2>
                                </div>
                                <span className="status-dot" />
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
                </section>
            </div>
        </main>
    )
}

export default App
