import type {RefObject} from 'react'
import {NavLink} from 'react-router'

type AppSidebarProps = {
    lessonCount?: number
    sidebarRef?: RefObject<HTMLElement | null>
    /** Called after a link is chosen (closes the off-canvas menu on narrow screens). */
    onNavigate?: () => void
}

export function AppSidebar({lessonCount: _lessonCount, sidebarRef, onNavigate}: AppSidebarProps) {
    return (
        <aside className="sidebar" id="app-sidebar" ref={sidebarRef}>
            <p className="sidebar-label">РОЗКЛАД</p>

            <nav className="navigation" aria-label="Основна навігація">
                <NavLink
                    onClick={onNavigate}
                    to="/schedule"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">▦</span>
                    Мій розклад
                </NavLink>

                <NavLink
                    onClick={onNavigate}
                    to="/general-schedule"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">▤</span>
                    Загальний розклад
                </NavLink>
            </nav>

            <div className="sidebar-divider"/>

            <p className="sidebar-label">ПЕРСОНАЛЬНЕ</p>

            <nav className="navigation" aria-label="Персональні функції">
                <NavLink
                    onClick={onNavigate}
                    to="/calendar-integration"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">◷</span>
                    Google Calendar
                </NavLink>

                <NavLink
                    onClick={onNavigate}
                    to="/settings"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">⚙</span>
                    Налаштування
                </NavLink>
            </nav>

            <div className="sidebar-divider"/>

            <p className="sidebar-label">АДМІНІСТРУВАННЯ</p>

            <nav className="navigation" aria-label="Адміністрування системи">
                <NavLink
                    onClick={onNavigate}
                    to="/admin"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">🛡</span>
                    Адмін-панель
                </NavLink>
            </nav>
        </aside>
    )
}
