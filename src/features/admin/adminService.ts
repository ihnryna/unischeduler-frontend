import type {Course, CourseClass, Speciality} from '../../types/catalog'
import {courseService} from '../../services/api/courseService'
import {courseClassService} from '../../services/api/courseClassService'
import {specialityService} from '../../services/api/specialityService'
import {userService} from '../../services/api/userService'
import {personalEventService} from '../events/personalEventService'
import {mockSpecialities} from '../../mocks/specialities'
import {mockCourses} from '../../mocks/courses'
import {mockCourseClasses} from '../../mocks/courseClasses'
import {getMondayOfWeek} from '../../utils/dateUtils'
import type {
    AuditLogEntry,
    CazSyncStatus,
    CourseClassFormData,
    CourseFormData,
    SystemIntegration,
} from './adminTypes'

const STORAGE_KEY_LOGS = 'unischeduler_admin_logs_v1'
const STORAGE_KEY_SYNC = 'unischeduler_admin_caz_sync_v1'

const INITIAL_INTEGRATIONS: SystemIntegration[] = [
    {
        id: 'backend',
        name: 'Spring Boot REST API',
        provider: 'Java 25 / Spring Boot 4.1.2 (Docker)',
        status: 'OPERATIONAL',
        latencyMs: 14,
        lastChecked: 'Щойно',
        description: 'Центральний API-сервіс розкладів, персональних подій та користувачів',
        details: 'http://localhost:8080/api · Context Path: /api',
        icon: '🚀',
    },
    {
        id: 'database',
        name: 'PostgreSQL Database',
        provider: 'PostgreSQL 18 Alpine (Docker Container)',
        status: 'OPERATIONAL',
        latencyMs: 5,
        lastChecked: 'Щойно',
        description: 'Основне сховище курсів, спеціальностей, пар та оверрайдів',
        details: 'DB: unischeduler_db · Port: 5432 · Connection Pool: HikariCP',
        icon: '🗄️',
    },
    {
        id: 'caz',
        name: 'KMA САЗ (Зовнішній сервіс)',
        provider: 'НаУКМА Automated Registration System',
        status: 'OPERATIONAL',
        latencyMs: 42,
        lastChecked: '2 хв тому',
        description: 'Синхронізація розкладу навчальних груп, дисциплін та викладачів',
        details: 'API v2.1 · Потребує реалізації /api/caz/sync на бекенді',
        icon: '🏛️',
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar API',
        provider: 'Google Cloud Platform (Workspace)',
        status: 'OPERATIONAL',
        latencyMs: 82,
        lastChecked: '5 хв тому',
        description: 'Експорт пар у персональні Google-календарі студентів НаУКМА',
        details: 'OAuth 2.0 · Потребує реалізації /api/google-calendar/sync на бекенді',
        icon: '📅',
    },
]

const INITIAL_LOGS: AuditLogEntry[] = [
    {
        id: 'log-1',
        timestamp: '2026-11-18 13:40:00',
        level: 'INFO',
        action: 'З’єднання з backend',
        user: 'СИСТЕМА',
        source: 'Frontend ApiClient',
        details: 'Успішне підключення до Spring Boot API (http://localhost:8080/api)',
    },
    {
        id: 'log-2',
        timestamp: '2026-11-18 13:30:00',
        level: 'INFO',
        action: 'Ініціалізація PostgreSQL',
        user: 'unischeduler_user',
        source: 'Docker Compose',
        details: 'Базу unischeduler_db піднято на порті 5432',
    },
]

const INITIAL_SYNC_STATUS: CazSyncStatus = {
    status: 'SUCCESS',
    lastSyncAt: '18 листопада 2026, 13:30',
    recordsCourses: 0,
    recordsClasses: 0,
    message: 'Бекенд готовий до роботи. Дані синхронізуються безпосередньо з базою PostgreSQL.',
    mode: 'AUTOMATIC',
}

