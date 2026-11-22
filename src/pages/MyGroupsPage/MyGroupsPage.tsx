import {useCallback, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router'
import {courseClassService} from '../../services/api/courseClassService'
import {studentCourseService, type StudentCourse} from '../../services/api/studentCourseService'
import {useAuthSession} from '../../features/auth/useAuthSession'
import {Loader} from '../../components/ui/Loader'
import type {CourseClass} from '../../types/catalog'

export function MyGroupsPage() {
    const {user} = useAuthSession()
    const userId = user?.id ?? 1

    const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([])
    const [allClasses, setAllClasses] = useState<CourseClass[]>([])
    const [groupInputs, setGroupInputs] = useState<Record<number, string>>({})
    const [savingMap, setSavingMap] = useState<Record<number, boolean>>({})
    const [successMap, setSuccessMap] = useState<Record<number, boolean>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null)

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [enrolled, classes] = await Promise.all([
                studentCourseService.getStudentCourses(userId),
                courseClassService.getAll().catch(() => [] as CourseClass[]),
            ])
            setStudentCourses(enrolled)
            setAllClasses(classes)

            // Initialize inputs
            const initialInputs: Record<number, string> = {}
            for (const sc of enrolled) {
                initialInputs[sc.courseId] = sc.group || '1'
            }
            setGroupInputs(initialInputs)
        } catch {
            setNotification({
                type: 'error',
                message: 'Не вдалося завантажити перелік ваших дисциплін із сервера. Перевірте з’єднання.',
            })
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Detect distinct practical/seminar groups from schedule for each course
    const detectedCourseGroups = useMemo(() => {
        const map = new Map<number, string[]>()
        for (const cls of allClasses) {
            const cId = cls.course?.id
            if (!cId) continue

            const rawGroup = (cls.group || '').trim()
            if (!rawGroup) continue

            // Skip pure lecture indicators
            const lower = rawGroup.toLowerCase()
            if (lower.includes('лек') || lower.includes('все') || lower === 'all') {
                continue
            }

            // Extract numeric group or short identifier
            const numMatch = rawGroup.match(/\d+/)
            const groupVal = numMatch ? numMatch[0] : rawGroup

            if (!map.has(cId)) {
                map.set(cId, [])
            }
            const list = map.get(cId)!
            if (!list.includes(groupVal)) {
                list.push(groupVal)
            }
        }

        // Sort detected groups numerically/alphabetically
        map.forEach((list) => {
            list.sort((a, b) => {
                const numA = parseInt(a, 10)
                const numB = parseInt(b, 10)
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB
                return a.localeCompare(b)
            })
        })

        return map
    }, [allClasses])

    const handleGroupChange = (courseId: number, value: string) => {
        setGroupInputs((prev) => ({
            ...prev,
            [courseId]: value,
        }))
    }

    const handleSaveGroup = async (courseId: number) => {
        const groupVal = (groupInputs[courseId] || '1').trim()
        if (!groupVal) return

        setSavingMap((prev) => ({...prev, [courseId]: true}))
        try {
            await studentCourseService.saveStudentCourse({
                userId,
                courseId,
                group: groupVal,
            })

            // Update in local state
            setStudentCourses((prev) =>
                prev.map((sc) => (sc.courseId === courseId ? {...sc, group: groupVal} : sc)),
            )

            setSuccessMap((prev) => ({...prev, [courseId]: true}))
            setTimeout(() => {
                setSuccessMap((prev) => ({...prev, [courseId]: false}))
            }, 3000)

            setNotification({
                type: 'success',
                message: `Групу ${groupVal} успішно збережено! Розклад оновлено.`,
            })
        } catch {
            setNotification({
                type: 'error',
                message: 'Не вдалося зберегти номер групи на сервері. Спробуйте ще раз.',
            })
        } finally {
            setSavingMap((prev) => ({...prev, [courseId]: false}))
        }
    }

    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return studentCourses
        const q = searchQuery.toLowerCase()
        return studentCourses.filter(
            (sc) =>
                sc.course?.name?.toLowerCase().includes(q) ||
                sc.course?.faculty?.toLowerCase().includes(q) ||
                sc.course?.department?.toLowerCase().includes(q),
        )
    }, [studentCourses, searchQuery])

    return (
        <section className="page-section">
            <div className="page-heading">
                <div>
                    <h1>Групи для дисциплін</h1>
                    <p className="page-intro text-muted">
                        Вкажіть номер вашої групи (числом) для кожної обраної дисципліни.
                        Лекції відображатимуться для всіх, а семінари та практичні заняття — лише для вашої групи.
                    </p>
                </div>
                <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                    <Link to="/my-courses" className="button">
                        📚 Мої дисципліни
                    </Link>
                    <Link to="/schedule" className="button primary-button">
                        🗓️ Мій розклад
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

            <div className="card" style={{padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <strong>Всього обраних дисциплін: {studentCourses.length}</strong>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>
                        Зміни автоматично відображаються у вашому персональному розкладі.
                    </div>
                </div>

                {studentCourses.length > 0 && (
                    <div style={{minWidth: '240px', maxWidth: '350px'}}>
                        <input
                            type="search"
                            className="input"
                            placeholder="Пошук серед обраних дисциплін..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '3rem 0'}}>
                    <Loader />
                </div>
            ) : studentCourses.length === 0 ? (
                <div className="card" style={{padding: '3rem 2rem', textAlign: 'center'}}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📚</div>
                    <h2 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>У вас поки немає обраних дисциплін</h2>
                    <p className="text-muted" style={{maxWidth: '480px', margin: '0 auto 1.5rem auto'}}>
                        Щоб налаштувати групи для практик та семінарів, спочатку оберіть дисципліни вашого індивідуального плану.
                    </p>
                    <Link to="/my-courses" className="button primary-button" style={{padding: '0.75rem 1.5rem'}}>
                        + Обрати дисципліни
                    </Link>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card" style={{padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                    <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Дисциплін не знайдено</p>
                    <p className="text-muted">За запитом «{searchQuery}» нічого не знайдено серед обраних вами курсів.</p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {filteredCourses.map((sc) => {
                        const courseId = sc.courseId
                        const course = sc.course
                        const currentInput = groupInputs[courseId] ?? (sc.group || '1')
                        const isSaving = Boolean(savingMap[courseId])
                        const isSuccess = Boolean(successMap[courseId])
                        const detectedGroups = detectedCourseGroups.get(courseId) || []

                        return (
                            <div
                                key={courseId}
                                className="card"
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    borderLeft: '4px solid var(--primary, #0066cc)',
                                }}
                            >
                                <div style={{flex: '1', minWidth: '260px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                                        <h3 style={{fontSize: '1.1rem', margin: 0}}>
                                            {course?.name || `Дисципліна #${courseId}`}
                                        </h3>
                                    </div>
                                    <p className="text-muted" style={{fontSize: '0.85rem', margin: 0}}>
                                        {course?.faculty ? `${course.faculty} · ` : ''}
                                        {course?.department || ''}
                                        {course?.year ? ` · ${course.year} рік` : ''}
                                    </p>

                                    {detectedGroups.length > 0 && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap'}}>
                                            <span style={{fontSize: '0.78rem', color: 'var(--text-muted)'}}>
                                                Групи в розкладі:
                                            </span>
                                            {detectedGroups.map((grp) => (
                                                <button
                                                    key={grp}
                                                    type="button"
                                                    onClick={() => {
                                                        handleGroupChange(courseId, grp)
                                                    }}
                                                    title={`Вибрати групу ${grp}`}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        padding: '1px 8px',
                                                        borderRadius: '12px',
                                                        border: currentInput === grp ? '1px solid var(--primary, #0066cc)' : '1px solid #d1d5db',
                                                        backgroundColor: currentInput === grp ? 'rgba(0, 102, 204, 0.1)' : '#f9fafb',
                                                        color: currentInput === grp ? 'var(--primary, #0066cc)' : 'inherit',
                                                        cursor: 'pointer',
                                                        fontWeight: currentInput === grp ? 600 : 400,
                                                    }}
                                                >
                                                    Група {grp}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <label
                                            htmlFor={`group-input-${courseId}`}
                                            style={{fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap'}}
                                        >
                                            Моя група:
                                        </label>
                                        <input
                                            id={`group-input-${courseId}`}
                                            type="number"
                                            min="1"
                                            max="50"
                                            className="input"
                                            style={{width: '80px', textAlign: 'center', fontWeight: 600, fontSize: '1rem', padding: '6px 8px'}}
                                            value={currentInput}
                                            onChange={(e) => handleGroupChange(courseId, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveGroup(courseId)
                                                }
                                            }}
                                            placeholder="1"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className={`button ${isSuccess ? '' : 'primary-button'}`}
                                        disabled={isSaving}
                                        style={{minWidth: '100px'}}
                                        onClick={() => handleSaveGroup(courseId)}
                                    >
                                        {isSaving ? 'Збереження...' : isSuccess ? '✓ Збережено' : 'Зберегти'}
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
