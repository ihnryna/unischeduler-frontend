import {useState} from 'react'

import {
    ClassOverrideModal,
    type ClassOverrideResult,
    type EditableClass,
} from '../../components/events/ClassOverrideModal'
import {
    ConfirmDeleteDialog,
    type DeletablePersonalEvent,
} from '../../components/events/ConfirmDeleteDialog'
import {
    PersonalEventModal,
    type EditablePersonalEvent,
} from '../../components/events/PersonalEventModal'
import {HiddenClassesList} from '../../components/events/HiddenClassesList'
import {ScheduleGrid} from '../../components/schedule/ScheduleGrid'
import {isEditablePersonalEvent} from '../../features/events/usePersonalEventMutations'
import {useSchedule} from '../../features/schedule/useSchedule'
import {useClassOverrideMutations} from '../../features/schedule/useClassOverrideMutations'
import type {CalendarEvent, PersonalEvent} from '../../types/schedule'
import {
    formatWeekRange,
    getAcademicWeekInfo,
    getMondayOfWeek,
    getWeekDays,
    getWeekOffsetFor,
    MONTH_NAMES_GENITIVE,
    MONTH_SHORT_UA,
} from '../../utils/dateUtils'
import {formatTime} from '../../utils/formatTime'

// TODO(FE-13): replace with useAuth().user.id
const CURRENT_USER_ID = 1

/** Personal events are edited; university classes get the student's own change form. */
function canEditScheduleEvent(event: CalendarEvent): boolean {
    return isEditablePersonalEvent(event) || Boolean(event.occurrence)
}

const CLASS_CHANGE_MESSAGES: Record<ClassOverrideResult, (name: string) => string> = {
    changed: (name) => `Зміни заняття «${name}» збережено. Їх бачите лише ви.`,
    hidden: (name) => `Заняття «${name}» приховано з вашого розкладу.`,
    restored: (name) => `Зміни заняття «${name}» скинуто.`,
}