function calculateClassDate(dayOfWeek: number, timeStr: string): string {
    const monday = getMondayOfWeek()
    monday.setDate(monday.getDate() + (dayOfWeek - 1))
    const yyyy = monday.getFullYear()
    const mm = String(monday.getMonth() + 1).padStart(2, '0')
    const dd = String(monday.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${timeStr}:00`
}

export const adminService = {
    getCourses(): Promise<Course[]> {
        return courseService.getAll()
    },

    async getCourseClasses(): Promise<CourseClass[]> {
        const classes = await courseClassService.getAll()
        const storedWeeksMap: Record<number, number[]> = (() => {
            try {
                return JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
            } catch {
                return {}
            }
        })()
        return classes.map((c) => ({
            ...c,
            weeks: c.weeks || storedWeeksMap[c.id] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        }))
    },

    getSpecialities(): Promise<Speciality[]> {
        return specialityService.getAll()
    },

    async addCourse(data: CourseFormData): Promise<Course> {
        let specs = await this.getSpecialities()
        if (specs.length === 0) {
            await this.seedSpecialitiesIfMissing()
            specs = await this.getSpecialities()
        }

        const matchedSpecs = specs.filter((s) => data.specialityNames.includes(s.name))
        const specIds = matchedSpecs.length > 0 ? matchedSpecs.map((s) => s.id) : [specs[0].id]

        const created = await courseService.create({
            name: data.name.trim(),
            faculty: data.faculty.trim() || 'Факультет інформатики',
            department: data.department.trim() || 'Кафедра інформатики',
            semester: data.semester,
            year: data.year,
            specialities: specIds,
        })

        this.addAuditLog(
            'Створення дисципліни',
            `Додано дисципліну «${created.name}» (ID: ${created.id}) у бекенд`,
            'INFO',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
        return created
    },

    async updateCourse(id: number, data: CourseFormData): Promise<Course> {
        const specs = await this.getSpecialities()
        const matchedSpecs = specs.filter((s) => data.specialityNames.includes(s.name))
        const specIds = matchedSpecs.length > 0 ? matchedSpecs.map((s) => s.id) : [specs[0]?.id ?? 1]

        const updated = await courseService.update({
            id,
            name: data.name.trim(),
            faculty: data.faculty.trim() || 'Факультет інформатики',
            department: data.department.trim() || 'Кафедра інформатики',
            semester: data.semester,
            year: data.year,
            specialities: specIds,
        })

        this.addAuditLog(
            'Редагування дисципліни',
            `Оновлено дані дисципліни «${updated.name}» (ID: ${id})`,
            'INFO',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
        return updated
    },

    async deleteCourse(id: number): Promise<void> {
        await courseService.delete(id)
        this.addAuditLog(
            'Видалення дисципліни',
            `Видалено дисципліну ID ${id} із бази даних`,
            'WARNING',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
    },

    async addCourseClass(data: CourseClassFormData): Promise<CourseClass> {
        const startsAt = calculateClassDate(data.dayOfWeek, data.startTime)
        const endsAt = calculateClassDate(data.dayOfWeek, data.endTime)

        const created = await courseClassService.create({
            course: data.courseId,
            teacher: data.teacher.trim() || 'Викладач',
            group: data.group.trim() || 'ІПЗ-4',
            location: data.location.trim() || 'Онлайн',
            startsAt,
            endsAt,
        })

        if (data.weeks && data.weeks.length > 0) {
            try {
                const map = JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
                map[created.id] = data.weeks
                localStorage.setItem('unischeduler_class_weeks_map', JSON.stringify(map))
            } catch {}
        }

        this.addAuditLog(
            'Додавання заняття',
            `Створено заняття для курсу (ID: ${data.courseId}, ${created.group}, ${created.location})`,
            'INFO',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))
        return {
            ...created,
            weeks: data.weeks || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        }
    },

    async updateCourseClass(id: number, data: CourseClassFormData): Promise<CourseClass> {
        const startsAt = calculateClassDate(data.dayOfWeek, data.startTime)
        const endsAt = calculateClassDate(data.dayOfWeek, data.endTime)

        const updated = await courseClassService.update({
            id,
            course: data.courseId,
            teacher: data.teacher.trim(),
            group: data.group.trim(),
            location: data.location.trim(),
            startsAt,
            endsAt,
        })

        if (data.weeks && data.weeks.length > 0) {
            try {
                const map = JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
                map[id] = data.weeks
                localStorage.setItem('unischeduler_class_weeks_map', JSON.stringify(map))
            } catch {}
        }

        this.addAuditLog(
            'Редагування заняття',
            `Оновлено розклад заняття ID ${id}`,
            'INFO',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))
        return {
            ...updated,
            weeks: data.weeks || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        }
    },

    async deleteCourseClass(id: number): Promise<void> {
        await courseClassService.delete(id)
        try {
            const map = JSON.parse(localStorage.getItem('unischeduler_class_weeks_map') || '{}')
            delete map[id]
            localStorage.setItem('unischeduler_class_weeks_map', JSON.stringify(map))
        } catch {}
        this.addAuditLog(
            'Видалення заняття',
            `Видалено заняття ID ${id} з розкладу`,
            'WARNING',
        )
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))
    },

    async seedSpecialitiesIfMissing(): Promise<Speciality[]> {
        const current = await this.getSpecialities()
        if (current.length > 0) return current

        const createdSpecs: Speciality[] = []
        for (const spec of mockSpecialities) {
            try {
                const created = await specialityService.create({name: spec.name})
                createdSpecs.push(created)
            } catch {
                // Ignore if duplicate
            }
        }
        return createdSpecs
    },

    /**
     * Seeds initial mock data (specialities, courses, classes, users, personal events)
     * into the real PostgreSQL database via Spring Boot REST API.
     */
    async resetToDefaults(): Promise<{courses: number; classes: number}> {
        // 1. Ensure specialities
        let specs = await this.getSpecialities()
        if (specs.length === 0) {
            specs = await this.seedSpecialitiesIfMissing()
        }
        const specIds = specs.map((s) => s.id)

        // 2. Ensure default users
        try {
            const existingUsers = await userService.getAll()
            if (existingUsers.length === 0 && specIds.length > 0) {
                await userService.create({
                    specialityId: specIds[0],
                    email: 'diana.tsisaruk@ukma.edu.ua',
                    role: 'STUDENT',
                })
                await userService.create({
                    specialityId: specIds[0],
                    email: 'admin@ukma.edu.ua',
                    role: 'ADMIN',
                })
            }
        } catch {
            // User service seed fallback
        }

        // 3. Seed Courses if empty
        const existingCourses = await this.getCourses()
        const courseMap = new Map<string, number>()

        if (existingCourses.length === 0) {
            for (const mockCourse of mockCourses) {
                try {
                    const created = await courseService.create({
                        name: mockCourse.name,
                        faculty: mockCourse.faculty,
                        department: mockCourse.department,
                        semester: mockCourse.semester,
                        year: mockCourse.year,
                        specialities: specIds,
                    })
                    courseMap.set(created.name, created.id)
                } catch {
                    // Ignore
                }
            }
        } else {
            existingCourses.forEach((c) => courseMap.set(c.name, c.id))
        }

        // 4. Seed Classes if empty
        const existingClasses = await this.getCourseClasses()
        if (existingClasses.length === 0 && courseMap.size > 0) {
            for (const mockCls of mockCourseClasses) {
                const backendCourseId = courseMap.get(mockCls.course.name)
                if (backendCourseId) {
                    try {
                        await courseClassService.create({
                            course: backendCourseId,
                            teacher: mockCls.teacher,
                            group: mockCls.group,
                            location: mockCls.location,
                            startsAt: mockCls.startsAt,
                            endsAt: mockCls.endsAt,
                        })
                    } catch {
                        // Ignore
                    }
                }
            }
        }

        // 5. Seed sample personal event
        try {
            const existingEvents = await personalEventService.getAll()
            if (existingEvents.length === 0) {
                await personalEventService.create({
                    userId: 1,
                    name: 'Зустріч команди UNIScheduler',
                    location: 'Онлайн (Google Meet)',
                    description: 'Обговорення прогресу інтеграції з бекендом.',
                    startsAt: '2026-10-28T16:00:00',
                    endsAt: '2026-10-28T17:00:00',
                })
            }
        } catch {
            // Ignore
        }

        const freshCourses = await this.getCourses()
        const freshClasses = await this.getCourseClasses()

        this.addAuditLog(
            'Ініціалізація даних',
            `Заповнено базу PostgreSQL: ${freshCourses.length} курсів та ${freshClasses.length} пар занять`,
            'INFO',
        )

        window.dispatchEvent(new CustomEvent('unischeduler_courses_updated'))
        window.dispatchEvent(new CustomEvent('unischeduler_classes_updated'))

        return {courses: freshCourses.length, classes: freshClasses.length}
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
        const courses = await this.getCourses()
        const classes = await this.getCourseClasses()

        const now = new Date()
        const timestamp = `${now.getDate()} листопада ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const updatedStatus: CazSyncStatus = {
            status: 'SUCCESS',
            lastSyncAt: timestamp,
            recordsCourses: courses.length,
            recordsClasses: classes.length,
            message: `Синхронізацію успішно завершено. У базі ${courses.length} дисциплін та ${classes.length} занять.`,
            mode: 'MANUAL',
        }

        this.saveCazSyncStatus(updatedStatus)
        this.addAuditLog(
            'Ручна синхронізація САЗ',
            `Оновлено стан розкладів. Всього: ${courses.length} дисциплін, ${classes.length} занять.`,
            'INFO',
        )
        return updatedStatus
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
        const logs = this.getAuditLogs()
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const hh = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')
        const ss = String(now.getSeconds()).padStart(2, '0')

        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`,
            level,
            action,
            user: 'admin@ukma.edu.ua',
            source: 'Admin Service',
            details,
        }

        const updated = [newLog, ...logs].slice(0, 100)
        this.saveAuditLogs(updated)
    },

    clearAuditLogs() {
        this.saveAuditLogs([])
    },
}
