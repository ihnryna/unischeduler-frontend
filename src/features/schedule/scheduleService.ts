import {
    mockCalendarEvents,
    mockCourses,
    mockPersonalEvents,
    mockSpecialities,
    mockUsers,
} from '../../mocks'
import type {Course, Speciality} from '../../types/catalog'
import type {CalendarEvent, CalendarEventFilter} from '../../types/schedule'

function overlapsRequestedRange(
    event: CalendarEvent,
    {startsAt, endsAt}: CalendarEventFilter,
) {
    return (!startsAt || event.endsAt >= startsAt)
        && (!endsAt || event.startsAt <= endsAt)
}

function toCalendarEvent(personalEvent: typeof mockPersonalEvents[number]): CalendarEvent {
    return {
        eventId: personalEvent.id,
        eventType: 'PERSONAL',
        name: personalEvent.name,
        teacher: null,
        group: null,
        location: personalEvent.location,
        description: personalEvent.description,
        startsAt: personalEvent.startsAt,
        endsAt: personalEvent.endsAt,
    }
}

export const scheduleService = {
    getCalendar(filters: CalendarEventFilter = {}): Promise<CalendarEvent[]> {
        const {userId} = filters

        if (userId !== undefined && !mockUsers.some((user) => user.id === userId)) {
            return Promise.reject(new Error('Тестового користувача не знайдено.'))
        }

        const personalEvents = mockPersonalEvents
            .filter((event) => userId === undefined || event.userId === userId)
            .map(toCalendarEvent)

        const events = [...mockCalendarEvents, ...personalEvents]
            .filter((event) => overlapsRequestedRange(event, filters))
            .sort((left, right) => left.startsAt.localeCompare(right.startsAt))

        return Promise.resolve(structuredClone(events))
    },

    getCourses(): Promise<Course[]> {
        return Promise.resolve(structuredClone(mockCourses))
    },

    getSpecialities(): Promise<Speciality[]> {
        return Promise.resolve(structuredClone(mockSpecialities))
    },
}
