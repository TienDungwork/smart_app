import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Camera, Wifi, WifiOff, AlertTriangle, Play } from 'lucide-react';

interface CameraData {
    id: string;
    name: string;
    rtspUrl: string;
    type: string;
    status: string;
    lastHeartbeat?: string;
    room?: { name: string };
}

export default function Cameras() {
    const [cameras, setCameras] = useState<CameraData[]>([]);
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getCameras(), api.getCameraStatus()])
            .then(([cams, status]) => {
                setCameras(cams);
                setOverview(status);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleTest = async (id: string) => {
        const result = await api.testCamera(id);
        alert(`Kết nối thành công!\nĐộ trễ: ${result.latency}ms\nĐộ phân giải: ${result.resolution}\nFPS: ${result.fps}`);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Camera</h1>
                    <p className="page-subtitle">Quản lý và giám sát camera AI</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Thêm camera
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Camera />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.total || 0}</div>
                        <div className="stat-label">Tổng camera</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <Wifi />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.online || 0}</div>
                        <div className="stat-label">Online</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon error">
                        <WifiOff />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.offline || 0}</div>
                        <div className="stat-label">Offline</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertTriangle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.degraded || 0}</div>
                        <div className="stat-label">Degraded</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Camera</th>
                                <th>Phòng</th>
                                <th>Loại</th>
                                <th>Trạng thái</th>
                                <th>Heartbeat</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cameras.map((camera) => (
                                <tr key={camera.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 'var(--radius-md)',
                                                background: camera.status === 'online' ? 'var(--status-present)' : camera.status === 'offline' ? 'var(--status-absent)' : 'var(--status-late)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Camera size={18} color="white" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{camera.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                                    {camera.rtspUrl.substring(0, 30)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{camera.room?.name}</td>
                                    <td>
                                        <span className={`badge ${camera.type === 'entry' ? 'badge-present' : 'badge-late'}`}>
                                            {camera.type === 'entry' ? '→ Vào' : '← Ra'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${camera.status}`}>
                                            {camera.status === 'online' ? '🟢 Online' :
                                                camera.status === 'offline' ? '🔴 Offline' : '🟡 Degraded'}
                                        </span>
                                    </td>
                                    <td>
                                        {camera.lastHeartbeat
                                            ? new Date(camera.lastHeartbeat).toLocaleString('vi-VN')
                                            : '-'}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleTest(camera.id)}>
                                            <Play size={14} />
                                            Test
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
