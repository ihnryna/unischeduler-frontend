import type {CalendarEvent} from '../../types/schedule'

/** Hours the week grid always shows: 08:00 up to (not including) 20:00. */
export const DEFAULT_FIRST_HOUR = 8
export const DEFAULT_LAST_HOUR = 20

export type HourRange = {
    /** First hour row, e.g. 8 for 08:00. */
    first: number
    /** Exclusive end, e.g. 20 means the last row is 19:00 – 20:00. */
    last: number
}

/** Hours since local midnight as a fraction, e.g. 10:30 → 10.5. */
export function hoursFromStartOfDay(value: string): number {
    const date = new Date(value)
    return date.getHours() + date.getMinutes() / 60
}

/**
 * Start and end of an event in hours of its start day. An event that ends on a later day
 * is cut at midnight, so its card never runs past the bottom of the grid.
 */
export function getEventHours(event: CalendarEvent): {start: number; end: number} {
    const start = hoursFromStartOfDay(event.startsAt)
    const endsNextDay =
        new Date(event.endsAt).toDateString() !== new Date(event.startsAt).toDateString()
    const end = endsNextDay ? 24 : hoursFromStartOfDay(event.endsAt)

    return {start, end: Math.max(end, start)}
}

/** The default range, widened so that every event fits inside the grid. */
export function getHourRange(events: CalendarEvent[]): HourRange {
    let first = DEFAULT_FIRST_HOUR
    let last = DEFAULT_LAST_HOUR

    for (const event of events) {
        const {start, end} = getEventHours(event)
        first = Math.min(first, Math.floor(start))
        last = Math.max(last, Math.ceil(end))
    }

    return {first, last}
}

/** Row labels for a range: [8, 9, …, 19] for 08:00 – 20:00. */
export function getHourRows({first, last}: HourRange): number[] {
    return Array.from({length: last - first}, (_, index) => first + index)
}

/** Side-by-side position of a card among events that overlap it in time. */
export type OverlapSlot = {
    /** 0-based column inside the group of overlapping events. */
    lane: number
    /** Number of columns the group needs. 1 = no overlap, the card takes the full width. */
    laneCount: number
}

/**
 * Splits one day's events into side-by-side columns so that overlapping events never cover
 * each other. Events that overlap (directly or through a chain) form a group; each event
 * takes the first column that is free at its start, and every event of the group gets the
 * group's column count. Returns the slot for every event, keyed by `getKey(event)`.
 */
export function getOverlapLayout(
    events: CalendarEvent[],
    getKey: (event: CalendarEvent) => string,
): Map<string, OverlapSlot> {
    const layout = new Map<string, OverlapSlot>()
    const sorted = events
        .map((event) => ({event, ...getEventHours(event)}))
        .sort((a, b) => a.start - b.start || b.end - a.end)

    let group: {key: string; lane: number}[] = []
    let laneEnds: number[] = []
    let groupEnd = -Infinity

    const closeGroup = () => {
        for (const {key, lane} of group) layout.set(key, {lane, laneCount: laneEnds.length})
        group = []
        laneEnds = []
    }

    for (const {event, start, end} of sorted) {
        if (start >= groupEnd) closeGroup()

        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
        if (lane === -1) {
            lane = laneEnds.length
            laneEnds.push(end)
        } else {
            laneEnds[lane] = end
        }

        group.push({key: getKey(event), lane})
        groupEnd = Math.max(start >= groupEnd ? end : groupEnd, end)
    }
    closeGroup()

    return layout
}
