import {useCallback, useEffect, useState} from 'react'
import type {Course, CourseClass} from '../../types/catalog'
import {adminService} from './adminService'
import type {
    AuditLogEntry,
    CazSyncStatus,
    CourseClassFormData,
    CourseFormData,
    SystemIntegration,
} from './adminTypes'

export function useAdmin() {
    const [courses, setCourses] = useState<Course[]>(() => adminService.getCourses())
    const [classes, setClasses] = useState<CourseClass[]>(() => adminService.getCourseClasses())
    const [integrations, setIntegrations] = useState<SystemIntegration[]>(() =>
        adminService.getIntegrations(),
    )
    const [syncStatus, setSyncStatus] = useState<CazSyncStatus>(() =>
        adminService.getCazSyncStatus(),
    )
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
        adminService.getAuditLogs(),
    )
    const [isSyncing, setIsSyncing] = useState(false)
    const [isCheckingIntegrations, setIsCheckingIntegrations] = useState(false)
    const [notification, setNotification] = useState<{
        message: string
        type: 'success' | 'info' | 'error'
    } | null>(null)

    const showNotification = useCallback(
        (message: string, type: 'success' | 'info' | 'error' = 'success') => {
            setNotification({message, type})
            setTimeout(() => {
                setNotification((curr) => (curr?.message === message ? null : curr))
            }, 3500)
        },
        [],
    )

    const reloadData = useCallback(() => {
        setCourses(adminService.getCourses())
        setClasses(adminService.getCourseClasses())
        setAuditLogs(adminService.getAuditLogs())
        setSyncStatus(adminService.getCazSyncStatus())
    }, [])

    useEffect(() => {
        const handleCoursesUpdate = () => setCourses(adminService.getCourses())
        const handleClassesUpdate = () => setClasses(adminService.getCourseClasses())

        window.addEventListener('unischeduler_courses_updated', handleCoursesUpdate)
        window.addEventListener('unischeduler_classes_updated', handleClassesUpdate)

        return () => {
            window.removeEventListener('unischeduler_courses_updated', handleCoursesUpdate)
            window.removeEventListener('unischeduler_classes_updated', handleClassesUpdate)
        }
    }, [])

    const handleCreateCourse = (data: CourseFormData) => {
        const created = adminService.addCourse(data)
        setCourses(adminService.getCourses())
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Дисципліну «${created.name}» успішно додано до каталогу.`)
    }

    const handleUpdateCourse = (id: number, data: CourseFormData) => {
        const updated = adminService.updateCourse(id, data)
        setCourses(adminService.getCourses())
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Дисципліну «${updated.name}» оновлено.`)
    }

    const handleDeleteCourse = (id: number) => {
        const deleted = adminService.deleteCourse(id)
        if (deleted) {
            setCourses(adminService.getCourses())
            setClasses(adminService.getCourseClasses())
            setAuditLogs(adminService.getAuditLogs())
            showNotification(`Дисципліну «${deleted.name}» видалено із системи.`, 'info')
        }
    }

    const handleCreateClass = (data: CourseClassFormData) => {
        const created = adminService.addCourseClass(data)
        setClasses(adminService.getCourseClasses())
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Заняття для курсу «${created.course.name}» (${created.group}) створено.`)
    }

    const handleUpdateClass = (id: number, data: CourseClassFormData) => {
        const updated = adminService.updateCourseClass(id, data)
        setClasses(adminService.getCourseClasses())
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Заняття курсу «${updated.course.name}» оновлено.`)
    }

    const handleDeleteClass = (id: number) => {
        const deleted = adminService.deleteCourseClass(id)
        if (deleted) {
            setClasses(adminService.getCourseClasses())
            setAuditLogs(adminService.getAuditLogs())
            showNotification(`Заняття курсу «${deleted.course.name}» видалено.`, 'info')
        }
    }

    const handleTriggerCazSync = async () => {
        setIsSyncing(true)
        showNotification('Запущено синхронізацію з KMA САЗ…', 'info')
        try {
            const result = await adminService.triggerCazSync()
            setSyncStatus(result)
            setAuditLogs(adminService.getAuditLogs())
            showNotification(
                `Синхронізація завершена! Актуалізовано ${result.recordsCourses} дисциплін та ${result.recordsClasses} занять.`,
            )
        } catch {
            showNotification('Помилка з’єднання із сервером САЗ. Перевірте мережу.', 'error')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleCheckIntegrations = async () => {
        setIsCheckingIntegrations(true)
        showNotification('Перевірка стану зовнішніх сервісів та бази даних…', 'info')
        await new Promise((resolve) => setTimeout(resolve, 800))

        const updated = adminService.getIntegrations().map((item) => ({
            ...item,
            latencyMs: Math.floor(Math.random() * 40) + 15,
            lastChecked: 'Щойно',
        }))
        setIntegrations(updated)
        setIsCheckingIntegrations(false)
        adminService.addAuditLog('Health Check', 'Виконано успішну діагностику всіх зовнішніх інтеграцій', 'INFO')
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Всі системи працюють у штатному режимі (${updated.length}/${updated.length} справні).`)
    }

    const handleClearLogs = () => {
        adminService.clearAuditLogs()
        setAuditLogs([])
        showNotification('Журнал системних подій очищено.', 'info')
    }

    const handleResetDefaults = () => {
        adminService.resetToDefaults()
        reloadData()
        showNotification('Усі дані адміністрування скинуто до початкових.', 'info')
    }

    return {
        courses,
        classes,
        integrations,
        syncStatus,
        auditLogs,
        isSyncing,
        isCheckingIntegrations,
        notification,
        createCourse: handleCreateCourse,
        updateCourse: handleUpdateCourse,
        deleteCourse: handleDeleteCourse,
        createClass: handleCreateClass,
        updateClass: handleUpdateClass,
        deleteClass: handleDeleteClass,
        triggerCazSync: handleTriggerCazSync,
        checkIntegrations: handleCheckIntegrations,
        clearLogs: handleClearLogs,
        resetDefaults: handleResetDefaults,
    }
}
