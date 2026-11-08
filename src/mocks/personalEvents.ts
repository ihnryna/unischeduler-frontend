import type {PersonalEvent} from '../types/schedule'

export const mockPersonalEvents: PersonalEvent[] = [
    {
        id: 1,
        userId: 1,
        name: 'Зустріч команди UNIScheduler',
        description: 'Обговорення прогресу frontend і наступної ітерації.',
        location: 'Онлайн',
        startsAt: '2026-10-28T16:00:00',
        endsAt: '2026-10-28T17:00:00',
    },
]
