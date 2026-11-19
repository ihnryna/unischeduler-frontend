import type {ClassOverride} from '../../types/catalog'
import type {LocalDateTime} from '../../types/common'
import type {CalendarEvent, ClassOccurrence} from '../../types/schedule'
import {getMondayOfWeek} from '../../utils/dateUtils'
import {isLinkLike, isRealDate, isValidLink} from '../events/personalEventValidation'

/*
 * Personal class overrides (student-side changes of a university class).
 *
 * The backend stores one `ClassOverride` row per change and never touches the shared SAZ
 * timetable. The frontend projects each `CourseClass` onto every teaching week, so it has
 * to decide which occurrence(s) an override applies to. Rule (decision D-06):
 *
 * - `startsAtOverride === null` → **series** override: applies to every occurrence of the
 *   class (e.g. the room changed for the rest of the semester, or the class is dropped).
 * - `startsAtOverride !== null` → **occurrence** override: applies to the one occurrence
 *   in the same Monday–Sunday week as `startsAtOverride` (e.g. moved from Tue to Thu, or
 *   cancelled this week). A cancelled occurrence keeps its original start/end.
 *
 * Field precedence: occurrence override → series override → SAZ timetable.
 * Hiding is the exception: a hidden series (class dropped for the semester) hides every
 * occurrence, including ones with a one-off change.
 * If several overrides of the same kind match, the newest (highest id) wins.
 */

/** Which occurrences an override applies to. */
export type ClassOverrideScope = 'occurrence' | 'series'

/** What the student is recording. */
export type ClassOverrideAction = 'change' | 'hide'

export const OVERRIDE_LOCATION_MAX_LENGTH = 100 // backend @Size(max = 100)
export const OVERRIDE_DESCRIPTION_MAX_LENGTH = 200 // backend @Size(max = 200)

/** `YYYY-MM-DD` of the Monday of the week containing `value`. */
function weekKey(value: LocalDateTime): string {
    const monday = getMondayOfWeek(new Date(value))
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(
        monday.getDate(),
    ).padStart(2, '0')}`
}

function newest(overrides: ClassOverride[]): ClassOverride | null {
    return overrides.reduce<ClassOverride | null>(
        (best, current) => (best === null || current.id > best.id ? current : best),
        null,
    )
}

/** True when the override applies to a single occurrence (see the rule above). */
export function isOccurrenceOverride(override: ClassOverride): boolean {
    return override.startsAtOverride !== null && override.startsAtOverride !== undefined
}

/**
 * Finds the overrides that apply to the occurrence of `courseClassId` that originally
 * starts at `originalStartsAt`.
 */
export function findOverridesFor(
    courseClassId: number,
    originalStartsAt: LocalDateTime,
    overrides: ClassOverride[],
): {occurrence: ClassOverride | null; series: ClassOverride | null} {
    const forClass = overrides.filter((override) => override.courseClass?.id === courseClassId)
    const week = weekKey(originalStartsAt)
    return {
        occurrence: newest(
            forClass.filter(
                (override) =>
                    isOccurrenceOverride(override) &&
                    weekKey(override.startsAtOverride as LocalDateTime) === week,
            ),
        ),
        series: newest(forClass.filter((override) => !isOccurrenceOverride(override))),
    }
}

/**
 * Applies the student's overrides to one projected class occurrence. Returns the event to
 * show; `event.occurrence.isHidden` tells whether the student hid it.
 */
export function applyClassOverrides(
    base: CalendarEvent,
    courseClassId: number,
    overrides: ClassOverride[],
): CalendarEvent {
    const {occurrence, series} = findOverridesFor(courseClassId, base.startsAt, overrides)
    const pick = <K extends keyof ClassOverride>(key: K) =>
        occurrence?.[key] ?? series?.[key] ?? null

    const info: ClassOccurrence = {
        courseClassId,
        originalStartsAt: base.startsAt,
        originalEndsAt: base.endsAt,
        originalLocation: base.location,
        occurrenceOverride: occurrence,
        seriesOverride: series,
        isHidden: Boolean(occurrence?.isHidden || series?.isHidden),
    }

    if (!occurrence && !series) {
        return {...base, occurrence: info}
    }

    return {
        ...base,
        eventType: 'CLASS_OVERRIDE',
        name: (pick('classNameOverride') as string | null) ?? base.name,
        teacher: (pick('teacherOverride') as string | null) ?? base.teacher,
        group: (pick('groupOverride') as string | null) ?? base.group,
        location: (pick('locationOverride') as string | null) ?? base.location,
        description: (pick('description') as string | null) ?? base.description,
        startsAt: occurrence?.startsAtOverride ?? base.startsAt,
        endsAt: occurrence?.endsAtOverride ?? base.endsAt,
        occurrence: info,
    }
}

// ---------------------------------------------------------------------------------------
// Form model
// ---------------------------------------------------------------------------------------

/** Raw values of the class-change form (strings as typed). */
export type ClassOverrideFormValues = {
    action: ClassOverrideAction
    scope: ClassOverrideScope
    date: string // YYYY-MM-DD, occurrence scope only
    startTime: string // HH:mm
    endTime: string // HH:mm
    location: string
    description: string
}

export type ClassOverrideFormField = 'date' | 'startTime' | 'endTime' | 'location' | 'description'

export type ClassOverrideFormErrors = Partial<Record<ClassOverrideFormField, string>>

export const CLASS_OVERRIDE_FIELD_ORDER: ClassOverrideFormField[] = [
    'date',
    'startTime',
    'endTime',
    'location',
    'description',
]

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** `YYYY-MM-DD` dates of the Monday and Sunday of the week containing `value`. */
export function getWeekBounds(value: LocalDateTime): {min: string; max: string} {
    const monday = getMondayOfWeek(new Date(value))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const iso = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
        ).padStart(2, '0')}`
    return {min: iso(monday), max: iso(sunday)}
}

