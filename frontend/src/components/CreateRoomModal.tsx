import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Modal from './Modal';

interface Unit {
    id: string;
    name: string;
}

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    
    const [form, setForm] = useState({
        name: '',
        location: '',
        capacity: 30,
        unitId: ''
    });

    useEffect(() => {
        if (isOpen) {
            api.getUnits()
                .then(setUnits)
                .catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.createRoom({
                name: form.name,
                location: form.location || undefined,
                capacity: form.capacity,
                unitId: form.unitId
            });

            onSuccess();
            onClose();
            setForm({ name: '', location: '', capacity: 30, unitId: '' });
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm phòng" size="md">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Tên phòng *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Phòng họp A1"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Vị trí</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Tầng 3, Tòa nhà A"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label">Sức chứa</label>
                        <input
                            type="number"
                            className="form-input"
                            value={form.capacity}
                            onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                            min={1}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đơn vị *</label>
                        <select
                            className="form-input form-select"
                            value={form.unitId}
                            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                            required
                        >
                            <option value="">-- Chọn đơn vị --</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Thêm phòng'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
