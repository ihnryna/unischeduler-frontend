import type {Lesson} from '../types/schedule'

const defaultGroups = ['group-ipz-4', 'group-kn-4']

export const mockLessons: Lesson[] = [
    {
        id: 1, courseId: 'course-pps', groupIds: defaultGroups, date: '2026-10-26', day: 0,
        start: 9, end: 10.5, title: 'Проєктування програмних систем', type: 'Лекція',
        room: '3-214', teacher: 'В. Бублик', color: 'purple', source: 'university',
    },
    {
        id: 2, courseId: 'course-se', groupIds: defaultGroups, date: '2026-10-26', day: 0,
        start: 12, end: 13.5, title: 'Інженерія програмного забезпечення', type: 'Практика',
        room: '4-105', teacher: 'О. Петренко', color: 'mint', source: 'university',
    },
    {
        id: 3, courseId: 'course-cpp', groupIds: defaultGroups, date: '2026-10-27', day: 1,
        start: 10, end: 11.5, title: 'Сучасний C++', type: 'Лекція',
        room: '1-8', teacher: 'В. Бублик', color: 'peach', source: 'university',
    },
    {
        id: 4, courseId: 'course-db', groupIds: defaultGroups, date: '2026-10-27', day: 1,
        start: 14, end: 15.5, title: 'Бази даних', type: 'Лабораторна',
        room: '3-301', teacher: 'І. Коваль', color: 'purple', source: 'university',
    },
    {
        id: 5, courseId: 'course-net', groupIds: defaultGroups, date: '2026-10-28', day: 2,
        start: 9, end: 10.5, title: 'Комп’ютерні мережі', type: 'Практика',
        room: '2-208', teacher: 'М. Савчук', color: 'blue', source: 'university',
    },
    {
        id: 6, courseId: 'course-project', groupIds: defaultGroups, date: '2026-10-28', day: 2,
        start: 12, end: 13.5, title: 'Проєкт UNIScheduler', type: 'Командна робота',
        room: 'Онлайн', teacher: 'Команда', color: 'mint', source: 'university',
    },
    {
        id: 7, courseId: 'course-en', groupIds: defaultGroups, date: '2026-10-29', day: 3,
        start: 11, end: 12.5, title: 'Англійська мова', type: 'Практика',
        room: '5-402', teacher: 'N. Smith', color: 'peach', source: 'university',
    },
    {
        id: 8, courseId: 'course-algo', groupIds: defaultGroups, date: '2026-10-29', day: 3,
        start: 14, end: 15.5, title: 'Алгоритми та структури даних', type: 'Лекція',
        room: '3-102', teacher: 'А. Мельник', color: 'purple', source: 'university',
    },
    {
        id: 9, courseId: 'course-qa', groupIds: defaultGroups, date: '2026-10-30', day: 4,
        start: 9, end: 10.5, title: 'Тестування програмного забезпечення', type: 'Лабораторна',
        room: '4-210', teacher: 'О. Петренко', color: 'blue', source: 'university',
    },
    {
        id: 10, courseId: 'course-arch', groupIds: defaultGroups, date: '2026-10-30', day: 4,
        start: 12, end: 13.5, title: 'Архітектура програмного забезпечення', type: 'Семінар',
        room: '3-216', teacher: 'І. Коваль', color: 'mint', source: 'university',
    },
    {
        id: 11, courseId: 'course-self', groupIds: defaultGroups, date: '2026-10-31', day: 5,
        start: 10, end: 11.5, title: 'Самостійна робота', type: 'Навчальний блок',
        room: 'Бібліотека', teacher: '—', color: 'peach', source: 'university',
    },
]
