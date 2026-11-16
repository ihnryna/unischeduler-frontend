import {useMemo, useState} from 'react'
import type {AuditLogEntry, LogLevel} from '../../../features/admin/adminTypes'

type AdminAuditLogsTabProps = {
    logs: AuditLogEntry[]
    onClearLogs: () => void
}

export function AdminAuditLogsTab({
    logs,
    onClearLogs,
}: Readonly<AdminAuditLogsTabProps>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [levelFilter, setLevelFilter] = useState<'ALL' | LogLevel>('ALL')

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch =
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.details.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter

            return matchesSearch && matchesLevel
        })
    }, [logs, searchQuery, levelFilter])

    const handleExport = () => {
        const dataStr =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(logs, null, 2))
        const downloadAnchor = document.createElement('a')
        downloadAnchor.setAttribute('href', dataStr)
        downloadAnchor.setAttribute('download', `unischeduler-audit-logs-${Date.now()}.json`)
        document.body.appendChild(downloadAnchor)
        downloadAnchor.click()
        downloadAnchor.remove()
    }

    const getLevelBadgeClass = (level: LogLevel) => {
        switch (level) {
            case 'INFO':
                return 'admin-badge admin-badge-info'
            case 'WARNING':
                return 'admin-badge admin-badge-warning'
            case 'ERROR':
                return 'admin-badge admin-badge-danger'
            default:
                return 'admin-badge admin-badge-neutral'
        }
    }

    return (
        <div className="admin-tab-content">
            <div className="admin-toolbar-row">
                <div className="admin-filter-group">
                    <input
                        type="text"
                        className="input admin-search-input"
                        placeholder="🔍 Пошук у журналі дій, системних подіях та помилках…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="select admin-filter-select"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value as 'ALL' | LogLevel)}
                    >
                        <option value="ALL">Всі рівні подій</option>
                        <option value="INFO">Рівень INFO</option>
                        <option value="WARNING">Рівень WARNING</option>
                        <option value="ERROR">Рівень ERROR</option>
                    </select>

                    {(searchQuery || levelFilter !== 'ALL') && (
                        <button
                            type="button"
                            className="button admin-btn-secondary"
                            onClick={() => {
                                setSearchQuery('')
                                setLevelFilter('ALL')
                            }}
                        >
                            Скинути
                        </button>
                    )}
                </div>

                <div className="admin-actions-right">
                    <button
                        type="button"
                        className="button admin-btn-outline"
                        onClick={handleExport}
                        title="Зберегти системний журнал у форматі JSON"
                    >
                        ⬇ Експорт логів
                    </button>

                    <button
                        type="button"
                        className="button admin-btn-danger"
                        onClick={onClearLogs}
                        disabled={logs.length === 0}
                    >
                        Очистити журнал
                    </button>
                </div>
            </div>

            <div className="admin-table-container admin-card">
                <div className="admin-table-header-meta">
                    <span className="admin-table-counter">
                        Записів: <strong>{filteredLogs.length}</strong> (збережено останніх <strong>{logs.length}</strong>)
                    </span>
                    <span className="admin-subtext">
                        Аудит дій адміністратора та системних помилок
                    </span>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="admin-empty-state">
                        <p className="admin-empty-title">Записів не знайдено</p>
                        <p className="admin-empty-desc">
                            Журнал подій порожній або за вказаними фільтрами немає збігів.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{width: '160px'}}>Час (UTC+2)</th>
                                    <th style={{width: '90px'}}>Рівень</th>
                                    <th style={{width: '180px'}}>Дія</th>
                                    <th style={{width: '180px'}}>Ініціатор / Джерело</th>
                                    <th>Деталі події</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="admin-cell-time">{log.timestamp}</td>
                                        <td>
                                            <span className={getLevelBadgeClass(log.level)}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="admin-cell-action-name">
                                            <strong>{log.action}</strong>
                                        </td>
                                        <td className="admin-cell-meta">
                                            <div>{log.user}</div>
                                            <small className="admin-subtext">{log.source}</small>
                                        </td>
                                        <td className="admin-cell-details">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
