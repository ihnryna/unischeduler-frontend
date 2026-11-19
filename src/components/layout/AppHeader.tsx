import type {RefObject} from 'react'
import {useLocation} from 'react-router'

import {UserMenu, type UserMenuUser} from './UserMenu'

type AppHeaderProps = {
    isSidebarOpen: boolean
    onToggleSidebar: () => void
    menuButtonRef: RefObject<HTMLButtonElement | null>
    user: UserMenuUser | null
    onLogout: () => void
    onUserMenuOpen?: () => void
}

export function AppHeader({
    isSidebarOpen,
    onToggleSidebar,
    menuButtonRef,
    user,
    onLogout,
    onUserMenuOpen,
}: Readonly<AppHeaderProps>) {
    const location = useLocation()
    const isAdminPage = location.pathname.startsWith('/admin')

    return (
        <header className="topbar">
            <div className="topbar-left">
                {/* Shown only on narrow screens, where the sidebar is hidden (layout.css). */}
                <button
                    ref={menuButtonRef}
                    type="button"
                    className="menu-toggle"
                    aria-controls="app-sidebar"
                    aria-expanded={isSidebarOpen}
                    aria-label={isSidebarOpen ? 'Закрити меню' : 'Відкрити меню'}
                    onClick={onToggleSidebar}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        {isSidebarOpen ? (
                            <path d="M5 5l10 10M15 5L5 15"/>
                        ) : (
                            <path d="M3 5h14M3 10h14M3 15h14"/>
                        )}
                    </svg>
                </button>

                <a className="brand" href="#" aria-label="UNIScheduler — головна">
                    <span className="brand-logo">UNI</span>

                    <span className="brand-text">
                        <strong>UNIScheduler</strong>
                    </span>
                </a>
            </div>

            <div className="topbar-right">
                {isAdminPage && (
                    <span className="admin-badge admin-badge-admin-role">
                        🛡️ Адміністратор системи · admin@ukma.edu.ua
                    </span>
                )}

                <span className="semester-label">
                    Осінній семестр · 2026
                </span>

                <UserMenu user={user} onLogout={onLogout} onOpen={onUserMenuOpen}/>
            </div>
        </header>
    )
}
