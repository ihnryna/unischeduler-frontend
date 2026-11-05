import {NavLink} from 'react-router'

type AppSidebarProps = {
    lessonCount: number
}

export function AppSidebar({lessonCount}: AppSidebarProps) {
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

            <p className="sidebar-label">ЦЬОГО ТИЖНЯ</p>

            <div className="sidebar-stat">
                <span className="stat-icon purple-icon">▦</span>
                <span>
                    <strong>{lessonCount}</strong>
                    <small> навчальних блоків</small>
                </span>
            </div>

            <div className="sidebar-stat">
                <span className="stat-icon mint-icon">◷</span>
                <span>
                    <strong>16,5 год</strong>
                    <small> у розкладі</small>
                </span>
            </div>

            <div className="sidebar-footer">
                Зроблено спудеями для спудеїв
            </div>
        </aside>
    )
}