/**
 * Overrides that hide the occurrence (series first). Showing the class again must clear
 * every one of them.
 */
export function hidingOverrides(occurrence: ClassOccurrence): ClassOverride[] {
    return [occurrence.seriesOverride, occurrence.occurrenceOverride].filter(
        (override): override is ClassOverride => Boolean(override?.isHidden),
    )
}

/** Override that the form edits for the chosen scope. */
export function overrideForScope(
    occurrence: ClassOccurrence,
    scope: ClassOverrideScope,
): ClassOverride | null {
    return scope === 'occurrence' ? occurrence.occurrenceOverride : occurrence.seriesOverride
}

/** Initial form values for `scope`, from that scope's override or the SAZ timetable. */
export function getInitialFormValues(
    occurrence: ClassOccurrence,
    scope: ClassOverrideScope,
): ClassOverrideFormValues {
    const override = overrideForScope(occurrence, scope)
    // Series changes show the series' own values; occurrence changes start from what the
    // student currently sees (series override included).
    const series = occurrence.seriesOverride
    const startsAt = override?.startsAtOverride ?? occurrence.originalStartsAt
    const endsAt = override?.endsAtOverride ?? occurrence.originalEndsAt
    const location =
        override?.locationOverride ??
        (scope === 'occurrence' ? series?.locationOverride : null) ??
        occurrence.originalLocation ??
        ''
    return {
        action: override?.isHidden ? 'hide' : 'change',
        scope,
        date: startsAt.slice(0, 10),
        startTime: startsAt.slice(11, 16),
        endTime: endsAt.slice(11, 16),
        location,
        description: override?.description ?? '',
    }
}

/**
 * Client-side validation of the class-change form. Hiding needs no fields; for a change,
 * the new date must stay inside the occurrence's week (see the rule above).
 */
