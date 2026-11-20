import {useEffect, useState} from 'react'

import {personalEventService} from './personalEventService'

// Same default user as useSchedule until auth gives a user id (Q-01).
const DEFAULT_USER_ID = 1

type UsePersonalEventNamesResult = {
    /** Distinct names of the user's personal events, sorted alphabetically. */
    names: string[]
    isLoading: boolean
    error: string | null
}

/** Names of the user's personal events, for per-event colour settings. */
export function usePersonalEventNames(userId = DEFAULT_USER_ID): UsePersonalEventNamesResult {
    const [names, setNames] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        personalEventService
            .getAll()
            .then((events) => {
                if (!isActive) return
                const own = events.filter((event) => event.userId === userId)
                setNames([...new Set(own.map((event) => event.name))].sort((a, b) => a.localeCompare(b, 'uk')))
                setError(null)
            })
            .catch(() => {
                if (isActive) setError('Не вдалося завантажити ваші особисті події.')
            })
            .finally(() => {
                if (isActive) setIsLoading(false)
            })

        return () => {
            isActive = false
        }
    }, [userId])

    return {names, isLoading, error}
}
