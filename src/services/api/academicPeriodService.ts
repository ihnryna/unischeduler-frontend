import {apiClient} from './apiClient'
import type {Semester} from '../../types/catalog'

export type AcademicPeriodResponse = {
    semester: Semester
    startDate: string
    currentWeek: number
}

export type AcademicPeriodUpdate = {
    semester: Semester
    startDate: string
}

export const academicPeriodService = {
    /**
     * Gets the current academic period and week from backend `GET /api/academic-period`.
     * If unconfigured (HTTP 404), returns null.
     */
    async getCurrent(): Promise<AcademicPeriodResponse | null> {
        try {
            return await apiClient.get<AcademicPeriodResponse>('/academic-period')
        } catch {
            return null
        }
    },

    /**
     * Updates the academic period in backend `PUT /api/academic-period`.
     * Requires ADMIN role.
     */
    async update(data: AcademicPeriodUpdate): Promise<AcademicPeriodResponse> {
        return apiClient.put<AcademicPeriodResponse>('/academic-period', data)
    },
}
