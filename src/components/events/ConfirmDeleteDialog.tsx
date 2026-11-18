import {useId, useRef} from 'react'

import {Modal} from '../ui/Modal'
import {usePersonalEventMutations} from '../../features/events/usePersonalEventMutations'
import type {LocalDateTime} from '../../types/common'
import {MONTH_NAMES_GENITIVE} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

export type DeletablePersonalEvent = {
    id: number
    name: string
    startsAt: LocalDateTime
    endsAt: LocalDateTime
}

type ConfirmDeleteDialogProps = {
    event: DeletablePersonalEvent
    onCancel: () => void
    onDeleted: (event: DeletablePersonalEvent) => void
}

export function ConfirmDeleteDialog({event, onCancel, onDeleted}: Readonly<ConfirmDeleteDialogProps>) {
    const questionId = useId()
    const cancelRef = useRef<HTMLButtonElement>(null)
    const {remove, isSaving: isDeleting, error} = usePersonalEventMutations()

    const startsAt = new Date(event.startsAt)
    const when = `${startsAt.getDate()} ${MONTH_NAMES_GENITIVE[startsAt.getMonth()]}, ${formatTime(
        event.startsAt,
    )}–${formatTime(event.endsAt)}`

    const handleCancel = () => {
        if (!isDeleting) onCancel()
    }

    const handleConfirm = async () => {
        if (isDeleting) return
        if (await remove(event.id)) onDeleted(event)
    }

    return (
        <Modal
            isOpen
            role="alertdialog"
            title="Видалення події"
            describedById={questionId}
            onClose={handleCancel}
            initialFocusRef={cancelRef}
            footer={
                <>
                    <button
                        ref={cancelRef}
                        type="button"
                        className="button modal-btn-secondary"
                        onClick={handleCancel}
                        disabled={isDeleting}
                    >
                        Скасувати
                    </button>
                    <button
                        type="button"
                        className="button modal-btn-danger"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        aria-busy={isDeleting}
                    >
                        {isDeleting ? 'Видаляємо…' : 'Видалити'}
                    </button>
                </>
            }
        >
            <div id={questionId} className="confirm-dialog-text">
                <p>Чи ви впевнені, що хочете видалити подію?</p>
                <p>
                    <strong>«{event.name}»</strong>, {when}
                </p>
                <p className="form-field-hint">Цю дію не можна скасувати.</p>
            </div>

            {error && (
                <div className="form-error-alert" role="alert">
                    <span aria-hidden="true">!! </span>
                    {error}
                </div>
            )}
        </Modal>
    )
}
