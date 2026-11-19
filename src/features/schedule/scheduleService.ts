import {apiClient} from '../../services/api/apiClient'
import {courseService} from '../../services/api/courseService'
import {courseClassService} from '../../services/api/courseClassService'
import {specialityService} from '../../services/api/specialityService'
import type {Course, CourseClass, Speciality} from '../../types/catalog'
import type {CalendarEvent, CalendarEventFilter} from '../../types/schedule'
import {getAcademicWeekInfo, getMondayOfWeek} from '../../utils/dateUtils'

function formatLocalDateTime(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

export const scheduleService = {
    /**
     * Fetches user's schedule (university classes, overrides, and personal events)
     * for the selected week. Combines backend calendar API events with recurring
     * weekly course classes so that timetable lessons repeat across semester weeks.
     */
    async getCalendar(filters: CalendarEventFilter = {}): Promise<CalendarEvent[]> {
        const {userId = 1, weekOffset = 0} = filters

        const monday = getMondayOfWeek()
        monday.setDate(monday.getDate() + weekOffset * 7)
        monday.setHours(0, 0, 0, 0)

        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        const startsAt = filters.startsAt || formatLocalDateTime(monday)
        const endsAt = filters.endsAt || formatLocalDateTime(sunday)

        // 1. Fetch specific week events from backend (personal events, overrides)
        // and all classes from /api/class (the university timetable)
        const [backendCalendarEvents, allClasses] = await Promise.all([
            apiClient.get<CalendarEvent[]>('/calendar', {
                userId,
                startsAt,
                endsAt,
            }).catch(() => [] as CalendarEvent[]),
            courseClassService.getAll().catch(() => [] as CourseClass[]),
        ])

        const {semesterWeek, isVacation, semesterName, semesterYear} = getAcademicWeekInfo(monday)

        // During vacation or outside teaching weeks (1-15), regular university classes do not take place
        if (isVacation || semesterWeek === null || semesterWeek < 1 || semesterWeek > 15) {
            return backendCalendarEvents || []
        }

        // Stored weeks map from admin settings if any
        const storedWeeksMap: Record<number, number[]> = (() => {
            try {
                return JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
            } catch {
                return {}
            }
        })()

        const recurringCourseEvents: CalendarEvent[] = []

        for (const cls of allClasses) {
            // Check semester match: e.g. 'AUTUMN' course must only appear in 'AUTUMN' semester
            if (cls.course?.semester && cls.course.semester !== semesterName) {
                continue
            }

            // Check academic year match: e.g. 2026 course must only appear in 2026 academic year
            if (cls.course?.year && cls.course.year >= 2000 && cls.course.year !== semesterYear) {
                continue
            }

            const classWeeks = cls.weeks || storedWeeksMap[cls.id] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

            // Check if this class is scheduled for this specific semester week
            if (!classWeeks.includes(semesterWeek)) {
                continue
            }

            // Determine day of week from cls.startsAt (0 = Monday, ..., 6 = Sunday)
            const startDate = new Date(cls.startsAt)
            const dayOffset = !isNaN(startDate.getTime())
                ? (startDate.getDay() + 6) % 7
                : 0

            const startTimeStr = cls.startsAt && cls.startsAt.length >= 16 ? cls.startsAt.slice(11, 19) : '08:30:00'
            const endTimeStr = cls.endsAt && cls.endsAt.length >= 16 ? cls.endsAt.slice(11, 19) : '09:50:00'

            const targetDate = new Date(monday)
            targetDate.setDate(targetDate.getDate() + dayOffset)
            const yyyy = targetDate.getFullYear()
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
            const dd = String(targetDate.getDate()).padStart(2, '0')

            const cleanStartTime = startTimeStr.length === 5 ? `${startTimeStr}:00` : startTimeStr.slice(0, 8)
            const cleanEndTime = endTimeStr.length === 5 ? `${endTimeStr}:00` : endTimeStr.slice(0, 8)

            const projectedStartsAt = `${yyyy}-${mm}-${dd}T${cleanStartTime}`
            const projectedEndsAt = `${yyyy}-${mm}-${dd}T${cleanEndTime}`

            // Check if backend already has this class in calendar for this week
            const alreadyInCalendar = (backendCalendarEvents || []).some(
                (e) => (e.eventType === 'COURSE_CLASS' || e.eventType === 'CLASS_OVERRIDE') && e.eventId === cls.id
            )

            if (!alreadyInCalendar) {
                recurringCourseEvents.push({
                    eventId: cls.id,
                    eventType: 'COURSE_CLASS',
                    name: cls.course?.name || 'Навчальне заняття',
                    teacher: cls.teacher || null,
                    group: cls.group || null,
                    location: cls.location || null,
                    description: cls.course?.faculty || cls.course?.department || null,
                    startsAt: projectedStartsAt,
                    endsAt: projectedEndsAt,
                    weeks: classWeeks,
                })
            }
        }

        const combinedEvents = [...(backendCalendarEvents || []), ...recurringCourseEvents].sort((a, b) =>
            a.startsAt.localeCompare(b.startsAt)
        )

        return combinedEvents
    },

    /**
     * Fetches all courses from backend `GET /api/course`.
     */
    getCourses(): Promise<Course[]> {
        return courseService.getAll()
    },

    /**
     * Fetches all specialities from backend `GET /api/speciality`.
     */
    getSpecialities(): Promise<Speciality[]> {
        return specialityService.getAll()
    },
}
