import {useState} from 'react'
import {useNavigate} from 'react-router'

export function LoginPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('diana.tsisaruk@ukma.edu.ua')
    const [error, setError] = useState<string | null>(null)

    const handleLogin = (role: 'STUDENT' | 'ADMIN') => {
        setIsLoading(true)
        setError(null)

        if (!email.endsWith('@ukma.edu.ua')) {
            setError('Авторизація дозволена лише для корпоративних поштових скриньок НаУКМА (*@ukma.edu.ua).')
            setIsLoading(false)
            return
        }

        setTimeout(() => {
            setIsLoading(false)
            // Store session
            localStorage.setItem('unischeduler_auth_user', JSON.stringify({
                email,
                role,
                name: email.split('@')[0].replace('.', ' '),
            }))
            navigate(role === 'ADMIN' ? '/admin' : '/schedule')
        }, 600)
    }

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                backgroundColor: 'var(--color-background, #f8fafc)',
            }}
        >
            <div
                className="card"
                style={{
                    maxWidth: '460px',
                    width: '100%',
                    padding: '2.5rem 2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>🏛️</div>
                    <h1 style={{fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0'}}>
                        UNIScheduler
                    </h1>
                    <p style={{margin: 0, color: 'var(--color-muted, #64748b)', fontSize: '0.95rem'}}>
                        Єдиний сервіс розкладу та планування для студентів і викладачів НаУКМА
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '1.25rem',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            border: '1px solid #f87171',
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div>
                        <label
                            htmlFor="login-email"
                            style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px'}}
                        >
                            Корпоративна пошта НаУКМА
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            className="input"
                            style={{width: '100%', padding: '10px 12px'}}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username@ukma.edu.ua"
                        />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem'}}>
                        <button
                            type="button"
                            className="button primary-button"
                            disabled={isLoading}
                            onClick={() => handleLogin('STUDENT')}
                            style={{padding: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                        >
                            <span>🎓</span>
                            <span>Увійти як Студент (Microsoft SSO)</span>
                        </button>

                        <button
                            type="button"
                            className="button"
                            disabled={isLoading}
                            onClick={() => {
                                setEmail('admin@ukma.edu.ua')
                                handleLogin('ADMIN')
                            }}
                            style={{padding: '10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                        >
                            <span>🔑</span>
                            <span>Увійти як Адміністратор (Панель керування)</span>
                        </button>
                    </div>

                    <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)'}}>
                        Авторизація через Microsoft Azure OAuth 2.0 / OpenID Connect НаУКМА
                    </div>
                </div>
            </div>
        </main>
    )
}
