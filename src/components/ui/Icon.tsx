/**
 * One set of line icons for navigation (sidebar, admin tabs), so every icon has the same
 * size, stroke and colour (`currentColor`) on every OS — unlike emoji and text symbols.
 * Decorative: always `aria-hidden`; the link or button text is the label.
 */
import type {ReactNode} from 'react'

export type IconName =
    | 'calendar'
    | 'table'
    | 'sync'
    | 'sliders'
    | 'shield'
    | 'chart'
    | 'book'
    | 'search'
    | 'clipboard'
    | 'users'

const PATHS: Record<IconName, ReactNode> = {
    users: (
        <>
            <path d="M14 16v-1.5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3V16"/>
            <circle cx="9" cy="6" r="3"/>
            <path d="M16 13a2.5 2.5 0 0 0 1.5-2.2V9.5"/>
            <path d="M13.5 3.5a2.5 2.5 0 0 1 0 5"/>
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="4.5" width="14" height="12.5" rx="2"/>
            <path d="M3 8.5h14M7 2.5v4M13 2.5v4"/>
        </>
    ),
    table: (
        <>
            <rect x="3" y="3.5" width="14" height="13" rx="2"/>
            <path d="M3 8h14M3 12.5h14M8 8v8.5"/>
        </>
    ),
    sync: (
        <>
            <path d="M16 10a6 6 0 0 1-10.4 4.1M4 10a6 6 0 0 1 10.4-4.1"/>
            <path d="M14.5 2.5v3.6h-3.6M5.5 17.5v-3.6h3.6"/>
        </>
    ),
    sliders: (
        <>
            <path d="M3.5 5h13M3.5 10h13M3.5 15h13"/>
            <circle cx="8" cy="5" r="1.7" fill="currentColor"/>
            <circle cx="13" cy="10" r="1.7" fill="currentColor"/>
            <circle cx="6.5" cy="15" r="1.7" fill="currentColor"/>
        </>
    ),
    shield: <path d="M10 2.5l6 2.4v4.6c0 3.9-2.6 6.6-6 8-3.4-1.4-6-4.1-6-8V4.9z"/>,
    chart: <path d="M3 17h14M6 14V9.5M10 14V5M14 14v-3.5"/>,
    book: (
        <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5zm0 12A1.5 1.5 0 0 0 5.5 18H16"/>
    ),
    search: (
        <>
            <circle cx="9" cy="9" r="5.5"/>
            <path d="M13.2 13.2L17 17"/>
        </>
    ),
    clipboard: (
        <>
            <rect x="4.5" y="3.5" width="11" height="14" rx="2"/>
            <path d="M7.5 2.5h5v2.5h-5zM7.5 9h5M7.5 12.5h5"/>
        </>
    ),
}

export function Icon({name, className = 'icon'}: Readonly<{name: IconName; className?: string}>) {
    return (
        <svg
            className={className}
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {PATHS[name]}
        </svg>
    )
}
