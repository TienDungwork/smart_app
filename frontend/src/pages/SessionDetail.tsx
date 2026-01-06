import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
    ArrowLeft,
    Play,
    Square,
    Lock,
    Users,
    CheckCircle,
    AlertCircle,
    XCircle,
    HelpCircle,
} from 'lucide-react';

interface Session {
    id: string;
    title: string;
    description?: string;
    status: string;
    startTime: string;
    endTime: string;
    gracePeriod: number;
    room?: { name: string; cameras?: any[] };
    host?: { fullName: string };
    rosters?: { person: any }[];
    attendanceRecords?: any[];
    unknownFaces?: any[];
}

export default function SessionDetail() {
    const { id } = useParams<{ id: string }>();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadSession();
        }
    }, [id]);

    const loadSession = () => {
        api.getSession(id!)
            .then(setSession)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleStart = async () => {
        await api.startSession(id!);
        loadSession();
    };

    const handleEnd = async () => {
        await api.endSession(id!);
        loadSession();
    };

    const handleLock = async () => {
        await api.lockSession(id!);
        loadSession();
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    if (!session) {
        return <div className="empty-state">Không tìm thấy buổi</div>;
    }

    const records = session.attendanceRecords || [];
    const present = records.filter(r => r.status === 'present');
    const late = records.filter(r => r.status === 'late');
    const absent = records.filter(r => r.status === 'absent');

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'present': return <CheckCircle size={18} style={{ color: 'var(--status-present)' }} />;
            case 'late': return <AlertCircle size={18} style={{ color: 'var(--status-late)' }} />;
            case 'absent': return <XCircle size={18} style={{ color: 'var(--status-absent)' }} />;
            default: return <HelpCircle size={18} style={{ color: 'var(--status-unknown)' }} />;
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/sessions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)', color: 'var(--color-text-muted)' }}>
                        <ArrowLeft size={16} />
                        Quay lại
                    </Link>
                    <h1 className="page-title">{session.title}</h1>
                    <p className="page-subtitle">
                        {session.room?.name} • {new Date(session.startTime).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {session.status === 'scheduled' && (
                        <button className="btn btn-success" onClick={handleStart}>
                            <Play size={18} />
                            Bắt đầu
                        </button>
                    )}
                    {session.status === 'running' && (
                        <button className="btn btn-secondary" onClick={handleEnd}>
                            <Square size={18} />
                            Kết thúc
                        </button>
                    )}
                    {session.status === 'ended' && (
                        <button className="btn btn-secondary" onClick={handleLock}>
                            <Lock size={18} />
                            Chốt buổi
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{present.length}</div>
                        <div className="stat-label">Có mặt</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertCircle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{late.length}</div>
                        <div className="stat-label">Đi muộn</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon error">
                        <XCircle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{absent.length}</div>
                        <div className="stat-label">Vắng mặt</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Users />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{records.length}</div>
                        <div className="stat-label">Tổng danh sách</div>
                    </div>
                </div>
            </div>

            <div className="realtime-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Danh sách điểm danh</h3>
                        <span className={`badge badge-${session.status}`}>
                            {session.status === 'running' ? '🟢 Live' : session.status}
                        </span>
                    </div>

                    <div className="attendance-list">
                        {records.map((record: any) => (
                            <div key={record.id} className="attendance-item">
                                <div className="attendance-avatar">
                                    {record.person?.fullName?.charAt(0) || '?'}
                                </div>
                                <div className="attendance-info">
                                    <div className="attendance-name">{record.person?.fullName}</div>
                                    <div className="attendance-time">
                                        {record.checkinTime
                                            ? `Vào lúc ${new Date(record.checkinTime).toLocaleTimeString('vi-VN')}`
                                            : 'Chưa điểm danh'}
                                    </div>
                                </div>
                                <StatusIcon status={record.status} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="timeline">
                    <div className="timeline-title">Timeline sự kiện</div>
                    <div className="timeline-list">
                        {records
                            .filter((r: any) => r.checkinTime)
                            .sort((a: any, b: any) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime())
                            .map((record: any) => (
                                <div key={record.id} className={`timeline-item ${record.status === 'present' ? 'entry' : 'exit'}`}>
                                    <span className="timeline-time">
                                        {new Date(record.checkinTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="timeline-content">
                                        {record.person?.fullName} check-in
                                    </span>
                                </div>
                            ))}
                        {records.filter((r: any) => r.checkinTime).length === 0 && (
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 'var(--space-lg)' }}>
                                Chưa có sự kiện
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
