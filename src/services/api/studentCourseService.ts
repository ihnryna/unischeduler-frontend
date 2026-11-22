import {apiClient} from './apiClient'
import type {Course} from '../../types/catalog'

export type StudentCourse = {
    id: number
    userId: number
    courseId: number
    course: Course
    group: string
}

export type StudentCourseCreate = {
    userId?: number
    courseId: number
    group?: string
}

const STORAGE_PREFIX = 'unischeduler_student_courses_'

export const studentCourseService = {
    /**
     * Fetches all courses selected by the student.
     * Caches in localStorage for instant access and offline tolerance.
     */
    async getStudentCourses(userId: number = 1): Promise<StudentCourse[]> {
        const storageKey = `${STORAGE_PREFIX}${userId}`
        try {
            const data = await apiClient.get<StudentCourse[]>('/student-courses', {userId})
            if (Array.isArray(data)) {
                localStorage.setItem(storageKey, JSON.stringify(data))
                return data
            }
        } catch {
            // Fallback to localStorage on error/offline
        }

        try {
            const cached = localStorage.getItem(storageKey)
            return cached ? JSON.parse(cached) : []
        } catch {
            return []
        }
    },

    /**
     * Enrolls or updates a course and academic group for the student.
     */
    async saveStudentCourse(data: StudentCourseCreate): Promise<StudentCourse> {
        const userId = data.userId || 1
        const res = await apiClient.post<StudentCourse>('/student-courses', {
            userId,
            courseId: data.courseId,
            group: data.group || '1',
        })

        // Update local cache
        const storageKey = `${STORAGE_PREFIX}${userId}`
        try {
            const cached = await this.getStudentCourses(userId)
            const index = cached.findIndex((item) => item.courseId === data.courseId)
            if (index >= 0) {
                cached[index] = res
            } else {
                cached.push(res)
            }
            localStorage.setItem(storageKey, JSON.stringify(cached))
        } catch {
            // Ignore storage errors
        }

        window.dispatchEvent(new CustomEvent('unischeduler_student_courses_updated'))
        return res
    },

    /**
     * Removes an enrolled course for the student.
     */
    async removeStudentCourse(courseId: number, userId: number = 1): Promise<void> {
        try {
            await apiClient.delete<void>(`/student-courses/course/${courseId}`, {userId})
        } catch {
            // Best effort
        }

        const storageKey = `${STORAGE_PREFIX}${userId}`
        try {
            const cached = await this.getStudentCourses(userId)
            const updated = cached.filter((item) => item.courseId !== courseId)
            localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch {
            // Ignore storage errors
        }

        window.dispatchEvent(new CustomEvent('unischeduler_student_courses_updated'))
    },
}
