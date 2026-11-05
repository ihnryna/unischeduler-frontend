export function formatTime(time: number) {
    const hours = Math.floor(time)
    const minutes = time % 1 === 0 ? '00' : '30'

    return `${String(hours).padStart(2, '0')}:${minutes}`
}