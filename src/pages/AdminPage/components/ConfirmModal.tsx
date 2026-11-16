type ConfirmModalProps = {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    isDestructive?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Підтвердити',
    cancelLabel = 'Скасувати',
    isDestructive = true,
    onConfirm,
    onCancel,
}: Readonly<ConfirmModalProps>) {
    if (!isOpen) return null

    return (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <div className="admin-modal-card admin-modal-confirm">
                <div className="admin-modal-header">
                    <h3 id="confirm-modal-title" className="admin-modal-title">
                        {isDestructive ? '⚠️ ' : ''}
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="admin-modal-close-btn"
                        onClick={onCancel}
                        aria-label="Закрити діалог"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="2" y1="2" x2="12" y2="12" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                        </svg>
                    </button>
                </div>

                <div className="admin-modal-body">
                    <p className="admin-modal-text">{message}</p>
                </div>

                <div className="admin-modal-footer">
                    <button
                        type="button"
                        className="button admin-btn-secondary"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`button ${isDestructive ? 'admin-btn-danger' : 'primary-button'}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
