import {
    mockSpecialities,
    mockUsers,
} from '../../mocks'
import {adminService} from '../admin/adminService'
import type {Course, Speciality} from '../../types/catalog'
import type {CalendarEvent, CalendarEventFilter} from '../../types/schedule'
import {getAcademicWeekInfo, getMondayOfWeek} from '../../utils/dateUtils'

function generateWeekCalendarEvents(weekOffset = 0, userId?: number): CalendarEvent[] {
    const monday = getMondayOfWeek()
    monday.setDate(monday.getDate() + weekOffset * 7)

    const {semesterWeek, isNumerator} = getAcademicWeekInfo(monday)

    const makeDateTime = (dayOffset: number, timeStr: string) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + dayOffset)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}T${timeStr}`
    }

    const cleanTime = (isoOrTime: string, defaultTime: string) => {
        if (!isoOrTime) return defaultTime
        const part = isoOrTime.includes('T') ? isoOrTime.split('T')[1] : isoOrTime
        const trimmed = part.trim()
        if (trimmed.length === 5) return `${trimmed}:00`
        if (trimmed.length >= 8) return trimmed.slice(0, 8)
        return defaultTime
    }

    // 1. Навчальні заняття, керовані адміністратором (через adminService)
    const adminClasses = adminService.getCourseClasses()
    const activeClasses = adminClasses.filter((cls) => {
        if (cls.weeks && cls.weeks.length > 0 && semesterWeek >= 1 && semesterWeek <= 20) {
            return cls.weeks.includes(semesterWeek)
        }
        return true
    })

    const courseEvents: CalendarEvent[] = activeClasses.map((cls) => {
        const startDate = new Date(cls.startsAt)
        const dayOffset = !isNaN(startDate.getTime())
            ? (startDate.getDay() + 6) % 7
            : 0

        const startTime = cleanTime(cls.startsAt, '08:30:00')
        const endTime = cleanTime(cls.endsAt, '09:50:00')

        return {
            eventId: cls.id,
            eventType: 'COURSE_CLASS' as const,
            name: cls.course?.name || 'Навчальне заняття',
            teacher: cls.teacher || null,
            group: cls.group || null,
            location: cls.location || null,
            description: cls.course?.department || cls.course?.faculty || null,
            startsAt: makeDateTime(dayOffset, startTime),
            endsAt: makeDateTime(dayOffset, endTime),
            weeks: cls.weeks,
        }
    })

    // 2. Персональні події залежно від тижня
    let eventIdCounter = 10000
    const personalEvents: CalendarEvent[] = []
    if (userId === undefined || userId === 1) {
        if (weekOffset === 0) {
            personalEvents.push({
                eventId: eventIdCounter++,
                eventType: 'PERSONAL',
                name: 'Зустріч команди UNIScheduler',
                teacher: null,
                group: null,
                location: 'Онлайн',
                description: 'Обговорення прогресу frontend і наступної ітерації.',
                startsAt: makeDateTime(2, '16:00:00'),
                endsAt: makeDateTime(2, '17:00:00'),
            })
        } else if (weekOffset === 1) {
            personalEvents.push({
                eventId: eventIdCounter++,
                eventType: 'PERSONAL',
                name: 'Консультація перед модульним контролем',
                teacher: null,
                group: null,
                location: 'Кафедра',
                description: 'Питання до викладача перед іспитом.',
                startsAt: makeDateTime(3, '16:00:00'),
                endsAt: makeDateTime(3, '17:30:00'),
            })
        } else if (weekOffset === -1) {
            personalEvents.push({
                eventId: eventIdCounter++,
                eventType: 'PERSONAL',
                name: 'Здача звіту з практики',
                teacher: null,
                group: null,
                location: 'Деканат',
                description: 'Підписання індивідуального плану.',
                startsAt: makeDateTime(4, '16:00:00'),
                endsAt: makeDateTime(4, '17:00:00'),
            })
        } else if (isNumerator) {
            personalEvents.push({
                eventId: eventIdCounter++,
                eventType: 'PERSONAL',
                name: 'Зустріч з ментором зі стажування',
                teacher: null,
                group: null,
                location: 'Онлайн',
                description: 'Регулярний синхрон по pet-проєкту.',
                startsAt: makeDateTime(1, '17:00:00'),
                endsAt: makeDateTime(1, '18:00:00'),
            })
        } else {
            personalEvents.push({
                eventId: eventIdCounter++,
                eventType: 'PERSONAL',
                name: 'Студентський клуб дебатів НаУКМА',
                teacher: null,
                group: null,
                location: 'Студентський хаб',
                description: 'Щотижнева зустріч клубу.',
                startsAt: makeDateTime(3, '18:00:00'),
                endsAt: makeDateTime(3, '19:30:00'),
            })
        }
    }

    return [...courseEvents, ...personalEvents].sort((left, right) =>
        left.startsAt.localeCompare(right.startsAt),
    )
}

function overlapsRequestedRange(
    event: CalendarEvent,
    {startsAt, endsAt}: CalendarEventFilter,
) {
    return (
        (!startsAt || event.endsAt >= startsAt) &&
        (!endsAt || event.startsAt <= endsAt)
    )
}

export const scheduleService = {
    getCalendar(filters: CalendarEventFilter = {}): Promise<CalendarEvent[]> {
        const {userId, weekOffset = 0} = filters

        if (userId !== undefined && !mockUsers.some((user) => user.id === userId)) {
            return Promise.reject(new Error('Тестового користувача не знайдено.'))
        }

        const events = generateWeekCalendarEvents(weekOffset, userId)
            .filter((event) => overlapsRequestedRange(event, filters))

        return Promise.resolve(structuredClone(events))
    },

    getCourses(): Promise<Course[]> {
        return Promise.resolve(structuredClone(adminService.getCourses()))
    },

    getSpecialities(): Promise<Speciality[]> {
        return Promise.resolve(structuredClone(mockSpecialities))
    },
}
