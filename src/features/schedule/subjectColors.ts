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
    {id: 'lavender', name: 'Лаванда', bg: '#e0d4fc', border: '#29251f', text: '#29251f'},
    {id: 'coral', name: 'Кораловий', bg: '#fca5a5', border: '#29251f', text: '#29251f'},
]

export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
    'Проєктування програмних систем': '#f5c928',
    'Інженерія програмного забезпечення': '#f6c7d7',
    'Сучасний C++': '#c7d8ff',
    'Бази даних': '#d9c7f0',
    'Комп’ютерні мережі': '#d6e9b8',
    'Проєкт UNIScheduler': '#ffd8b8',
    'Англійська мова': '#e0d4fc',
    'Алгоритми та структури даних': '#c7d8ff',
    'Тестування програмного забезпечення': '#f6c7d7',
    'Архітектура програмного забезпечення': '#d6e9b8',
    'Самостійна робота': '#d9c7f0',
}

const STORAGE_KEY = 'unischeduler_subject_colors'
const CHANGE_EVENT = 'unischeduler:subject-colors-changed'

export function getStoredSubjectColors(): Record<string, string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored) as Record<string, string>
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

export function resetSubjectColors(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
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
