import type {Course, CourseClass} from '../../types/catalog'
import {mockCourses} from '../../mocks/courses'
import {mockCourseClasses} from '../../mocks/courseClasses'
import {mockSpecialities} from '../../mocks/specialities'
import type {
    AuditLogEntry,
    CazSyncStatus,
    CourseClassFormData,
    CourseFormData,
    SystemIntegration,
} from './adminTypes'

const STORAGE_KEY_COURSES = 'unischeduler_admin_courses_v1'
const STORAGE_KEY_CLASSES = 'unischeduler_admin_classes_v1'
const STORAGE_KEY_LOGS = 'unischeduler_admin_logs_v1'
const STORAGE_KEY_SYNC = 'unischeduler_admin_caz_sync_v1'

const INITIAL_INTEGRATIONS: SystemIntegration[] = [
    {
        id: 'caz',
        name: 'KMA САЗ',
        provider: 'НаУКМА Automated Registration System',
        status: 'OPERATIONAL',
        latencyMs: 38,
        lastChecked: 'Щойно',
        description: 'Синхронізація розкладу навчальних груп, дисциплін та викладачів',
        details: 'API v2.1 · Режим кешування: активний (fallback 72h)',
        icon: '🏛️',
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar API',
        provider: 'Google Cloud Platform (Workspace)',
        status: 'OPERATIONAL',
        latencyMs: 84,
        lastChecked: '2 хв тому',
        description: 'Експорт пар у персональні Google-календарі студентів',
        details: 'OAuth 2.0 Client · Квота: 8.4k / 50k req/day',
        icon: '📅',
    },
    {
        id: 'database',
        name: 'PostgreSQL Database',
        provider: 'Central Relational Cluster',
        status: 'OPERATIONAL',
        latencyMs: 6,
        lastChecked: 'Щойно',
        description: 'Основне сховище розкладів, персональних подій та журналів аудиту',
        details: 'Storage: 42 MB / 80% поріг моніторингу · Active pools: 8',
        icon: '🗄️',
    },
]

const INITIAL_LOGS: AuditLogEntry[] = [
    {
        id: 'log-1',
        timestamp: '2026-11-16 18:45:12',
        level: 'INFO',
        action: 'Планова синхронізація САЗ',
        user: 'СИСТЕМА (cron)',
        source: 'KMA CAZ Worker',
        details: 'Успішно оновлено 11 дисциплін та 11 розкладів навчальних блоків',
    },
    {
        id: 'log-2',
        timestamp: '2026-11-16 16:20:05',
        level: 'INFO',
        action: 'Вхід адміністратора',
        user: 'admin@ukma.edu.ua',
        source: 'Auth Service',
        details: 'Успішна автентифікація через корпоративний акаунт НаУКМА',
    },
    {
        id: 'log-3',
        timestamp: '2026-11-16 14:10:48',
        level: 'WARNING',
        action: 'Google Calendar Rate Limit',
        user: 'СИСТЕМА',
        source: 'Calendar Integration',
        details: 'Тимчасове уповільнення відповіді Google API (latency 620ms), повторний запит успішний',
    },
    {
        id: 'log-4',
        timestamp: '2026-11-15 11:32:00',
        level: 'INFO',
        action: 'Оновлення аудиторії',
        user: 'admin@ukma.edu.ua',
        source: 'Course Class Manager',
        details: 'Дисципліна «Сучасний C++»: аудиторію змінено з 1-204 на 1-8',
    },
    {
        id: 'log-5',
        timestamp: '2026-11-14 09:15:33',
        level: 'INFO',
        action: 'Ініціалізація системи',
        user: 'СИСТЕМА',
        source: 'Kernel',
        details: 'Запуск сервісів UNIScheduler v1.0. Всі модулі працюють у штатному режимі',
    },
]

const INITIAL_SYNC_STATUS: CazSyncStatus = {
    status: 'SUCCESS',
    lastSyncAt: '16 листопада 2026, 18:45',
    recordsCourses: 11,
    recordsClasses: 11,
    message: 'Синхронізацію успішно завершено. Усі навчальні плани актуалізовано.',
    mode: 'AUTOMATIC',
}

