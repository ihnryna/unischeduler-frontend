import {
    mockCourses,
    mockSpecialities,
    mockUsers,
} from '../../mocks'
import type {Course, Speciality} from '../../types/catalog'
import type {CalendarEvent, CalendarEventFilter} from '../../types/schedule'
import {getAcademicWeekInfo, getMondayOfWeek} from '../../utils/dateUtils'

function generateWeekCalendarEvents(weekOffset = 0, userId?: number): CalendarEvent[] {
    const monday = getMondayOfWeek()
    monday.setDate(monday.getDate() + weekOffset * 7)

    const {isNumerator} = getAcademicWeekInfo(monday)

    const makeDateTime = (dayOffset: number, timeStr: string) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + dayOffset)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}T${timeStr}`
    }

    let eventIdCounter = 1

    // 1. Щотижневі заняття (базовий розклад)
    const recurringClasses: CalendarEvent[] = [
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Проєктування програмних систем',
            teacher: 'В. Бублик',
            group: 'ІПЗ-4',
            location: '3-214',
            description: 'Лекція',
            startsAt: makeDateTime(0, '09:00:00'),
            endsAt: makeDateTime(0, '10:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Сучасний C++',
            teacher: 'В. Бублик',
            group: 'ІПЗ-4',
            location: '1-8',
            description: 'Лекція',
            startsAt: makeDateTime(1, '10:00:00'),
            endsAt: makeDateTime(1, '11:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Комп’ютерні мережі',
            teacher: 'М. Савчук',
            group: 'ІПЗ-4',
            location: '2-208',
            description: 'Лекція',
            startsAt: makeDateTime(2, '09:00:00'),
            endsAt: makeDateTime(2, '10:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Англійська мова',
            teacher: 'N. Smith',
            group: 'ІПЗ-4',
            location: '5-402',
            description: 'Практичне заняття',
            startsAt: makeDateTime(3, '11:00:00'),
            endsAt: makeDateTime(3, '12:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Тестування програмного забезпечення',
            teacher: 'О. Петренко',
            group: 'ІПЗ-4',
            location: '4-210',
            description: 'Семінар',
            startsAt: makeDateTime(4, '09:00:00'),
            endsAt: makeDateTime(4, '10:30:00'),
        },
    ]

    // 2. Заняття за чисельником (непарні тижні)
    const numeratorClasses: CalendarEvent[] = [
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Інженерія програмного забезпечення',
            teacher: 'О. Петренко',
            group: 'ІПЗ-4',
            location: '4-105',
            description: 'Лекція (чисельник)',
            startsAt: makeDateTime(0, '12:00:00'),
            endsAt: makeDateTime(0, '13:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Проєкт UNIScheduler',
            teacher: 'Команда',
            group: 'ІПЗ-4',
            location: 'Онлайн',
            description: 'Командний воркшоп',
            startsAt: makeDateTime(2, '12:00:00'),
            endsAt: makeDateTime(2, '13:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Алгоритми та структури даних',
            teacher: 'А. Мельник',
            group: 'ІПЗ-4',
            location: '3-102',
            description: 'Семінар (чисельник)',
            startsAt: makeDateTime(3, '14:00:00'),
            endsAt: makeDateTime(3, '15:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Архітектура програмного забезпечення',
            teacher: 'І. Коваль',
            group: 'ІПЗ-4',
            location: '3-216',
            description: 'Лекція',
            startsAt: makeDateTime(4, '12:00:00'),
            endsAt: makeDateTime(4, '13:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Самостійна робота',
            teacher: null,
            group: 'ІПЗ-4',
            location: 'Бібліотека',
            description: 'Підготовка до модульного контролю',
            startsAt: makeDateTime(5, '10:00:00'),
            endsAt: makeDateTime(5, '11:30:00'),
        },
    ]

    // 3. Заняття за знаменником (парні тижні)
    const denominatorClasses: CalendarEvent[] = [
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Бази даних',
            teacher: 'І. Коваль',
            group: 'ІПЗ-4',
            location: '3-301',
            description: 'Лабораторний практикум (знаменник)',
            startsAt: makeDateTime(1, '14:00:00'),
            endsAt: makeDateTime(1, '15:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Комп’ютерні мережі',
            teacher: 'М. Савчук',
            group: 'ІПЗ-4',
            location: '2-208',
            description: 'Лабораторна робота',
            startsAt: makeDateTime(2, '14:00:00'),
            endsAt: makeDateTime(2, '15:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Інженерія програмного забезпечення',
            teacher: 'О. Петренко',
            group: 'ІПЗ-4',
            location: '4-105',
            description: 'Практикум (знаменник)',
            startsAt: makeDateTime(3, '14:00:00'),
            endsAt: makeDateTime(3, '15:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Проєктування програмних систем',
            teacher: 'В. Бублик',
            group: 'ІПЗ-4',
            location: '3-214',
            description: 'Колоквіум (знаменник)',
            startsAt: makeDateTime(4, '12:00:00'),
            endsAt: makeDateTime(4, '13:30:00'),
        },
        {
            eventId: eventIdCounter++,
            eventType: 'COURSE_CLASS',
            name: 'Сучасний C++',
            teacher: 'В. Бублик',
            group: 'ІПЗ-4',
            location: '1-8',
            description: 'Лабораторна робота',
            startsAt: makeDateTime(4, '14:00:00'),
            endsAt: makeDateTime(4, '15:30:00'),
        },
    ]

    // 4. Персональні події залежно від тижня
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

    const parityClasses = isNumerator ? numeratorClasses : denominatorClasses

    return [...recurringClasses, ...parityClasses, ...personalEvents].sort((left, right) =>
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
        return Promise.resolve(structuredClone(mockCourses))
    },

    getSpecialities(): Promise<Speciality[]> {
        return Promise.resolve(structuredClone(mockSpecialities))
    },
}
