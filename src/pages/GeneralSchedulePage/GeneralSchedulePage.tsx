import {useCallback, useEffect, useMemo, useState} from 'react'
import type {Course, CourseClass, Speciality} from '../../types/catalog'
import {courseService} from '../../services/api/courseService'
import {courseClassService} from '../../services/api/courseClassService'
import {specialityService} from '../../services/api/specialityService'
import {Loader} from '../../components/ui/Loader'

const DAYS = [
    {dayIndex: 1, name: 'Понеділок'},
    {dayIndex: 2, name: 'Вівторок'},
    {dayIndex: 3, name: 'Середа'},
    {dayIndex: 4, name: 'Четвер'},
    {dayIndex: 5, name: 'П’ятниця'},
    {dayIndex: 6, name: 'Субота'},
]

export function GeneralSchedulePage() {
    const [specialities, setSpecialities] = useState<Speciality[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [classes, setClasses] = useState<CourseClass[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [selectedSpecialityId, setSelectedSpecialityId] = useState<number | 'ALL'>('ALL')
    const [selectedCourseId, setSelectedCourseId] = useState<number | 'ALL'>('ALL')
    const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [specs, crs, cls] = await Promise.all([
                specialityService.getAll(),
                courseService.getAll(),
                courseClassService.getAll(),
            ])
            setSpecialities(specs)
            setCourses(crs)
            setClasses(cls)
        } catch {
            setError('Не вдалося завантажити загальний розклад із сервера. Перевірте з’єднання з бекендом.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Available groups for dropdown
    const availableGroups = useMemo(() => {
        const groups = new Set<string>()
        classes.forEach((c) => {
            if (c.group) groups.add(c.group)
        })
        return Array.from(groups).sort()
    }, [classes])

    // Courses matching the selected speciality
    const filteredCoursesForDropdown = useMemo(() => {
        if (selectedSpecialityId === 'ALL') return courses
        return courses.filter((c) =>
            c.specialities?.some((s) => s.id === selectedSpecialityId),
        )
    }, [courses, selectedSpecialityId])

    // Filtered classes according to all filter criteria
    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            // Speciality filter
            if (selectedSpecialityId !== 'ALL') {
                const courseMatchesSpec = cls.course?.specialities?.some(
                    (s) => s.id === selectedSpecialityId,
                )
                if (!courseMatchesSpec) return false
            }

            // Course filter
            if (selectedCourseId !== 'ALL') {
                if (cls.course?.id !== selectedCourseId) return false
            }

            // Group filter
            if (selectedGroup !== 'ALL') {
                if (cls.group !== selectedGroup) return false
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchesCourse = cls.course?.name?.toLowerCase().includes(q)
                const matchesTeacher = cls.teacher?.toLowerCase().includes(q)
                const matchesLocation = cls.location?.toLowerCase().includes(q)
                const matchesGroup = cls.group?.toLowerCase().includes(q)
                if (!matchesCourse && !matchesTeacher && !matchesLocation && !matchesGroup) {
                    return false
                }
            }

            return true
        })
    }, [classes, selectedSpecialityId, selectedCourseId, selectedGroup, searchQuery])

    const getDayIndex = (startsAt: string) => {
        const date = new Date(startsAt)
        return ((date.getDay() + 6) % 7) + 1
    }

    return (
        <section className="schedule-page" style={{padding: '1.5rem', maxWidth: '1400px', margin: '0 auto'}}>
            {/* Header */}
            <div className="page-heading" style={{marginBottom: '1.5rem'}}>
                <div>
                    <h1 style={{fontSize: '1.75rem', fontWeight: 700, margin: 0}}>
                        Загальний розклад НаУКМА
                    </h1>
                    <p style={{margin: '6px 0 0 0', color: 'var(--color-muted, #64748b)'}}>
                        Перегляд університетського розкладу навчальних груп, спеціальностей та дисциплін
                    </p>
                </div>
            </div>

            {/* Filter toolbar */}
            <div
                className="card"
                style={{
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'flex-end',
                }}
            >
                {/* Speciality selector */}
                <div style={{flex: '1 1 220px', minWidth: 'min(200px, 100%)'}}>
                    <label
                        htmlFor="filter-spec"
                        style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px'}}
                    >
                        Спеціальність
                    </label>
                    <select
                        id="filter-spec"
                        className="select"
                        style={{width: '100%', padding: '8px 12px'}}
                        value={selectedSpecialityId}
                        onChange={(e) => {
                            const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                            setSelectedSpecialityId(val)
                            setSelectedCourseId('ALL')
                        }}
                    >
                        <option value="ALL">Всі спеціальності</option>
                        {specialities.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                                {spec.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Course selector */}
                <div style={{flex: '1 1 240px', minWidth: 'min(200px, 100%)'}}>
                    <label
                        htmlFor="filter-course"
                        style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px'}}
                    >
                        Дисципліна
                    </label>
                    <select
                        id="filter-course"
                        className="select"
                        style={{width: '100%', padding: '8px 12px'}}
                        value={selectedCourseId}
                        onChange={(e) =>
                            setSelectedCourseId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                        }
                    >
                        <option value="ALL">Всі дисципліни</option>
                        {filteredCoursesForDropdown.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Group selector */}
                <div style={{flex: '0 1 160px', minWidth: 'min(130px, 100%)'}}>
                    <label
                        htmlFor="filter-group"
                        style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px'}}
                    >
                        Група
                    </label>
                    <select
                        id="filter-group"
                        className="select"
                        style={{width: '100%', padding: '8px 12px'}}
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option value="ALL">Всі групи</option>
                        {availableGroups.map((grp) => (
                            <option key={grp} value={grp}>
                                {grp}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search query */}
                <div style={{flex: '2 1 260px', minWidth: 'min(220px, 100%)'}}>
                    <label
                        htmlFor="filter-search"
                        style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px'}}
                    >
                        Пошук (курс, викладач, аудиторія)
                    </label>
                    <input
                        id="filter-search"
                        type="search"
                        className="input"
                        placeholder="Введіть текст для пошуку…"
                        style={{width: '100%', padding: '8px 12px'}}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Reset filters */}
                <div>
                    <button
                        type="button"
                        className="button"
                        onClick={() => {
                            setSelectedSpecialityId('ALL')
                            setSelectedCourseId('ALL')
                            setSelectedGroup('ALL')
                            setSearchQuery('')
                        }}
                    >
                        Скинути фільтри
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div
                    className="card"
                    style={{
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#fee2e2',
                        borderColor: '#f87171',
                        color: '#991b1b',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span>⚠️ {error}</span>
                    <button type="button" className="button" onClick={loadData}>
                        Спробувати знову
                    </button>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div style={{display: 'flex', justifyContent: 'center', padding: '4rem 0'}}>
                    <Loader />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredClasses.length === 0 && (
                <div
                    className="card"
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'var(--color-muted, #64748b)',
                    }}
                >
                    <p style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem'}}>
                        Заняття не знайдено
                    </p>
                    <p style={{margin: 0}}>
                        Для обраних критеріїв фільтрації розклад відсутній або база даних ще не наповнена заняттями.
                    </p>
                </div>
            )}

            {/* Schedule Days Grid */}
            {!isLoading && !error && filteredClasses.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        // min(…, 100%) lets a day card shrink below 360px on phones
                        // instead of widening the whole page.
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {DAYS.map((day) => {
                        const dayClasses = filteredClasses
                            .filter((c) => getDayIndex(c.startsAt) === day.dayIndex)
                            .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

                        return (
                            <div
                                key={day.dayIndex}
                                className="card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.85rem 1.25rem',
                                        backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.03))',
                                        borderBottom: '1px solid var(--color-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <strong style={{fontSize: '1rem'}}>{day.name}</strong>
                                    <span className="badge" style={{fontSize: '0.8rem', padding: '2px 8px'}}>
                                        {dayClasses.length} {dayClasses.length === 1 ? 'пара' : 'пар'}
                                    </span>
                                </div>

                                <div style={{padding: '1rem', flex: 1}}>
                                    {dayClasses.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                color: 'var(--color-muted, #94a3b8)',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Немає запланованих пар
                                        </div>
                                    ) : (
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                            {dayClasses.map((cls) => {
                                                const timeRange = `${cls.startsAt.slice(11, 16)} – ${cls.endsAt.slice(11, 16)}`
                                                return (
                                                    <div
                                                        key={cls.id}
                                                        style={{
                                                            padding: '0.85rem',
                                                            borderRadius: 'var(--radius-small, 6px)',
                                                            border: '1px solid var(--color-border)',
                                                            backgroundColor: 'var(--color-surface)',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 700,
                                                                    color: 'var(--color-primary-text, #2563eb)',
                                                                }}
                                                            >
                                                                ⏱ {timeRange}
                                                            </span>
                                                            <span
                                                                className="badge"
                                                                style={{fontSize: '0.75rem', padding: '2px 6px'}}
                                                            >
                                                                {cls.group}
                                                            </span>
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                fontSize: '0.95rem',
                                                                marginBottom: '6px',
                                                            }}
                                                        >
                                                            {cls.course?.name || 'Навчальне заняття'}
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize: '0.85rem',
                                                                color: 'var(--color-muted, #64748b)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '3px',
                                                            }}
                                                        >
                                                            <span>👤 Викладач: {cls.teacher || '—'}</span>
                                                            <span>📍 Аудиторія: {cls.location || '—'}</span>
                                                            {cls.course?.department && (
                                                                <span>🏛 {cls.course.department}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
