import {useCallback, useEffect, useState} from 'react'
import {useNavigate} from 'react-router'

import {authService, type SessionUser} from './authService'

/**
 * Real session management hook connected to Spring Boot backend auth.
 * Verifies session via `/api/auth/me` and handles logout.
 */
export function useAuthSession() {
    const navigate = useNavigate()
    const [user, setUser] = useState<SessionUser | null>(() => authService.getSessionUser())
    const [isLoading, setIsLoading] = useState<boolean>(() => !authService.getSessionUser())

    useEffect(() => {
        let isMounted = true
        authService.checkAuth().then((authenticatedUser) => {
            if (isMounted) {
                setUser(authenticatedUser)
                setIsLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
        navigate('/login', {replace: true})
    }, [navigate])

    return {user, isLoading, logout}
}
