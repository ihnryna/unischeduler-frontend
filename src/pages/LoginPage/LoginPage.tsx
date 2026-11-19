import {useState} from 'react'
import {useNavigate} from 'react-router'

import {authService} from '../../features/auth/authService'

export function LoginPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('diana.tsisaruk@ukma.edu.ua')
    const [error, setError] = useState<string | null>(null)

    // The admin button passes its own email: setEmail() would not be applied yet here.
    const handleLogin = (role: 'STUDENT' | 'ADMIN', loginEmail = email) => {
        setIsLoading(true)
        setError(null)

        if (!loginEmail.endsWith('@ukma.edu.ua')) {
            setError('Авторизація дозволена лише для корпоративних поштових скриньок НаУКМА (*@ukma.edu.ua).')
            setIsLoading(false)
            return
        }

        setTimeout(() => {
            setIsLoading(false)
            authService.saveSession({
                email: loginEmail,
                role,
                name: loginEmail.split('@')[0].replace('.', ' '),
            })
            navigate(role === 'ADMIN' ? '/admin' : '/schedule')
        }, 600)
    }

    return (
        <main className="login-page">
            <div className="card login-card">
                <div className="login-brand">
                    {/* Same logo as the app header, so the sign-in page looks like the app. */}
                    <span className="brand-logo" aria-hidden="true">UNI</span>
                    <h1>UNIScheduler</h1>
                    <p className="text-muted">
                        Єдиний сервіс розкладу та планування для студентів і викладачів НаУКМА
                    </p>
                </div>

                {error && (
                    <div className="notice notice-error" role="alert">
                        <span aria-hidden="true">⚠️ </span>
                        {error}
                    </div>
                )}

                <div className="login-form">
                    <div className="form-field">
                        <label htmlFor="login-email">Корпоративна пошта НаУКМА</label>
                        <input
                            id="login-email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username@ukma.edu.ua"
                        />
                    </div>

                    <div className="login-actions">
                        <button
                            type="button"
                            className="button primary-button"
                            disabled={isLoading}
                            onClick={() => handleLogin('STUDENT')}
                        >
                            <span aria-hidden="true">🎓</span>
                            <span>Увійти як Студент (Microsoft SSO)</span>
                        </button>

                        <button
                            type="button"
                            className="button"
                            disabled={isLoading}
                            onClick={() => {
                                setEmail('admin@ukma.edu.ua')
                                handleLogin('ADMIN', 'admin@ukma.edu.ua')
                            }}
                        >
                            <span aria-hidden="true">🔑</span>
                            <span>Увійти як Адміністратор</span>
                        </button>
                    </div>

                    <p className="login-footnote text-muted">
                        Авторизація через Microsoft Azure OAuth 2.0 / OpenID Connect НаУКМА
                    </p>
                </div>
            </div>
        </main>
    )
}