export function validateClassOverride(
    values: ClassOverrideFormValues,
    occurrence: ClassOccurrence,
): ClassOverrideFormErrors {
    const errors: ClassOverrideFormErrors = {}
    const description = values.description.trim()

    if (description.length > OVERRIDE_DESCRIPTION_MAX_LENGTH) {
        errors.description = `Примітка задовга: до ${OVERRIDE_DESCRIPTION_MAX_LENGTH} символів.`
    }

    if (values.action === 'hide') return errors

    const location = values.location.trim()
    if (location.length > OVERRIDE_LOCATION_MAX_LENGTH) {
        errors.location = `Занадто довго: до ${OVERRIDE_LOCATION_MAX_LENGTH} символів. Скоротіть посилання або вставте його в примітку.`
    } else if (location && isLinkLike(location) && !isValidLink(location)) {
        errors.location =
            'Посилання виглядає неправильним. Перевірте адресу, наприклад https://meet.google.com/…'
    }

    if (values.scope === 'series') return errors

    const {min, max} = getWeekBounds(occurrence.originalStartsAt)
    if (!values.date) {
        errors.date = 'Оберіть дату.'
    } else if (!isRealDate(values.date)) {
        errors.date = 'Вкажіть коректну дату.'
    } else if (values.date < min || values.date > max) {
        errors.date =
            'Нова дата має бути в межах того самого тижня. Якщо заняття перенесли на інший тиждень, приховайте його тут і додайте особисту подію.'
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

    return errors
}

/** Override fields the form writes (the rest is preserved from an existing override). */
export type ClassOverridePatch = {
    locationOverride: string | null
    startsAtOverride: LocalDateTime | null
    endsAtOverride: LocalDateTime | null
    description: string | null
    isHidden: boolean
}

/**
 * Converts valid form values into override fields, or `null` when the form describes
 * no change at all (then an existing override should be removed, and none created).
 */
export function buildOverridePatch(
    values: ClassOverrideFormValues,
    occurrence: ClassOccurrence,
): ClassOverridePatch | null {
    const description = values.description.trim() || null
    const isOccurrence = values.scope === 'occurrence'
    const existing = overrideForScope(occurrence, values.scope)

    if (values.action === 'hide') {
        return {
            // Keep earlier changes, so showing the class again restores them.
            locationOverride: existing?.locationOverride ?? null,
            startsAtOverride: isOccurrence
                ? (existing?.startsAtOverride ?? occurrence.originalStartsAt)
                : null,
            endsAtOverride: isOccurrence
                ? (existing?.endsAtOverride ?? occurrence.originalEndsAt)
                : null,
            description,
            isHidden: true,
        }
    }

    const location = values.location.trim()
    // Same as SAZ (or as the series change, for one occurrence) → not an override.
    const inherited =
        (isOccurrence ? occurrence.seriesOverride?.locationOverride : null) ??
        occurrence.originalLocation ??
        ''
    const locationOverride = location && location !== inherited ? location : null

    const startsAt = isOccurrence ? `${values.date}T${values.startTime}:00` : null
    const endsAt = isOccurrence ? `${values.date}T${values.endTime}:00` : null
    const timeChanged =
        isOccurrence &&
        (startsAt !== normalizeSeconds(occurrence.originalStartsAt) ||
            endsAt !== normalizeSeconds(occurrence.originalEndsAt))

    const hasPreservedFields = Boolean(
        existing?.teacherOverride || existing?.groupOverride || existing?.classNameOverride,
    )
    if (!locationOverride && !timeChanged && !description && !hasPreservedFields) {
        return null
    }

    return {
        locationOverride,
        startsAtOverride: startsAt,
        endsAtOverride: endsAt,
        description,
        isHidden: false,
    }
}

function normalizeSeconds(value: LocalDateTime): LocalDateTime {
    return value.length === 16 ? `${value}:00` : value.slice(0, 19)
}

/**
 * True when un-hiding `override` would still leave a visible change; otherwise the
 * override only existed to hide the class and can be removed.
 */
export function hasChangesBesidesHiding(
    override: ClassOverride,
    occurrence: ClassOccurrence,
): boolean {
    const timeChanged =
        isOccurrenceOverride(override) &&
        (normalizeSeconds(override.startsAtOverride as string) !==
            normalizeSeconds(occurrence.originalStartsAt) ||
            normalizeSeconds(override.endsAtOverride ?? occurrence.originalEndsAt) !==
                normalizeSeconds(occurrence.originalEndsAt))
    return Boolean(
        timeChanged ||
            override.locationOverride ||
            override.description ||
            override.teacherOverride ||
            override.groupOverride ||
            override.classNameOverride,
    )
}
