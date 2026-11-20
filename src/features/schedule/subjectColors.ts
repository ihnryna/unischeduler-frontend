import {useEffect, useState} from 'react'

export type PaletteColor = {
    id: string
    name: string
    bg: string
    border: string
    text: string
}

export const RETRO_COLOR_PALETTE: PaletteColor[] = [
    {id: 'yellow', name: 'Жовтий', bg: '#f5c928', border: '#29251f', text: '#29251f'},
    {id: 'pink', name: 'Рожевий', bg: '#f6c7d7', border: '#29251f', text: '#29251f'},
    {id: 'blue', name: 'Блакитний', bg: '#c7d8ff', border: '#29251f', text: '#29251f'},
    {id: 'green', name: 'Зелений', bg: '#d6e9b8', border: '#29251f', text: '#29251f'},
    {id: 'lilac', name: 'Бузковий', bg: '#d9c7f0', border: '#29251f', text: '#29251f'},
    {id: 'peach', name: 'Персиковий', bg: '#ffd8b8', border: '#29251f', text: '#29251f'},
    {id: 'mint', name: 'М’ятний', bg: '#b8e6dc', border: '#29251f', text: '#29251f'},
    {id: 'coral', name: 'Кораловий', bg: '#fca5a5', border: '#29251f', text: '#29251f'},
]

/** Card colour for a subject with no colour of its own (palette "lilac"). */
export const FALLBACK_CLASS_COLOR = '#d9c7f0'
/** Card colour for personal events with no colour of their own (palette "blue"). */
export const FALLBACK_PERSONAL_COLOR = '#c7d8ff'

/**
 * Personal events keep their colours under their own keys, so a personal event named like a
 * subject does not share its colour.
 */
export const personalColorKey = (eventName: string) => `personal:${eventName}`
const isPersonalKey = (key: string) => key.startsWith('personal:')

/** Background of an event card: its own colour, else the default for its kind. */
export function getEventCardColor(
    colors: Record<string, string>,
    event: {eventType: string; name: string},
): string {
    if (event.eventType === 'PERSONAL') {
        return colors[personalColorKey(event.name)] ?? FALLBACK_PERSONAL_COLOR
    }
    return colors[event.name] ?? FALLBACK_CLASS_COLOR
}

export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
    'Проєктування програмних систем': '#f5c928',
    'Інженерія програмного забезпечення': '#f6c7d7',
    'Сучасний C++': '#c7d8ff',
    'Бази даних': '#d9c7f0',
    'Комп’ютерні мережі': '#d6e9b8',
    'Проєкт UNIScheduler': '#ffd8b8',
    'Англійська мова': '#b8e6dc',
    'Алгоритми та структури даних': '#c7d8ff',
    'Тестування програмного забезпечення': '#f6c7d7',
    'Архітектура програмного забезпечення': '#d6e9b8',
    'Самостійна робота': '#d9c7f0',
}

const STORAGE_KEY = 'unischeduler_subject_colors'

/** Lavender was too close to lilac and was replaced by mint. */
const REPLACED_COLORS: Record<string, string> = {'#e0d4fc': '#b8e6dc'}
/** Key of the removed "all personal events" colour. */
const REMOVED_KEYS = ['personal:*']

/** Brings colours saved by older versions up to date: swaps replaced colours, drops removed keys. */
function migrateStoredColors(stored: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(stored)
            .filter(([key]) => !REMOVED_KEYS.includes(key))
            .map(([key, color]) => [key, REPLACED_COLORS[color.toLowerCase()] ?? color]),
    )
}
const CHANGE_EVENT = 'unischeduler:subject-colors-changed'

export function getStoredSubjectColors(): Record<string, string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = migrateStoredColors(JSON.parse(stored) as Record<string, string>)
            return {...DEFAULT_SUBJECT_COLORS, ...parsed}
        }
    } catch {
        // Fallback to defaults if localStorage is not accessible
    }
    return {...DEFAULT_SUBJECT_COLORS}
}

export function saveSubjectColor(subjectName: string, colorHex: string): void {
    try {
        const current = getStoredSubjectColors()
        current[subjectName] = colorHex
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch (err) {
        console.error('Failed to save subject color', err)
    }
}

/** Which colours a reset clears: subjects (classes) or personal events. */
export type ColorScope = 'subjects' | 'personal'

export function resetSubjectColors(scope: ColorScope = 'subjects'): void {
    try {
        const current = getStoredSubjectColors()
        const kept = Object.fromEntries(
            Object.entries(current).filter(([key]) =>
                scope === 'personal' ? !isPersonalKey(key) : isPersonalKey(key),
            ),
        )
        if (Object.keys(kept).length === 0) {
            localStorage.removeItem(STORAGE_KEY)
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(kept))
        }
        window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch (err) {
        console.error('Failed to reset subject colors', err)
    }
}

export function useSubjectColors() {
    const [colors, setColors] = useState<Record<string, string>>(getStoredSubjectColors)

    useEffect(() => {
        const handleUpdate = () => {
            setColors(getStoredSubjectColors())
        }

        window.addEventListener(CHANGE_EVENT, handleUpdate)
        window.addEventListener('storage', handleUpdate)

        return () => {
            window.removeEventListener(CHANGE_EVENT, handleUpdate)
            window.removeEventListener('storage', handleUpdate)
        }
    }, [])

    return {
        colors,
        setColor: saveSubjectColor,
        resetColors: resetSubjectColors,
    }
}
