import { useEffect, useState } from 'react';
import { UserX, Check, X, Clock } from 'lucide-react';

interface UnknownFace {
    id: string;
    imageUrl: string;
    timestamp: string;
    camera?: { name: string };
    session?: { title: string };
    status: string;
}

export default function UnknownFaces() {
    const [faces, setFaces] = useState<UnknownFace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaces();
    }, []);

    const loadFaces = () => {
        setLoading(true);
        // Using AI events endpoint for unknown faces
        // This would typically be a dedicated endpoint
        setTimeout(() => {
            // Mock data for demonstration
            setFaces([]);
            setLoading(false);
        }, 500);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Khuôn mặt chưa xác định</h1>
                    <p className="page-subtitle">Xem xét và xử lý các khuôn mặt không nhận diện được</p>
                </div>
            </div>

            {faces.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <UserX size={48} />
                        <p>Không có khuôn mặt nào cần xem xét</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                            Các khuôn mặt chưa xác định từ camera sẽ hiển thị ở đây
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
                    {faces.map((face) => (
                        <div key={face.id} className="card" style={{ padding: 'var(--space-md)' }}>
                            <div style={{
                                aspectRatio: '1',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {face.imageUrl ? (
                                    <img
                                        src={face.imageUrl}
                                        alt="Unknown face"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <UserX size={48} style={{ color: 'var(--color-text-muted)' }} />
                                )}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>
                                <Clock size={12} style={{ marginRight: 4 }} />
                                {new Date(face.timestamp).toLocaleString('vi-VN')}
                            </div>

                            {face.camera && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                    📹 {face.camera.name}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                <button className="btn btn-success btn-sm" style={{ flex: 1 }}>
                                    <Check size={14} />
                                    Gán
                                </button>
                                <button className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                                    <X size={14} />
                                    Bỏ qua
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
