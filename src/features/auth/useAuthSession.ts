import {useCallback, useState} from 'react'
import {useNavigate} from 'react-router'

import {authService, type SessionUser} from './authService'

/**
 * Current (mock) session for the app shell.
 * `logout()` clears the session and sends the user to the login page.
 */
export function useAuthSession() {
    const navigate = useNavigate()
    const [user, setUser] = useState<SessionUser | null>(() => authService.getSessionUser())

    const logout = useCallback(() => {
        authService.logout()
        setUser(null)
        navigate('/login', {replace: true})
    }, [navigate])

    return {user, logout}
}
