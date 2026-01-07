import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Modal from './Modal';

interface Unit {
    id: string;
    name: string;
}

interface CreatePersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePersonModal({ isOpen, onClose, onSuccess }: CreatePersonModalProps) {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    
    const [form, setForm] = useState({
        fullName: '',
        employeeId: '',
        email: '',
        phone: '',
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
            await api.createPerson({
                fullName: form.fullName,
                employeeId: form.employeeId || undefined,
                email: form.email || undefined,
                phone: form.phone || undefined,
                unitId: form.unitId
            });

            onSuccess();
            onClose();
            setForm({
                fullName: '',
                employeeId: '',
                email: '',
                phone: '',
                unitId: ''
            });
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm nhân sự" size="md">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Nguyễn Văn A"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label">Mã nhân viên</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="NV001"
                            value={form.employeeId}
                            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
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

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="0901234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Thêm nhân sự'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
