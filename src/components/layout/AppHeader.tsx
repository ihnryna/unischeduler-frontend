import {useLocation} from 'react-router'

export function AppHeader() {
    const location = useLocation()
    const isAdminPage = location.pathname.startsWith('/admin')

    return (
        <header className="topbar">
            <a className="brand" href="#" aria-label="UNIScheduler — головна">
                <span className="brand-logo">UNI</span>

                <span className="brand-text">
                    <strong>UNIScheduler</strong>
                </span>
            </a>

            <div className="topbar-right">
                {isAdminPage && (
                    <span className="admin-badge admin-badge-admin-role">
                        🛡️ Адміністратор системи · admin@ukma.edu.ua
                    </span>
                )}

                <span className="semester-label">
                    Осінній семестр · 2026
                </span>

                <button
                    className="profile-button"
                    aria-label="Профіль користувача"
                >
                    ІГ
                </button>
            </div>
        </header>
    )
}