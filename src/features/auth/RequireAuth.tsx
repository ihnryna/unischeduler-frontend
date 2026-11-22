import type {ReactNode} from 'react'
import {Navigate, useLocation} from 'react-router'

import {useAuthSession} from './useAuthSession'
import {Loader} from '../../components/ui/Loader'

/** Router state handed to `/login` so it can return the user to the page they asked for. */
export type LoginRedirectState = {
    from: string
}

type RequireAuthProps = {
    children: ReactNode
}

/**
 * Renders `children` only when a user is signed in; otherwise redirects to `/login`.
 * Waits for session verification to complete before redirecting.
 */
export function RequireAuth({children}: Readonly<RequireAuthProps>) {
    const location = useLocation()
    const {user, isLoading} = useAuthSession()

    if (isLoading) {
        return (
            <div style={{minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Loader />
            </div>
        )
    }

    if (!user) {
        const state: LoginRedirectState = {
            from: `${location.pathname}${location.search}${location.hash}`,
        }
        return <Navigate to="/login" replace state={state}/>
    }

    return children
}
