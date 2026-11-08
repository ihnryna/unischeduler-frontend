import type {CourseClass} from '../types/catalog'
import {mockCourses} from './courses'

type CourseClassSeed = Omit<CourseClass, 'id' | 'course'> & {
    courseId: number
}

const courseClassSeeds: CourseClassSeed[] = [
    {courseId: 1, teacher: 'В. Бублик', group: 'ІПЗ-4', location: '3-214', startsAt: '2026-10-26T09:00:00', endsAt: '2026-10-26T10:30:00'},
    {courseId: 2, teacher: 'О. Петренко', group: 'ІПЗ-4', location: '4-105', startsAt: '2026-10-26T12:00:00', endsAt: '2026-10-26T13:30:00'},
    {courseId: 3, teacher: 'В. Бублик', group: 'ІПЗ-4', location: '1-8', startsAt: '2026-10-27T10:00:00', endsAt: '2026-10-27T11:30:00'},
    {courseId: 4, teacher: 'І. Коваль', group: 'ІПЗ-4', location: '3-301', startsAt: '2026-10-27T14:00:00', endsAt: '2026-10-27T15:30:00'},
    {courseId: 5, teacher: 'М. Савчук', group: 'ІПЗ-4', location: '2-208', startsAt: '2026-10-28T09:00:00', endsAt: '2026-10-28T10:30:00'},
    {courseId: 6, teacher: 'Команда', group: 'ІПЗ-4', location: 'Онлайн', startsAt: '2026-10-28T12:00:00', endsAt: '2026-10-28T13:30:00'},
    {courseId: 7, teacher: 'N. Smith', group: 'ІПЗ-4', location: '5-402', startsAt: '2026-10-29T11:00:00', endsAt: '2026-10-29T12:30:00'},
    {courseId: 8, teacher: 'А. Мельник', group: 'ІПЗ-4', location: '3-102', startsAt: '2026-10-29T14:00:00', endsAt: '2026-10-29T15:30:00'},
    {courseId: 9, teacher: 'О. Петренко', group: 'ІПЗ-4', location: '4-210', startsAt: '2026-10-30T09:00:00', endsAt: '2026-10-30T10:30:00'},
    {courseId: 10, teacher: 'І. Коваль', group: 'ІПЗ-4', location: '3-216', startsAt: '2026-10-30T12:00:00', endsAt: '2026-10-30T13:30:00'},
    {courseId: 11, teacher: '—', group: 'ІПЗ-4', location: 'Бібліотека', startsAt: '2026-10-31T10:00:00', endsAt: '2026-10-31T11:30:00'},
]

export const mockCourseClasses: CourseClass[] = courseClassSeeds.map(
    ({courseId, ...courseClass}, index) => ({
        id: index + 1,
        course: mockCourses.find((course) => course.id === courseId)!,
        ...courseClass,
    }),
)