export function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<EditablePersonalEvent | null>(null)
    const [deletingEvent, setDeletingEvent] = useState<DeletablePersonalEvent | null>(null)
    const [editingClass, setEditingClass] = useState<EditableClass | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const {events, hiddenEvents, isLoading, error, refetch} = useSchedule(CURRENT_USER_ID, weekOffset)
    const {
        unhide,
        isSaving: isRestoringClass,
        error: restoreError,
        resetError: resetRestoreError,
    } = useClassOverrideMutations()

    // New events default to the selected day, else today (if visible), else Monday.
    const weekDays = getWeekDays(weekOffset)
    const defaultEventDate =
        (selectedDay !== null ? weekDays[selectedDay]?.isoDate : undefined) ??
        weekDays.find((day) => day.isToday)?.isoDate ??
        weekDays[0].isoDate

    // Saved (created or edited): close the form, show the event's week, refetch.
    const handleEventSaved = (event: PersonalEvent, verb: string) => {
        const startsAt = new Date(event.startsAt)
        const nextWeekOffset = getWeekOffsetFor(startsAt)
        setIsCreateOpen(false)
        setEditingEvent(null)
        const dayIndex = (startsAt.getDay() + 6) % 7
        // Keep the day filter only if the saved event is still visible under it.
        if (nextWeekOffset !== weekOffset || (selectedDay !== null && selectedDay !== dayIndex)) {
            setSelectedDay(null)
        }
        setWeekOffset(nextWeekOffset)
        refetch()
        setSuccessMessage(
            `Подію «${event.name}» ${verb}: ${startsAt.getDate()} ${
                MONTH_NAMES_GENITIVE[startsAt.getMonth()]
            }, ${formatTime(event.startsAt)}–${formatTime(event.endsAt)}.`,
        )
    }

    const handleEventDeleted = (event: {name: string}) => {
        setEditingEvent(null)
        setDeletingEvent(null)
        refetch()
        setSuccessMessage(`Подію «${event.name}» видалено.`)
    }

    const handleDeleteEvent = (event: CalendarEvent) => {
        setSuccessMessage(null)
        setDeletingEvent({
            id: event.eventId,
            name: event.name,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
        })
    }

    const handleClassSaved = (name: string, result: ClassOverrideResult) => {
        setEditingClass(null)
        refetch()
        setSuccessMessage(CLASS_CHANGE_MESSAGES[result](name))
    }

    const handleRestoreClass = async (event: CalendarEvent) => {
        const occurrence = event.occurrence
        const override = occurrence?.occurrenceOverride ?? occurrence?.seriesOverride
        if (!occurrence || !override) return
        setSuccessMessage(null)
        const ok = await unhide(override, occurrence)
        if (ok) {
            refetch()
            setSuccessMessage(`Заняття «${event.name}» знову у вашому розкладі.`)
        }
    }

    const handleEditEvent = (event: CalendarEvent) => {
        setSuccessMessage(null)
        resetRestoreError()
        if (event.eventType !== 'PERSONAL') {
            if (event.occurrence) {
                setEditingClass({name: event.name, occurrence: event.occurrence})
            }
            return
        }
        setEditingEvent({
            id: event.eventId,
            name: event.name,
            location: event.location,
            description: event.description,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
        })
    }

    const monday = getMondayOfWeek()
    monday.setDate(monday.getDate() + weekOffset * 7)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const weekRangeLabel = formatWeekRange(monday, sunday)
    const academicWeekInfo = getAcademicWeekInfo(monday)

    // Дані для блоку "Найближче заняття" (перше заняття у вибраному тижні)
    const upcomingEvent = events[0] ?? null
    let upcomingDay = '--'
    let upcomingMonth = ''
    if (upcomingEvent) {
        const eventDate = new Date(upcomingEvent.startsAt)
        upcomingDay = String(eventDate.getDate())
        upcomingMonth = MONTH_SHORT_UA[eventDate.getMonth()]
    }

    // Дані для блоку "Тиждень у цифрах"
    const uniqueDaysCount = new Set(
        events.map((e) => new Date(e.startsAt).getDay()),
    ).size
    const totalHours = events.reduce((sum, e) => {
        const diffMs = new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()
        return sum + diffMs / (1000 * 60 * 60)
    }, 0)

    return (
        <>
            <div className="page-heading">
                <div>
                    <h1>Мій розклад</h1>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                        setSuccessMessage(null)
                        setIsCreateOpen(true)
                    }}
                    aria-haspopup="dialog"
                >
                    <span aria-hidden="true">＋</span> Нова подія
                </button>
            </div>

            {isCreateOpen && (
                <PersonalEventModal
                    mode="create"
                    userId={CURRENT_USER_ID}
                    defaultDate={defaultEventDate}
                    onClose={() => setIsCreateOpen(false)}
                    onSaved={(event) => handleEventSaved(event, 'додано')}
                />
            )}

            {editingEvent && (
                <PersonalEventModal
                    mode="edit"
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onSaved={(event) => handleEventSaved(event, 'оновлено')}
                    onDeleted={handleEventDeleted}
                />
            )}

            {editingClass && (
                <ClassOverrideModal
                    classItem={editingClass}
                    userId={CURRENT_USER_ID}
                    onClose={() => setEditingClass(null)}
                    onSaved={(result) => handleClassSaved(editingClass.name, result)}
                />
            )}

            {deletingEvent && (
                <ConfirmDeleteDialog
                    event={deletingEvent}
                    onCancel={() => setDeletingEvent(null)}
                    onDeleted={handleEventDeleted}
                />
            )}

            {/* Live region stays mounted so the success message is announced. */}
            <div role="status" aria-live="polite">
                {successMessage && (
                    <p className="form-success-notice">
                        <span aria-hidden="true">✓ </span>
                        {successMessage}
                    </p>
                )}
            </div>

            <section className="week-toolbar">
                <div className="week-controls">
                    <button
                        className="icon-button"
                        onClick={() => setWeekOffset((value) => value - 1)}
                        aria-label="Попередній тиждень"
                    >
                        ←
                    </button>

                    <button
                        className="today-button"
                        onClick={() => {
                            setWeekOffset(0)
                            setSelectedDay(null)
                        }}
                    >
                        Сьогодні
                    </button>

                    <button
                        className="icon-button"
                        onClick={() => setWeekOffset((value) => value + 1)}
                        aria-label="Наступний тиждень"
                    >
                        →
                    </button>
                </div>

                <div className="week-center">
                    <div className="week-title-row">
                        <h2>{weekRangeLabel}</h2>
                        {weekOffset === 0 ? (
                            <span className="current-week-badge">Поточний тиждень</span>
                        ) : (
                            <span className="week-offset-badge">
                                {weekOffset > 0 ? `+${weekOffset}` : weekOffset} тиж. від поточного
                            </span>
                        )}
                    </div>
                </div>

                <div className="week-right">
                    <span className="week-parity-badge">
                        {academicWeekInfo.fullLabel}
                    </span>
                </div>
            </section>

            {isLoading && (
                <p className="demo-notice">Завантажуємо розклад…</p>
            )}

            {error && (
                <p className="demo-notice" role="alert">{error}</p>
            )}

            <ScheduleGrid
                events={events}
                selectedDay={selectedDay}
                onSelectDay={(dayIndex) => {
                    setSelectedDay((current) =>
                        current === dayIndex ? null : dayIndex,
                    )
                }}
                weekOffset={weekOffset}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                canEditEvent={canEditScheduleEvent}
                canDeleteEvent={isEditablePersonalEvent}
            />

            {restoreError && (
                <p className="form-error-alert" role="alert">
                    <span aria-hidden="true">!! </span>
                    {restoreError}
                </p>
            )}

            <HiddenClassesList
                events={hiddenEvents}
                onRestore={handleRestoreClass}
                onEdit={handleEditEvent}
                isBusy={isRestoringClass}
            />

            <div className="bottom-widgets">
                <section className="widget" id="upcoming">
                    <div className="widget-heading">
                        <div>
                            <p className="eyebrow">НЕЗАБАРОМ</p>
                            <h2>Найближче заняття</h2>
                        </div>

                        <span className="status-dot"/>
                    </div>

                    {upcomingEvent ? (
                        <div className="upcoming-lesson">
                            <div className="upcoming-date">
                                <strong>{upcomingDay}</strong>
                                <span>{upcomingMonth}</span>
                            </div>

                            <div className="upcoming-details">
                                <strong>{upcomingEvent.name}</strong>
                                <span>
                                    {formatTime(upcomingEvent.startsAt)} ·{' '}
                                    {upcomingEvent.location ?? 'Онлайн'}
                                </span>
                                <span>
                                    {upcomingEvent.teacher ?? upcomingEvent.description ?? 'Навчальна група'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="upcoming-empty">
                            <p>На цьому тижні немає запланованих занять.</p>
                        </div>
                    )}
                </section>

                <section className="widget" id="overview">
                    <div className="widget-heading">
                        <div>
                            <p className="eyebrow">ШВИДКИЙ ОГЛЯД</p>
                            <h2>Тиждень у цифрах</h2>
                        </div>
                    </div>

                    <div className="overview-stats">
                        <div>
                            <strong>{events.length}</strong>
                            <span>подій</span>
                        </div>

                        <div>
                            <strong>{uniqueDaysCount}</strong>
                            <span>навчальних днів</span>
                        </div>

                        <div>
                            <strong>
                                {totalHours.toLocaleString('uk-UA', {
                                    maximumFractionDigits: 1,
                                })}
                            </strong>
                            <span>годин</span>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="page-footer">
                UNIScheduler <span>·</span> Твій час має значення
            </footer>
        </>
    )
}
