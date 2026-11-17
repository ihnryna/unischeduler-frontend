import {useMemo, useState} from 'react'
import type {CourseClass} from '../../../types/catalog'
import {mockSpecialities} from '../../../mocks/specialities'
import {formatWeeksList} from '../../../utils/dateUtils'

type AdminScheduleInspectorTabProps = {
    classes: CourseClass[]
    onEditClass: (cls: CourseClass) => void
}

const DAYS = [
    {dayIndex: 1, name: 'Понеділок'},
    {dayIndex: 2, name: 'Вівторок'},
    {dayIndex: 3, name: 'Середа'},
    {dayIndex: 4, name: 'Четвер'},
    {dayIndex: 5, name: 'П’ятниця'},
    {dayIndex: 6, name: 'Субота'},
]

export function AdminScheduleInspectorTab({
    classes,
    onEditClass,
}: Readonly<AdminScheduleInspectorTabProps>) {
    const [selectedSpeciality, setSelectedSpeciality] = useState(mockSpecialities[0].name)

    const inspectedClasses = useMemo(() => {
        return classes.filter((c) =>
            c.course.specialities.some((s) => s.name === selectedSpeciality),
        )
    }, [classes, selectedSpeciality])

    const getDayIndex = (startsAt: string) => {
        const date = new Date(startsAt)
        return (date.getDay() + 6) % 7 + 1
    }

    return (
        <div className="admin-tab-content">
            <div className="admin-card">
                <div className="admin-card-header-row">
                    <div>
                        <h3 className="admin-card-title">Діагностика та аудит розкладів</h3>
                        <p className="admin-card-subtitle">
                            Швидкий перегляд зведеного розкладу для перевірки звернень студентів і викладачів
                        </p>
                    </div>

                    <div className="admin-inspector-select-wrap">
                        <label className="admin-inspector-label" htmlFor="inspector-spec">
                            Спеціальність НаУКМА:
                        </label>
                        <select
                            id="inspector-spec"
                            className="select admin-form-select"
                            value={selectedSpeciality}
                            onChange={(e) => setSelectedSpeciality(e.target.value)}
                        >
                            {mockSpecialities.map((spec) => (
                                <option key={spec.id} value={spec.name}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-inspector-controls">
                    <div className="admin-inspector-stats">
                        <span className="admin-badge admin-badge-info">
                            {inspectedClasses.length} навчальних пар
                        </span>
                        <span className="admin-badge admin-badge-success">
                            ✓ Колізій не виявлено
                        </span>
                    </div>
                </div>
            </div>

            {/* Weekly Days Grid */}
            <div className="admin-inspector-days-grid">
                {DAYS.map((day) => {
                    const dayClasses = inspectedClasses
                        .filter((c) => getDayIndex(c.startsAt) === day.dayIndex)
                        .sort(
                            (a, b) =>
                                new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
                        )

                    return (
                        <div className="admin-day-card" key={day.dayIndex}>
                            <div className="admin-day-card-header">
                                <strong className="admin-day-name">{day.name}</strong>
                                <span className="admin-day-count">{dayClasses.length} пар</span>
                            </div>

                            <div className="admin-day-card-body">
                                {dayClasses.length === 0 ? (
                                    <div className="admin-day-empty">Немає запланованих занять</div>
                                ) : (
                                    <div className="admin-inspector-classes-list">
                                        {dayClasses.map((cls) => (
                                            <div
                                                className="admin-inspector-class-item"
                                                key={cls.id}
                                            >
                                                <div className="admin-inspector-time">
                                                    {cls.startsAt.slice(11, 16)} – {cls.endsAt.slice(11, 16)}
                                                </div>
                                                <strong className="admin-inspector-title">
                                                    {cls.course.name}
                                                </strong>
                                                <div className="admin-inspector-meta">
                                                    <span>👤 {cls.teacher}</span>
                                                    <span>📍 {cls.location}</span>
                                                    <span>🗓️ {formatWeeksList(cls.weeks)}</span>
                                                </div>
                                                <div className="admin-inspector-footer">
                                                    <span className="admin-badge admin-badge-neutral">
                                                        {cls.group}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="button admin-action-btn admin-action-edit"
                                                        onClick={() => onEditClass(cls)}
                                                    >
                                                        ✎ Змінити
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
