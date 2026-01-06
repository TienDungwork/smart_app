import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, DoorOpen, Camera } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    location?: string;
    capacity?: number;
    unit?: { name: string };
    cameras?: any[];
    _count?: { cameras: number; camerasOnline: number };
}

export default function Rooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getRooms()
            .then(setRooms)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Phòng</h1>
                    <p className="page-subtitle">Quản lý phòng học và phòng họp</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Thêm phòng
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                {rooms.map((room) => (
                    <div key={room.id} className="card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <DoorOpen size={24} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-xs)' }}>
                                    {room.name}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    {room.location || 'Chưa có vị trí'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>Sức chứa</div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                    {room.capacity || '-'} người
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>Camera</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                    <Camera size={14} />
                                    <span style={{ fontWeight: 600, color: room._count?.camerasOnline ? 'var(--status-present)' : 'var(--color-text-secondary)' }}>
                                        {room._count?.camerasOnline || 0}
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>/ {room._count?.cameras || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
