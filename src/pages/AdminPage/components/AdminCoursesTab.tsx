import {useMemo, useState} from 'react'
import {formatStudyYear} from '../../../utils/studyYear'
import type {Course, Semester, Speciality} from '../../../types/catalog'
import {
    EMPTY_COURSE_FILTERS,
    SEMESTER_OPTIONS,
    getCourseYears,
    isCourseFilterActive,
    matchesCourseFilters,
    type CourseFilterValues,
} from '../../../features/courses/courseFilters'

type AdminCoursesTabProps = {
    courses: Course[]
    specialities: Speciality[]
    onAddCourse: () => void
    onEditCourse: (course: Course) => void
    onDeleteCourse: (course: Course) => void
}

export function AdminCoursesTab({
    courses,
    specialities,
    onAddCourse,
    onEditCourse,
    onDeleteCourse,
}: Readonly<AdminCoursesTabProps>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<CourseFilterValues>(EMPTY_COURSE_FILTERS)
    const setFilter = <K extends keyof CourseFilterValues>(key: K, value: CourseFilterValues[K]) =>
        setFilters((current) => ({...current, [key]: value}))
    const availableYears = useMemo(() => getCourseYears(courses), [courses])

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.department.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesSearch && matchesCourseFilters(course, filters)
        })
    }, [courses, searchQuery, filters])

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

                    <div className="admin-filter-selects">
                    <select
                        className="select admin-filter-select"
                        aria-label="Фільтр за спеціальністю"
                        value={filters.specialityId}
                        onChange={(e) => setFilter('specialityId', e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    >
                        <option value="ALL">Всі спеціальності</option>
                        {specialities.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                                {spec.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="select admin-filter-select"
                        aria-label="Фільтр за семестром"
                        value={filters.semester}
                        onChange={(e) => setFilter('semester', e.target.value as Semester | 'ALL')}
                    >
                        <option value="ALL">Всі семестри</option>
                        {SEMESTER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="select admin-filter-select"
                        aria-label="Фільтр за роком навчання"
                        value={filters.year}
                        onChange={(e) => setFilter('year', e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    >
                        <option value="ALL">Всі роки навчання</option>
                        {availableYears.map((yr) => (
                            <option key={yr} value={yr}>
                                {formatStudyYear(yr)}
                            </option>
                        ))}
                    </select>

                    {(searchQuery || isCourseFilterActive(filters)) && (
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={() => {
                                setSearchQuery('')
                                setFilters(EMPTY_COURSE_FILTERS)
                            }}
                        >
                            Скинути
                        </button>
                    )}
                    </div>
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
                            Спробуйте змінити пошуковий запит чи фільтри або додайте нову дисципліну до каталогу.
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
                                                {getSemesterLabel(course.semester)} · {formatStudyYear(course.year)}
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
