import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router'

import {
    FALLBACK_CLASS_COLOR,
    RETRO_COLOR_PALETTE,
    useSubjectColors,
} from '../../features/schedule/subjectColors'
import {studentCourseService, type StudentCourse} from '../../services/api/studentCourseService'
import {useAuthSession} from '../../features/auth/useAuthSession'

type ColorRowProps = {
    title: string
    subtitle: string
    activeColor: string
    onSelect: (colorHex: string, colorName: string) => void
}

/** One subject with its preview and the palette to pick from. */
function ColorRow({title, subtitle, activeColor, onSelect}: Readonly<ColorRowProps>) {
    return (
        <div className="subject-color-item">
            <div className="subject-info">
                <div
                    className="subject-preview-badge"
                    style={{backgroundColor: activeColor}}
                    aria-hidden="true"
                />
                <div className="subject-names">
                    <strong className="subject-title">{title}</strong>
                    <span className="subject-preview-text">{subtitle}</span>
                </div>
            </div>

            <div
                className="palette-swatches"
                role="radiogroup"
                aria-label={`Кольори для ${title}`}
            >
                {RETRO_COLOR_PALETTE.map((paletteColor) => {
                    const isSelected = activeColor.toLowerCase() === paletteColor.bg.toLowerCase()

                    return (
                        <button
                            type="button"
                            key={paletteColor.id}
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={paletteColor.name}
                            className={`color-swatch-btn ${isSelected ? 'is-selected' : ''}`}
                            style={{
                                backgroundColor: paletteColor.bg,
                                ['--swatch-bg' as string]: paletteColor.bg,
                            }}
                            onClick={() => onSelect(paletteColor.bg, paletteColor.name)}
                            title={paletteColor.name}
                        >
                            {isSelected && <span className="swatch-check" aria-hidden="true">✓</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export function SettingsPage() {
    const {user} = useAuthSession()
    const userId = user?.id ?? 1

    const {colors, setColor, resetColors} = useSubjectColors()
    const [savedNotice, setSavedNotice] = useState<string | null>(null)
    const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)
    const noticeTimer = useRef<number | undefined>(undefined)

    useEffect(() => {
        let isActive = true
        const load = async () => {
            setIsLoadingCourses(true)
            try {
                const enrolled = await studentCourseService.getStudentCourses(userId)
                if (isActive) {
                    setStudentCourses(enrolled)
                }
            } catch {
                // Ignore load error
            } finally {
                if (isActive) {
                    setIsLoadingCourses(false)
                }
            }
        }

        load()
        window.addEventListener('unischeduler_student_courses_updated', load)
        return () => {
            isActive = false
            window.removeEventListener('unischeduler_student_courses_updated', load)
        }
    }, [userId])

    useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

    const showNotice = (text: string) => {
        setSavedNotice(text)
        window.clearTimeout(noticeTimer.current)
        noticeTimer.current = window.setTimeout(() => setSavedNotice(null), 3000)
    }

    const renderNotice = () =>
        savedNotice && (
            <span className="settings-saved-pill" role="status">
                ✓ {savedNotice}
            </span>
        )

    return (
        <section className="settings-page">
            <div className="page-heading">
                <div>
                    <h1>Налаштування</h1>
                </div>
            </div>

            <div className="settings-content">
                {/* 1. Мої обрані дисципліни */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div>
                            <h2>Кольори моїх дисциплін</h2>
                        </div>

                        <div className="settings-actions">
                            {renderNotice()}
                            <button
                                type="button"
                                className="reset-button"
                                onClick={() => {
                                    resetColors('subjects')
                                    showNotice('Кольори дисциплін скинуто до початкових')
                                }}
                                title="Повернути початкові кольори дисциплін"
                            >
                                Скинути до початкових
                            </button>
                        </div>
                    </div>

                    <div className="subject-color-list">
                        {isLoadingCourses && (
                            <p className="text-muted">Завантажуємо обрані дисципліни…</p>
                        )}

                        {!isLoadingCourses && studentCourses.length === 0 && (
                            <div style={{padding: '2rem 1rem', textAlign: 'center'}}>
                                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>📚</div>
                                <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>У вас ще немає обраних дисциплін</p>
                                <p className="text-muted" style={{maxWidth: '480px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem'}}>
                                    Оберіть дисципліни у розділі «Мої дисципліни», щоб вони з’явилися тут і ви могли налаштувати для них власні кольори.
                                </p>
                                <Link to="/my-courses" className="button primary-button" style={{fontSize: '0.9rem'}}>
                                    + Обрати дисципліни
                                </Link>
                            </div>
                        )}

                        {!isLoadingCourses && studentCourses.map((sc) => {
                            const courseName = sc.course?.name || `Дисципліна #${sc.courseId}`
                            const subtitle = `${sc.course?.faculty ? `${sc.course.faculty} · ` : ''}Група ${sc.group || '1'}`

                            return (
                                <ColorRow
                                    key={sc.courseId}
                                    title={courseName}
                                    subtitle={subtitle}
                                    activeColor={colors[courseName] ?? FALLBACK_CLASS_COLOR}
                                    onSelect={(colorHex, colorName) => {
                                        setColor(courseName, colorHex)
                                        showNotice(`Колір для «${courseName}» оновлено (${colorName})`)
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>

            </div>
        </section>
    )
}
