import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router'

import {authService} from '../../features/auth/authService'
import type {LoginRedirectState} from '../../features/auth/RequireAuth'

/** Only same-app paths are followed after sign-in, never `//host` or full URLs. */
function readRedirectTarget(state: unknown): string | null {
    const from = (state as Partial<LoginRedirectState> | null)?.from
    if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return null
    if (from === '/login') return null
    return from
}

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const redirectTarget = readRedirectTarget(location.state)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Parse error from URL redirect if backend rejected OAuth
        const params = new URLSearchParams(location.search)
        const errorParam = params.get('error')
        if (errorParam === 'auth_failed') {
            setError('Не вдалося виконати авторизацію через Microsoft. Спробуйте ще раз.')
        } else if (errorParam === 'invalid_domain') {
            setError('Авторизація дозволена лише для корпоративних поштових скриньок НаУКМА (*@ukma.edu.ua).')
        } else if (errorParam === 'missing_email') {
            setError('У вашому обліковому записі Microsoft не знайдено адресу електронної пошти.')
        } else if (errorParam) {
            setError(`Помилка авторизації: ${errorParam}`)
        }

        // If user is already authenticated, redirect them
        const currentUser = authService.getSessionUser()
        if (currentUser) {
            navigate(redirectTarget ?? (currentUser.role === 'ADMIN' ? '/admin' : '/schedule'), {replace: true})
        }
    }, [location.search, navigate, redirectTarget])

    const handleMicrosoftLogin = () => {
        setIsLoading(true)
        setError(null)
        authService.loginWithMicrosoft()
    }

    return (
        <main className="login-page">
            <div className="card login-card">
                <div className="login-brand">
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
                    <div className="login-actions">
                        <button
                            type="button"
                            className="button primary-button"
                            style={{width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: '1rem'}}
                            disabled={isLoading}
                            onClick={handleMicrosoftLogin}
                        >
                            <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <rect width="10.8" height="10.8" fill="#F25022"/>
                                <rect x="12.2" width="10.8" height="10.8" fill="#7FBA00"/>
                                <rect y="12.2" width="10.8" height="10.8" fill="#00A4EF"/>
                                <rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#FFB900"/>
                            </svg>
                            <span>{isLoading ? 'Перенаправлення до Microsoft...' : 'Увійти через корпоративний акаунт НаУКМА'}</span>
                        </button>
                    </div>

                    <p className="login-footnote text-muted" style={{marginTop: '1.25rem', textAlign: 'center'}}>
                        Авторизація через Microsoft Entra ID (OAuth 2.0 / OpenID Connect) для акаунтів @ukma.edu.ua
                    </p>
                </div>
            </div>
        </main>
    )
}
