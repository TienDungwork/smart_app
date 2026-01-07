import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, DoorOpen, MapPin, Users } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';

interface Room {
    id: string;
    name: string;
    location?: string;
    capacity: number;
    unit?: { name: string };
    cameras?: any[];
}

export default function Rooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = () => {
        setLoading(true);
        api.getRooms()
            .then(setRooms)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Phòng</h1>
                    <p className="page-subtitle">Quản lý các phòng họp và học</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />
                    Thêm phòng
                </button>
            </div>

            {rooms.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <DoorOpen size={48} />
                        <p>Chưa có phòng nào</p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowCreateModal(true)}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            <Plus size={16} />
                            Thêm phòng đầu tiên
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                    {rooms.map((room) => (
                        <div key={room.id} className="card" style={{ padding: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--gradient-cyan)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <DoorOpen size={22} color="white" />
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span className="badge badge-online">
                                        {room.cameras?.length || 0} camera
                                    </span>
                                </div>
                            </div>
                            
                            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-xs)' }}>
                                {room.name}
                            </h3>
                            
                            {room.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                    <MapPin size={12} />
                                    {room.location}
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                <Users size={12} />
                                Sức chứa: {room.capacity} người
                            </div>

                            {room.unit && (
                                <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    Đơn vị: {room.unit.name}
                                </div>
                            )}

                            <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-border)' }}>
                                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateRoomModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadRooms}
            />
        </div>
    );
}
