import type {Semester} from '../../types/catalog'

export type IntegrationStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN'

export type SystemIntegration = {
    id: string
    name: string
    provider: string
    status: IntegrationStatus
    latencyMs: number
    lastChecked: string
    description: string
    details: string
    icon: string
}

export type CazSyncStatus = {
    status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'
    lastSyncAt: string
    recordsCourses: number
    recordsClasses: number
    message: string
    mode: 'AUTOMATIC' | 'MANUAL'
}

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR'

export type AuditLogEntry = {
    id: string
    timestamp: string
    level: LogLevel
    action: string
    user: string
    source: string
    details: string
}

export type CourseFormData = {
    name: string
    faculty: string
    department: string
    semester: Semester
    year: number
    specialityNames: string[]
}

export type CourseClassFormData = {
    courseId: number
    teacher: string
    group: string
    location: string
    dayOfWeek: number // 1 (Пн) - 6 (Сб)
    startTime: string // "08:30"
    endTime: string // "09:50"
    weeks: number[]
}
