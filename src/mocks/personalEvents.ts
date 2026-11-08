import type {PersonalEvent} from '../types/schedule'

export const mockPersonalEvents: PersonalEvent[] = [
    {
        id: 'event-1',
        ownerId: 'user-student-diana',
        title: 'Зустріч команди UNIScheduler',
        description: 'Обговорення прогресу frontend і наступної ітерації.',
        date: '2026-10-28',
        start: 16,
        end: 17,
        location: 'Онлайн',
        color: 'blue',
        source: 'personal',
        createdAt: '2026-10-20T10:00:00.000Z',
        updatedAt: '2026-10-20T10:00:00.000Z',
    },
]
