import {useId, useState, type FormEvent} from 'react'

import {Modal} from '../ui/Modal'
import {FormField} from '../ui/FormField'
import {PAIR_TIME_SLOTS} from '../../features/schedule/scheduleConfig'
import {
    buildOverridePatch,
    CLASS_OVERRIDE_FIELD_ORDER,
    getInitialFormValues,
    getWeekBounds,
    OVERRIDE_DESCRIPTION_MAX_LENGTH,
    OVERRIDE_LOCATION_MAX_LENGTH,
    overrideForScope,
    validateClassOverride,
    type ClassOverrideAction,
    type ClassOverrideFormField,
    type ClassOverrideFormValues,
    type ClassOverrideScope,
} from '../../features/schedule/classOverrides'
import {useClassOverrideMutations} from '../../features/schedule/useClassOverrideMutations'
import {isLinkLike} from '../../features/events/personalEventValidation'
import type {ClassOccurrence} from '../../types/schedule'
import {DAY_NAMES_FULL, MONTH_NAMES_GENITIVE} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

/** The class occurrence the student is changing. */
export type EditableClass = {
    name: string
    occurrence: ClassOccurrence
}

/** What was saved, for the page's success message. */
export type ClassOverrideResult = 'changed' | 'hidden' | 'restored'

type ClassOverrideModalProps = {
    classItem: EditableClass
    /** Owner of the change. TODO(FE-13): take from `useAuth()` instead of props. */
    userId: number
    onClose: () => void
    /** Called after a successful save; the page refetches the schedule. */
    onSaved: (result: ClassOverrideResult) => void
}

function formatDayDate(value: string): string {
    const date = new Date(value)
    return `${DAY_NAMES_FULL[(date.getDay() + 6) % 7].toLowerCase()}, ${date.getDate()} ${
        MONTH_NAMES_GENITIVE[date.getMonth()]
    }`
}

/**
 * Modal where a student records a change of one university class in their **personal**
 * schedule only: the teacher moved it (new day/time), changed the room, moved it online
 * (meeting link), or cancelled it (hide it). The change applies either to this occurrence
 * or to every occurrence of the class. The shared SAZ timetable is never modified; "Скинути
 * зміни" removes the student's change and restores the university data.
 *
 * Mount it only while open, so each opening starts from the current values.
 */
