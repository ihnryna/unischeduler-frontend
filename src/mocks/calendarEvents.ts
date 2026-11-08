import type {CalendarEvent} from '../types/schedule'
import {mockCourseClasses} from './courseClasses'

export const mockCalendarEvents: CalendarEvent[] = mockCourseClasses.map(
    (courseClass) => ({
        eventId: courseClass.id,
        eventType: 'COURSE_CLASS',
        name: courseClass.course.name,
        teacher: courseClass.teacher,
        group: courseClass.group,
        location: courseClass.location,
        description: null,
        startsAt: courseClass.startsAt,
        endsAt: courseClass.endsAt,
    }),
)
