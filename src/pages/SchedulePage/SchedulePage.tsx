import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router'

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
import {EventDetailsModal} from '../../components/events/EventDetailsModal'
import {HiddenClassesList} from '../../components/events/HiddenClassesList'
import {ScheduleGrid} from '../../components/schedule/ScheduleGrid'
import type {AccessDeniedState} from '../../features/auth/RequireRole'
import {
    isEditablePersonalEvent,
    usePersonalEventMutations,
} from '../../features/events/usePersonalEventMutations'
import {buildMovePatch, hidingOverrides} from '../../features/schedule/classOverrides'
import type {EventMove} from '../../features/schedule/eventMove'
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

/** Own personal events are edited; university classes get the student's own change form. */
function canEditScheduleEvent(event: CalendarEvent): boolean {
    return isEditablePersonalEvent(event) || Boolean(event.occurrence)
}

/**
 * What can be dragged to another time: own personal events, and university classes shown in
 * the schedule (moving one records a one-off change for that week only, D-06).
 */
function canMoveScheduleEvent(event: CalendarEvent): boolean {
    return (
        isEditablePersonalEvent(event) ||
        Boolean(event.occurrence && !event.occurrence.isHidden)
    )
}

/** "21 листопада, 10:00–11:30" */
function formatMoveTarget(move: EventMove): string {
    const startsAt = new Date(move.startsAt)
    return `${startsAt.getDate()} ${MONTH_NAMES_GENITIVE[startsAt.getMonth()]}, ${formatTime(
        move.startsAt,
    )}–${formatTime(move.endsAt)}`
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
    const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [moveError, setMoveError] = useState<string | null>(null)
    // Hidden (cancelled) classes are drawn faded in the grid only on request.
    const [showHidden, setShowHidden] = useState(false)
    // Set by RequireRole when a student opens /admin and is sent here.
    const location = useLocation()
    const navigate = useNavigate()
    const [accessNotice] = useState<string | null>(
        () => (location.state as AccessDeniedState | null)?.accessNotice ?? null,
    )

    // Drop the notice from history so a reload does not show it again.
    useEffect(() => {
        if (location.state) navigate(location.pathname, {replace: true, state: null})
    }, [location.state, location.pathname, navigate])
    const {events, hiddenEvents, isLoading, error, refetch} = useSchedule(CURRENT_USER_ID, weekOffset)
    const {
        unhide,
        isSaving: isRestoringClass,
        error: restoreError,
        resetError: resetRestoreError,
    } = useClassOverrideMutations()
    // Separate instances, so a drag-and-drop save does not disable the other forms.
    const {save: saveClassChange} = useClassOverrideMutations()
    const {update: updatePersonalEvent} = usePersonalEventMutations()

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
        setViewingEvent(null)
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
        if (!occurrence) return
        const overrides = hidingOverrides(occurrence)
        if (overrides.length === 0) return
        setSuccessMessage(null)
        let ok = true
        for (const override of overrides) {
            ok = await unhide(override, occurrence)
            if (!ok) break
        }
        if (ok) {
            setViewingEvent(null)
            refetch()
            setSuccessMessage(`Заняття «${event.name}» знову у вашому розкладі.`)
        }
    }

    // Drag-and-drop in the grid. No optimistic update: the grid shows a "saving" outline
    // until the schedule is reloaded; on failure the event stays where it was.
    const handleMoveEvent = async (event: CalendarEvent, move: EventMove) => {
        setSuccessMessage(null)
        setMoveError(null)
        const failure = `Не вдалося перенести «${event.name}». Спробуйте ще раз.`

        if (event.eventType === 'PERSONAL') {
            const saved = await updatePersonalEvent({
                id: event.eventId,
                name: event.name,
                location: event.location,
                description: event.description,
                ...move,
            })
            if (!saved) {
                setMoveError(failure)
                return
            }
            await refetch()
            setSuccessMessage(`Подію «${event.name}» перенесено: ${formatMoveTarget(move)}.`)
            return
        }

        const occurrence = event.occurrence
        if (!occurrence) return
        const {patch, error: invalid} = buildMovePatch(occurrence, move.startsAt, move.endsAt)
        if (invalid) {
            setMoveError(invalid)
            return
        }
        const ok = await saveClassChange({
            userId: CURRENT_USER_ID,
            courseClassId: occurrence.courseClassId,
            existing: occurrence.occurrenceOverride,
            patch,
        })
        if (!ok) {
            setMoveError(failure)
            return
        }
        await refetch()
        setSuccessMessage(
            patch === null
                ? `Заняття «${event.name}» повернуто на час за розкладом університету.`
                : `Заняття «${event.name}» перенесено: ${formatMoveTarget(move)}. Цю зміну бачите лише ви.`,
        )
    }

    const handleOpenEvent = (event: CalendarEvent) => {
        setSuccessMessage(null)
        setMoveError(null)
        setViewingEvent(event)
    }

    const handleEditEvent = (event: CalendarEvent) => {
        setViewingEvent(null)
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

    const isShowingHidden = showHidden && hiddenEvents.length > 0
    const gridEvents = isShowingHidden
        ? [...events, ...hiddenEvents].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        : events

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

            {viewingEvent && (
                <EventDetailsModal
                    event={viewingEvent}
                    onClose={() => setViewingEvent(null)}
                    onEdit={
                        canEditScheduleEvent(viewingEvent)
                            ? () => handleEditEvent(viewingEvent)
                            : undefined
                    }
                    onDelete={
                        isEditablePersonalEvent(viewingEvent)
                            ? () => handleDeleteEvent(viewingEvent)
                            : undefined
                    }
                    onRestore={() => handleRestoreClass(viewingEvent)}
                    isRestoring={isRestoringClass}
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

            {accessNotice && (
                <p className="demo-notice" role="alert">{accessNotice}</p>
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

            {hiddenEvents.length > 0 && (
                <div className="hidden-toggle-row">
                    <button
                        type="button"
                        className="button modal-btn-secondary hidden-toggle"
                        aria-pressed={isShowingHidden}
                        onClick={() => setShowHidden((value) => !value)}
                    >
                        <span aria-hidden="true">{isShowingHidden ? '◉ ' : '◎ '}</span>
                        {isShowingHidden ? 'Сховати приховані' : 'Показати приховані'} (
                        {hiddenEvents.length})
                    </button>
                </div>
            )}

            <ScheduleGrid
                events={gridEvents}
                selectedDay={selectedDay}
                onSelectDay={(dayIndex) => {
                    setSelectedDay((current) =>
                        current === dayIndex ? null : dayIndex,
                    )
                }}
                weekOffset={weekOffset}
                onOpenEvent={handleOpenEvent}
                onDeleteEvent={handleDeleteEvent}
                canDeleteEvent={isEditablePersonalEvent}
                onMoveEvent={handleMoveEvent}
                canMoveEvent={canMoveScheduleEvent}
            />

            {moveError && (
                <p className="form-error-alert" role="alert">
                    <span aria-hidden="true">!! </span>
                    {moveError}
                </p>
            )}

            {restoreError && (
                <p className="form-error-alert" role="alert">
                    <span aria-hidden="true">!! </span>
                    {restoreError}
                </p>
            )}

            {isShowingHidden && (
                <HiddenClassesList
                    events={hiddenEvents}
                    onRestore={handleRestoreClass}
                    onEdit={handleEditEvent}
                    isBusy={isRestoringClass}
                />
            )}

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
