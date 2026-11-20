import type {CalendarEvent} from '../../types/schedule'
import {formatWeeksList} from '../../utils/dateUtils'

/** Kind of a university class, shown in the class details (FE-18). */
export type ClassKind = 'LECTURE' | 'SEMINAR' | 'LAB'

export const CLASS_KIND_LABELS: Record<ClassKind, string> = {
    LECTURE: 'Лекція',
    SEMINAR: 'Семінар / практичне',
    LAB: 'Лабораторна',
}

/** Number of teaching weeks in a semester (weeks 1–15, as in `getAcademicWeekInfo`). */
const SEMESTER_WEEKS = 15

/**
 * Guesses the class kind from the group and class name.
 *
 * > TODO(question): Q-11 — the backend `CourseClass` DTO has no class-type field. Until it
 * > gets one, the kind is read from the SAZ-style group text: "лекція" / "потік" → lecture,
 * > "лаб" → lab, "семінар" / "практ" or a bare group number ("1", "2") → seminar.
 * > Anything else (e.g. "ІПЗ-4") is unknown and the UI says "Не вказано".
 */
export function getClassKind(event: Pick<CalendarEvent, 'group' | 'name'>): ClassKind | null {
    const group = (event.group ?? '').trim().toLowerCase()
    const text = `${group} ${event.name.toLowerCase()}`

    if (/лаб/.test(text)) return 'LAB'
    if (/лекц|потік/.test(text)) return 'LECTURE'
    if (/семінар|практ/.test(text) || /^\d+$/.test(group)) return 'SEMINAR'
    return null
}

/** How often a class takes place, derived from its semester weeks. */
export type WeekPattern = {
    /** Short label: "Чисельник", "Знаменник", "Щотижня" or "Окремі тижні". */
    label: string
    /** Explanation with the week numbers. */
    hint: string
}

/**
 * Numerator / denominator of a class. Odd semester weeks are the numerator (чисельник),
 * even weeks the denominator (знаменник) — the same rule as `getAcademicWeekInfo`.
 * Without `weeks` the class runs every week (the schedule service default).
 */
export function getWeekPattern(weeks?: number[]): WeekPattern {
    const unique = Array.from(new Set(weeks ?? [])).sort((a, b) => a - b)
    const list = formatWeeksList(unique)

    if (unique.length === 0 || unique.length >= SEMESTER_WEEKS) {
        return {label: 'Щотижня', hint: 'Чисельник і знаменник, тижні 1–15'}
    }
    if (unique.every((week) => week % 2 === 1)) {
        return {label: 'Чисельник', hint: `Непарні тижні: ${list}`}
    }
    if (unique.every((week) => week % 2 === 0)) {
        return {label: 'Знаменник', hint: `Парні тижні: ${list}`}
    }
    return {label: 'Окремі тижні', hint: `Тижні: ${list}`}
}
