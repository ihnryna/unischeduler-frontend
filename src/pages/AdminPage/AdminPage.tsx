import {useState} from 'react'
import type {Course, CourseClass} from '../../types/catalog'
import {useAdmin} from '../../features/admin/useAdmin'
import {AdminOverviewTab} from './components/AdminOverviewTab'
import {AdminCoursesTab} from './components/AdminCoursesTab'
import {AdminClassesTab} from './components/AdminClassesTab'
import {AdminScheduleInspectorTab} from './components/AdminScheduleInspectorTab'
import {AdminAuditLogsTab} from './components/AdminAuditLogsTab'
import {CourseModal} from './components/CourseModal'
import {ClassModal} from './components/ClassModal'
import {ConfirmModal} from './components/ConfirmModal'
import {Icon} from '../../components/ui/Icon'

type AdminTab = 'OVERVIEW' | 'COURSES' | 'CLASSES' | 'INSPECTOR' | 'LOGS'

export function AdminPage() {
    const {
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
        createCourse,
        updateCourse,
        deleteCourse,
        createClass,
        updateClass,
        deleteClass,
        triggerCazSync,
        checkIntegrations,
        clearLogs,
        resetDefaults,
    } = useAdmin()

    const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW')

    // Modal states
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)

    const [isClassModalOpen, setIsClassModalOpen] = useState(false)
    const [classToEdit, setClassToEdit] = useState<CourseClass | null>(null)

    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'COURSE' | 'CLASS'
        id: number
        name: string
    } | null>(null)

    const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false)

    // Handlers for Course actions
    const handleOpenAddCourse = () => {
        setCourseToEdit(null)
        setIsCourseModalOpen(true)
    }

    const handleOpenEditCourse = (course: Course) => {
        setCourseToEdit(course)
        setIsCourseModalOpen(true)
    }

    const handlePromptDeleteCourse = (course: Course) => {
        setDeleteTarget({
            type: 'COURSE',
            id: course.id,
            name: `дисципліну «${course.name}»`,
        })
    }

    // Handlers for Class actions
    const handleOpenAddClass = () => {
        setClassToEdit(null)
        setIsClassModalOpen(true)
    }

    const handleOpenEditClass = (cls: CourseClass) => {
        setClassToEdit(cls)
        setIsClassModalOpen(true)
    }

    const handlePromptDeleteClass = (cls: CourseClass) => {
        setDeleteTarget({
            type: 'CLASS',
            id: cls.id,
            name: `заняття курсу «${cls.course.name}» для групи ${cls.group}`,
        })
    }

    // Confirm deletion handler
    const handleConfirmDelete = () => {
        if (!deleteTarget) return
        if (deleteTarget.type === 'COURSE') {
            deleteCourse(deleteTarget.id)
        } else {
            deleteClass(deleteTarget.id)
        }
        setDeleteTarget(null)
    }

    return (
        <section className="admin-page-container">
            {/* Top Heading */}
            <div className="page-heading admin-page-heading">
                <div>
                    <h1>Адміністративна панель</h1>
                </div>
                <div>
                    <button
                        type="button"
                        className="button primary-button"
                        disabled={isLoading}
                        onClick={resetDefaults}
                        title="Наповнити базу PostgreSQL початковими дисциплінами та парами НаУКМА"
                    >
                        {isLoading ? '⏳ Завантаження…' : '📦 Ініціалізувати базу НаУКМА'}
                    </button>
                </div>
            </div>

            {/* Notification Alert banner */}
            {notification && (
                <div
                    className={`admin-notification-banner admin-notification-${notification.type}`}
                    role="status"
                >
                    <span className="admin-notification-icon">
                        {notification.type === 'error' ? '⚠️' : '✓'}
                    </span>
                    <span className="admin-notification-text">{notification.message}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <nav className="admin-tabs-nav" aria-label="Розділи адміністративної панелі">
                <button
                    type="button"
                    className={`admin-tab-btn ${activeTab === 'OVERVIEW' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('OVERVIEW')}
                >
                    <Icon name="chart" className="admin-tab-icon"/>
                    <span>Огляд та інтеграції</span>
                </button>

                <button
                    type="button"
                    className={`admin-tab-btn ${activeTab === 'COURSES' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('COURSES')}
                >
                    <Icon name="book" className="admin-tab-icon"/>
                    <span>Дисципліни</span>
                    <span className="admin-tab-counter">{courses.length}</span>
                </button>

                <button
                    type="button"
                    className={`admin-tab-btn ${activeTab === 'CLASSES' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('CLASSES')}
                >
                    <Icon name="calendar" className="admin-tab-icon"/>
                    <span>Розклад занять</span>
                    <span className="admin-tab-counter">{classes.length}</span>
                </button>

                <button
                    type="button"
                    className={`admin-tab-btn ${activeTab === 'INSPECTOR' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('INSPECTOR')}
                >
                    <Icon name="search" className="admin-tab-icon"/>
                    <span>Перегляд розкладів</span>
                </button>

                <button
                    type="button"
                    className={`admin-tab-btn ${activeTab === 'LOGS' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('LOGS')}
                >
                    <Icon name="clipboard" className="admin-tab-icon"/>
                    <span>Журнал аудиту</span>
                    <span className="admin-tab-counter">{auditLogs.length}</span>
                </button>
            </nav>

            {/* Tab Panes */}
            {activeTab === 'OVERVIEW' && (
                <AdminOverviewTab
                    coursesCount={courses.length}
                    classesCount={classes.length}
                    logsCount={auditLogs.length}
                    integrations={integrations}
                    syncStatus={syncStatus}
                    isSyncing={isSyncing}
                    isCheckingIntegrations={isCheckingIntegrations}
                    onTriggerSync={triggerCazSync}
                    onCheckIntegrations={checkIntegrations}
                />
            )}

            {activeTab === 'COURSES' && (
                <AdminCoursesTab
                    courses={courses}
                    onAddCourse={handleOpenAddCourse}
                    onEditCourse={handleOpenEditCourse}
                    onDeleteCourse={handlePromptDeleteCourse}
                />
            )}

            {activeTab === 'CLASSES' && (
                <AdminClassesTab
                    classes={classes}
                    onAddClass={handleOpenAddClass}
                    onEditClass={handleOpenEditClass}
                    onDeleteClass={handlePromptDeleteClass}
                />
            )}

            {activeTab === 'INSPECTOR' && (
                <AdminScheduleInspectorTab
                    classes={classes}
                    specialities={specialities}
                    onEditClass={handleOpenEditClass}
                />
            )}

            {activeTab === 'LOGS' && (
                <AdminAuditLogsTab
                    logs={auditLogs}
                    onClearLogs={() => setIsClearLogsModalOpen(true)}
                />
            )}

            {/* Modals */}
            <CourseModal
                isOpen={isCourseModalOpen}
                courseToEdit={courseToEdit}
                specialities={specialities}
                onSave={(data) => {
                    if (courseToEdit) {
                        updateCourse(courseToEdit.id, data)
                    } else {
                        createCourse(data)
                    }
                }}
                onClose={() => {
                    setIsCourseModalOpen(false)
                    setCourseToEdit(null)
                }}
            />

            <ClassModal
                isOpen={isClassModalOpen}
                classToEdit={classToEdit}
                courses={courses}
                onSave={(data) => {
                    if (classToEdit) {
                        updateClass(classToEdit.id, data)
                    } else {
                        createClass(data)
                    }
                }}
                onClose={() => {
                    setIsClassModalOpen(false)
                    setClassToEdit(null)
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteTarget !== null}
                title="Підтвердження видалення"
                message={`Ви впевнені, що бажаєте видалити ${deleteTarget?.name}? Цю дію буде зафіксовано в системному журналі аудиту.`}
                confirmLabel="Так, видалити"
                cancelLabel="Скасувати"
                isDestructive={true}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Clear Logs Modal */}
            <ConfirmModal
                isOpen={isClearLogsModalOpen}
                title="Очищення журналу подій"
                message="Ви збираєтеся видалити всі поточні записи з системного журналу аудиту. Цю дію неможливо скасувати."
                confirmLabel="Очистити журнал"
                cancelLabel="Скасувати"
                isDestructive={true}
                onConfirm={() => {
                    clearLogs()
                    setIsClearLogsModalOpen(false)
                }}
                onCancel={() => setIsClearLogsModalOpen(false)}
            />
        </section>
    )
}
