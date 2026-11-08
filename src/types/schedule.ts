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
}

export type CalendarEventFilter = {
    userId?: number
    startsAt?: LocalDateTime
    endsAt?: LocalDateTime
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
