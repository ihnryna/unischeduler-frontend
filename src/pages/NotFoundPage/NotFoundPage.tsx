import {Link, useLocation} from 'react-router'

/** Shown inside the app layout for any path that has no route. */
export function NotFoundPage() {
    const {pathname} = useLocation()

    return (
        <section className="page-section">
            <div className="page-heading">
                <div>
                    <h1>Сторінку не знайдено</h1>
                </div>
            </div>

            <p className="page-intro text-muted">
                Сторінки <code>{pathname}</code> не існує або її було переміщено.
                Перевірте адресу чи поверніться до свого розкладу.
            </p>

            <div className="button-row">
                <Link to="/schedule" className="button primary-button">
                    До мого розкладу
                </Link>
            </div>
        </section>
    )
}
