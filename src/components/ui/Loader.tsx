export function Loader() {
    return (
        <div
            style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                border: '3px solid var(--color-border, #cbd5e1)',
                borderRadius: '50%',
                borderTopColor: 'var(--color-primary, #3b82f6)',
                animation: 'spin 1s ease-in-out infinite',
            }}
            role="status"
            aria-label="Завантаження…"
        >
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
