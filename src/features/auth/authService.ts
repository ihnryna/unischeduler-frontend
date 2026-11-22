import type {UserRole} from '../../types/user'
import type {Speciality} from '../../types/catalog'
import {apiClient} from '../../services/api/apiClient'

/** The signed-in user session state. */
export type SessionUser = {
    id: number
    email: string
    role: UserRole
    name: string
    speciality?: Speciality | null
}

const SESSION_KEY = 'unischeduler_auth_user'

function isSessionUser(value: unknown): value is SessionUser {
    if (typeof value !== 'object' || value === null) return false
    const candidate = value as Record<string, unknown>
    return (
        typeof candidate.email === 'string' &&
        typeof candidate.name === 'string' &&
        (candidate.role === 'STUDENT' || candidate.role === 'ADMIN')
    )
}

/**
 * Authentication service connected to Spring Boot backend:
 * - Microsoft Azure OIDC login flow via `/api/oauth2/authorization/microsoft`
 * - Session verification via `GET /api/auth/me`
 * - Session termination via `POST /api/logout`
 */
export const authService = {
    /**
     * Checks currently authenticated user from backend `GET /api/auth/me`.
     * If session cookie is valid, saves session user to localStorage and returns it.
     * If 401 Unauthorized or failed, clears cached session and returns null.
     */
    async checkAuth(): Promise<SessionUser | null> {
        try {
            const data = await apiClient.get<{
                id: number
                email: string
                role: UserRole
                speciality?: Speciality | null
            }>('/auth/me')

            if (data && data.email) {
                const user: SessionUser = {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    name: data.email.split('@')[0].replace('.', ' '),
                    speciality: data.speciality ?? null,
                }
                this.saveSession(user)
                return user
            }
            this.logoutLocal()
            return null
        } catch {
            this.logoutLocal()
            return null
        }
    },

    /**
     * Returns cached session user from localStorage for instant synchronous reads.
     */
    getSessionUser(): SessionUser | null {
        try {
            const raw = localStorage.getItem(SESSION_KEY)
            if (!raw) return null
            const parsed: unknown = JSON.parse(raw)
            return isSessionUser(parsed) ? (parsed as SessionUser) : null
        } catch {
            return null
        }
    },

    saveSession(user: SessionUser) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user))
        } catch {
            // Storage can be unavailable in private mode
        }
    },

    logoutLocal() {
        try {
            localStorage.removeItem(SESSION_KEY)
        } catch {
            // Nothing stored, nothing to clear
        }
    },

    /**
     * Initiates login by redirecting the browser to Spring Security's Microsoft OAuth2 authorization endpoint.
     */
    loginWithMicrosoft() {
        window.location.href = '/api/oauth2/authorization/microsoft'
    },

    /**
     * Logs out the user from backend (`/api/logout`) and removes local credentials.
     */
    async logout(): Promise<void> {
        this.logoutLocal()
        try {
            await apiClient.post<void>('/logout')
        } catch {
            // Best-effort logout
        }
    },
}
