export function GoogleCalendarPage() {
    return (
        <section>
            <h1>Google Calendar</h1>

            <p>
                Синхронізуйте свій навчальний розклад із Google Calendar.
            </p>

            <div>
                <p>Статус підключення: Не підключено</p>

                <button disabled>
                    Підключити Google Calendar
                </button>

                <button disabled>
                    Синхронізувати розклад
                </button>
            </div>
        </section>
    )
}