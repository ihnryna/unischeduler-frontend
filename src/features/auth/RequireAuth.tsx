import type {ReactNode} from 'react'
import {Navigate, useLocation} from 'react-router'

import {authService} from './authService'

/** Router state handed to `/login` so it can return the user to the page they asked for. */
export type LoginRedirectState = {
    from: string
}

type RequireAuthProps = {
    children: ReactNode
}

/**
 * Renders `children` only when someone is signed in; otherwise sends them to `/login`,
 * remembering the requested path (with query and hash) in router state.
 * This is UX only: the backend must still check access (SR-5.2-4).
 */
export function RequireAuth({children}: Readonly<RequireAuthProps>) {
    const location = useLocation()

    if (!authService.getSessionUser()) {
        const state: LoginRedirectState = {
            from: `${location.pathname}${location.search}${location.hash}`,
        }
        return <Navigate to="/login" replace state={state}/>
    }

    return children
}
