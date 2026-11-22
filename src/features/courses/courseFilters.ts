import type {Course, Semester} from '../../types/catalog'

/** Course catalogue filters shared by "Мої дисципліни" and the admin "Дисципліни" tab. */
export type CourseFilterValues = {
    specialityId: number | 'ALL'
    semester: Semester | 'ALL'
    year: number | 'ALL'
}

export const EMPTY_COURSE_FILTERS: CourseFilterValues = {
    specialityId: 'ALL',
    semester: 'ALL',
    year: 'ALL',
}

export const SEMESTER_OPTIONS: {value: Semester; label: string}[] = [
    {value: 'AUTUMN', label: 'Осінній семестр'},
    {value: 'SPRING', label: 'Весняний семестр'},
    {value: 'SUMMER', label: 'Літній семестр'},
]

export function isCourseFilterActive(filters: CourseFilterValues): boolean {
    return filters.specialityId !== 'ALL' || filters.semester !== 'ALL' || filters.year !== 'ALL'
}

export function matchesCourseFilters(course: Course, filters: CourseFilterValues): boolean {
    if (
        filters.specialityId !== 'ALL' &&
        !course.specialities?.some((spec) => spec.id === filters.specialityId)
    ) {
        return false
    }
    if (filters.semester !== 'ALL' && course.semester !== filters.semester) return false
    if (filters.year !== 'ALL' && course.year !== filters.year) return false
    return true
}

/** Years of study present in `courses`, ascending. */
export function getCourseYears(courses: Course[]): number[] {
    return Array.from(new Set(courses.map((course) => course.year).filter(Boolean))).sort(
        (a, b) => a - b,
    )
}
