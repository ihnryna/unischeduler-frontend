import type {ReactNode} from 'react'
import {Navigate, useLocation} from 'react-router'

import type {UserRole} from '../../types/user'
import {authService} from './authService'

/** Router state set when a page is closed to the user; the landing page shows the notice. */
export type AccessDeniedState = {
    accessNotice: string
}

type RequireRoleProps = {
    role: UserRole
    children: ReactNode
}

const ACCESS_DENIED_NOTICE = 'Адміністративна панель доступна лише адміністраторам.'

/**
 * Renders `children` only for a signed-in user with `role`.
 * Nobody signed in → `/login`; another role → `/schedule` with a notice.
 * This is UX only: the backend must still check access (SR-5.2-4).
 */
export function RequireRole({role, children}: Readonly<RequireRoleProps>) {
    const location = useLocation()
    const user = authService.getSessionUser()

    if (!user) {
        return <Navigate to="/login" replace state={{from: location.pathname}}/>
    }

    if (user.role !== role) {
        const state: AccessDeniedState = {accessNotice: ACCESS_DENIED_NOTICE}
        return <Navigate to="/schedule" replace state={state}/>
    }

    return children
}
