export const MONTH_NAMES_GENITIVE = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
]

export const MONTH_NAMES_NOMINATIVE = [
    'січень', 'лютий', 'березень', 'квітень', 'травень', 'червень',
    'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень',
]

export const MONTH_SHORT_UA = [
    'СІЧ', 'ЛЮТ', 'БЕР', 'КВІ', 'ТРА', 'ЧЕР',
    'ЛИП', 'СЕР', 'ВЕР', 'ЖОВ', 'ЛИС', 'ГРУ',
]

export const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

export const DAY_NAMES_FULL = [
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четвер',
    'Пʼятниця',
    'Субота',
    'Неділя',
]

export function getMondayOfWeek(d: Date = new Date()): Date {
    const date = new Date(d)
    const day = date.getDay()
    // JS: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const diff = (day === 0 ? -6 : 1) - day
    date.setDate(date.getDate() + diff)
    date.setHours(0, 0, 0, 0)
    return date
}

export function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    )
}

export type WeekDayInfo = {
    dayIndex: number
    name: string
    fullName: string
    date: number
    month: number
    year: number
    isoDate: string
    fullDate: Date
    isToday: boolean
}

export function getWeekDays(weekOffset = 0, baseDate = new Date()): WeekDayInfo[] {
    const monday = getMondayOfWeek(baseDate)
    monday.setDate(monday.getDate() + weekOffset * 7)

    const now = new Date()

    return DAY_NAMES_SHORT.map((name, index) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + index)

        const year = d.getFullYear()
        const month = d.getMonth()
        const dayOfMonth = d.getDate()
        const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`

        return {
            dayIndex: index,
            name,
            fullName: DAY_NAMES_FULL[index],
            date: dayOfMonth,
            month,
            year,
            isoDate,
            fullDate: d,
            isToday: isSameDay(d, now),
        }
    })
}

export function formatWeekRange(monday: Date, sunday: Date): string {
    const startDay = monday.getDate()
    const startMonth = monday.getMonth()
    const startYear = monday.getFullYear()

    const endDay = sunday.getDate()
    const endMonth = sunday.getMonth()
    const endYear = sunday.getFullYear()

    if (startYear !== endYear) {
        return `${startDay} ${MONTH_NAMES_GENITIVE[startMonth]} ${startYear} — ${endDay} ${MONTH_NAMES_GENITIVE[endMonth]} ${endYear}`
    }

    if (startMonth !== endMonth) {
        return `${startDay} ${MONTH_NAMES_GENITIVE[startMonth]} — ${endDay} ${MONTH_NAMES_GENITIVE[endMonth]}`
    }

    return `${startDay} — ${endDay} ${MONTH_NAMES_GENITIVE[endMonth]}`
}

export function getAcademicWeekInfo(monday: Date) {
    const year = monday.getFullYear()
    // Academic year starts Sep 1. If date is before July, semester started Sep previous year
    const semStartYear = monday.getMonth() < 6 ? year - 1 : year
    const semStart = new Date(semStartYear, 8, 1)
    const semStartMonday = getMondayOfWeek(semStart)

    const diffMs = monday.getTime() - semStartMonday.getTime()
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
    const semesterWeek = Math.max(1, diffWeeks + 1)
    const isNumerator = semesterWeek % 2 !== 0

    return {
        semesterWeek,
        isNumerator,
        parityName: isNumerator ? 'Чисельник' : 'Знаменник',
        fullLabel: `${semesterWeek}-й тиждень · ${isNumerator ? 'Чисельник' : 'Знаменник'}`,
    }
}

export function formatWeeksList(weeks?: number[]): string {
    if (!weeks || weeks.length === 0) return 'Усі тижні'
    const sorted = Array.from(new Set(weeks)).sort((a, b) => a - b)
    if (sorted.length === 15 && sorted[0] === 1 && sorted[14] === 15) {
        return '1–15'
    }
    const isConsecutive =
        sorted.length >= 4 &&
        sorted.every((w, i) => i === 0 || w === sorted[i - 1] + 1)
    if (isConsecutive) {
        return `${sorted[0]}–${sorted[sorted.length - 1]}`
    }
    return sorted.join(', ')
}

export function parseWeeksInput(input: string): number[] {
    const tokens = input.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
    const weeksSet = new Set<number>()

    for (const token of tokens) {
        if (token.includes('-') || token.includes('–')) {
            const [startStr, endStr] = token.split(/[-–]/)
            const start = parseInt(startStr, 10)
            const end = parseInt(endStr, 10)
            if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                for (let w = start; w <= Math.min(end, 30); w++) {
                    weeksSet.add(w)
                }
            }
        } else {
            const num = parseInt(token, 10)
            if (!isNaN(num) && num > 0 && num <= 30) {
                weeksSet.add(num)
            }
        }
    }

    return Array.from(weeksSet).sort((a, b) => a - b)
}
