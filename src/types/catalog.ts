import type {LocalDateTime} from './common'

export type Semester = 'AUTUMN' | 'SPRING' | 'SUMMER'

export type Speciality = {
    id: number
    name: string
}

export type SpecialityCreate = {
    name: string
}

export type SpecialityUpdate = Speciality

export type Course = {
    id: number
    name: string
    faculty: string
    department: string
    semester: Semester
    year: number
    specialities: Speciality[]
}

export type CourseCreate = Omit<Course, 'id' | 'specialities'> & {
    specialities: number[]
}

export type CourseUpdate = CourseCreate & {
    id: number
}

export type CourseClass = {
    id: number
    course: Course
    teacher: string
    group: string
    location: string
    startsAt: LocalDateTime
    endsAt: LocalDateTime
}

export type CourseClassCreate = Omit<CourseClass, 'id' | 'course'> & {
    course: number
}

export type CourseClassUpdate = CourseClassCreate & {
    id: number
}

export type ClassOverride = {
    id: number
    user: number
    courseClass: CourseClass
    teacherOverride: string | null
    groupOverride: string | null
    classNameOverride: string | null
    locationOverride: string | null
    startsAtOverride: LocalDateTime | null
    endsAtOverride: LocalDateTime | null
    description: string | null
    isHidden: boolean
}

type ClassOverrideFields = {
    teacherOverride?: string | null
    groupOverride?: string | null
    classNameOverride?: string | null
    locationOverride?: string | null
    startsAtOverride?: LocalDateTime | null
    endsAtOverride?: LocalDateTime | null
    description?: string | null
    isHidden: boolean
}

export type ClassOverrideCreate = ClassOverrideFields & {
    user: number
    courseClass: number
}

export type ClassOverrideUpdate = ClassOverrideFields & {
    id: number
}
