import {useCallback, useState} from 'react'

import type {
    CalendarEvent,
    PersonalEvent,
    PersonalEventCreate,
    PersonalEventUpdate,
} from '../../types/schedule'
import {personalEventService} from './personalEventService'

type UsePersonalEventMutationsResult = {
    /** Creates the event; resolves with the stored event or `null` on failure. */
    create: (data: PersonalEventCreate) => Promise<PersonalEvent | null>
    /** Saves changes to an existing event; resolves with the stored event or `null` on failure. */
    update: (data: PersonalEventUpdate) => Promise<PersonalEvent | null>
    remove: (eventId: number) => Promise<boolean>
    isSaving: boolean
    /** Plain-Ukrainian error of the last attempt, if it failed. */
    error: string | null
    resetError: () => void
}

/**
 * Creates and edits personal events through `personalEventService` (FE-22, FE-23).
 * No optimistic update: callers refetch the schedule only after a successful save, so a
 * failed change never appears applied.
 */
export function usePersonalEventMutations(): UsePersonalEventMutationsResult {
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const run = useCallback(
        async <T>(save: () => Promise<T>, failureMessage: string): Promise<T | null> => {
            setIsSaving(true)
            setError(null)
            try {
                return await save()
            } catch {
                setError(failureMessage)
                return null
            } finally {
                setIsSaving(false)
            }
        },
        [],
    )

    const create = useCallback(
        async (data: PersonalEventCreate) => {
            const res = await run(
                () => personalEventService.create(data),
                'Не вдалося зберегти подію. Спробуйте ще раз.',
            )
            if (res) {
                window.dispatchEvent(new CustomEvent('unischeduler_personal_events_updated'))
            }
            return res
        },
        [run],
    )

    const update = useCallback(
        async (data: PersonalEventUpdate) => {
            const res = await run(
                () => personalEventService.update(data),
                'Не вдалося зберегти зміни. Спробуйте ще раз.',
            )
            if (res) {
                window.dispatchEvent(new CustomEvent('unischeduler_personal_events_updated'))
            }
            return res
        },
        [run],
    )

    const remove = useCallback(
        async (eventId: number) => {
            const result = await run(
                async () => {
                    await personalEventService.remove(eventId)
                    return true
                },
                'Не вдалося видалити подію. Спробуйте ще раз.',
            )
            if (result === true) {
                window.dispatchEvent(new CustomEvent('unischeduler_personal_events_updated'))
            }
            return result === true
        },
        [run],
    )

    const resetError = useCallback(() => setError(null), [])

    return {create, update, remove, isSaving, error, resetError}
}

/**
 * True when a calendar entry is a personal event the current user created and may edit.
 * University classes (`COURSE_CLASS`, `CLASS_OVERRIDE`) are never editable (FR-5.7).
 */
export function isEditablePersonalEvent(event: CalendarEvent): boolean {
    return event.eventType === 'PERSONAL' && personalEventService.isEditable(event.eventId)
}
