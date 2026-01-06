import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
    Calendar,
    Users,
    Camera,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
    Play,
} from 'lucide-react';

interface DashboardData {
    todaySessions: {
        total: number;
        running: number;
        scheduled: number;
        ended: number;
    };
    cameras: {
        total: number;
        online: number;
        offline: number;
    };
    attendance: {
        rate: number;
        present: number;
        total: number;
    };
    unknownPending: number;
}

interface Session {
    id: string;
    title: string;
    status: string;
    startTime: string;
    room?: { name: string };
    _count?: { roster: number; present: number };
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getDashboard(), api.getTodaySessions()])
            .then(([dashData, sessData]) => {
                setData(dashData);
                setSessions(sessData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Tổng quan hệ thống điểm danh</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Calendar />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{data?.todaySessions.total || 0}</div>
                        <div className="stat-label">Buổi hôm nay</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <TrendingUp />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{data?.attendance.rate || 0}%</div>
                        <div className="stat-label">Tỷ lệ có mặt</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon info">
                        <Camera />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {data?.cameras.online || 0}/{data?.cameras.total || 0}
                        </div>
                        <div className="stat-label">Camera online</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertTriangle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{data?.unknownPending || 0}</div>
                        <div className="stat-label">Chờ xác nhận</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Buổi hôm nay</h2>
                    <Link to="/sessions" className="btn btn-secondary btn-sm">
                        Xem tất cả
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Không có buổi nào hôm nay</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Buổi</th>
                                    <th>Phòng</th>
                                    <th>Thời gian</th>
                                    <th>Tham dự</th>
                                    <th>Trạng thái</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {session.title}
                                        </td>
                                        <td>{session.room?.name}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                                <Clock size={14} />
                                                {new Date(session.startTime).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                                <Users size={14} />
                                                {session._count?.present || 0}/{session._count?.roster || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${session.status}`}>
                                                {session.status === 'running' ? 'Đang diễn ra' :
                                                    session.status === 'scheduled' ? 'Chưa bắt đầu' :
                                                        session.status === 'ended' ? 'Đã kết thúc' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/sessions/${session.id}`} className="btn btn-secondary btn-sm">
                                                {session.status === 'running' ? (
                                                    <>
                                                        <Play size={14} />
                                                        Xem live
                                                    </>
                                                ) : (
                                                    'Chi tiết'
                                                )}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
