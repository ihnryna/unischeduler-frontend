import {useMemo, useState} from 'react'
import type {Course, Semester} from '../../../types/catalog'

type AdminCoursesTabProps = {
    courses: Course[]
    onAddCourse: () => void
    onEditCourse: (course: Course) => void
    onDeleteCourse: (course: Course) => void
}

export function AdminCoursesTab({
    courses,
    onAddCourse,
    onEditCourse,
    onDeleteCourse,
}: Readonly<AdminCoursesTabProps>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [semesterFilter, setSemesterFilter] = useState<'ALL' | Semester>('ALL')

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.department.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesSemester =
                semesterFilter === 'ALL' || course.semester === semesterFilter

            return matchesSearch && matchesSemester
        })
    }, [courses, searchQuery, semesterFilter])

    const getSemesterLabel = (semester: Semester) => {
        switch (semester) {
            case 'AUTUMN':
                return 'Осінній'
            case 'SPRING':
                return 'Весняний'
            case 'SUMMER':
                return 'Літній'
            default:
                return semester
        }
    }

    return (
        <div className="admin-tab-content">
            <div className="admin-toolbar-row">
                <div className="admin-filter-group">
                    <input
                        type="text"
                        className="input admin-search-input"
                        placeholder="🔍 Назва або факультет"
                        aria-label="Пошук дисциплін за назвою або факультетом"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="select admin-filter-select"
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value as 'ALL' | Semester)}
                    >
                        <option value="ALL">Всі семестри</option>
                        <option value="AUTUMN">Осінній семестр</option>
                        <option value="SPRING">Весняний семестр</option>
                        <option value="SUMMER">Літній семестр</option>
                    </select>

                    {(searchQuery || semesterFilter !== 'ALL') && (
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={() => {
                                setSearchQuery('')
                                setSemesterFilter('ALL')
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
                        onClick={onAddCourse}
                    >
                        ＋ Додати дисципліну
                    </button>
                </div>
            </div>

            <div className="admin-table-container admin-card">
                <div className="admin-table-header-meta">
                    <span className="admin-table-counter">
                        Відображено <strong>{filteredCourses.length}</strong> із <strong>{courses.length}</strong> дисциплін
                    </span>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="admin-empty-state">
                        <p className="admin-empty-title">Дисциплін не знайдено</p>
                        <p className="admin-empty-desc">
                            Спробуйте змінити пошуковий запит або додайте нову дисципліну до каталогу.
                        </p>
                        <button
                            type="button"
                            className="button primary-button"
                            onClick={onAddCourse}
                        >
                            ＋ Додати дисципліну
                        </button>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{width: '60px'}}>ID</th>
                                    <th>Назва дисципліни</th>
                                    <th>Факультет та кафедра</th>
                                    <th>Семестр / Рік</th>
                                    <th>Спеціальності</th>
                                    <th style={{width: '160px', textAlign: 'right'}}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td className="admin-cell-id">#{course.id}</td>
                                        <td className="admin-cell-title">
                                            <strong>{course.name}</strong>
                                        </td>
                                        <td className="admin-cell-meta">
                                            <div>{course.faculty}</div>
                                            <small className="admin-subtext">{course.department}</small>
                                        </td>
                                        <td>
                                            <span className="admin-badge admin-badge-neutral">
                                                {getSemesterLabel(course.semester)} · {course.year}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-spec-pills-list">
                                                {course.specialities.map((spec) => (
                                                    <span key={spec.id} className="admin-pill">
                                                        {spec.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="admin-cell-actions">
                                            <div className="admin-actions-flex">
                                                <button
                                                    type="button"
                                                    className="button admin-action-btn admin-action-edit"
                                                    onClick={() => onEditCourse(course)}
                                                    title="Редагувати дисципліну"
                                                >
                                                    ✎ Редагувати
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button admin-action-btn admin-action-delete"
                                                    onClick={() => onDeleteCourse(course)}
                                                    title="Видалити дисципліну"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
