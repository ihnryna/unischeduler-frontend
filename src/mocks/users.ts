import type {User} from '../types/user'
import {mockSpecialities} from './specialities'

export const mockUsers: User[] = [
    {
        id: 1,
        speciality: mockSpecialities[0],
        email: 'diana.tsisaruk@ukma.edu.ua',
        role: 'STUDENT',
    },
    {
        id: 2,
        speciality: mockSpecialities[1],
        email: 'iryna.hryshchenko@ukma.edu.ua',
        role: 'STUDENT',
    },
    {
        id: 3,
        speciality: mockSpecialities[0],
        email: 'admin@ukma.edu.ua',
        role: 'ADMIN',
    },
]
