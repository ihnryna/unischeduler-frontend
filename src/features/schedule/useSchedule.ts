import {useCallback, useEffect, useRef, useState} from 'react'

import type {CalendarEvent} from '../../types/schedule'
import {scheduleService} from './scheduleService'

const DEFAULT_USER_ID = 1

type UseScheduleResult = {
    /** Events to show in the grid (hidden classes excluded). */
    events: CalendarEvent[]
    /** University classes of the week the student hid from the personal schedule. */
    hiddenEvents: CalendarEvent[]
    isLoading: boolean
    error: string | null
    /** Reloads the week; resolves when the new data is in (or the reload failed). */
    refetch: () => Promise<void>
}

/**
 * Loads the personal schedule for the week `weekOffset` weeks from now: university classes
 * (with the student's overrides applied) and personal events. Refetches when classes or
 * courses change in the admin panel, or on `refetch()`.
 */
export function useSchedule(userId = DEFAULT_USER_ID, weekOffset = 0): UseScheduleResult {
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)
    // `refetch()` callers waiting for the next reload to finish.
    const waitersRef = useRef<Array<() => void>>([])

    useEffect(() => {
        const handleUpdate = () => {
            setRequestVersion((version) => version + 1)
        }
        window.addEventListener('unischeduler_classes_updated', handleUpdate)
        window.addEventListener('unischeduler_courses_updated', handleUpdate)
        return () => {
            window.removeEventListener('unischeduler_classes_updated', handleUpdate)
            window.removeEventListener('unischeduler_courses_updated', handleUpdate)
        }
    }, [])

    useEffect(() => {
        let isActive = true

        setIsLoading(true)
        setError(null)

        scheduleService
            .getCalendar({userId, weekOffset})
            .then((nextEvents) => {
                if (isActive) {
                    setAllEvents(nextEvents)
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
                    const waiters = waitersRef.current
                    waitersRef.current = []
                    waiters.forEach((resolve) => resolve())
                }
            })

        return () => {
            isActive = false
        }
    }, [requestVersion, userId, weekOffset])

    const refetch = useCallback(
        () =>
            new Promise<void>((resolve) => {
                waitersRef.current.push(resolve)
                setRequestVersion((version) => version + 1)
            }),
        [],
    )

    return {
        events: allEvents.filter((event) => !event.occurrence?.isHidden),
        hiddenEvents: allEvents.filter((event) => event.occurrence?.isHidden),
        isLoading,
        error,
        refetch,
    }
}
