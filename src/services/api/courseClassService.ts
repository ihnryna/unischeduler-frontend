import {apiClient} from './apiClient'
import type {CourseClass, CourseClassCreate, CourseClassUpdate} from '../../types/catalog'

export const courseClassService = {
    getAll(): Promise<CourseClass[]> {
        return apiClient.get<CourseClass[]>('/class')
    },

    getById(id: number): Promise<CourseClass> {
        return apiClient.get<CourseClass>(`/class/${id}`)
    },

    create(data: CourseClassCreate): Promise<CourseClass> {
        return apiClient.post<CourseClass>('/class', data)
    },

    update(data: CourseClassUpdate): Promise<CourseClass> {
        return apiClient.put<CourseClass>('/class', data)
    },

    delete(id: number): Promise<void> {
        return apiClient.delete<void>(`/class/${id}`)
    },
}
