/**
 * `Course.year` is the year of study (1–4, "4 р.н." in the SAZ spreadsheet header), the same
 * value the schedule importer (`unischeduler-parser`, `studyYear`) writes. Older records may
 * still hold a calendar year (e.g. 2026); those are shown as is.
 */
export const STUDY_YEARS = [1, 2, 3, 4] as const

export const DEFAULT_STUDY_YEAR = 1

export function formatStudyYear(year: number): string {
    return year >= 1900 ? `${year} рік` : `${year}-й курс`
}
