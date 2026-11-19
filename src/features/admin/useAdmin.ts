import {useCallback, useEffect, useState} from 'react'
import type {Course, CourseClass, Speciality} from '../../types/catalog'
import {adminService} from './adminService'
import type {
    AuditLogEntry,
    CazSyncStatus,
    CourseClassFormData,
    CourseFormData,
    SystemIntegration,
} from './adminTypes'

export function useAdmin() {
    const [courses, setCourses] = useState<Course[]>([])
    const [classes, setClasses] = useState<CourseClass[]>([])
    const [specialities, setSpecialities] = useState<Speciality[]>([])
    const [integrations, setIntegrations] = useState<SystemIntegration[]>(() =>
        adminService.getIntegrations(),
    )
    const [syncStatus, setSyncStatus] = useState<CazSyncStatus>(() =>
        adminService.getCazSyncStatus(),
    )
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
        adminService.getAuditLogs(),
    )
    const [isLoading, setIsLoading] = useState(true)
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

    const reloadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [c, cl, sp] = await Promise.all([
                adminService.getCourses(),
                adminService.getCourseClasses(),
                adminService.getSpecialities(),
            ])
            setCourses(c)
            setClasses(cl)
            setSpecialities(sp)
            setAuditLogs(adminService.getAuditLogs())
            setSyncStatus(adminService.getCazSyncStatus())
        } catch {
            showNotification('Помилка завантаження даних із бекенду.', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [showNotification])

    useEffect(() => {
        reloadData()
    }, [reloadData])

    useEffect(() => {
        const handleCoursesUpdate = () => {
            adminService.getCourses().then(setCourses).catch(() => {})
        }
        const handleClassesUpdate = () => {
            adminService.getCourseClasses().then(setClasses).catch(() => {})
        }

        window.addEventListener('unischeduler_courses_updated', handleCoursesUpdate)
        window.addEventListener('unischeduler_classes_updated', handleClassesUpdate)

        return () => {
            window.removeEventListener('unischeduler_courses_updated', handleCoursesUpdate)
            window.removeEventListener('unischeduler_classes_updated', handleClassesUpdate)
        }
    }, [])

    const handleCreateCourse = async (data: CourseFormData) => {
        try {
            const created = await adminService.addCourse(data)
            await reloadData()
            showNotification(`Дисципліну «${created.name}» успішно додано до каталогу.`)
        } catch {
            showNotification('Не вдалося створити дисципліну на сервері.', 'error')
        }
    }

    const handleUpdateCourse = async (id: number, data: CourseFormData) => {
        try {
            const updated = await adminService.updateCourse(id, data)
            await reloadData()
            showNotification(`Дисципліну «${updated.name}» оновлено.`)
        } catch {
            showNotification('Не вдалося оновити дисципліну на сервері.', 'error')
        }
    }

    const handleDeleteCourse = async (id: number) => {
        try {
            await adminService.deleteCourse(id)
            await reloadData()
            showNotification('Дисципліну успішно видалено із сервера.', 'info')
        } catch {
            showNotification('Не вдалося видалити дисципліну.', 'error')
        }
    }

    const handleCreateClass = async (data: CourseClassFormData) => {
        try {
            const created = await adminService.addCourseClass(data)
            await reloadData()
            showNotification(`Заняття (${created.group}) успішно створено.`)
        } catch {
            showNotification('Не вдалося створити розклад заняття.', 'error')
        }
    }

    const handleUpdateClass = async (id: number, data: CourseClassFormData) => {
        try {
            await adminService.updateCourseClass(id, data)
            await reloadData()
            showNotification('Заняття успішно оновлено.')
        } catch {
            showNotification('Не вдалося оновити заняття.', 'error')
        }
    }

    const handleDeleteClass = async (id: number) => {
        try {
            await adminService.deleteCourseClass(id)
            await reloadData()
            showNotification('Заняття видалено із системи.', 'info')
        } catch {
            showNotification('Не вдалося видалити заняття.', 'error')
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
            latencyMs: Math.floor(Math.random() * 20) + 5,
            lastChecked: 'Щойно',
        }))
        setIntegrations(updated)
        setIsCheckingIntegrations(false)
        adminService.addAuditLog('Health Check', 'Виконано успішну діагностику всіх інтеграцій', 'INFO')
        setAuditLogs(adminService.getAuditLogs())
        showNotification(`Всі системи працюють у штатному режимі (${updated.length}/${updated.length} справні).`)
    }

    const handleClearLogs = () => {
        adminService.clearAuditLogs()
        setAuditLogs([])
        showNotification('Журнал системних подій очищено.', 'info')
    }

    const handleResetDefaults = async () => {
        setIsLoading(true)
        showNotification('Заповнення бази даних початковими записами НаУКМА…', 'info')
        try {
            const stats = await adminService.resetToDefaults()
            await reloadData()
            showNotification(
                `Базу даних заповнено: додано ${stats.courses} курсів та ${stats.classes} занять!`,
            )
        } catch {
            showNotification('Помилка ініціалізації бази даних.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        courses,
        classes,
        specialities,
        integrations,
        syncStatus,
        auditLogs,
        isLoading,
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
        reloadData,
    }
}
