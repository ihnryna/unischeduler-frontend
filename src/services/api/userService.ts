import {apiClient} from './apiClient'
import type {User, UserCreate, UserUpdate} from '../../types/user'

export const userService = {
    getAll(): Promise<User[]> {
        return apiClient.get<User[]>('/user')
    },

    getById(id: number): Promise<User> {
        return apiClient.get<User>(`/user/${id}`)
    },

    create(data: UserCreate): Promise<User> {
        return apiClient.post<User>('/user', data)
    },

    update(data: UserUpdate): Promise<User> {
        return apiClient.put<User>('/user', data)
    },

    delete(id: number): Promise<void> {
        return apiClient.delete<void>(`/user/${id}`)
    },
}
