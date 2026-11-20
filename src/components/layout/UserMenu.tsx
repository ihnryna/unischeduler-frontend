import {useEffect, useId, useRef, useState, type KeyboardEvent} from 'react'
import {Link} from 'react-router'

import type {UserRole} from '../../types/user'

export type UserMenuUser = {
    email: string
    name: string
    role: UserRole
}

type UserMenuProps = {
    /** Signed-in user, or null when nobody is signed in. */
    user: UserMenuUser | null
    onLogout: () => void
    /** Called when the menu opens (the layout closes the mobile sidebar, which would cover it). */
    onOpen?: () => void
}

const ROLE_LABELS: Record<UserRole, string> = {
    STUDENT: 'Студент',
    ADMIN: 'Адміністратор',
}

function getInitials(user: UserMenuUser): string {
    const source = user.name.trim() || user.email.split('@')[0]
    const words = source.split(/[\s._-]+/).filter(Boolean)
    return words
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
}

/**
 * Profile button in the header and the account menu it opens.
 * The menu shows who is signed in and always offers "Вийти" (log out), for every role.
 * Keyboard: Enter/Space/↓ open it, ↑/↓/Home/End move between items, Esc closes it and
 * returns focus to the button; Tab or a click outside closes it.
 */
export function UserMenu({user, onLogout, onOpen}: Readonly<UserMenuProps>) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const menuId = useId()

    const getItems = () =>
        Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])

    const open = () => {
        setIsOpen(true)
        onOpen?.()
    }

    const close = (returnFocus: boolean) => {
        setIsOpen(false)
        if (returnFocus) buttonRef.current?.focus()
    }

    useEffect(() => {
        if (!isOpen) return

        getItems()[0]?.focus()

        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [isOpen])

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const items = getItems()
        const index = items.indexOf(document.activeElement as HTMLElement)

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                items[(index + 1) % items.length]?.focus()
                break
            case 'ArrowUp':
                event.preventDefault()
                items[(index - 1 + items.length) % items.length]?.focus()
                break
            case 'Home':
                event.preventDefault()
                items[0]?.focus()
                break
            case 'End':
                event.preventDefault()
                items[items.length - 1]?.focus()
                break
            case 'Escape':
                event.preventDefault()
                event.stopPropagation()
                close(true)
                break
            case 'Tab':
                setIsOpen(false)
                break
        }
    }

    const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown' && !isOpen) {
            event.preventDefault()
            open()
        }
    }

    return (
        <div className="user-menu" ref={containerRef}>
            <button
                ref={buttonRef}
                type="button"
                className="profile-button"
                aria-label={user ? `Меню користувача: ${user.email}` : 'Меню користувача'}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? menuId : undefined}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                onKeyDown={handleButtonKeyDown}
            >
                {user ? (
                    <span aria-hidden="true">{getInitials(user)}</span>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="10" cy="7" r="3.5"/>
                        <path d="M3.5 17c1-3.2 3.4-4.8 6.5-4.8s5.5 1.6 6.5 4.8"/>
                    </svg>
                )}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    id={menuId}
                    className="user-menu-dropdown"
                    role="menu"
                    aria-label="Меню користувача"
                    onKeyDown={handleMenuKeyDown}
                >
                    <div className="user-menu-header">
                        {user ? (
                            <>
                                <span className="user-menu-role">{ROLE_LABELS[user.role]}</span>
                                <span className="user-menu-email">{user.email}</span>
                            </>
                        ) : (
                            <span className="user-menu-role">Ви не увійшли в систему</span>
                        )}
                    </div>

                    <hr className="user-menu-divider"/>

                    <Link
                        to="/settings"
                        role="menuitem"
                        tabIndex={-1}
                        className="user-menu-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="user-menu-icon" aria-hidden="true">⚙</span>
                        Налаштування
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        tabIndex={-1}
                        className="user-menu-item user-menu-item-logout"
                        onClick={() => {
                            setIsOpen(false)
                            onLogout()
                        }}
                    >
                        <svg className="user-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6M10.5 11l3-3-3-3M13.5 8H6"/>
                        </svg>
                        Вийти
                    </button>
                </div>
            )}
        </div>
    )
}
