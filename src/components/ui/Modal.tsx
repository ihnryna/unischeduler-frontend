import {useEffect, useId, useRef, type ReactNode, type RefObject} from 'react'
import {createPortal} from 'react-dom'

type ModalProps = {
    /** Whether the dialog is rendered. */
    isOpen: boolean
    /** Visible heading; also the dialog's accessible name. */
    title: string
    /** Called on Esc, on the close button and (optionally) on a backdrop click. */
    onClose: () => void
    children: ReactNode
    /** Optional footer bar content (usually the action buttons). */
    footer?: ReactNode
    /** Close when the dimmed backdrop is clicked. Default `true`. */
    closeOnBackdropClick?: boolean
    /** Element that receives focus on open. Defaults to the first focusable element. */
    initialFocusRef?: RefObject<HTMLElement | null>
}

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

/**
 * Accessible modal dialog (FE-09).
 *
 * Renders through a portal into the `.app` element so theme styles apply; sets
 * `role="dialog"`, `aria-modal` and `aria-labelledby`; moves focus inside on open, traps
 * Tab / Shift+Tab, closes on Esc, locks background scroll and returns focus to the element
 * that was focused before it opened.
 */
export function Modal({
    isOpen,
    title,
    onClose,
    children,
    footer,
    closeOnBackdropClick = true,
    initialFocusRef,
}: Readonly<ModalProps>) {
    const titleId = useId()
    const cardRef = useRef<HTMLDivElement>(null)
    // Latest props kept in refs so the open/close effect runs only when `isOpen` changes.
    const onCloseRef = useRef(onClose)
    const initialFocusRefRef = useRef(initialFocusRef)

    useEffect(() => {
        onCloseRef.current = onClose
        initialFocusRefRef.current = initialFocusRef
    })

    useEffect(() => {
        if (!isOpen) return

        const previouslyFocused = document.activeElement as HTMLElement | null
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const card = cardRef.current
        if (card) {
            const target =
                initialFocusRefRef.current?.current ?? getFocusable(card)[0] ?? card
            target.focus()
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                onCloseRef.current()
                return
            }
            const container = cardRef.current
            if (event.key !== 'Tab' || !container) return

            const focusable = getFocusable(container)
            if (focusable.length === 0) {
                event.preventDefault()
                return
            }
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const active = document.activeElement
            const isOutside = !container.contains(active)

            if (event.shiftKey && (active === first || isOutside)) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && (active === last || isOutside)) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            previouslyFocused?.focus()
        }
    }, [isOpen])

    if (!isOpen) return null

    const portalTarget = document.querySelector<HTMLElement>('.app') ?? document.body

    return createPortal(
        <div
            className="modal-overlay"
            onMouseDown={(event) => {
                if (closeOnBackdropClick && event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <div
                ref={cardRef}
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="modal-header">
                    <h2 id={titleId} className="modal-title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Закрити"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="2" y1="2" x2="12" y2="12"/>
                            <line x1="12" y1="2" x2="2" y2="12"/>
                        </svg>
                    </button>
                </div>

                <div className="modal-body">{children}</div>

                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        portalTarget,
    )
}
