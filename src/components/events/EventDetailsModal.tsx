import type {ReactNode} from 'react'

import {Modal} from '../ui/Modal'
import {CLASS_KIND_LABELS, getClassKind, getWeekPattern} from '../../features/schedule/classDetails'
import {getMeetingHref} from '../../features/events/personalEventValidation'
import type {CalendarEvent, EventType} from '../../types/schedule'
import {DAY_NAMES_FULL, MONTH_NAMES_GENITIVE} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

type EventDetailsModalProps = {
    event: CalendarEvent
    onClose: () => void
    /**
     * Opens the edit form: the personal-event form, or for a university class the form for
     * the student's own change of it. Without it no edit button is shown.
     */
    onEdit?: () => void
    /** Opens the delete confirmation (own personal events only). */
    onDelete?: () => void
    /** Shows a class the student hid again. The button appears only for a hidden class. */
    onRestore?: () => void
    /** Disables the restore button while it is being saved. */
    isRestoring?: boolean
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
    COURSE_CLASS: 'Заняття за розкладом',
    CLASS_OVERRIDE: 'Заняття змінено вами',
    PERSONAL: 'Особиста подія',
}

const NOT_SPECIFIED = 'Не вказано'

function formatDate(value: string): string {
    const date = new Date(value)
    return `${DAY_NAMES_FULL[(date.getDay() + 6) % 7]}, ${date.getDate()} ${
        MONTH_NAMES_GENITIVE[date.getMonth()]
    }`
}

function formatTimeRange(startsAt: string, endsAt: string): string {
    return `${formatTime(startsAt)} – ${formatTime(endsAt)}`
}

function LocationValue({location}: Readonly<{location: string | null}>) {
    const href = getMeetingHref(location)
    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="event-details-link">
                Онлайн-зустріч
                <span className="visually-hidden"> (відкриється в новій вкладці)</span>
                <span aria-hidden="true"> ↗</span>
            </a>
        )
    }
    return <>{location || NOT_SPECIFIED}</>
}

function DetailRow({label, children}: Readonly<{label: string; children: ReactNode}>) {
    return (
        <div className="event-details-row">
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    )
}

/**
 * Read-only details of a calendar entry (FE-18), opened by clicking its card in the week
 * grid. A university class shows its full title, department, instructor, room, group, class
 * kind (lecture / seminar / lab) and numerator / denominator; a personal event shows its
 * time, place and description. Edit / delete buttons appear only when the page passes
 * `onEdit` / `onDelete`.
 *
 * Mount it only while open.
 */
export function EventDetailsModal({
    event,
    onClose,
    onEdit,
    onDelete,
    onRestore,
    isRestoring = false,
}: Readonly<EventDetailsModalProps>) {
    const isPersonal = event.eventType === 'PERSONAL'
    const occurrence = event.occurrence
    const isHidden = Boolean(occurrence?.isHidden)
    const course = event.course ?? null
    const classKind = isPersonal ? null : getClassKind(event)
    const weekPattern = isPersonal ? null : getWeekPattern(event.weeks)
    const studentNote = occurrence
        ? (occurrence.occurrenceOverride?.description ?? occurrence.seriesOverride?.description ?? null)
        : null

    // Show the university's original time / room when the student changed them.
    const timeChanged =
        occurrence &&
        (occurrence.originalStartsAt !== event.startsAt || occurrence.originalEndsAt !== event.endsAt)
    const locationChanged = occurrence && occurrence.originalLocation !== event.location

    return (
        <Modal
            isOpen
            title={isPersonal ? 'Деталі події' : 'Деталі заняття'}
            onClose={onClose}
            footer={
                <>
                    {onDelete && (
                        <button
                            type="button"
                            className="button modal-btn-danger modal-footer-start"
                            onClick={onDelete}
                            aria-haspopup="dialog"
                        >
                            Видалити
                        </button>
                    )}
                    <button type="button" className="button modal-btn-secondary" onClick={onClose}>
                        Закрити
                    </button>
                    {isHidden && onRestore && (
                        <button
                            type="button"
                            className="primary-button"
                            onClick={onRestore}
                            disabled={isRestoring}
                        >
                            {isRestoring ? 'Повертаємо…' : 'Показати знову'}
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            className={isHidden ? 'button modal-btn-secondary' : 'primary-button'}
                            onClick={onEdit}
                            aria-haspopup="dialog"
                        >
                            {isPersonal ? 'Редагувати' : 'Змінити заняття'}
                        </button>
                    )}
                </>
            }
        >
            <div className="event-details">
                <div className="event-details-summary">
                    <p className="event-details-title">{event.name}</p>
                    <div className="event-details-tags">
                        <span className="chip">
                            {isHidden ? 'Приховано з вашого розкладу' : EVENT_TYPE_LABELS[event.eventType]}
                        </span>
                        {classKind && <span className="chip">{CLASS_KIND_LABELS[classKind]}</span>}
                        {weekPattern && <span className="chip">{weekPattern.label}</span>}
                    </div>
                </div>

                <dl className="event-details-list">
                    <DetailRow label="Дата">{formatDate(event.startsAt)}</DetailRow>
                    <DetailRow label="Час">
                        {formatTimeRange(event.startsAt, event.endsAt)}
                        {timeChanged && (
                            <span className="event-details-original">
                                За розкладом університету:{' '}
                                {formatDate(occurrence.originalStartsAt).toLowerCase()},{' '}
                                {formatTimeRange(occurrence.originalStartsAt, occurrence.originalEndsAt)}
                            </span>
                        )}
                    </DetailRow>

                    {isPersonal ? (
                        <>
                            <DetailRow label="Місце">
                                <LocationValue location={event.location}/>
                            </DetailRow>
                            {event.description && (
                                <DetailRow label="Опис">
                                    <span className="event-details-text">{event.description}</span>
                                </DetailRow>
                            )}
                        </>
                    ) : (
                        <>
                            <DetailRow label="Кафедра">{course?.department || NOT_SPECIFIED}</DetailRow>
                            {course?.faculty && <DetailRow label="Факультет">{course.faculty}</DetailRow>}
                            <DetailRow label="Викладач">{event.teacher || NOT_SPECIFIED}</DetailRow>
                            <DetailRow label="Аудиторія">
                                <LocationValue location={event.location}/>
                                {locationChanged && (
                                    <span className="event-details-original">
                                        За розкладом університету: {occurrence.originalLocation || NOT_SPECIFIED}
                                    </span>
                                )}
                            </DetailRow>
                            <DetailRow label="Група">{event.group || NOT_SPECIFIED}</DetailRow>
                            <DetailRow label="Тип заняття">
                                {classKind ? CLASS_KIND_LABELS[classKind] : NOT_SPECIFIED}
                            </DetailRow>
                            {weekPattern && (
                                <DetailRow label="Чисельник / знаменник">
                                    {weekPattern.label}
                                    <span className="event-details-original">{weekPattern.hint}</span>
                                </DetailRow>
                            )}
                            {studentNote && (
                                <DetailRow label="Ваша нотатка">
                                    <span className="event-details-text">{studentNote}</span>
                                </DetailRow>
                            )}
                        </>
                    )}
                </dl>
            </div>
        </Modal>
    )
}
