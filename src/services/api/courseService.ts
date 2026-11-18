import {apiClient} from './apiClient'
import type {Course, CourseCreate, CourseUpdate} from '../../types/catalog'

export const courseService = {
    getAll(): Promise<Course[]> {
        return apiClient.get<Course[]>('/course')
    },

    getById(id: number): Promise<Course> {
        return apiClient.get<Course>(`/course/${id}`)
    },

    create(data: CourseCreate): Promise<Course> {
        return apiClient.post<Course>('/course', data)
    },

    update(data: CourseUpdate): Promise<Course> {
        return apiClient.put<Course>('/course', data)
    },

    delete(id: number): Promise<void> {
        return apiClient.delete<void>(`/course/${id}`)
    },
}
