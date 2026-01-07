import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Modal from './Modal';

interface Room {
    id: string;
    name: string;
}

interface CreateCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCameraModal({ isOpen, onClose, onSuccess }: CreateCameraModalProps) {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    
    const [form, setForm] = useState({
        name: '',
        rtspUrl: '',
        type: 'entry',
        roomId: '',
        threshold: 0.6
    });

    useEffect(() => {
        if (isOpen) {
            api.getRooms()
                .then(setRooms)
                .catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.createCamera({
                name: form.name,
                rtspUrl: form.rtspUrl,
                type: form.type,
                roomId: form.roomId,
                threshold: form.threshold
            });

            onSuccess();
            onClose();
            setForm({ name: '', rtspUrl: '', type: 'entry', roomId: '', threshold: 0.6 });
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm camera" size="md">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Tên camera *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Camera cổng vào"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">RTSP URL *</label>
                    <input
                        type="url"
                        className="form-input"
                        placeholder="rtsp://192.168.1.100:554/stream"
                        value={form.rtspUrl}
                        onChange={(e) => setForm({ ...form, rtspUrl: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label">Loại camera *</label>
                        <select
                            className="form-input form-select"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            required
                        >
                            <option value="entry">Cổng vào</option>
                            <option value="exit">Cổng ra</option>
                            <option value="both">Cả hai</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phòng *</label>
                        <select
                            className="form-input form-select"
                            value={form.roomId}
                            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                            required
                        >
                            <option value="">-- Chọn phòng --</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Ngưỡng nhận diện (0.0 - 1.0)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.threshold}
                        onChange={(e) => setForm({ ...form, threshold: parseFloat(e.target.value) || 0.6 })}
                        min={0}
                        max={1}
                        step={0.05}
                        style={{ width: 120 }}
                    />
                    <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                        Giá trị cao hơn = chính xác hơn nhưng khó nhận diện hơn
                    </small>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Thêm camera'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
