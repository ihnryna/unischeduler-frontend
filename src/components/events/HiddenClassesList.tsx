import type {CalendarEvent} from '../../types/schedule'
import {hidingOverrides} from '../../features/schedule/classOverrides'
import {DAY_NAMES_SHORT} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

type HiddenClassesListProps = {
    /** University classes of the shown week that the student hid. */
    events: CalendarEvent[]
    /** Shows the class in the personal schedule again. */
    onRestore: (event: CalendarEvent) => void
    /** Opens the class-change form (e.g. to hide only this week instead). */
    onEdit: (event: CalendarEvent) => void
    /** Disables the actions while a change is being saved. */
    isBusy?: boolean
}

/**
 * Compact list of the week's hidden (cancelled) university classes, so a hidden class can
 * always be found and shown again. Renders nothing when no class is hidden.
 */
export function HiddenClassesList({
    events,
    onRestore,
    onEdit,
    isBusy = false,
}: Readonly<HiddenClassesListProps>) {
    if (events.length === 0) return null

    return (
        <section className="hidden-classes" aria-labelledby="hidden-classes-title">
            <h2 id="hidden-classes-title" className="hidden-classes-title">
                Приховані заняття цього тижня ({events.length})
            </h2>
            <ul className="hidden-classes-list">
                {events.map((event) => {
                    const original = event.occurrence
                    const startsAt = original?.originalStartsAt ?? event.startsAt
                    const endsAt = original?.originalEndsAt ?? event.endsAt
                    const dayName = DAY_NAMES_SHORT[(new Date(startsAt).getDay() + 6) % 7]
                    const hiding = original ? hidingOverrides(original) : []
                    const isSeries = Boolean(original?.seriesOverride?.isHidden)
                    const note = hiding.find((override) => override.description)?.description
                    return (
                        <li key={`${event.eventType}-${event.eventId}`} className="hidden-classes-item">
                            <span className="hidden-classes-text">
                                <strong>{event.name}</strong>
                                <span>
                                    {dayName}, {formatTime(startsAt)}–{formatTime(endsAt)}
                                    {isSeries ? ' · приховано на весь семестр' : ''}
                                    {note ? ` · ${note}` : ''}
                                </span>
                            </span>
                            <span className="hidden-classes-actions">
                                <button
                                    type="button"
                                    className="button modal-btn-secondary"
                                    onClick={() => onEdit(event)}
                                    disabled={isBusy}
                                    aria-haspopup="dialog"
                                    aria-label={`Змінити: ${event.name}`}
                                >
                                    Змінити
                                </button>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => onRestore(event)}
                                    disabled={isBusy}
                                    aria-label={`Показати знову: ${event.name}`}
                                >
                                    Показати знову
                                </button>
                            </span>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
