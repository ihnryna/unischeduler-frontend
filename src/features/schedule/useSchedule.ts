import {useEffect, useState} from 'react'

import type {CalendarEvent} from '../../types/schedule'
import {scheduleService} from './scheduleService'

const DEFAULT_USER_ID = 1

type UseScheduleResult = {
    events: CalendarEvent[]
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useSchedule(userId = DEFAULT_USER_ID): UseScheduleResult {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)

    useEffect(() => {
        let isActive = true

        setIsLoading(true)
        setError(null)

        scheduleService.getCalendar({userId})
            .then((nextEvents) => {
                if (isActive) {
                    setEvents(nextEvents)
                }
            })
            .catch((reason: unknown) => {
                if (isActive) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : 'Не вдалося завантажити розклад.',
                    )
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false)
                }
            })

        return () => {
            isActive = false
        }
    }, [requestVersion, userId])

    return {
        events,
        isLoading,
        error,
        refetch: () => setRequestVersion((version) => version + 1),
    }
}
