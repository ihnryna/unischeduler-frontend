import {apiClient} from '../../services/api/apiClient'
import type {PersonalEvent, PersonalEventCreate, PersonalEventUpdate} from '../../types/schedule'

/**
 * Personal-event data access connected to Spring Boot backend (/api/personal-event).
 */
export const personalEventService = {
    /** Creates a personal event in the backend */
    async create(data: PersonalEventCreate): Promise<PersonalEvent> {
        return apiClient.post<PersonalEvent>('/personal-event', {
            userId: data.userId,
            name: data.name,
            location: data.location ?? null,
            description: data.description ?? null,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
        })
    },

    /** Updates an existing personal event in the backend */
    async update(data: PersonalEventUpdate): Promise<PersonalEvent> {
        return apiClient.put<PersonalEvent>('/personal-event', {
            id: data.id,
            name: data.name,
            location: data.location ?? null,
            description: data.description ?? null,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
        })
    },

    /** Deletes a personal event from the backend */
    async remove(eventId: number): Promise<void> {
        return apiClient.delete<void>(`/personal-event/${eventId}`)
    },

    /** Fetches all personal events from the backend */
    async getAll(): Promise<PersonalEvent[]> {
        return apiClient.get<PersonalEvent[]>('/personal-event')
    },

    /** Fetches single personal event by id */
    async getById(eventId: number): Promise<PersonalEvent> {
        return apiClient.get<PersonalEvent>(`/personal-event/${eventId}`)
    },

    /**
     * True for any personal event (FR-5.1, FR-6.1: students manage their own personal events).
     */
    isEditable(_eventId: number): boolean {
        return true
    },
}
