import {apiClient} from './apiClient'
import type {ClassOverride, ClassOverrideCreate, ClassOverrideUpdate} from '../../types/catalog'

/**
 * Per-student changes of university classes (`/api/class-override`). An override only
 * changes how a class looks in one student's personal schedule; the shared SAZ timetable
 * (`/api/class`) is never modified.
 */
export const classOverrideService = {
    /** All overrides. The backend does not filter by user, so callers must. */
    getAll(): Promise<ClassOverride[]> {
        return apiClient.get<ClassOverride[]>('/class-override')
    },

    /** Overrides owned by `userId`. */
    async getForUser(userId: number): Promise<ClassOverride[]> {
        const all = await apiClient.get<ClassOverride[]>('/class-override')
        return (all ?? []).filter((override) => override.user === userId)
    },

    create(data: ClassOverrideCreate): Promise<ClassOverride> {
        return apiClient.post<ClassOverride>('/class-override', data)
    },

    /** Full replace: fields sent as `null` are cleared on the backend. */
    update(data: ClassOverrideUpdate): Promise<ClassOverride> {
        return apiClient.put<ClassOverride>('/class-override', data)
    },

    remove(id: number): Promise<void> {
        return apiClient.delete<void>(`/class-override/${id}`)
    },
}
