import {useId, useRef, useState, type FormEvent} from 'react'

import {Modal} from '../ui/Modal'
import {FormField} from '../ui/FormField'
import {PAIR_TIME_SLOTS} from '../../features/schedule/scheduleConfig'
import {useCreatePersonalEvent} from '../../features/events/useCreatePersonalEvent'
import {
    DESCRIPTION_MAX_LENGTH,
    isLinkLike,
    LOCATION_MAX_LENGTH,
    NAME_MAX_LENGTH,
    PERSONAL_EVENT_FIELD_ORDER,
    validatePersonalEvent,
    type PersonalEventFormField,
    type PersonalEventFormValues,
} from '../../features/events/personalEventValidation'
import type {PersonalEvent} from '../../types/schedule'

type CreatePersonalEventModalProps = {
    /** Owner of the new event. TODO(FE-13): take from `useAuth()` instead of props. */
    userId: number
    /** Initial value of the date field, `YYYY-MM-DD`. */
    defaultDate: string
    onClose: () => void
    /** Called after the event was saved successfully. */
    onCreated: (event: PersonalEvent) => void
}

function formatDuration(startTime: string, endTime: string): string | null {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const minutes = eh * 60 + em - (sh * 60 + sm)
    if (!Number.isFinite(minutes) || minutes <= 0) return null
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return [hours ? `${hours} год` : '', rest ? `${rest} хв` : ''].filter(Boolean).join(' ')
}

/**
 * Modal with the "new personal event" form (FE-22).
 *
 * Fields: name*, date*, start*, end*, room or online link, description. Validates on blur
 * and on submit, shows inline errors, focuses the first invalid field, sends nothing while
 * the form is invalid and keeps the entered data if saving fails. Mount it only while open
 * so every opening starts with a clean form.
 */
export function CreatePersonalEventModal({
    userId,
    defaultDate,
    onClose,
    onCreated,
}: Readonly<CreatePersonalEventModalProps>) {
    const idPrefix = useId()
    const formId = `${idPrefix}-form`
    const fieldId = (field: PersonalEventFormField) => `${idPrefix}-${field}`
    const nameRef = useRef<HTMLInputElement>(null)

    const [initialValues] = useState<PersonalEventFormValues>(() => ({
        name: '',
        date: defaultDate,
        startTime: '',
        endTime: '',
        location: '',
        description: '',
    }))
    const [values, setValues] = useState<PersonalEventFormValues>(initialValues)
    const [touched, setTouched] = useState<Partial<Record<PersonalEventFormField, boolean>>>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)
    const {create, isSaving, error: saveError, resetError} = useCreatePersonalEvent()

    const errors = validatePersonalEvent(values)
    const visibleError = (field: PersonalEventFormField) =>
        submitAttempted || touched[field] ? errors[field] : undefined
    const hasErrors = Object.keys(errors).length > 0

    const update = (field: PersonalEventFormField, value: string) => {
        setValues((current) => ({...current, [field]: value}))
        if (saveError) resetError()
    }

    // Show a field's error after the user edited it and left it (or after submit),
    // not merely because focus passed through an untouched field.
    const markTouched = (field: PersonalEventFormField) => {
        if (values[field] === initialValues[field]) return
        setTouched((current) => (current[field] ? current : {...current, [field]: true}))
    }

    const handleClose = () => {
        if (!isSaving) onClose()
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isSaving) return
        setSubmitAttempted(true)

        if (hasErrors) {
            const firstInvalid = PERSONAL_EVENT_FIELD_ORDER.find((field) => errors[field])
            if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus()
            return
        }

        const location = values.location.trim()
        const description = values.description.trim()
        const created = await create({
            userId,
            name: values.name.trim(),
            location: location || null,
            description: description || null,
            startsAt: `${values.date}T${values.startTime}:00`,
            endsAt: `${values.date}T${values.endTime}:00`,
        })

        if (created) onCreated(created)
    }

    const duration =
        !errors.startTime && !errors.endTime
            ? formatDuration(values.startTime, values.endTime)
            : null
    const trimmedLocation = values.location.trim()
    const locationHint =
        trimmedLocation && isLinkLike(trimmedLocation) && !errors.location
            ? 'Онлайн-подія: посилання буде видно в деталях.'
            : 'Номер аудиторії (наприклад, 3-214) або посилання на онлайн-зустріч.'

    return (
        <Modal
            isOpen
            title="Нова особиста подія"
            onClose={handleClose}
            closeOnBackdropClick={false}
            initialFocusRef={nameRef}
            footer={
                <>
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
                        {isSaving ? 'Зберігаємо…' : 'Створити подію'}
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
                <p className="form-required-note">
                    Обов’язкові поля позначено{' '}
                    <span className="form-field-required" aria-hidden="true">*</span>
                    <span className="visually-hidden">зірочкою</span>.
                </p>

                {submitAttempted && hasErrors && (
                    <div className="form-error-alert" role="alert">
                        <span aria-hidden="true">!! </span>
                        Перевірте позначені поля — подію ще не збережено.
                    </div>
                )}

                {saveError && (
                    <div className="form-error-alert" role="alert">
                        <span aria-hidden="true">!! </span>
                        {saveError}
                    </div>
                )}

                <FormField
                    label="Назва"
                    id={fieldId('name')}
                    required
                    error={visibleError('name')}
                >
                    <input
                        ref={nameRef}
                        className="input"
                        type="text"
                        autoComplete="off"
                        maxLength={NAME_MAX_LENGTH + 20}
                        placeholder="наприклад, Консультація з курсової"
                        value={values.name}
                        onChange={(e) => update('name', e.target.value)}
                        onBlur={() => markTouched('name')}
                    />
                </FormField>

                <FormField
                    label="Дата"
                    id={fieldId('date')}
                    required
                    error={visibleError('date')}
                >
                    <input
                        className="input"
                        type="date"
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
                        hint={duration ? `Тривалість: ${duration}` : undefined}
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
                    <div className="admin-slot-presets" role="group" aria-labelledby={`${idPrefix}-slots`}>
                        {PAIR_TIME_SLOTS.map((slot) => {
                            const isActive =
                                values.startTime === slot.start && values.endTime === slot.end
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
                                        setTouched((current) => ({
                                            ...current,
                                            startTime: true,
                                            endTime: true,
                                        }))
                                    }}
                                >
                                    {slot.start} – {slot.end}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <FormField
                    label="Аудиторія або посилання"
                    id={fieldId('location')}
                    error={visibleError('location')}
                    hint={locationHint}
                >
                    <input
                        className="input"
                        type="text"
                        autoComplete="off"
                        maxLength={LOCATION_MAX_LENGTH + 20}
                        placeholder="3-214 або https://meet.google.com/…"
                        value={values.location}
                        onChange={(e) => update('location', e.target.value)}
                        onBlur={() => markTouched('location')}
                    />
                </FormField>

                <FormField
                    label="Опис"
                    id={fieldId('description')}
                    error={visibleError('description')}
                    hint={`${values.description.trim().length} / ${DESCRIPTION_MAX_LENGTH}`}
                >
                    <textarea
                        className="textarea"
                        rows={3}
                        placeholder="Що потрібно підготувати, з ким зустріч…"
                        value={values.description}
                        onChange={(e) => update('description', e.target.value)}
                        onBlur={() => markTouched('description')}
                    />
                </FormField>
            </form>
        </Modal>
    )
}