export const adminService = {
    getCourses(): Course[] {
        const stored = localStorage.getItem(STORAGE_KEY_COURSES)
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch {
                // fallback
            }
        }
        return [...mockCourses]
    },

    saveCourses(courses: Course[]) {
        localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses))
        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
    },

    addCourse(data: CourseFormData): Course {
        const current = this.getCourses()
        const newId = current.length > 0 ? Math.max(...current.map((c) => c.id)) + 1 : 1
        const newSpecialities = mockSpecialities.filter((s) =>
            data.specialityNames.includes(s.name),
        )

        const newCourse: Course = {
            id: newId,
            name: data.name.trim(),
            faculty: data.faculty.trim() || 'Факультет інформатики',
            department: data.department.trim() || 'Кафедра інформатики',
            semester: data.semester,
            year: data.year,
            specialities: newSpecialities.length > 0 ? newSpecialities : [mockSpecialities[0]],
        }

        const updated = [newCourse, ...current]
        this.saveCourses(updated)
        this.addAuditLog('Створення дисципліни', `Додано дисципліну «${newCourse.name}» (ID: ${newCourse.id})`, 'INFO')
        return newCourse
    },

    updateCourse(id: number, data: CourseFormData): Course {
        const current = this.getCourses()
        const index = current.findIndex((c) => c.id === id)
        if (index === -1) {
            throw new Error(`Course with ID ${id} not found`)
        }

        const newSpecialities = mockSpecialities.filter((s) =>
            data.specialityNames.includes(s.name),
        )

        const updatedCourse: Course = {
            ...current[index],
            name: data.name.trim(),
            faculty: data.faculty.trim(),
            department: data.department.trim(),
            semester: data.semester,
            year: data.year,
            specialities: newSpecialities.length > 0 ? newSpecialities : current[index].specialities,
        }

        current[index] = updatedCourse
        this.saveCourses([...current])
        this.addAuditLog('Редагування дисципліни', `Оновлено дані дисципліни «${updatedCourse.name}» (ID: ${id})`, 'INFO')
        return updatedCourse
    },

    deleteCourse(id: number): Course | null {
        const current = this.getCourses()
        const target = current.find((c) => c.id === id)
        if (!target) return null

        const updated = current.filter((c) => c.id !== id)
        this.saveCourses(updated)

        // Also clean up course classes associated with this course
        const currentClasses = this.getCourseClasses()
        const updatedClasses = currentClasses.filter((cc) => cc.course.id !== id)
        this.saveCourseClasses(updatedClasses)

        this.addAuditLog('Видалення дисципліни', `Видалено дисципліну «${target.name}» (ID: ${id}) та пов'язані заняття`, 'WARNING')
        return target
    },

    getCourseClasses(): CourseClass[] {
        const stored = localStorage.getItem(STORAGE_KEY_CLASSES)
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as CourseClass[]
                return parsed.map((cls, idx) => ({
                    ...cls,
                    weeks: cls.weeks && cls.weeks.length > 0
                        ? cls.weeks
                        : (mockCourseClasses[idx]?.weeks ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
                }))
            } catch {
                // fallback
            }
        }
        return [...mockCourseClasses]
    },

    saveCourseClasses(classes: CourseClass[]) {
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes))
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))
    },

    addCourseClass(data: CourseClassFormData): CourseClass {
        const current = this.getCourseClasses()
        const courses = this.getCourses()
        const course = courses.find((c) => c.id === data.courseId) ?? courses[0]

        const newId = current.length > 0 ? Math.max(...current.map((c) => c.id)) + 1 : 1

        // Use standard week reference date (Monday 2026-10-26)
        const dateBase = new Date(2026, 9, 26 + (data.dayOfWeek - 1))
        const dateStr = dateBase.toISOString().slice(0, 10)

        const newClass: CourseClass = {
            id: newId,
            course,
            teacher: data.teacher.trim() || 'Викладач кафедри',
            group: data.group.trim() || 'ІПЗ-4',
            location: data.location.trim() || 'Аудиторія не вказана',
            startsAt: `${dateStr}T${data.startTime}:00`,
            endsAt: `${dateStr}T${data.endTime}:00`,
            weeks: data.weeks && data.weeks.length > 0 ? [...data.weeks].sort((a, b) => a - b) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        }

        const updated = [newClass, ...current]
        this.saveCourseClasses(updated)
        this.addAuditLog(
            'Додавання заняття',
            `Створено заняття для курсу «${course.name}» (${newClass.group}, ${newClass.location})`,
            'INFO',
        )
        return newClass
    },

    updateCourseClass(id: number, data: CourseClassFormData): CourseClass {
        const current = this.getCourseClasses()
        const courses = this.getCourses()
        const index = current.findIndex((c) => c.id === id)
        if (index === -1) {
            throw new Error(`CourseClass with ID ${id} not found`)
        }

        const course = courses.find((c) => c.id === data.courseId) ?? current[index].course

        const dateBase = new Date(2026, 9, 26 + (data.dayOfWeek - 1))
        const dateStr = dateBase.toISOString().slice(0, 10)

        const updatedClass: CourseClass = {
            ...current[index],
            course,
            teacher: data.teacher.trim(),
            group: data.group.trim(),
            location: data.location.trim(),
            startsAt: `${dateStr}T${data.startTime}:00`,
            endsAt: `${dateStr}T${data.endTime}:00`,
            weeks: data.weeks && data.weeks.length > 0 ? [...data.weeks].sort((a, b) => a - b) : (current[index].weeks ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
        }

        current[index] = updatedClass
        this.saveCourseClasses([...current])
        this.addAuditLog(
            'Редагування заняття',
            `Змінено розклад блоку ID ${id} для курсу «${course.name}» (${updatedClass.group})`,
            'INFO',
        )
        return updatedClass
    },

    deleteCourseClass(id: number): CourseClass | null {
        const current = this.getCourseClasses()
        const target = current.find((c) => c.id === id)
        if (!target) return null

        const updated = current.filter((c) => c.id !== id)
        this.saveCourseClasses(updated)
        this.addAuditLog(
            'Видалення заняття',
            `Видалено заняття курсу «${target.course.name}» (${target.group}, ${target.location})`,
            'WARNING',
        )
        return target
    },

    getIntegrations(): SystemIntegration[] {
        return [...INITIAL_INTEGRATIONS]
    },

    getCazSyncStatus(): CazSyncStatus {
        const stored = localStorage.getItem(STORAGE_KEY_SYNC)
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch {
                // fallback
            }
        }
        return {...INITIAL_SYNC_STATUS}
    },

    saveCazSyncStatus(status: CazSyncStatus) {
        localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(status))
    },

    async triggerCazSync(): Promise<CazSyncStatus> {
        // Simulates network latency and data processing from САЗ
        await new Promise((resolve) => setTimeout(resolve, 1400))

        const courses = this.getCourses()
        const classes = this.getCourseClasses()

        const now = new Date()
        const formattedDate = `${now.getDate()} листопада 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const newStatus: CazSyncStatus = {
            status: 'SUCCESS',
            lastSyncAt: formattedDate,
            recordsCourses: courses.length,
            recordsClasses: classes.length,
            message: `Синхронізація успішна. Оновлено ${courses.length} дисциплін та ${classes.length} занять із KMA САЗ.`,
            mode: 'MANUAL',
        }

        this.saveCazSyncStatus(newStatus)
        this.addAuditLog(
            'Ручна синхронізація САЗ',
            `Адміністратор успішно синхронізував розклад із KMA САЗ (${courses.length} курсів, ${classes.length} занять)`,
            'INFO',
        )

        return newStatus
    },

    getAuditLogs(): AuditLogEntry[] {
        const stored = localStorage.getItem(STORAGE_KEY_LOGS)
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch {
                // fallback
            }
        }
        return [...INITIAL_LOGS]
    },

    saveAuditLogs(logs: AuditLogEntry[]) {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs))
    },

    addAuditLog(action: string, details: string, level: 'INFO' | 'WARNING' | 'ERROR' = 'INFO') {
        const current = this.getAuditLogs()
        const now = new Date()
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp,
            level,
            action,
            user: 'admin@ukma.edu.ua',
            source: 'Admin Console',
            details,
        }

        const updated = [newLog, ...current.slice(0, 49)] // Keep latest 50
        this.saveAuditLogs(updated)
    },

    clearAuditLogs() {
        this.saveAuditLogs([])
    },

    resetToDefaults() {
        localStorage.removeItem(STORAGE_KEY_COURSES)
        localStorage.removeItem(STORAGE_KEY_CLASSES)
        localStorage.removeItem(STORAGE_KEY_LOGS)
        localStorage.removeItem(STORAGE_KEY_SYNC)
        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))
    },
}
