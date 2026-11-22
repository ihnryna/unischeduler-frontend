import {useCallback, useEffect, useMemo, useState} from 'react'
import {formatStudyYear} from '../../utils/studyYear'
import {
    EMPTY_COURSE_FILTERS,
    SEMESTER_OPTIONS,
    getCourseYears,
    isCourseFilterActive,
    matchesCourseFilters,
    type CourseFilterValues,
} from '../../features/courses/courseFilters'
import type {Semester} from '../../types/catalog'
import {Link} from 'react-router'
import type {Course, Speciality} from '../../types/catalog'
import {courseService} from '../../services/api/courseService'
import {specialityService} from '../../services/api/specialityService'
import {studentCourseService, type StudentCourse} from '../../services/api/studentCourseService'
import {useAuthSession} from '../../features/auth/useAuthSession'
import {Loader} from '../../components/ui/Loader'

export function MyCoursesPage() {
    const {user} = useAuthSession()
    const userId = user?.id ?? 1

    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [specialities, setSpecialities] = useState<Speciality[]>([])
    const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTab, setFilterTab] = useState<'ALL' | 'ENROLLED' | 'AVAILABLE'>('ALL')
    const [filters, setFilters] = useState<CourseFilterValues>(EMPTY_COURSE_FILTERS)
    const setFilter = <K extends keyof CourseFilterValues>(key: K, value: CourseFilterValues[K]) =>
        setFilters((current) => ({...current, [key]: value}))
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
    const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null)

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [courses, enrolled, specs] = await Promise.all([
                courseService.getAll(),
                studentCourseService.getStudentCourses(userId),
                specialityService.getAll().catch(() => [] as Speciality[]),
            ])
            setAllCourses(courses)
            setStudentCourses(enrolled)
            setSpecialities(specs)
        } catch {
            setNotification({
                type: 'error',
                message: 'Не вдалося завантажити перелік дисциплін із сервера. Перевірте з’єднання.',
            })
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const enrolledCourseIds = useMemo(() => {
        return new Set(studentCourses.map((sc) => sc.courseId))
    }, [studentCourses])

    const enrolledCount = enrolledCourseIds.size

    const handleToggleEnroll = async (course: Course) => {
        setActionLoadingId(course.id)
        const isEnrolled = enrolledCourseIds.has(course.id)

        try {
            if (isEnrolled) {
                await studentCourseService.removeStudentCourse(course.id, userId)
                setStudentCourses((prev) => prev.filter((sc) => sc.courseId !== course.id))
                setNotification({
                    type: 'info',
                    message: `Дисципліну «${course.name}» видалено з вашого вибору.`,
                })
            } else {
                const added = await studentCourseService.saveStudentCourse({
                    userId,
                    courseId: course.id,
                    group: '1',
                })
                setStudentCourses((prev) => [...prev, added])
                setNotification({
                    type: 'success',
                    message: `Дисципліну «${course.name}» додано до ваших дисциплін! За замовчуванням призначено групу 1.`,
                })
            }
        } catch {
            setNotification({
                type: 'error',
                message: 'Не вдалося зберегти зміни на сервері. Спробуйте ще раз.',
            })
        } finally {
            setActionLoadingId(null)
        }
    }

    const availableYears = useMemo(() => getCourseYears(allCourses), [allCourses])

    const filteredCourses = useMemo(() => {
        return allCourses.filter((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id)

            if (filterTab === 'ENROLLED' && !isEnrolled) return false
            if (filterTab === 'AVAILABLE' && isEnrolled) return false

            if (!matchesCourseFilters(course, filters)) return false

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchesName = course.name.toLowerCase().includes(q)
                const matchesFaculty = course.faculty?.toLowerCase().includes(q)
                const matchesDept = course.department?.toLowerCase().includes(q)
                if (!matchesName && !matchesFaculty && !matchesDept) return false
            }

            return true
        })
    }, [allCourses, enrolledCourseIds, filterTab, filters, searchQuery])

    return (
        <section className="page-section">
            <div className="page-heading">
                <div>
                    <h1>Мої дисципліни</h1>
                </div>
                <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                    <Link to="/my-groups" className="button primary-button">
                        👥 Налаштувати групи ({enrolledCount})
                    </Link>
                </div>
            </div>

            {notification && (
                <div className={`notice notice-${notification.type}`} role="alert" style={{marginBottom: '1.25rem'}}>
                    <span aria-hidden="true">
                        {notification.type === 'success' ? '✅ ' : notification.type === 'error' ? '⚠️ ' : 'ℹ️ '}
                    </span>
                    {notification.message}
                </div>
            )}

            <div className="card" style={{padding: '1.25rem', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <button
                            type="button"
                            className={`button ${filterTab === 'ALL' ? 'primary-button' : ''}`}
                            onClick={() => setFilterTab('ALL')}
                        >
                            Всі дисципліни ({allCourses.length})
                        </button>
                        <button
                            type="button"
                            className={`button ${filterTab === 'ENROLLED' ? 'primary-button' : ''}`}
                            onClick={() => setFilterTab('ENROLLED')}
                        >
                            ✓ Мої обрані ({enrolledCount})
                        </button>
                        <button
                            type="button"
                            className={`button ${filterTab === 'AVAILABLE' ? 'primary-button' : ''}`}
                            onClick={() => setFilterTab('AVAILABLE')}
                        >
                            Не обрані ({allCourses.length - enrolledCount})
                        </button>
                    </div>

                    <div style={{flex: '1', minWidth: '220px', maxWidth: '350px'}}>
                        <input
                            type="search"
                            className="input"
                            placeholder="Пошук дисципліни за назвою..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters by speciality, semester & year of study */}
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #e2e8f0)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px'}}>
                        <label htmlFor="filter-spec" style={{fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap'}}>
                            Спеціальність:
                        </label>
                        <select
                            id="filter-spec"
                            className="select"
                            value={filters.specialityId}
                            onChange={(e) => setFilter('specialityId', e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            style={{padding: '6px 10px', fontSize: '0.85rem', width: '100%'}}
                        >
                            <option value="ALL">Всі спеціальності ({specialities.length})</option>
                            {specialities.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px'}}>
                        <label htmlFor="filter-semester" style={{fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap'}}>
                            Семестр:
                        </label>
                        <select
                            id="filter-semester"
                            className="select"
                            value={filters.semester}
                            onChange={(e) => setFilter('semester', e.target.value as Semester | 'ALL')}
                            style={{padding: '6px 10px', fontSize: '0.85rem'}}
                        >
                            <option value="ALL">Всі семестри</option>
                            {SEMESTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px'}}>
                        <label htmlFor="filter-year" style={{fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap'}}>
                            Рік навчання:
                        </label>
                        <select
                            id="filter-year"
                            className="select"
                            value={filters.year}
                            onChange={(e) => setFilter('year', e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            style={{padding: '6px 10px', fontSize: '0.85rem'}}
                        >
                            <option value="ALL">Всі роки</option>
                            {availableYears.map((yr) => (
                                <option key={yr} value={yr}>
                                    {formatStudyYear(yr)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(isCourseFilterActive(filters) || searchQuery) && (
                        <button
                            type="button"
                            className="button"
                            style={{fontSize: '0.85rem', padding: '6px 12px'}}
                            onClick={() => {
                                setFilters(EMPTY_COURSE_FILTERS)
                                setSearchQuery('')
                            }}
                        >
                            ✕ Скинути фільтри
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '3rem 0'}}>
                    <Loader />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card" style={{padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                    <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Дисциплін не знайдено</p>
                    <p className="text-muted">
                        {searchQuery ? 'Спробуйте змінити пошуковий запит' : 'Немає дисциплін у вибраній категорії'}
                    </p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem'}}>
                    {filteredCourses.map((course) => {
                        const isEnrolled = enrolledCourseIds.has(course.id)
                        const isActionLoading = actionLoadingId === course.id
                        const studentCourse = studentCourses.find((sc) => sc.courseId === course.id)

                        return (
                            <div
                                key={course.id}
                                className="card"
                                style={{
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    border: isEnrolled ? '2px solid var(--primary, #0066cc)' : undefined,
                                    boxShadow: isEnrolled ? '0 2px 8px rgba(0, 102, 204, 0.12)' : undefined,
                                }}
                            >
                                <div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                        <h3 style={{fontSize: '1.05rem', margin: 0, lineHeight: '1.3'}}>
                                            {course.name}
                                        </h3>
                                        {isEnrolled && (
                                            <span
                                                className="badge badge-success"
                                                style={{
                                                    backgroundColor: '#10b981',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                ✓ Обрано
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                                        {course.faculty} · {course.department}
                                    </p>

                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                                        <span>Семестр: {course.semester === 'AUTUMN' ? 'Осінній' : course.semester === 'SPRING' ? 'Весняний' : 'Літній'}</span>
                                        <span>•</span>
                                        <span>{formatStudyYear(course.year)}</span>
                                    </div>

                                    {course.specialities && course.specialities.length > 0 && (
                                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem'}}>
                                            {course.specialities.map((s) => (
                                                <span
                                                    key={s.id}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        backgroundColor: 'var(--bg-subtle, #f1f5f9)',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                    }}
                                                >
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    {isEnrolled ? (
                                        <Link
                                            to="/my-groups"
                                            style={{fontSize: '0.85rem', color: 'var(--primary, #0066cc)', textDecoration: 'none'}}
                                        >
                                            Група: <strong>{studentCourse?.group || '1'}</strong> ✎
                                        </Link>
                                    ) : (
                                        <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Не в плані</span>
                                    )}

                                    <button
                                        type="button"
                                        className={`button ${isEnrolled ? '' : 'primary-button'}`}
                                        disabled={isActionLoading}
                                        style={{fontSize: '0.85rem', padding: '6px 12px'}}
                                        onClick={() => handleToggleEnroll(course)}
                                    >
                                        {isActionLoading
                                            ? 'Збереження...'
                                            : isEnrolled
                                            ? '✕ Відмовитися'
                                            : '+ Обрати дисципліну'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
