import type {ClassOverride} from './catalog'
import type {LocalDateTime} from './common'

export type EventType = 'COURSE_CLASS' | 'CLASS_OVERRIDE' | 'PERSONAL'

export type CalendarEvent = {
    eventId: number
    eventType: EventType
    name: string
    teacher: string | null
    group: string | null
    location: string | null
    description: string | null
    startsAt: LocalDateTime
    endsAt: LocalDateTime
    weeks?: number[]
    /**
     * Frontend-only (not in the backend DTO): set on university classes projected for the
     * shown week, so the student's personal changes (`ClassOverride`) can be edited.
     */
    occurrence?: ClassOccurrence
}

/** Frontend-only: one weekly occurrence of a `CourseClass` and the overrides applied to it. */
export type ClassOccurrence = {
    courseClassId: number
    /** Start/end/room from the university (SAZ) timetable for this week, before overrides. */
    originalStartsAt: LocalDateTime
    originalEndsAt: LocalDateTime
    originalLocation: string | null
    /** Override for this occurrence only (it has `startsAtOverride`). */
    occurrenceOverride: ClassOverride | null
    /** Override for every occurrence of the class (no `startsAtOverride`). */
    seriesOverride: ClassOverride | null
    /** True when the student hid this occurrence from the personal schedule. */
    isHidden: boolean
}

export type CalendarEventFilter = {
    userId?: number
    startsAt?: LocalDateTime
    endsAt?: LocalDateTime
    weekOffset?: number
}

export type PersonalEvent = {
    id: number
    userId: number
    name: string
    location: string | null
    description: string | null
    startsAt: LocalDateTime
    endsAt: LocalDateTime
}

type PersonalEventFields = {
    name: string
    location?: string | null
    description?: string | null
    startsAt: LocalDateTime
    endsAt: LocalDateTime
}

export type PersonalEventCreate = PersonalEventFields & {
    userId: number
}

export type PersonalEventUpdate = PersonalEventFields & {
    id: number
}
