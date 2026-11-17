import {mockPersonalEvents} from '../../mocks'
import type {LocalDateTime} from '../../types/common'
import type {PersonalEvent, PersonalEventCreate} from '../../types/schedule'

/** Simulated network latency of the mock, so loading states are visible. */
const MOCK_LATENCY_MS = 400

// In-memory copy: fixtures stay untouched, created events live until page reload.
let storedEvents: PersonalEvent[] = []
let nextId = Math.max(0, ...mockPersonalEvents.map((event) => event.id)) + 1000

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Personal-event data access (mock implementation of `POST /personal-event`).
 *
 * TODO(FE-21): add `update`, `remove` and the HTTP variant once `apiClient` exists.
 */
export const personalEventService = {
    /** Creates a personal event and resolves with the stored DTO. */
    async create(data: PersonalEventCreate): Promise<PersonalEvent> {
        await delay(MOCK_LATENCY_MS)

        const created: PersonalEvent = {
            id: nextId++,
            userId: data.userId,
            name: data.name,
            location: data.location ?? null,
            description: data.description ?? null,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
        }
        storedEvents = [...storedEvents, created]

        return structuredClone(created)
    },

    /**
     * Events created in this session that start inside `[from, to)`.
     * Used by the mock schedule service to merge them into the calendar.
     */
    listCreatedInRange(userId: number, from: LocalDateTime, to: LocalDateTime): PersonalEvent[] {
        return structuredClone(
            storedEvents.filter(
                (event) =>
                    event.userId === userId &&
                    event.startsAt >= from &&
                    event.startsAt < to,
            ),
        )
    },
}
