export type LessonColor = 'purple' | 'mint' | 'peach' | 'blue'

export type LessonType =
    | 'Лекція'
    | 'Практика'
    | 'Лабораторна'
    | 'Семінар'
    | 'Командна робота'
    | 'Навчальний блок'

export type Lesson = {
    id: number
    courseId: string
    groupIds: string[]
    date: string
    day: number
    start: number
    end: number
    title: string
    type: LessonType
    room: string
    teacher: string
    color: LessonColor
    source: 'university'
}

export type PersonalEvent = {
    id: string
    ownerId: string
    title: string
    description?: string
    date: string
    start: number
    end: number
    location?: string
    color: LessonColor
    source: 'personal'
    createdAt: string
    updatedAt: string
}

export type CreatePersonalEventInput = Pick<
    PersonalEvent,
    'title' | 'description' | 'date' | 'start' | 'end' | 'location' | 'color'
>

export type UpdatePersonalEventInput = Partial<CreatePersonalEventInput>
