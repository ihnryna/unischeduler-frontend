import {useEffect, useRef, useState, type ReactNode} from 'react'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

type AppLayoutProps = {
    children: ReactNode
    lessonCount: number
}

/**
 * Page shell: header, sidebar, main content. On narrow screens (≤ 900px, see layout.css)
 * the sidebar is an off-canvas menu opened by the header's menu button; it closes on
 * Escape, on a click outside it, and after choosing a page.
 */
export function AppLayout({ children, lessonCount }: Readonly<AppLayoutProps>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const sidebarRef = useRef<HTMLElement>(null)

    const closeSidebar = () => setIsSidebarOpen(false)

    useEffect(() => {
        if (!isSidebarOpen) return

        sidebarRef.current?.querySelector<HTMLElement>('a.active, a')?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            setIsSidebarOpen(false)
            menuButtonRef.current?.focus()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isSidebarOpen])

    return (
        <>
            <AppHeader
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
                menuButtonRef={menuButtonRef}
            />

            <div className={`app-layout${isSidebarOpen ? ' sidebar-open' : ''}`}>
                <AppSidebar
                    lessonCount={lessonCount}
                    sidebarRef={sidebarRef}
                    onNavigate={closeSidebar}
                />

                {isSidebarOpen && (
                    <div
                        className="sidebar-backdrop"
                        aria-hidden="true"
                        onClick={closeSidebar}
                    />
                )}

                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    )
}
