import {useEffect, useState} from 'react'
import {DEFAULT_STUDY_YEAR, STUDY_YEARS, formatStudyYear} from '../../../utils/studyYear'
import type {Course, Semester, Speciality} from '../../../types/catalog'
import {mockSpecialities} from '../../../mocks/specialities'
import type {CourseFormData} from '../../../features/admin/adminTypes'

type CourseModalProps = {
    isOpen: boolean
    courseToEdit: Course | null
    specialities?: Speciality[]
    onSave: (data: CourseFormData) => void
    onClose: () => void
}

const DEFAULT_FACULTIES = [
    'Факультет інформатики',
    'Факультет економічних наук',
    'Факультет правничих наук',
    'Факультет гуманітарних наук',
    'Факультет природничих наук',
]

export function CourseModal({
    isOpen,
    courseToEdit,
    specialities = [],
    onSave,
    onClose,
}: Readonly<CourseModalProps>) {
    const activeSpecialities = specialities.length > 0 ? specialities : mockSpecialities
    const [name, setName] = useState('')
    const [faculty, setFaculty] = useState(DEFAULT_FACULTIES[0])
    const [department, setDepartment] = useState('Кафедра інформатики')
    const [semester, setSemester] = useState<Semester>('AUTUMN')
    const [year, setYear] = useState<number>(DEFAULT_STUDY_YEAR)
    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([
        activeSpecialities[0]?.name ?? 'Інженерія програмного забезпечення',
    ])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (courseToEdit) {
            setName(courseToEdit.name)
            setFaculty(courseToEdit.faculty)
            setDepartment(courseToEdit.department)
            setSemester(courseToEdit.semester)
            setYear(courseToEdit.year)
            setSelectedSpecialities(courseToEdit.specialities.map((s) => s.name))
        } else {
            setName('')
            setFaculty(DEFAULT_FACULTIES[0])
            setDepartment('Кафедра інформатики')
            setSemester('AUTUMN')
            setYear(DEFAULT_STUDY_YEAR)
            setSelectedSpecialities([mockSpecialities[0].name])
        }
        setError(null)
    }, [courseToEdit, isOpen])

    if (!isOpen) return null

    const toggleSpeciality = (specName: string) => {
        setSelectedSpecialities((current) =>
            current.includes(specName)
                ? current.filter((item) => item !== specName)
                : [...current, specName],
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Назва дисципліни є обов’язковою')
            return
        }
        if (selectedSpecialities.length === 0) {
            setError('Оберіть хоча б одну спеціальність для курсу')
            return
        }

        onSave({
            name: name.trim(),
            faculty,
            department: department.trim(),
            semester,
            year: Number(year) || DEFAULT_STUDY_YEAR,
            specialityNames: selectedSpecialities,
        })
        onClose()
    }

    return (
        <div
            className="admin-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
        >
            <div className="admin-modal-card">
                <div className="admin-modal-header">
                    <h3 id="course-modal-title" className="admin-modal-title">
                        {courseToEdit ? '✎ Редагувати дисципліну' : '＋ Створити нову дисципліну'}
                    </h3>
                    <button
                        type="button"
                        className="admin-modal-close-btn"
                        onClick={onClose}
                        aria-label="Закрити"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="2" y1="2" x2="12" y2="12" />
                            <line x1="12" y1="2" x2="2" y2="12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-form">
                    <div className="admin-modal-body">
                        {error && (
                            <div className="admin-form-error-alert" role="alert">
                                ⚠ {error}
                            </div>
                        )}

                        <div className="admin-form-group">
                            <label className="admin-form-label" htmlFor="course-name">
                                Назва дисципліни <span className="admin-required">*</span>
                            </label>
                            <input
                                id="course-name"
                                className="input admin-form-input"
                                type="text"
                                placeholder="наприклад, Архітектура хмарних систем"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    setError(null)
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="course-faculty">
                                    Факультет
                                </label>
                                <select
                                    id="course-faculty"
                                    className="select admin-form-select"
                                    value={faculty}
                                    onChange={(e) => setFaculty(e.target.value)}
                                >
                                    {DEFAULT_FACULTIES.map((fac) => (
                                        <option key={fac} value={fac}>
                                            {fac}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="course-department">
                                    Кафедра
                                </label>
                                <input
                                    id="course-department"
                                    className="input admin-form-input"
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="Кафедра інформатики"
                                />
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="course-semester">
                                    Семестр
                                </label>
                                <select
                                    id="course-semester"
                                    className="select admin-form-select"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value as Semester)}
                                >
                                    <option value="AUTUMN">Осінній семестр</option>
                                    <option value="SPRING">Весняний семестр</option>
                                    <option value="SUMMER">Літній семестр</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="course-year">
                                    Рік навчання
                                </label>
                                <select
                                    id="course-year"
                                    className="select admin-form-select"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                >
                                    {(STUDY_YEARS as readonly number[]).includes(year) ? null : (
                                        <option value={year}>{formatStudyYear(year)}</option>
                                    )}
                                    {STUDY_YEARS.map((studyYear) => (
                                        <option key={studyYear} value={studyYear}>
                                            {formatStudyYear(studyYear)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <span className="admin-form-label">
                                Спеціальності (закріплення) <span className="admin-required">*</span>
                            </span>
                            <div className="admin-checkbox-grid">
                                {activeSpecialities.map((spec) => {
                                    const isChecked = selectedSpecialities.includes(spec.name)
                                    return (
                                        <label
                                            key={spec.id}
                                            className={`admin-checkbox-pill ${isChecked ? 'is-active' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSpeciality(spec.name)}
                                                className="admin-hidden-checkbox"
                                            />
                                            <span>{isChecked ? '✓ ' : '+ '}</span>
                                            {spec.name}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={onClose}
                        >
                            Скасувати
                        </button>
                        <button type="submit" className="button primary-button">
                            {courseToEdit ? 'Зберегти зміни' : 'Створити дисципліну'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
