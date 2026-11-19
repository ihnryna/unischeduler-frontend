import {useCallback, useState} from 'react'

import {classOverrideService} from '../../services/api/classOverrideService'
import type {ClassOverride} from '../../types/catalog'
import type {ClassOccurrence} from '../../types/schedule'
import {hasChangesBesidesHiding, type ClassOverridePatch} from './classOverrides'

type UseClassOverrideMutationsResult = {
    /**
     * Creates the override, or replaces `existing`. With `patch === null` (the form now
     * matches the university timetable) removes `existing`. Resolves `true` on success.
     */
    save: (args: {
        userId: number
        courseClassId: number
        existing: ClassOverride | null
        patch: ClassOverridePatch | null
    }) => Promise<boolean>
    /** Deletes the override, restoring the university data for that scope. */
    remove: (overrideId: number) => Promise<boolean>
    /** Shows a hidden class again, keeping any other change recorded with it. */
    unhide: (override: ClassOverride, occurrence: ClassOccurrence) => Promise<boolean>
    isSaving: boolean
    /** Plain-Ukrainian error of the last attempt, if it failed. */
    error: string | null
    resetError: () => void
}

/**
 * Saves a student's personal changes of a university class through
 * `classOverrideService`. Only the student's own `ClassOverride` rows change; the shared
 * SAZ timetable is never written. No optimistic update: callers refetch the schedule after
 * a successful save, so a failed change never appears applied.
 */
export function useClassOverrideMutations(): UseClassOverrideMutationsResult {
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const run = useCallback(async (action: () => Promise<unknown>, failureMessage: string) => {
        setIsSaving(true)
        setError(null)
        try {
            await action()
            return true
        } catch {
            setError(failureMessage)
            return false
        } finally {
            setIsSaving(false)
        }
    }, [])

    const save = useCallback<UseClassOverrideMutationsResult['save']>(
        ({userId, courseClassId, existing, patch}) =>
            run(async () => {
                if (patch === null) {
                    if (existing) await classOverrideService.remove(existing.id)
                    return
                }
                if (existing) {
                    await classOverrideService.update({
                        id: existing.id,
                        // PUT replaces every field: keep the ones this form does not edit.
                        teacherOverride: existing.teacherOverride,
                        groupOverride: existing.groupOverride,
                        classNameOverride: existing.classNameOverride,
                        ...patch,
                    })
                } else {
                    await classOverrideService.create({
                        user: userId,
                        courseClass: courseClassId,
                        teacherOverride: null,
                        groupOverride: null,
                        classNameOverride: null,
                        ...patch,
                    })
                }
            }, 'Не вдалося зберегти зміни заняття. Спробуйте ще раз.'),
        [run],
    )

    const remove = useCallback(
        (overrideId: number) =>
            run(
                () => classOverrideService.remove(overrideId),
                'Не вдалося скинути зміни. Спробуйте ще раз.',
            ),
        [run],
    )

    const unhide = useCallback(
        (override: ClassOverride, occurrence: ClassOccurrence) =>
            run(async () => {
                if (!hasChangesBesidesHiding(override, occurrence)) {
                    await classOverrideService.remove(override.id)
                    return
                }
                await classOverrideService.update({
                    id: override.id,
                    teacherOverride: override.teacherOverride,
                    groupOverride: override.groupOverride,
                    classNameOverride: override.classNameOverride,
                    locationOverride: override.locationOverride,
                    startsAtOverride: override.startsAtOverride,
                    endsAtOverride: override.endsAtOverride,
                    description: override.description,
                    isHidden: false,
                })
            }, 'Не вдалося повернути заняття в розклад. Спробуйте ще раз.'),
        [run],
    )

    const resetError = useCallback(() => setError(null), [])

    return {save, remove, unhide, isSaving, error, resetError}
}
