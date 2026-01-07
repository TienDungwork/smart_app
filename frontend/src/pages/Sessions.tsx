import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Calendar, Clock, Play, Square, Trash2 } from 'lucide-react';
import CreateSessionModal from '../components/CreateSessionModal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Session {
    id: string;
    title: string;
    description?: string;
    status: string;
    startTime: string;
    endTime: string;
    room?: { name: string };
    host?: { fullName: string };
    _count?: { roster: number; present: number; late: number; absent: number };
}

export default function Sessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = () => {
        setLoading(true);
        api.getSessions()
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleStart = async (id: string) => {
        try {
            await api.startSession(id);
            loadSessions();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEnd = async (id: string) => {
        try {
            await api.endSession(id);
            loadSessions();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buổi học / Cuộc họp</h1>
                    <p className="page-subtitle">Quản lý các buổi điểm danh</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />
                    Tạo buổi mới
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Chưa có buổi nào</p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowCreateModal(true)}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            <Plus size={16} />
                            Tạo buổi đầu tiên
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Buổi</th>
                                    <th>Phòng</th>
                                    <th>Thời gian</th>
                                    <th>Chủ trì</th>
                                    <th>Điểm danh</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td>
                                            <Link to={`/sessions/${session.id}`} style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                {session.title}
                                            </Link>
                                        </td>
                                        <td>{session.room?.name || '-'}</td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    {new Date(session.startTime).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                                                    <Clock size={12} />
                                                    {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{session.host?.fullName || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span className="badge badge-present">{session._count?.present || 0}</span>
                                                <span className="badge badge-late">{session._count?.late || 0}</span>
                                                <span className="badge badge-absent">{session._count?.absent || 0}</span>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                                    / {session._count?.roster || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${session.status}`}>
                                                {session.status === 'running' ? '▶️ Đang diễn ra' :
                                                    session.status === 'scheduled' ? '📅 Chưa bắt đầu' :
                                                        session.status === 'ended' ? '⏹️ Đã kết thúc' : '🔒 Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {session.status === 'scheduled' && (
                                                    <button className="btn btn-success btn-sm" onClick={() => handleStart(session.id)}>
                                                        <Play size={14} />
                                                        Bắt đầu
                                                    </button>
                                                )}
                                                {session.status === 'running' && (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEnd(session.id)}>
                                                        <Square size={14} />
                                                        Kết thúc
                                                    </button>
                                                )}
                                                <Link to={`/sessions/${session.id}`} className="btn btn-secondary btn-sm">
                                                    Chi tiết
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreateSessionModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadSessions}
            />
        </div>
    );
}
