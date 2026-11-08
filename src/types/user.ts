export type UserRole = 'student' | 'admin'

export type User = {
    id: string
    name: string
    email: string
    initials: string
    role: UserRole
    groupId?: string
}
