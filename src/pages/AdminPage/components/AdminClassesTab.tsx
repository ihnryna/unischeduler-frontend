import {useMemo, useState} from 'react'
import type {CourseClass} from '../../../types/catalog'
import {formatWeeksList} from '../../../utils/dateUtils'

type AdminClassesTabProps = {
    classes: CourseClass[]
    onAddClass: () => void
    onEditClass: (cls: CourseClass) => void
    onDeleteClass: (cls: CourseClass) => void
}

const DAYS_UA = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота']

export function AdminClassesTab({
    classes,
    onAddClass,
    onEditClass,
    onDeleteClass,
}: Readonly<AdminClassesTabProps>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [groupFilter, setGroupFilter] = useState('ALL')

    const availableGroups = useMemo(() => {
        const groups = new Set<string>()
        classes.forEach((c) => {
            if (c.group) groups.add(c.group)
        })
        return Array.from(groups).sort()
    }, [classes])

    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            const matchesSearch =
                cls.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.location.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesGroup = groupFilter === 'ALL' || cls.group === groupFilter

            return matchesSearch && matchesGroup
        })
    }, [classes, searchQuery, groupFilter])

    const formatScheduleSlot = (startsAt: string, endsAt: string) => {
        const start = new Date(startsAt)
        const dayName = DAYS_UA[start.getDay()] || 'Понеділок'
        const startTime = startsAt.slice(11, 16)
        const endTime = endsAt.slice(11, 16)
        return {dayName, timeRange: `${startTime} – ${endTime}`}
    }

    return (
        <div className="admin-tab-content">
            <div className="admin-toolbar-row">
                <div className="admin-filter-group">
                    <input
                        type="text"
                        className="input admin-search-input"
                        placeholder="🔍 Дисципліна, викладач, аудиторія"
                        aria-label="Пошук занять за дисципліною, викладачем або аудиторією"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="select admin-filter-select"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                    >
                        <option value="ALL">Всі навчальні групи</option>
                        {availableGroups.map((grp) => (
                            <option key={grp} value={grp}>
                                Група {grp}
                            </option>
                        ))}
                    </select>

                    {(searchQuery || groupFilter !== 'ALL') && (
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={() => {
                                setSearchQuery('')
                                setGroupFilter('ALL')
                            }}
                        >
                            Скинути
                        </button>
                    )}
                </div>

                <div className="admin-actions-right">
                    <button
                        type="button"
                        className="button primary-button admin-add-btn"
                        onClick={onAddClass}
                    >
                        ＋ Додати заняття
                    </button>
                </div>
            </div>

            <div className="admin-table-container admin-card">
                <div className="admin-table-header-meta">
                    <span className="admin-table-counter">
                        Відображено <strong>{filteredClasses.length}</strong> із <strong>{classes.length}</strong> занять
                    </span>
                </div>

                {filteredClasses.length === 0 ? (
                    <div className="admin-empty-state">
                        <p className="admin-empty-title">Занять не знайдено</p>
                        <p className="admin-empty-desc">
                            Спробуйте змінити фільтри або призначте новий розклад для курсу.
                        </p>
                        <button
                            type="button"
                            className="button primary-button"
                            onClick={onAddClass}
                        >
                            ＋ Додати заняття
                        </button>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{width: '60px'}}>ID</th>
                                    <th>Дисципліна</th>
                                    <th>Викладач</th>
                                    <th>Група</th>
                                    <th>День та час</th>
                                    <th>Аудиторія</th>
                                    <th>Тижні</th>
                                    <th style={{width: '160px', textAlign: 'right'}}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((cls) => {
                                    const {dayName, timeRange} = formatScheduleSlot(
                                        cls.startsAt,
                                        cls.endsAt,
                                    )
                                    return (
                                        <tr key={cls.id}>
                                            <td className="admin-cell-id">#{cls.id}</td>
                                            <td className="admin-cell-title">
                                                <strong>{cls.course.name}</strong>
                                                <small className="admin-subtext">{cls.course.faculty}</small>
                                            </td>
                                            <td>{cls.teacher || '—'}</td>
                                            <td>
                                                <span className="admin-badge admin-badge-info">
                                                    {cls.group}
                                                </span>
                                            </td>
                                            <td>
                                                <div><strong>{dayName}</strong></div>
                                                <small className="admin-subtext">{timeRange}</small>
                                            </td>
                                            <td>
                                                <span className="admin-location-pill">
                                                    📍 {cls.location}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="admin-weeks-badge"
                                                    title={cls.weeks ? `Тижні: ${cls.weeks.join(', ')}` : 'Усі тижні'}
                                                >
                                                    🗓️ {formatWeeksList(cls.weeks)}
                                                </span>
                                            </td>
                                            <td className="admin-cell-actions">
                                                <div className="admin-actions-flex">
                                                    <button
                                                        type="button"
                                                        className="button admin-action-btn admin-action-edit"
                                                        onClick={() => onEditClass(cls)}
                                                        title="Редагувати заняття"
                                                    >
                                                        ✎ Редагувати
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button admin-action-btn admin-action-delete"
                                                        onClick={() => onDeleteClass(cls)}
                                                        title="Видалити заняття"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
