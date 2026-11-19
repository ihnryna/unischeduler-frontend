import {
    createBrowserRouter,
    Navigate,
    Outlet,
} from 'react-router'

import {AppLayout} from '../components/layout/AppLayout'
import {LoginPage} from '../pages/LoginPage/LoginPage'
import {SchedulePage} from '../pages/SchedulePage/SchedulePage'
import {SettingsPage} from '../pages/SettingsPage/SettingsPage'
import { GeneralSchedulePage } from '../pages/GeneralSchedulePage/GeneralSchedulePage'
import { GoogleCalendarPage } from '../pages/GoogleCalendarPage/GoogleCalendarPage'
import { AdminPage } from '../pages/AdminPage/AdminPage'
import {NotFoundPage} from '../pages/NotFoundPage/NotFoundPage'

import {RequireAuth} from '../features/auth/RequireAuth'
import {RequireRole} from '../features/auth/RequireRole'
import {useAuthSession} from '../features/auth/useAuthSession'
import {useSchedule} from '../features/schedule/useSchedule'

function MainLayout() {
    const {events} = useSchedule()
    const {user, logout} = useAuthSession()

    return (
        <AppLayout lessonCount={events.length} user={user} onLogout={logout}>
            <Outlet/>
        </AppLayout>
    )
}

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        path: '/',
        // Every route below needs a signed-in user (Q-06 default: only /login is public).
        element: (
            <RequireAuth>
                <MainLayout />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/schedule" replace />,
            },
            {
                path: 'schedule',
                element: <SchedulePage />,
            },
            {
                path: 'general-schedule',
                element: <GeneralSchedulePage />,
            },
            {
                path: 'calendar-integration',
                element: <GoogleCalendarPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            {
                path: 'admin',
                element: (
                    <RequireRole role="ADMIN">
                        <AdminPage />
                    </RequireRole>
                ),
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    }
])
