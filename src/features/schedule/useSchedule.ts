import {useEffect, useState} from 'react'

import type {Lesson} from '../../types/schedule'
import {scheduleService} from './scheduleService'

const DEFAULT_USER_ID = 'user-student-diana'

type UseScheduleResult = {
    lessons: Lesson[]
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useSchedule(userId = DEFAULT_USER_ID): UseScheduleResult {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)

    useEffect(() => {
        let isActive = true

        setIsLoading(true)
        setError(null)

        scheduleService.getPersonalSchedule(userId)
            .then((nextLessons) => {
                if (isActive) {
                    setLessons(nextLessons)
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
        lessons,
        isLoading,
        error,
        refetch: () => setRequestVersion((version) => version + 1),
    }
}
