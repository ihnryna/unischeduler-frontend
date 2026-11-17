import {useCallback, useState} from 'react'

import type {PersonalEvent, PersonalEventCreate} from '../../types/schedule'
import {personalEventService} from './personalEventService'

type UseCreatePersonalEventResult = {
    /** Sends the event; resolves with the stored event or `null` on failure. */
    create: (data: PersonalEventCreate) => Promise<PersonalEvent | null>
    isSaving: boolean
    /** Plain-Ukrainian error of the last attempt, if it failed. */
    error: string | null
    resetError: () => void
}

/**
 * Creates personal events through `personalEventService` (FE-22).
 * No optimistic update: callers refetch the schedule only after a successful save.
 */
export function useCreatePersonalEvent(): UseCreatePersonalEventResult {
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = useCallback(async (data: PersonalEventCreate) => {
        setIsSaving(true)
        setError(null)
        try {
            return await personalEventService.create(data)
        } catch {
            setError('Не вдалося зберегти подію. Спробуйте ще раз.')
            return null
        } finally {
            setIsSaving(false)
        }
    }, [])

    const resetError = useCallback(() => setError(null), [])

    return {create, isSaving, error, resetError}
}
