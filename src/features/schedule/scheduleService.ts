import {mockCourses, mockGroups, mockLessons, mockUsers} from '../../mocks'
import type {Course, Group} from '../../types/catalog'
import type {Lesson} from '../../types/schedule'

export type ScheduleFilters = {
    search?: string
    courseId?: string
    groupId?: string
    date?: string
}

function matchesSearch(lesson: Lesson, search: string) {
    const query = search.trim().toLocaleLowerCase('uk')
    return !query || [lesson.title, lesson.teacher, lesson.room].some(
        (value) => value.toLocaleLowerCase('uk').includes(query),
    )
}

export const scheduleService = {
    getPersonalSchedule(userId: string): Promise<Lesson[]> {
        const user = mockUsers.find((candidate) => candidate.id === userId)

        if (!user) {
            return Promise.reject(new Error('Тестового користувача не знайдено.'))
        }

        const {groupId} = user

        const lessons = groupId
            ? mockLessons.filter((lesson) => lesson.groupIds.includes(groupId))
            : mockLessons

        return Promise.resolve(structuredClone(lessons))
    },

    getGeneralSchedule(filters: ScheduleFilters = {}): Promise<Lesson[]> {
        const lessons = mockLessons.filter((lesson) => (
            matchesSearch(lesson, filters.search ?? '')
            && (!filters.courseId || lesson.courseId === filters.courseId)
            && (!filters.groupId || lesson.groupIds.includes(filters.groupId))
            && (!filters.date || lesson.date === filters.date)
        ))

        return Promise.resolve(structuredClone(lessons))
    },

    getCourses(): Promise<Course[]> {
        return Promise.resolve(structuredClone(mockCourses))
    },

    getGroups(): Promise<Group[]> {
        return Promise.resolve(structuredClone(mockGroups))
    },
}
