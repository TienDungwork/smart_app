import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Modal from './Modal';
import { Calendar, Clock, Users } from 'lucide-react';

interface Room {
    id: string;
    name: string;
}

interface Person {
    id: string;
    fullName: string;
    employeeId?: string;
}

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateSessionModal({ isOpen, onClose, onSuccess }: CreateSessionModalProps) {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [selectedPersons, setSelectedPersons] = useState<string[]>([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        roomId: '',
        startDate: '',
        startTime: '08:00',
        endTime: '10:00',
        gracePeriod: 15
    });

    useEffect(() => {
        if (isOpen) {
            // Load rooms and persons
            Promise.all([api.getRooms(), api.getPersons()])
                .then(([roomsData, personsData]) => {
                    setRooms(roomsData);
                    setPersons(personsData);
                })
                .catch(console.error);

            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            setForm(f => ({ ...f, startDate: today }));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const startTime = new Date(`${form.startDate}T${form.startTime}`);
            const endTime = new Date(`${form.startDate}T${form.endTime}`);

            await api.createSession({
                title: form.title,
                description: form.description,
                roomId: form.roomId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                gracePeriod: form.gracePeriod,
                roster: selectedPersons
            });

            onSuccess();
            onClose();
            // Reset form
            setForm({
                title: '',
                description: '',
                roomId: '',
                startDate: new Date().toISOString().split('T')[0],
                startTime: '08:00',
                endTime: '10:00',
                gracePeriod: 15
            });
            setSelectedPersons([]);
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const togglePerson = (personId: string) => {
        setSelectedPersons(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tạo buổi mới" size="lg">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Tiêu đề *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="VD: Họp giao ban sáng"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                        className="form-input"
                        placeholder="Mô tả chi tiết (không bắt buộc)"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        style={{ resize: 'vertical' }}
                    />
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={14} style={{ marginRight: 4 }} />
                            Ngày *
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <Clock size={14} style={{ marginRight: 4 }} />
                            Bắt đầu *
                        </label>
                        <input
                            type="time"
                            className="form-input"
                            value={form.startTime}
                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <Clock size={14} style={{ marginRight: 4 }} />
                            Kết thúc *
                        </label>
                        <input
                            type="time"
                            className="form-input"
                            value={form.endTime}
                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Thời gian cho phép đi muộn (phút)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.gracePeriod}
                        onChange={(e) => setForm({ ...form, gracePeriod: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={60}
                        style={{ width: 100 }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <Users size={14} style={{ marginRight: 4 }} />
                        Danh sách điểm danh ({selectedPersons.length} người)
                    </label>
                    <div style={{
                        maxHeight: 180,
                        overflowY: 'auto',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm)'
                    }}>
                        {persons.length === 0 ? (
                            <div style={{ padding: 'var(--space-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                Không có nhân sự
                            </div>
                        ) : (
                            persons.map(person => (
                                <label
                                    key={person.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        padding: 'var(--space-sm)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s'
                                    }}
                                    className="hover-bg"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPersons.includes(person.id)}
                                        onChange={() => togglePerson(person.id)}
                                        style={{ width: 16, height: 16 }}
                                    />
                                    <span style={{ flex: 1 }}>{person.fullName}</span>
                                    {person.employeeId && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {person.employeeId}
                                        </span>
                                    )}
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Tạo buổi'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
