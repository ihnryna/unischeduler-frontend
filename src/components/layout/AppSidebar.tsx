import type {RefObject} from 'react'
import {NavLink} from 'react-router'

import {Icon} from '../ui/Icon'

type AppSidebarProps = {
    lessonCount?: number
    sidebarRef?: RefObject<HTMLElement | null>
    /** Called after a link is chosen (closes the off-canvas menu on narrow screens). */
    onNavigate?: () => void
    /** Shows the "Адміністрування" group; only users with the ADMIN role get it. */
    isAdmin?: boolean
}

export function AppSidebar({lessonCount: _lessonCount, sidebarRef, onNavigate, isAdmin = false}: AppSidebarProps) {
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
                    <Icon name="calendar" className="nav-icon"/>
                    Мій розклад
                </NavLink>

                <NavLink
                    onClick={onNavigate}
                    to="/general-schedule"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <Icon name="table" className="nav-icon"/>
                    Загальний розклад
                </NavLink>
            </nav>

            <div className="sidebar-divider"/>

            <p className="sidebar-label">ПЕРСОНАЛЬНЕ</p>

            <nav className="navigation" aria-label="Персональні функції">
                <NavLink
                    onClick={onNavigate}
                    to="/my-courses"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <Icon name="book" className="nav-icon"/>
                    Мої дисципліни
                </NavLink>

                <NavLink
                    onClick={onNavigate}
                    to="/my-groups"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <Icon name="users" className="nav-icon"/>
                    Групи
                </NavLink>

                <NavLink
                    onClick={onNavigate}
                    to="/settings"
                    className={({isActive}) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <Icon name="sliders" className="nav-icon"/>
                    Налаштування
                </NavLink>
            </nav>

            {isAdmin && (
                <>
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
                            <Icon name="shield" className="nav-icon"/>
                            Адмін-панель
                        </NavLink>
                    </nav>
                </>
            )}
        </aside>
    )
}
