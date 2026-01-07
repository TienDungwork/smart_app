import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Camera, Wifi, WifiOff, Video, Play } from 'lucide-react';
import CreateCameraModal from '../components/CreateCameraModal';

interface CameraDevice {
    id: string;
    name: string;
    rtspUrl: string;
    type: string;
    status: string;
    room?: { name: string };
    lastSeen?: string;
}

export default function Cameras() {
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);

    useEffect(() => {
        loadCameras();
    }, []);

    const loadCameras = () => {
        setLoading(true);
        api.getCameras()
            .then(setCameras)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleTest = async (id: string) => {
        setTestingId(id);
        try {
            await api.testCamera(id);
            loadCameras();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setTestingId(null);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Camera</h1>
                    <p className="page-subtitle">Quản lý các camera nhận diện khuôn mặt</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />
                    Thêm camera
                </button>
            </div>

            {cameras.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Camera size={48} />
                        <p>Chưa có camera nào</p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowCreateModal(true)}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            <Plus size={16} />
                            Thêm camera đầu tiên
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                    {cameras.map((camera) => (
                        <div key={camera.id} className="card" style={{ padding: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    background: camera.status === 'online' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Video size={22} color="white" />
                                </div>
                                <span className={`badge badge-${camera.status === 'online' ? 'online' : 'offline'}`}>
                                    {camera.status === 'online' ? (
                                        <><Wifi size={12} /> Online</>
                                    ) : (
                                        <><WifiOff size={12} /> Offline</>
                                    )}
                                </span>
                            </div>
                            
                            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-xs)' }}>
                                {camera.name}
                            </h3>
                            
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                📍 {camera.room?.name || 'Chưa gán phòng'}
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                Loại: {camera.type === 'entry' ? '🚪 Cổng vào' : camera.type === 'exit' ? '🚶 Cổng ra' : '🔄 Cả hai'}
                            </div>

                            <div style={{ 
                                padding: 'var(--space-sm)', 
                                background: 'var(--color-bg-tertiary)', 
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                fontFamily: 'monospace',
                                color: 'var(--color-text-muted)',
                                wordBreak: 'break-all',
                                marginBottom: 'var(--space-md)'
                            }}>
                                {camera.rtspUrl}
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ flex: 1 }}
                                    onClick={() => handleTest(camera.id)}
                                    disabled={testingId === camera.id}
                                >
                                    <Play size={14} />
                                    {testingId === camera.id ? 'Đang test...' : 'Test kết nối'}
                                </button>
                                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateCameraModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadCameras}
            />
        </div>
    );
}
