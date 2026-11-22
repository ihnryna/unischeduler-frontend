import {useMemo, useState} from 'react'
import type {Course, Speciality} from '../../../types/catalog'

type AdminSpecialitiesTabProps = {
    specialities: Speciality[]
    courses: Course[]
    onAddSpeciality: (name: string) => void
    onDeleteSpeciality: (spec: Speciality) => void
}

export function AdminSpecialitiesTab({
    specialities,
    courses,
    onAddSpeciality,
    onDeleteSpeciality,
}: Readonly<AdminSpecialitiesTabProps>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [newSpecName, setNewSpecName] = useState('')

    const filteredSpecialities = useMemo(() => {
        if (!searchQuery.trim()) return specialities
        const q = searchQuery.toLowerCase()
        return specialities.filter((s) => s.name.toLowerCase().includes(q))
    }, [specialities, searchQuery])

    const getCoursesCount = (specId: number) => {
        return courses.filter((c) => c.specialities?.some((s) => s.id === specId)).length
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = newSpecName.trim()
        if (!trimmed) return
        onAddSpeciality(trimmed)
        setNewSpecName('')
    }

    return (
        <div className="admin-tab-content">
            <div className="admin-toolbar-row" style={{alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
                <div className="admin-filter-group" style={{flex: '1', minWidth: '240px', maxWidth: '350px'}}>
                    <input
                        type="text"
                        className="input admin-search-input"
                        placeholder="🔍 Пошук спеціальності"
                        aria-label="Пошук спеціальності"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <form
                    onSubmit={handleAdd}
                    style={{display: 'flex', gap: '0.5rem', flex: '1', minWidth: '280px', justifyContent: 'flex-end'}}
                >
                    <input
                        type="text"
                        className="input"
                        placeholder="Назва нової спеціальності…"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        style={{maxWidth: '320px'}}
                        required
                    />
                    <button type="submit" className="button primary-button admin-add-btn" style={{whiteSpace: 'nowrap'}}>
                        ＋ Додати спеціальність
                    </button>
                </form>
            </div>

            <div className="admin-table-container admin-card">
                <div className="admin-table-header-meta">
                    <span className="admin-table-counter">
                        Відображено <strong>{filteredSpecialities.length}</strong> із <strong>{specialities.length}</strong> спеціальностей
                    </span>
                </div>

                {filteredSpecialities.length === 0 ? (
                    <div className="admin-empty-state">
                        <p className="admin-empty-title">Спеціальностей не знайдено</p>
                        <p className="admin-empty-desc">
                            {searchQuery
                                ? 'Спробуйте змінити пошуковий запит.'
                                : 'У системі ще немає зареєстрованих спеціальностей. Створіть першу за формою вище.'}
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{width: '80px'}}>ID</th>
                                    <th>Назва спеціальності</th>
                                    <th style={{width: '200px'}}>Закріплені дисципліни</th>
                                    <th style={{width: '120px', textAlign: 'right'}}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSpecialities.map((spec) => {
                                    const linkedCount = getCoursesCount(spec.id)
                                    return (
                                        <tr key={spec.id}>
                                            <td className="admin-cell-id">#{spec.id}</td>
                                            <td className="admin-cell-title">
                                                <strong>{spec.name}</strong>
                                            </td>
                                            <td>
                                                <span className="admin-badge admin-badge-neutral">
                                                    {linkedCount} {linkedCount === 1 ? 'дисципліна' : linkedCount > 1 && linkedCount < 5 ? 'дисципліни' : 'дисциплін'}
                                                </span>
                                            </td>
                                            <td className="admin-cell-actions">
                                                <div className="admin-actions-flex" style={{justifyContent: 'flex-end'}}>
                                                    <button
                                                        type="button"
                                                        className="button admin-action-btn admin-action-delete"
                                                        onClick={() => onDeleteSpeciality(spec)}
                                                        title="Видалити спеціальність"
                                                        style={{color: 'var(--danger, #dc2626)', borderColor: '#fca5a5'}}
                                                    >
                                                        🗑 Видалити
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
