import type { ReactNode } from 'react'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

type AppLayoutProps = {
    children: ReactNode
    lessonCount: number
}

export function AppLayout({ children, lessonCount }: Readonly<AppLayoutProps>) {
    return (
        <>
            <AppHeader />

            <div className="app-layout">
                <AppSidebar lessonCount={lessonCount} />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    )
}