import type {CazSyncStatus, SystemIntegration} from '../../../features/admin/adminTypes'

type AdminOverviewTabProps = {
    coursesCount: number
    classesCount: number
    logsCount: number
    integrations: SystemIntegration[]
    syncStatus: CazSyncStatus
    isSyncing: boolean
    isCheckingIntegrations: boolean
    onTriggerSync: () => void
    onCheckIntegrations: () => void
}

export function AdminOverviewTab({
    coursesCount,
    classesCount,
    logsCount,
    integrations,
    syncStatus,
    isSyncing,
    isCheckingIntegrations,
    onTriggerSync,
    onCheckIntegrations,
}: Readonly<AdminOverviewTabProps>) {
    return (
        <div className="admin-tab-content">
            {/* KPI metric summary */}
            <div className="admin-metrics-grid">
                <div className="admin-metric-card">
                    <div className="admin-metric-icon">📚</div>
                    <div className="admin-metric-info">
                        <strong className="admin-metric-value">{coursesCount}</strong>
                        <span className="admin-metric-label">Активних дисциплін</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-icon">🗓️</div>
                    <div className="admin-metric-info">
                        <strong className="admin-metric-value">{classesCount}</strong>
                        <span className="admin-metric-label">Розкладів занять</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-icon">⚡</div>
                    <div className="admin-metric-info">
                        <strong className="admin-metric-value">
                            {integrations.filter((i) => i.status === 'OPERATIONAL').length}/{integrations.length}
                        </strong>
                        <span className="admin-metric-label">Інтеграцій активні</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-icon">📋</div>
                    <div className="admin-metric-info">
                        <strong className="admin-metric-value">{logsCount}</strong>
                        <span className="admin-metric-label">Записів в аудиті</span>
                    </div>
                </div>
            </div>

            {/* KMA САЗ Sync Banner */}
            <div className="admin-card admin-sync-banner">
                <div className="admin-sync-header">
                    <div className="admin-sync-title-group">
                        <span className="admin-sync-icon" aria-hidden="true">🏛️</span>
                        <div>
                            <div className="admin-sync-title-row">
                                <h3 className="admin-card-title">Синхронізація з KMA САЗ</h3>
                                <span className="admin-badge admin-badge-success">
                                    {syncStatus.status === 'SUCCESS' ? '✓ Актуально' : syncStatus.status}
                                </span>
                            </div>
                            <p className="admin-card-subtitle">
                                Автоматизоване отримання навчальних планів, дисциплін, викладачів та груп
                            </p>
                        </div>
                    </div>

                    <div className="admin-sync-actions">
                        <button
                            type="button"
                            className="button primary-button admin-sync-btn"
                            disabled={isSyncing}
                            onClick={onTriggerSync}
                        >
                            {isSyncing ? '⏳ Синхронізація…' : '🔄 Синхронізувати із САЗ зараз'}
                        </button>
                    </div>
                </div>

                <div className="admin-sync-meta-grid">
                    <div className="admin-sync-meta-item">
                        <span className="admin-sync-meta-label">Останнє оновлення:</span>
                        <strong className="admin-sync-meta-val">{syncStatus.lastSyncAt}</strong>
                    </div>

                    <div className="admin-sync-meta-item">
                        <span className="admin-sync-meta-label">Дисциплін у базі:</span>
                        <strong className="admin-sync-meta-val">{syncStatus.recordsCourses} курсів</strong>
                    </div>

                    <div className="admin-sync-meta-item">
                        <span className="admin-sync-meta-label">Розкладів пар:</span>
                        <strong className="admin-sync-meta-val">{syncStatus.recordsClasses} занять</strong>
                    </div>

                    <div className="admin-sync-meta-item">
                        <span className="admin-sync-meta-label">Режим оновлення:</span>
                        <strong className="admin-sync-meta-val">
                            {syncStatus.mode === 'AUTOMATIC' ? 'Автоматичний (Cron 02:00)' : 'Ручний запит'}
                        </strong>
                    </div>
                </div>

                <div className="admin-sync-footer-note">
                    ℹ {syncStatus.message}
                </div>
            </div>

            {/* External Integrations */}
            <div className="admin-card">
                <div className="admin-card-header-row">
                    <div>
                        <h3 className="admin-card-title">Зовнішні інтеграції та інфраструктура</h3>
                        <p className="admin-card-subtitle">
                            Контроль доступності API, хмарних провайдерів та бази даних
                        </p>
                    </div>

                    <div className="admin-card-actions">
                        <button
                            type="button"
                            className="button admin-btn-outline"
                            disabled={isCheckingIntegrations}
                            onClick={onCheckIntegrations}
                        >
                            {isCheckingIntegrations ? 'Перевірка…' : '⚡ Перевірити всі з’єднання'}
                        </button>
                    </div>
                </div>

                <div className="admin-integrations-grid">
                    {integrations.map((item) => (
                        <div className="admin-integration-item" key={item.id}>
                            <div className="admin-integration-header">
                                <div className="admin-integration-name-row">
                                    <span className="admin-integration-icon">{item.icon}</span>
                                    <div>
                                        <strong className="admin-integration-name">{item.name}</strong>
                                        <span className="admin-integration-provider">{item.provider}</span>
                                    </div>
                                </div>

                                <span className="admin-badge admin-badge-success admin-status-badge">
                                    <span className="admin-status-dot" aria-hidden="true">●</span>
                                    <span>{item.status === 'OPERATIONAL' ? 'Працює' : item.status}</span>
                                </span>
                            </div>

                            <p className="admin-integration-desc">{item.description}</p>

                            <div className="admin-integration-footer">
                                <span className="admin-integration-detail">{item.details}</span>
                                <span className="admin-integration-latency">⚡ {item.latencyMs} ms</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
