import type {LocalDateTime} from '../../types/common'
import type {CalendarEvent} from '../../types/schedule'
import type {HourRange} from './gridHours'

/** Step, in minutes, that a dragged event snaps to. */
export const MOVE_SNAP_MINUTES = 15

/** New start and end of an event moved in the week grid. */
export type EventMove = {
    startsAt: LocalDateTime
    endsAt: LocalDateTime
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Local `YYYY-MM-DDTHH:mm:00` for `date`, the format of the backend's `LocalDateTime`. */
export function toLocalDateTime(date: Date): LocalDateTime {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours(),
    )}:${pad(date.getMinutes())}:00`
}

/**
 * Where `event` lands when its card is dropped on the day `isoDate` (`YYYY-MM-DD`) with its
 * top edge at `topHours` (hours since midnight, e.g. 10.4). The start snaps to
 * {@link MOVE_SNAP_MINUTES}, the duration is kept, and the event is kept inside the hours the
 * grid shows (`range`) and inside its day.
 */
export function computeMovedTimes(
    event: CalendarEvent,
    isoDate: string,
    topHours: number,
    range: HourRange,
): EventMove {
    const durationMs = Math.max(
        0,
        new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime(),
    )
    const durationMinutes = Math.round(durationMs / 60_000)

    const minStart = range.first * 60
    const maxEnd = Math.min(range.last, 24) * 60
    const maxStart = Math.max(
        minStart,
        Math.floor((maxEnd - durationMinutes) / MOVE_SNAP_MINUTES) * MOVE_SNAP_MINUTES,
    )
    const snapped = Math.round((topHours * 60) / MOVE_SNAP_MINUTES) * MOVE_SNAP_MINUTES
    const startMinutes = Math.min(Math.max(snapped, minStart), maxStart)

    const [year, month, day] = isoDate.split('-').map(Number)
    const start = new Date(year, month - 1, day, 0, startMinutes)
    const end = new Date(start.getTime() + durationMs)

    return {startsAt: toLocalDateTime(start), endsAt: toLocalDateTime(end)}
}

/** True when `move` keeps the event where it already is. */
export function isSameTimes(event: CalendarEvent, move: EventMove): boolean {
    return (
        new Date(event.startsAt).getTime() === new Date(move.startsAt).getTime() &&
        new Date(event.endsAt).getTime() === new Date(move.endsAt).getTime()
    )
}
