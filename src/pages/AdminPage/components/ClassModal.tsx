import {useEffect, useState} from 'react'
import type {Course, CourseClass} from '../../../types/catalog'
import type {CourseClassFormData} from '../../../features/admin/adminTypes'
import {parseWeeksInput} from '../../../utils/dateUtils'

type ClassModalProps = {
    isOpen: boolean
    classToEdit: CourseClass | null
    courses: Course[]
    onSave: (data: CourseClassFormData) => void
    onClose: () => void
}

const ALL_SEMESTER_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

const DAYS = [
    {value: 1, label: 'Понеділок'},
    {value: 2, label: 'Вівторок'},
    {value: 3, label: 'Середа'},
    {value: 4, label: 'Четвер'},
    {value: 5, label: 'П’ятниця'},
    {value: 6, label: 'Субота'},
]

const TIME_SLOTS = [
    {start: '08:30', end: '09:50'},
    {start: '10:00', end: '11:20'},
    {start: '11:40', end: '13:00'},
    {start: '13:30', end: '14:50'},
    {start: '15:00', end: '16:20'},
    {start: '16:30', end: '17:50'},
    {start: '18:00', end: '19:20'},
]

export function ClassModal({
    isOpen,
    classToEdit,
    courses,
    onSave,
    onClose,
}: Readonly<ClassModalProps>) {
    const [courseId, setCourseId] = useState<number>(courses[0]?.id ?? 1)
    const [teacher, setTeacher] = useState('')
    const [group, setGroup] = useState('ІПЗ-4')
    const [location, setLocation] = useState('3-214')
    const [dayOfWeek, setDayOfWeek] = useState(1)
    const [startTime, setStartTime] = useState('08:30')
    const [endTime, setEndTime] = useState('09:50')
    const [selectedWeeks, setSelectedWeeks] = useState<number[]>(ALL_SEMESTER_WEEKS)
    const [weeksInputText, setWeeksInputText] = useState(ALL_SEMESTER_WEEKS.join(', '))
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (classToEdit) {
            setCourseId(classToEdit.course.id)
            setTeacher(classToEdit.teacher || '')
            setGroup(classToEdit.group || 'ІПЗ-4')
            setLocation(classToEdit.location || '3-214')

            const startDate = new Date(classToEdit.startsAt)
            const day = (startDate.getDay() + 6) % 7 + 1
            setDayOfWeek(day >= 1 && day <= 6 ? day : 1)

            const startFormatted = classToEdit.startsAt.slice(11, 16)
            const endFormatted = classToEdit.endsAt.slice(11, 16)
            setStartTime(startFormatted || '08:30')
            setEndTime(endFormatted || '09:50')

            const currentWeeks = classToEdit.weeks && classToEdit.weeks.length > 0
                ? [...classToEdit.weeks].sort((a, b) => a - b)
                : ALL_SEMESTER_WEEKS
            setSelectedWeeks(currentWeeks)
            setWeeksInputText(currentWeeks.join(', '))
        } else {
            setCourseId(courses[0]?.id ?? 1)
            setTeacher('')
            setGroup('ІПЗ-4')
            setLocation('3-214')
            setDayOfWeek(1)
            setStartTime('08:30')
            setEndTime('09:50')
            setSelectedWeeks(ALL_SEMESTER_WEEKS)
            setWeeksInputText(ALL_SEMESTER_WEEKS.join(', '))
        }
        setError(null)
    }, [classToEdit, courses, isOpen])

    if (!isOpen) return null

    const toggleWeek = (weekNum: number) => {
        setSelectedWeeks((prev) => {
            const next = prev.includes(weekNum)
                ? prev.filter((w) => w !== weekNum)
                : [...prev, weekNum].sort((a, b) => a - b)
            setWeeksInputText(next.join(', '))
            return next
        })
    }

    const setPresetWeeks = (weeks: number[]) => {
        setSelectedWeeks(weeks)
        setWeeksInputText(weeks.join(', '))
    }

    const handleWeeksInputChange = (text: string) => {
        setWeeksInputText(text)
        const parsed = parseWeeksInput(text)
        setSelectedWeeks(parsed)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!teacher.trim()) {
            setError('Вкажіть викладача або кафедру')
            return
        }
        if (!group.trim()) {
            setError('Вкажіть навчальну групу (наприклад, ІПЗ-4)')
            return
        }
        if (!location.trim()) {
            setError('Вкажіть аудиторію або «Онлайн»')
            return
        }

        const finalWeeks = selectedWeeks.length > 0 ? selectedWeeks : ALL_SEMESTER_WEEKS

        onSave({
            courseId: Number(courseId),
            teacher: teacher.trim(),
            group: group.trim(),
            location: location.trim(),
            dayOfWeek: Number(dayOfWeek),
            startTime,
            endTime,
            weeks: finalWeeks,
        })
        onClose()
    }

    return (
        <div
            className="admin-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-modal-title"
        >
            <div className="admin-modal-card">
                <div className="admin-modal-header">
                    <h3 id="class-modal-title" className="admin-modal-title">
                        {classToEdit ? '✎ Редагувати заняття' : '＋ Додати нове заняття'}
                    </h3>
                    <button
                        type="button"
                        className="admin-modal-close-btn"
                        onClick={onClose}
                        aria-label="Закрити"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="2" y1="2" x2="12" y2="12" />
                            <line x1="12" y1="2" x2="2" y2="12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-form">
                    <div className="admin-modal-body">
                        {error && (
                            <div className="admin-form-error-alert" role="alert">
                                ⚠ {error}
                            </div>
                        )}

                        <div className="admin-form-group">
                            <label className="admin-form-label" htmlFor="class-course">
                                Дисципліна <span className="admin-required">*</span>
                            </label>
                            <select
                                id="class-course"
                                className="select admin-form-select"
                                value={courseId}
                                onChange={(e) => setCourseId(Number(e.target.value))}
                            >
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.faculty})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-teacher">
                                    Викладач <span className="admin-required">*</span>
                                </label>
                                <input
                                    id="class-teacher"
                                    className="input admin-form-input"
                                    type="text"
                                    placeholder="наприклад, проф. В. Бублик"
                                    value={teacher}
                                    onChange={(e) => {
                                        setTeacher(e.target.value)
                                        setError(null)
                                    }}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-group">
                                    Навчальна група <span className="admin-required">*</span>
                                </label>
                                <input
                                    id="class-group"
                                    className="input admin-form-input"
                                    type="text"
                                    placeholder="ІПЗ-4"
                                    value={group}
                                    onChange={(e) => {
                                        setGroup(e.target.value)
                                        setError(null)
                                    }}
                                />
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-location">
                                    Аудиторія / Локація <span className="admin-required">*</span>
                                </label>
                                <input
                                    id="class-location"
                                    className="input admin-form-input"
                                    type="text"
                                    placeholder="3-214 або Онлайн"
                                    value={location}
                                    onChange={(e) => {
                                        setLocation(e.target.value)
                                        setError(null)
                                    }}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-day">
                                    День тижня
                                </label>
                                <select
                                    id="class-day"
                                    className="select admin-form-select"
                                    value={dayOfWeek}
                                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                                >
                                    {DAYS.map((d) => (
                                        <option key={d.value} value={d.value}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-start">
                                    Час початку
                                </label>
                                <input
                                    id="class-start"
                                    className="input admin-form-input"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="class-end">
                                    Час завершення
                                </label>
                                <input
                                    id="class-end"
                                    className="input admin-form-input"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <span className="admin-form-label">Швидкі пари НаУКМА:</span>
                            <div className="admin-slot-presets">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={`${slot.start}-${slot.end}`}
                                        type="button"
                                        className="admin-slot-pill"
                                        onClick={() => {
                                            setStartTime(slot.start)
                                            setEndTime(slot.end)
                                        }}
                                    >
                                        {slot.start} – {slot.end}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label" htmlFor="class-weeks-input">
                                Навчальні тижні проведення пари
                            </label>

                            <div className="admin-weeks-presets">
                                <button
                                    type="button"
                                    className="admin-slot-pill"
                                    onClick={() => setPresetWeeks(ALL_SEMESTER_WEEKS)}
                                >
                                    Усі (1–15)
                                </button>
                                <button
                                    type="button"
                                    className="admin-slot-pill"
                                    onClick={() => setPresetWeeks([1, 3, 5, 7, 9, 11, 13, 15])}
                                >
                                    Чисельник (непарні)
                                </button>
                                <button
                                    type="button"
                                    className="admin-slot-pill"
                                    onClick={() => setPresetWeeks([2, 4, 6, 8, 10, 12, 14])}
                                >
                                    Знаменник (парні)
                                </button>
                                <button
                                    type="button"
                                    className="admin-slot-pill"
                                    onClick={() => setPresetWeeks([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])}
                                >
                                    1–10 тижні
                                </button>
                            </div>

                            <div className="admin-weeks-pills-grid" role="group" aria-label="Вибір тижнів">
                                {Array.from({length: 16}, (_, i) => i + 1).map((w) => {
                                    const isSelected = selectedWeeks.includes(w)
                                    return (
                                        <button
                                            key={w}
                                            type="button"
                                            className={`admin-week-num-pill ${isSelected ? 'is-selected' : ''}`}
                                            onClick={() => toggleWeek(w)}
                                            aria-pressed={isSelected}
                                            title={`Тиждень ${w}`}
                                        >
                                            {w}
                                        </button>
                                    )
                                })}
                            </div>

                            <input
                                id="class-weeks-input"
                                className="input admin-form-input admin-weeks-input"
                                type="text"
                                placeholder="Вкажіть тижні через кому, наприклад: 1, 2, 3, 10 або 1-15"
                                value={weeksInputText}
                                onChange={(e) => handleWeeksInputChange(e.target.value)}
                            />
                            <small className="admin-subtext">
                                Оберіть пресет, клацайте окремі номери тижнів або введіть їх вручну через кому.
                            </small>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={onClose}
                        >
                            Скасувати
                        </button>
                        <button type="submit" className="button primary-button">
                            {classToEdit ? 'Зберегти зміни' : 'Створити заняття'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
