import type {CourseClass} from '../types/catalog'
import {mockCourses} from './courses'

type CourseClassSeed = Omit<CourseClass, 'id' | 'course'> & {
    courseId: number
}

const courseClassSeeds: CourseClassSeed[] = [
    {courseId: 1, teacher: 'В. Бублик', group: 'ІПЗ-4', location: '3-214', startsAt: '2026-10-26T08:30:00', endsAt: '2026-10-26T09:50:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {courseId: 2, teacher: 'О. Петренко', group: 'ІПЗ-4', location: '4-105', startsAt: '2026-10-26T11:40:00', endsAt: '2026-10-26T13:00:00', weeks: [1, 3, 5, 7, 9, 11, 13, 15]},
    {courseId: 3, teacher: 'В. Бублик', group: 'ІПЗ-4', location: '1-8', startsAt: '2026-10-27T10:00:00', endsAt: '2026-10-27T11:20:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {courseId: 4, teacher: 'І. Коваль', group: 'ІПЗ-4', location: '3-301', startsAt: '2026-10-27T13:30:00', endsAt: '2026-10-27T14:50:00', weeks: [2, 4, 6, 8, 10, 12, 14]},
    {courseId: 5, teacher: 'М. Савчук', group: 'ІПЗ-4', location: '2-208', startsAt: '2026-10-28T08:30:00', endsAt: '2026-10-28T09:50:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {courseId: 6, teacher: 'Команда', group: 'ІПЗ-4', location: 'Онлайн', startsAt: '2026-10-28T11:40:00', endsAt: '2026-10-28T13:00:00', weeks: [1, 2, 3, 10]},
    {courseId: 7, teacher: 'N. Smith', group: 'ІПЗ-4', location: '5-402', startsAt: '2026-10-29T10:00:00', endsAt: '2026-10-29T11:20:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {courseId: 8, teacher: 'А. Мельник', group: 'ІПЗ-4', location: '3-102', startsAt: '2026-10-29T13:30:00', endsAt: '2026-10-29T14:50:00', weeks: [1, 3, 5, 7, 9, 11, 13, 15]},
    {courseId: 9, teacher: 'О. Петренко', group: 'ІПЗ-4', location: '4-210', startsAt: '2026-10-30T08:30:00', endsAt: '2026-10-30T09:50:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {courseId: 10, teacher: 'І. Коваль', group: 'ІПЗ-4', location: '3-216', startsAt: '2026-10-30T11:40:00', endsAt: '2026-10-30T13:00:00', weeks: [2, 4, 6, 8, 10, 12, 14]},
    {courseId: 11, teacher: '—', group: 'ІПЗ-4', location: 'Бібліотека', startsAt: '2026-10-31T10:00:00', endsAt: '2026-10-31T11:20:00', weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
]

export const mockCourseClasses: CourseClass[] = courseClassSeeds.map(
    ({courseId, ...courseClass}, index) => ({
        id: index + 1,
        course: mockCourses.find((course) => course.id === courseId)!,
        ...courseClass,
    }),
)
