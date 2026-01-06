import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Search, UserCheck, UserX } from 'lucide-react';

interface Person {
    id: string;
    fullName: string;
    employeeId?: string;
    email?: string;
    unit?: { name: string };
    faceProfiles?: any[];
    enrollmentStatus: string;
}

export default function Persons() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.getPersons()
            .then(setPersons)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = persons.filter(p =>
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Nhân sự</h1>
                    <p className="page-subtitle">Quản lý danh sách nhân sự và đăng ký khuôn mặt</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Thêm nhân sự
                </button>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tên, mã nhân sự, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nhân sự</th>
                                <th>Mã NV</th>
                                <th>Email</th>
                                <th>Đơn vị</th>
                                <th>Khuôn mặt</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((person) => (
                                <tr key={person.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                color: 'var(--color-text-secondary)',
                                            }}>
                                                {person.fullName.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                {person.fullName}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{person.employeeId || '-'}</td>
                                    <td>{person.email || '-'}</td>
                                    <td>{person.unit?.name || '-'}</td>
                                    <td>
                                        {person.enrollmentStatus === 'enrolled' ? (
                                            <span className="badge badge-online">
                                                <UserCheck size={12} />
                                                Đã đăng ký
                                            </span>
                                        ) : (
                                            <span className="badge badge-offline">
                                                <UserX size={12} />
                                                Chưa đăng ký
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm">
                                            {person.enrollmentStatus === 'enrolled' ? 'Cập nhật' : 'Đăng ký mặt'}
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
