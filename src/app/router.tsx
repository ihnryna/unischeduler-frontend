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

import {useSchedule} from '../features/schedule/useSchedule'

function MainLayout() {
    const {events} = useSchedule()

    return (
        <AppLayout lessonCount={events.length}>
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
        element: <MainLayout />,
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
            /*{
                path: 'admin',
                element: <AdminPage />,
            },
            {
                path: 'admin/courses',
                element: <AdminCoursesPage />,
            },
            {
                path: 'admin/sync',
                element: <AdminSyncPage />,
            },
            {
                path: 'admin/integrations',
                element: <AdminIntegrationsPage />,
            },
            {
                path: 'admin/logs',
                element: <AdminLogsPage />,
            },*/
        ],
    }
])
