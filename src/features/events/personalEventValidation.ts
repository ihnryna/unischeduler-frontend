/** Raw values of the personal-event form (all strings, as typed by the user). */
export type PersonalEventFormValues = {
    name: string
    date: string // YYYY-MM-DD
    startTime: string // HH:mm
    endTime: string // HH:mm
    location: string
    description: string
}

export type PersonalEventFormField = keyof PersonalEventFormValues

export type PersonalEventFormErrors = Partial<Record<PersonalEventFormField, string>>

/** Field order used to focus the first invalid field. */
export const PERSONAL_EVENT_FIELD_ORDER: PersonalEventFormField[] = [
    'name',
    'date',
    'startTime',
    'endTime',
    'location',
    'description',
]

export const NAME_MAX_LENGTH = 100
export const LOCATION_MAX_LENGTH = 255
export const DESCRIPTION_MAX_LENGTH = 1000

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const LINK_PATTERN = /^(https?:\/\/|www\.)/i

/** True when the location looks like a meeting link rather than a room. */
export function isLinkLike(value: string): boolean {
    return LINK_PATTERN.test(value.trim())
}

/** True for a well-formed http(s) link (a bare `www.` prefix is accepted). */
export function isValidLink(value: string): boolean {
    const candidate = /^www\./i.test(value) ? `https://${value}` : value
    try {
        const url = new URL(candidate)
        return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
    } catch {
        return false
    }
}

/** Meeting link to open, or `null` when the location is a room / not a valid link. */
export function getMeetingHref(location: string | null): string | null {
    if (!location || !isLinkLike(location) || !isValidLink(location)) return null
    const trimmed = location.trim()
    return /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed
}

/** True for an existing calendar date in `YYYY-MM-DD` format. */
export function isRealDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) return false
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    )
}

/**
 * Client-side validation of the personal-event form (FR-4.5).
 * Returns a map of field → Ukrainian message; an empty object means the form is valid.
 */
export function validatePersonalEvent(values: PersonalEventFormValues): PersonalEventFormErrors {
    const errors: PersonalEventFormErrors = {}
    const name = values.name.trim()
    const location = values.location.trim()
    const description = values.description.trim()

    if (!name) {
        errors.name = 'Вкажіть назву події.'
    } else if (name.length > NAME_MAX_LENGTH) {
        errors.name = `Назва задовга: до ${NAME_MAX_LENGTH} символів.`
    }

    if (!values.date) {
        errors.date = 'Оберіть дату.'
    } else if (!isRealDate(values.date)) {
        errors.date = 'Вкажіть коректну дату.'
    }

    if (!values.startTime) {
        errors.startTime = 'Вкажіть час початку.'
    } else if (!TIME_PATTERN.test(values.startTime)) {
        errors.startTime = 'Вкажіть час у форматі ГГ:ХХ.'
    }

    if (!values.endTime) {
        errors.endTime = 'Вкажіть час завершення.'
    } else if (!TIME_PATTERN.test(values.endTime)) {
        errors.endTime = 'Вкажіть час у форматі ГГ:ХХ.'
    } else if (!errors.startTime && values.endTime <= values.startTime) {
        errors.endTime = 'Час завершення має бути пізніше за час початку.'
    }

    if (location.length > LOCATION_MAX_LENGTH) {
        errors.location = `Занадто довго: до ${LOCATION_MAX_LENGTH} символів.`
    } else if (location && isLinkLike(location) && !isValidLink(location)) {
        errors.location = 'Посилання виглядає неправильним. Перевірте адресу, наприклад https://meet.google.com/…'
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
        errors.description = `Опис задовгий: до ${DESCRIPTION_MAX_LENGTH} символів.`
    }

    return errors
}
