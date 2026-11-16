import {NavLink} from 'react-router'

type AppSidebarProps = {
    lessonCount?: number
}

export function AppSidebar({lessonCount: _lessonCount}: AppSidebarProps) {
    return (
        <aside className="sidebar">
            <p className="sidebar-label">РОЗКЛАД</p>

            <nav className="navigation" aria-label="Основна навігація">
                <NavLink
                    to="/schedule"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">▦</span>
                    Мій розклад
                </NavLink>

                <NavLink
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
                    to="/calendar-integration"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="nav-icon">◷</span>
                    Google Calendar
                </NavLink>

                <NavLink
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
