import type {User} from '../types/user'

export const mockUsers: User[] = [
    {
        id: 'user-student-diana',
        name: 'Діана Цісарук',
        email: 'diana.tsisaruk@ukma.edu.ua',
        initials: 'ДЦ',
        role: 'student',
        groupId: 'group-ipz-4',
    },
    {
        id: 'user-student-iryna',
        name: 'Ірина Грищенко',
        email: 'iryna.hryshchenko@ukma.edu.ua',
        initials: 'ІГ',
        role: 'student',
        groupId: 'group-kn-4',
    },
    {
        id: 'user-admin',
        name: 'Адміністратор UNIScheduler',
        email: 'admin@ukma.edu.ua',
        initials: 'AU',
        role: 'admin',
    },
]
