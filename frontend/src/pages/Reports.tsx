import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { FileText, Download, TrendingUp, Users, Calendar } from 'lucide-react';

interface Session {
    id: string;
    title: string;
    startTime: string;
    status: string;
    room?: { name: string };
}

export default function Reports() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        api.getSessions()
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadReport = async (sessionId: string) => {
        setSelectedSession(sessionId);
        const data = await api.getSessionReport(sessionId);
        setReport(data);
    };

    const handleExport = async () => {
        if (!selectedSession) return;
        const data = await api.exportSessionReport(selectedSession);

        // Convert to CSV and download
        const headers = Object.keys(data.data[0] || {}).join(',');
        const rows = data.data.map((row: any) => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename.replace('.xlsx', '.csv');
        a.click();
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Báo cáo</h1>
                    <p className="page-subtitle">Thống kê và xuất báo cáo điểm danh</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Chọn buổi</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: 400, overflowY: 'auto' }}>
                        {sessions.filter(s => s.status === 'ended' || s.status === 'locked').map((session) => (
                            <button
                                key={session.id}
                                className={`btn ${selectedSession === session.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                onClick={() => loadReport(session.id)}
                            >
                                <Calendar size={16} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        {new Date(session.startTime).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card">
                    {!report ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>Chọn một buổi để xem báo cáo</p>
                        </div>
                    ) : (
                        <>
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{report.session.title}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        {report.session.room} • {new Date(report.session.startTime).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <button className="btn btn-primary" onClick={handleExport}>
                                    <Download size={18} />
                                    Xuất Excel
                                </button>
                            </div>

                            <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-present)' }}>{report.summary.present}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Có mặt</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-late)' }}>{report.summary.late}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Đi muộn</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-absent)' }}>{report.summary.absent}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vắng mặt</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{report.summary.rate}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tỷ lệ</div>
                                </div>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Họ tên</th>
                                            <th>Mã NV</th>
                                            <th>Đơn vị</th>
                                            <th>Trạng thái</th>
                                            <th>Giờ vào</th>
                                            <th>Giờ ra</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.records.map((record: any, i: number) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{record.personName}</td>
                                                <td>{record.employeeId || '-'}</td>
                                                <td>{record.unit || '-'}</td>
                                                <td>
                                                    <span className={`badge badge-${record.status}`}>
                                                        {record.status === 'present' ? 'Có mặt' :
                                                            record.status === 'late' ? 'Đi muộn' : 'Vắng'}
                                                    </span>
                                                </td>
                                                <td>{record.checkinTime || '-'}</td>
                                                <td>{record.checkoutTime || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
