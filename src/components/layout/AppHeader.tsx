export function AppHeader() {
    return (
        <header className="topbar">
            <a className="brand" href="#" aria-label="UNIScheduler — головна">
                <span className="brand-logo">UNI</span>

                <span className="brand-text">
                    <strong>UNIScheduler</strong>
                </span>
            </a>

            <div className="topbar-right">
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