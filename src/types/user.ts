import type {Speciality} from './catalog'

export type UserRole = 'STUDENT' | 'ADMIN'

export type User = {
    id: number
    speciality: Speciality
    email: string
    role: UserRole
}

export type UserCreate = {
    specialityId: number
    email: string
    role: UserRole
}

export type UserUpdate = UserCreate & {
    id: number
}
