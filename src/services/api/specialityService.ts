import {apiClient} from './apiClient'
import type {Speciality, SpecialityCreate, SpecialityUpdate} from '../../types/catalog'

export const specialityService = {
    getAll(): Promise<Speciality[]> {
        return apiClient.get<Speciality[]>('/speciality')
    },

    getById(id: number): Promise<Speciality> {
        return apiClient.get<Speciality>(`/speciality/${id}`)
    },

    create(data: SpecialityCreate): Promise<Speciality> {
        return apiClient.post<Speciality>('/speciality', data)
    },

    update(data: SpecialityUpdate): Promise<Speciality> {
        return apiClient.put<Speciality>('/speciality', data)
    },

    delete(id: number): Promise<void> {
        return apiClient.delete<void>(`/speciality/${id}`)
    },
}