export function ClassOverrideModal({
    classItem,
    userId,
    onClose,
    onSaved,
}: Readonly<ClassOverrideModalProps>) {
    const {occurrence} = classItem
    const idPrefix = useId()
    const formId = `${idPrefix}-form`
    const fieldId = (field: ClassOverrideFormField) => `${idPrefix}-${field}`

    const initialScope: ClassOverrideScope =
        occurrence.occurrenceOverride || !occurrence.seriesOverride ? 'occurrence' : 'series'
    const [values, setValues] = useState<ClassOverrideFormValues>(() =>
        getInitialFormValues(occurrence, initialScope),
    )
    const [touched, setTouched] = useState<Partial<Record<ClassOverrideFormField, boolean>>>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)
    const {save, remove, isSaving, error: saveError, resetError} = useClassOverrideMutations()

    const existing = overrideForScope(occurrence, values.scope)
    const errors = validateClassOverride(values, occurrence)
    const hasErrors = Object.keys(errors).length > 0
    const visibleError = (field: ClassOverrideFormField) =>
        submitAttempted || touched[field] ? errors[field] : undefined
    const weekBounds = getWeekBounds(occurrence.originalStartsAt)
    const isChange = values.action === 'change'
    const isOccurrence = values.scope === 'occurrence'

    const update = (field: ClassOverrideFormField, value: string) => {
        setValues((current) => ({...current, [field]: value}))
        if (saveError) resetError()
    }
    const markTouched = (field: ClassOverrideFormField) =>
        setTouched((current) => (current[field] ? current : {...current, [field]: true}))

    const setAction = (action: ClassOverrideAction) => {
        setValues((current) => ({...current, action}))
        if (saveError) resetError()
    }

    // Switching scope loads that scope's own saved change (or the university data).
    const setScope = (scope: ClassOverrideScope) => {
        setValues((current) => ({
            ...getInitialFormValues(occurrence, scope),
            action: current.action,
        }))
        setTouched({})
        setSubmitAttempted(false)
        if (saveError) resetError()
    }

    const handleClose = () => {
        if (!isSaving) onClose()
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isSaving) return
        setSubmitAttempted(true)

        if (hasErrors) {
            const firstInvalid = CLASS_OVERRIDE_FIELD_ORDER.find((field) => errors[field])
            if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus()
            return
        }

        const patch = buildOverridePatch(values, occurrence)
        if (patch === null && !existing) {
            // Nothing differs from the university timetable: nothing to store.
            onClose()
            return
        }
        const ok = await save({
            userId,
            courseClassId: occurrence.courseClassId,
            existing,
            patch,
        })
        if (ok) onSaved(patch === null ? 'restored' : patch.isHidden ? 'hidden' : 'changed')
    }

    const handleReset = async () => {
        if (!existing || isSaving) return
        const ok = await remove(existing.id)
        if (ok) onSaved('restored')
    }

    const trimmedLocation = values.location.trim()
    const locationHint =
        trimmedLocation && isLinkLike(trimmedLocation) && !errors.location
            ? 'Онлайн-заняття: посилання буде на картці заняття.'
            : `Нова аудиторія (наприклад, 1-225) або посилання на зустріч. За розкладом: ${
                  occurrence.originalLocation ?? 'не вказано'
              }.`

    const originalSummary = `${formatDayDate(occurrence.originalStartsAt)}, ${formatTime(
        occurrence.originalStartsAt,
    )}–${formatTime(occurrence.originalEndsAt)}`

    return (
        <Modal
            isOpen
            title="Зміни заняття"
            onClose={handleClose}
            closeOnBackdropClick={false}
            footer={
                <>
                    {existing && (
                        <button
                            type="button"
                            className="button modal-btn-danger modal-footer-start"
                            onClick={handleReset}
                            disabled={isSaving}
                        >
                            Скинути зміни
                        </button>
                    )}
                    <button
                        type="button"
                        className="button modal-btn-secondary"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        form={formId}
                        className="primary-button"
                        disabled={isSaving}
                        aria-busy={isSaving}
                    >
                        {isSaving ? 'Зберігаємо…' : isChange ? 'Зберегти' : 'Приховати'}
                    </button>
                </>
            }
        >
            <form
                id={formId}
                className="modal-form"
                onSubmit={handleSubmit}
                noValidate
                aria-busy={isSaving}
            >
                <div className="class-override-summary">
                    <strong>{classItem.name}</strong>
                    <span>За розкладом університету: {originalSummary}</span>
                    <span className="form-field-hint">
                        Зміни бачите лише ви — загальний розклад САЗ не змінюється.
                    </span>
                </div>

                {submitAttempted && hasErrors && (
                    <div className="form-error-alert" role="alert">
                        <span aria-hidden="true">!! </span>
                        Перевірте позначені поля — зміни ще не збережено.
                    </div>
                )}

                {saveError && (
                    <div className="form-error-alert" role="alert">
                        <span aria-hidden="true">!! </span>
                        {saveError}
                    </div>
                )}

                <fieldset className="choice-group">
                    <legend className="form-field-label">Що сталося?</legend>
                    <label className="choice-option">
                        <input
                            type="radio"
                            name={`${idPrefix}-action`}
                            checked={isChange}
                            onChange={() => setAction('change')}
                        />
                        <span>Заняття перенесли або змінили аудиторію чи формат</span>
                    </label>
                    <label className="choice-option">
                        <input
                            type="radio"
                            name={`${idPrefix}-action`}
                            checked={!isChange}
                            onChange={() => setAction('hide')}
                        />
                        <span>Заняття скасовано — приховати з мого розкладу</span>
                    </label>
                </fieldset>

                <fieldset className="choice-group">
                    <legend className="form-field-label">Для яких занять?</legend>
                    <label className="choice-option">
                        <input
                            type="radio"
                            name={`${idPrefix}-scope`}
                            checked={isOccurrence}
                            onChange={() => setScope('occurrence')}
                        />
                        <span>Лише це заняття ({formatDayDate(occurrence.originalStartsAt)})</span>
                    </label>
                    <label className="choice-option">
                        <input
                            type="radio"
                            name={`${idPrefix}-scope`}
                            checked={!isOccurrence}
                            onChange={() => setScope('series')}
                        />
                        <span>Усі заняття цього предмета в семестрі</span>
                    </label>
                </fieldset>

                {isChange && isOccurrence && (
                    <>
                        <FormField
                            label="Дата"
                            id={fieldId('date')}
                            required
                            error={visibleError('date')}
                            hint="У межах цього тижня."
                        >
                            <input
                                className="input"
                                type="date"
                                min={weekBounds.min}
                                max={weekBounds.max}
                                value={values.date}
                                onChange={(e) => update('date', e.target.value)}
                                onBlur={() => markTouched('date')}
                            />
                        </FormField>

                        <div className="form-row">
                            <FormField
                                label="Початок"
                                id={fieldId('startTime')}
                                required
                                error={visibleError('startTime')}
                            >
                                <input
                                    className="input"
                                    type="time"
                                    step={300}
                                    value={values.startTime}
                                    onChange={(e) => update('startTime', e.target.value)}
                                    onBlur={() => markTouched('startTime')}
                                />
                            </FormField>

                            <FormField
                                label="Кінець"
                                id={fieldId('endTime')}
                                required
                                error={visibleError('endTime')}
                            >
                                <input
                                    className="input"
                                    type="time"
                                    step={300}
                                    value={values.endTime}
                                    onChange={(e) => update('endTime', e.target.value)}
                                    onBlur={() => markTouched('endTime')}
                                />
                            </FormField>
                        </div>

                        <div className="form-field">
                            <span className="form-field-label" id={`${idPrefix}-slots`}>
                                Швидкий вибір пари
                            </span>
                            <div
                                className="admin-slot-presets"
                                role="group"
                                aria-labelledby={`${idPrefix}-slots`}
                            >
                                {PAIR_TIME_SLOTS.map((slot) => {
                                    const isActive =
                                        values.startTime === slot.start &&
                                        values.endTime === slot.end
                                    return (
                                        <button
                                            key={slot.start}
                                            type="button"
                                            className={`admin-slot-pill ${isActive ? 'is-selected' : ''}`}
                                            aria-pressed={isActive}
                                            onClick={() => {
                                                setValues((current) => ({
                                                    ...current,
                                                    startTime: slot.start,
                                                    endTime: slot.end,
                                                }))
                                                if (saveError) resetError()
                                            }}
                                        >
                                            {slot.start} – {slot.end}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {isChange && !isOccurrence && (
                    <p className="form-field-hint">
                        Час можна змінити лише для окремого заняття. Для всіх занять — аудиторію
                        або посилання на зустріч.
                    </p>
                )}

                {isChange && (
                    <FormField
                        label="Аудиторія або посилання на зустріч"
                        id={fieldId('location')}
                        error={visibleError('location')}
                        hint={locationHint}
                    >
                        <input
                            className="input"
                            type="text"
                            autoComplete="off"
                            maxLength={OVERRIDE_LOCATION_MAX_LENGTH + 20}
                            placeholder="1-225 або https://meet.google.com/…"
                            value={values.location}
                            onChange={(e) => update('location', e.target.value)}
                            onBlur={() => markTouched('location')}
                        />
                    </FormField>
                )}

                <FormField
                    label="Примітка"
                    id={fieldId('description')}
                    error={visibleError('description')}
                    hint={`${values.description.trim().length} / ${OVERRIDE_DESCRIPTION_MAX_LENGTH}`}
                >
                    <textarea
                        className="textarea"
                        rows={2}
                        placeholder={
                            isChange
                                ? 'Наприклад: викладач переніс через конференцію'
                                : 'Наприклад: скасовано, відпрацювання згодом'
                        }
                        value={values.description}
                        onChange={(e) => update('description', e.target.value)}
                        onBlur={() => markTouched('description')}
                    />
                </FormField>
            </form>
        </Modal>
    )
}
