import {useEffect, useRef, useState} from 'react'

import {
    FALLBACK_CLASS_COLOR,
    FALLBACK_PERSONAL_COLOR,
    RETRO_COLOR_PALETTE,
    personalColorKey,
    useSubjectColors,
    type ColorScope,
} from '../../features/schedule/subjectColors'
import {adminService} from '../../features/admin/adminService'
import {usePersonalEventNames} from '../../features/events/usePersonalEventNames'
import type {Course} from '../../types/catalog'

type SavedNotice = {scope: ColorScope; text: string}

type ColorRowProps = {
    title: string
    subtitle: string
    activeColor: string
    onSelect: (colorHex: string, colorName: string) => void
}

/** One subject / personal event with its preview and the palette to pick from. */
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
    const {colors, setColor, resetColors} = useSubjectColors()
    const [savedNotice, setSavedNotice] = useState<SavedNotice | null>(null)
    const [courses, setCourses] = useState<Course[]>([])
    const personalEvents = usePersonalEventNames()
    const noticeTimer = useRef<number | undefined>(undefined)

    useEffect(() => {
        const load = () => {
            adminService.getCourses().then(setCourses).catch(() => {})
        }
        load()
        window.addEventListener('unischeduler_courses_updated', load)
        return () => {
            window.removeEventListener('unischeduler_courses_updated', load)
        }
    }, [])

    useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

    const showNotice = (scope: ColorScope, text: string) => {
        setSavedNotice({scope, text})
        window.clearTimeout(noticeTimer.current)
        noticeTimer.current = window.setTimeout(() => setSavedNotice(null), 3000)
    }

    const subjects = courses.map((c) => c.name)

    const renderNotice = (scope: ColorScope) =>
        savedNotice?.scope === scope && (
            <span className="settings-saved-pill" role="status">
                ✓ {savedNotice.text}
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
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div>
                            <h2>Кольори предметів у розкладі</h2>
                            <p className="settings-card-description">
                                Оберіть колір для кожної дисципліни. Картки занять у вашому календарі
                                автоматично підсвічуватимуться обраним відтінком із фірмової ретро-палітри.
                            </p>
                        </div>

                        <div className="settings-actions">
                            {renderNotice('subjects')}
                            <button
                                type="button"
                                className="reset-button"
                                onClick={() => {
                                    resetColors('subjects')
                                    showNotice('subjects', 'Кольори дисциплін скинуто до початкових')
                                }}
                                title="Повернути початкові кольори дисциплін"
                            >
                                Скинути до початкових
                            </button>
                        </div>
                    </div>

                    <div className="subject-color-list">
                        {subjects.map((subject) => (
                            <ColorRow
                                key={subject}
                                title={subject}
                                subtitle="ІПЗ-4 · Осінній семестр"
                                activeColor={colors[subject] ?? FALLBACK_CLASS_COLOR}
                                onSelect={(colorHex, colorName) => {
                                    setColor(subject, colorHex)
                                    showNotice('subjects', `Колір для «${subject}» оновлено (${colorName})`)
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">
                        <div>
                            <h2>Кольори особистих подій</h2>
                            <p className="settings-card-description">
                                Оберіть колір для кожної особистої події. Події без власного кольору
                                показуються блакитними.
                            </p>
                        </div>

                        <div className="settings-actions">
                            {renderNotice('personal')}
                            <button
                                type="button"
                                className="reset-button"
                                onClick={() => {
                                    resetColors('personal')
                                    showNotice('personal', 'Кольори особистих подій скинуто до початкових')
                                }}
                                title="Повернути початкові кольори особистих подій"
                            >
                                Скинути до початкових
                            </button>
                        </div>
                    </div>

                    <div className="subject-color-list">
                        {personalEvents.isLoading && (
                            <p className="text-muted">Завантажуємо ваші особисті події…</p>
                        )}
                        {personalEvents.error && (
                            <p className="notice notice-error" role="alert">{personalEvents.error}</p>
                        )}
                        {!personalEvents.isLoading && !personalEvents.error && personalEvents.names.length === 0 && (
                            <p className="text-muted">
                                У вас ще немає особистих подій. Створіть подію в розкладі, і тут з’явиться її колір.
                            </p>
                        )}

                        {personalEvents.names.map((name) => (
                            <ColorRow
                                key={name}
                                title={name}
                                subtitle="Особиста подія"
                                activeColor={colors[personalColorKey(name)] ?? FALLBACK_PERSONAL_COLOR}
                                onSelect={(colorHex, colorName) => {
                                    setColor(personalColorKey(name), colorHex)
                                    showNotice('personal', `Колір для «${name}» оновлено (${colorName})`)
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
