import type {UserRole} from '../../types/user'

/** The signed-in user as the mock login stores it (not a backend DTO). */
export type SessionUser = {
    email: string
    role: UserRole
    name: string
}

// TODO(question): Q-01 — session storage is temporary until FE-13 decides how auth state
// is kept. This is the key LoginPage has always written; it holds no token.
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
 * Mock session handling until the real auth service (FE-13) exists.
 * `getSessionUser` returns null when nobody is signed in or the stored value is unreadable.
 */
export const authService = {
    getSessionUser(): SessionUser | null {
        try {
            const raw = localStorage.getItem(SESSION_KEY)
            if (!raw) return null
            const parsed: unknown = JSON.parse(raw)
            return isSessionUser(parsed) ? parsed : null
        } catch {
            return null
        }
    },

    saveSession(user: SessionUser) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user))
        } catch {
            // Storage can be unavailable (private mode); the session then lasts only this page.
        }
    },

    logout() {
        try {
            localStorage.removeItem(SESSION_KEY)
        } catch {
            // Nothing stored, nothing to clear.
        }
    },
}
