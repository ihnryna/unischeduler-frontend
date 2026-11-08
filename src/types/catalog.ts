import type {LessonColor} from './schedule'

export type Course = {
    id: string
    code: string
    title: string
    teacher: string
    color: LessonColor
}

export type Group = {
    id: string
    name: string
    specialty: string
    year: number
}
