import {useState} from 'react'
import type {Course, CourseClass, Speciality} from '../../types/catalog'
import {useAdmin} from '../../features/admin/useAdmin'
import {AdminCoursesTab} from './components/AdminCoursesTab'
import {AdminClassesTab} from './components/AdminClassesTab'
import {AdminSpecialitiesTab} from './components/AdminSpecialitiesTab'
import {AdminScheduleInspectorTab} from './components/AdminScheduleInspectorTab'
import {AdminAuditLogsTab} from './components/AdminAuditLogsTab'
import {CourseModal} from './components/CourseModal'
import {ClassModal} from './components/ClassModal'
import {ConfirmModal} from './components/ConfirmModal'
import {Icon} from '../../components/ui/Icon'

type AdminTab = 'COURSES' | 'CLASSES' | 'SPECIALITIES' | 'INSPECTOR' | 'LOGS'

type DeleteTarget =
    | {type: 'COURSE'; id: number; name: string}
    | {type: 'CLASS'; id: number; name: string; occurrenceIds?: number[]}
    | {type: 'SPECIALITY'; id: number; name: string}

export function AdminPage() {
    const {
        courses,
        classes,
        specialities,
        auditLogs,
        notification,
        createCourse,
        updateCourse,
        deleteCourse,
        createClass,
        updateClass,
        deleteClass,
        createSpeciality,
        deleteSpeciality,
        clearLogs,
    } = useAdmin()

    const [activeTab, setActiveTab] = useState<AdminTab>('COURSES')

    // Modal states
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)

    const [isClassModalOpen, setIsClassModalOpen] = useState(false)
    const [classToEdit, setClassToEdit] = useState<CourseClass | null>(null)

    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

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
            occurrenceIds: cls.occurrenceIds,
            name: `заняття курсу «${cls.course.name}» для групи ${cls.group}`,
        })
    }

    const handlePromptDeleteSpeciality = (spec: Speciality) => {
        setDeleteTarget({
            type: 'SPECIALITY',
            id: spec.id,
            name: `спеціальність «${spec.name}»`,
        })
    }

    // Confirm deletion handler
    const handleConfirmDelete = () => {
        if (!deleteTarget) return
        if (deleteTarget.type === 'COURSE') {
            deleteCourse(deleteTarget.id)
        } else if (deleteTarget.type === 'CLASS') {
            deleteClass(deleteTarget.id, deleteTarget.occurrenceIds)
        } else if (deleteTarget.type === 'SPECIALITY') {
            deleteSpeciality(deleteTarget.id)
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
                    className={`admin-tab-btn ${activeTab === 'SPECIALITIES' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('SPECIALITIES')}
                >
                    <Icon name="users" className="admin-tab-icon"/>
                    <span>Спеціальності</span>
                    <span className="admin-tab-counter">{specialities.length}</span>
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
            {activeTab === 'COURSES' && (
                <AdminCoursesTab
                    courses={courses}
                    specialities={specialities}
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

            {activeTab === 'SPECIALITIES' && (
                <AdminSpecialitiesTab
                    specialities={specialities}
                    courses={courses}
                    onAddSpeciality={createSpeciality}
                    onDeleteSpeciality={handlePromptDeleteSpeciality}
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
                        updateClass(classToEdit.id, data, classToEdit.occurrenceIds)
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
                message={
                    deleteTarget?.type === 'SPECIALITY'
                        ? `Ви впевнені, що бажаєте видалити спеціальність ${deleteTarget?.name}? Разом із нею буде видалено всі її дисципліни та їхні розклади занять.`
                        : `Ви впевнені, що бажаєте видалити ${deleteTarget?.name}? Цю дію буде зафіксовано в системному журналі аудиту.`
                }
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
