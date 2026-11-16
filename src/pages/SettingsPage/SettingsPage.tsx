import {useState} from 'react'

import {
    RETRO_COLOR_PALETTE,
    useSubjectColors,
} from '../../features/schedule/subjectColors'
import {mockCourses} from '../../mocks'

export function SettingsPage() {
    const {colors, setColor, resetColors} = useSubjectColors()
    const [savedNotification, setSavedNotification] = useState<string | null>(null)

    const subjects = mockCourses.map((c) => c.name)

    const handleSelectColor = (subject: string, colorHex: string, colorName: string) => {
        setColor(subject, colorHex)
        setSavedNotification(`Колір для «${subject}» оновлено (${colorName})`)
        setTimeout(() => {
            setSavedNotification(null)
        }, 3000)
    }

    const handleReset = () => {
        resetColors()
        setSavedNotification('Усі кольори дисциплін скинуто до початкових')
        setTimeout(() => {
            setSavedNotification(null)
        }, 3000)
    }

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
                            {savedNotification && (
                                <span className="settings-saved-pill" role="status">
                                    ✓ {savedNotification}
                                </span>
                            )}
                            <button
                                type="button"
                                className="reset-button"
                                onClick={handleReset}
                                title="Повернути початкові кольори розкладу"
                            >
                                Скинути до початкових
                            </button>
                        </div>
                    </div>

                    <div className="subject-color-list">
                        {subjects.map((subject) => {
                            const activeColor = colors[subject] ?? '#d9c7f0'

                            return (
                                <div className="subject-color-item" key={subject}>
                                    <div className="subject-info">
                                        <div
                                            className="subject-preview-badge"
                                            style={{backgroundColor: activeColor}}
                                            aria-hidden="true"
                                        />
                                        <div className="subject-names">
                                            <strong className="subject-title">{subject}</strong>
                                            <span className="subject-preview-text">
                                                ІПЗ-4 · Осінній семестр
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="palette-swatches"
                                        role="radiogroup"
                                        aria-label={`Кольори для ${subject}`}
                                    >
                                        {RETRO_COLOR_PALETTE.map((paletteColor) => {
                                            const isSelected = activeColor.toLowerCase() === paletteColor.bg.toLowerCase()

                                            return (
                                                <button
                                                    type="button"
                                                    key={paletteColor.id}
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    className={`color-swatch-btn ${isSelected ? 'is-selected' : ''}`}
                                                    style={{
                                                        backgroundColor: paletteColor.bg,
                                                        ['--swatch-bg' as string]: paletteColor.bg,
                                                    }}
                                                    onClick={() =>
                                                        handleSelectColor(
                                                            subject,
                                                            paletteColor.bg,
                                                            paletteColor.name,
                                                        )
                                                    }
                                                    title={`${paletteColor.name} (${paletteColor.bg})`}
                                                >
                                                    {isSelected && <span className="swatch-check">✓</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
