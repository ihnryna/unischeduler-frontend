import {apiClient} from '../../services/api/apiClient'
import {classOverrideService} from '../../services/api/classOverrideService'
import {courseService} from '../../services/api/courseService'
import {courseClassService} from '../../services/api/courseClassService'
import {specialityService} from '../../services/api/specialityService'
import {studentCourseService, type StudentCourse} from '../../services/api/studentCourseService'
import type {ClassOverride, Course, CourseClass, Speciality} from '../../types/catalog'
import type {CalendarEvent, CalendarEventFilter} from '../../types/schedule'
import {getAcademicWeekInfo, getMondayOfWeek} from '../../utils/dateUtils'
import {applyClassOverrides} from './classOverrides'

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
     *
     * The student's class overrides (`/class-override`) are applied here, on the frontend,
     * to each projected occurrence (rules in `classOverrides.ts`). Class entries from
     * `/calendar` are therefore ignored: the backend would apply an override to every week
     * and does not drop hidden classes. Hidden occurrences are returned with
     * `occurrence.isHidden = true` so the page can list them and offer to show them again.
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

        // 1. Fetch the week's personal events, all classes from /api/class (the university
        // timetable), this student's class overrides, and chosen courses/groups.
        const [calendarEvents, allClasses, overrides, studentCourses] = await Promise.all([
            apiClient.get<CalendarEvent[]>('/calendar', {
                userId,
                startsAt,
                endsAt,
            }).catch(() => [] as CalendarEvent[]),
            courseClassService.getAll().catch(() => [] as CourseClass[]),
            classOverrideService.getForUser(userId).catch(() => [] as ClassOverride[]),
            studentCourseService.getStudentCourses(userId).catch(() => [] as StudentCourse[]),
        ])
        const backendCalendarEvents = (calendarEvents || []).filter(
            (event) => event.eventType === 'PERSONAL',
        )

        const {semesterWeek, isVacation, semesterName, semesterYear} = getAcademicWeekInfo(monday)

        // During vacation or outside teaching weeks (1-15), regular university classes do not take place
        if (isVacation || semesterWeek === null || semesterWeek < 1 || semesterWeek > 15) {
            return backendCalendarEvents
        }

        // Stored weeks map from admin settings if any
        const storedWeeksMap: Record<number, number[]> = (() => {
            try {
                return JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
            } catch {
                return {}
            }
        })()

        // If the student has not selected any courses, their personal university schedule has no course classes.
        // (They can select courses in "Мої дисципліни" or view all university classes in "Загальний розклад").
        if (!studentCourses || studentCourses.length === 0) {
            return backendCalendarEvents
        }

        // Detect which courses have multiple distinct calendar dates across the semester
        // (e.g. parser/SQL import generates a separate class occurrence for each week).
        const courseDatesCount = new Map<number, Set<string>>()
        for (const cls of allClasses) {
            const cId = cls.course?.id
            if (!cId) continue
            const dateStr = cls.startsAt ? cls.startsAt.slice(0, 10) : ''
            if (!courseDatesCount.has(cId)) {
                courseDatesCount.set(cId, new Set())
            }
            if (dateStr) {
                courseDatesCount.get(cId)!.add(dateStr)
            }
        }

        const recurringCourseEvents: CalendarEvent[] = []

        for (const cls of allClasses) {
            const courseId = cls.course?.id
            const enrollment = studentCourses.find((sc) => sc.courseId === courseId)
            if (!enrollment) {
                continue // Course not chosen by student
            }

            const assignedGroup = (enrollment.group || '').trim().toLowerCase()
            const classGroup = (cls.group || '').trim().toLowerCase()

            // Lectures are common for all enrolled groups
            const isLecture = classGroup === '' ||
                classGroup.includes('лек') ||
                classGroup.includes('все') ||
                classGroup === 'all'

            if (!isLecture && assignedGroup) {
                const classGroupNum = classGroup.replace(/\D/g, '')
                const assignedGroupNum = assignedGroup.replace(/\D/g, '')
                if (classGroupNum && assignedGroupNum && classGroupNum !== assignedGroupNum) {
                    continue // Practice/seminar for another group
                }
            }

            // Check semester match: e.g. 'AUTUMN' course must only appear in 'AUTUMN' semester
            if (cls.course?.semester && cls.course.semester !== semesterName) {
                continue
            }

            // Check academic year match: e.g. 2026 course must only appear in 2026 academic year
            if (cls.course?.year && cls.course.year >= 2000 && cls.course.year !== semesterYear) {
                continue
            }

            const isMultiDateCourse = (courseDatesCount.get(courseId || 0)?.size ?? 0) > 1
            const classStartDate = new Date(cls.startsAt)

            let eventStartsAt: string
            let eventEndsAt: string

            if (isMultiDateCourse) {
                // If the course has real calendar dates spanning multiple weeks,
                // only include the class if it actually takes place in THIS selected week!
                if (isNaN(classStartDate.getTime()) || classStartDate < monday || classStartDate > sunday) {
                    continue
                }
                eventStartsAt = cls.startsAt
                eventEndsAt = cls.endsAt
            } else {
                // Single-date template course (e.g. mock test courses): project to the selected week
                const classWeeks = cls.weeks || storedWeeksMap[cls.id] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
                if (!classWeeks.includes(semesterWeek)) {
                    continue
                }

                const dayOffset = !isNaN(classStartDate.getTime())
                    ? (classStartDate.getDay() + 6) % 7
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

                eventStartsAt = `${yyyy}-${mm}-${dd}T${cleanStartTime}`
                eventEndsAt = `${yyyy}-${mm}-${dd}T${cleanEndTime}`
            }

            recurringCourseEvents.push(
                applyClassOverrides(
                    {
                        eventId: cls.id,
                        eventType: 'COURSE_CLASS',
                        name: cls.course?.name || 'Навчальне заняття',
                        teacher: cls.teacher || null,
                        group: cls.group || null,
                        location: cls.location || null,
                        description: cls.course?.faculty || cls.course?.department || null,
                        startsAt: eventStartsAt,
                        endsAt: eventEndsAt,
                        weeks: [semesterWeek],
                        course: cls.course ?? null,
                    },
                    cls.id,
                    overrides,
                ),
            )
        }

        const combinedEvents = [...backendCalendarEvents, ...recurringCourseEvents].sort((a, b) =>
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
