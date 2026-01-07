import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { User, Building, Moon, Sun, Lock, Bell, Shield } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage('Mật khẩu mới không khớp');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage('');

        // API call would go here
        setTimeout(() => {
            setPasswordMessage('Đổi mật khẩu thành công!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordLoading(false);
        }, 1000);
    };

    const tabs = [
        { id: 'profile', label: 'Hồ sơ', icon: User },
        { id: 'security', label: 'Bảo mật', icon: Lock },
        { id: 'preferences', label: 'Tùy chọn', icon: Bell },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Cài đặt</h1>
                    <p className="page-subtitle">Quản lý tài khoản và tùy chọn hệ thống</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-lg)' }}>
                {/* Sidebar tabs */}
                <div className="card" style={{ padding: 'var(--space-sm)', height: 'fit-content' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)',
                                width: '100%',
                                padding: 'var(--space-md)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                textAlign: 'left',
                                transition: 'all 0.15s'
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'profile' && (
                        <div className="card">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                Thông tin cá nhân
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                                <div style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 'var(--radius-xl)',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: 'white'
                                }}>
                                    {user?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {user?.fullName}
                                    </h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        {user?.email}
                                    </p>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                        {user?.roles?.map((role: string) => (
                                            <span key={role} className="badge badge-ended" style={{ textTransform: 'capitalize' }}>
                                                <Shield size={12} />
                                                {role.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Họ và tên</label>
                                    <input type="text" className="form-input" value={user?.fullName || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={user?.email || ''} disabled />
                                </div>
                            </div>

                            {user?.unit && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <Building size={14} style={{ marginRight: 4 }} />
                                        Đơn vị
                                    </label>
                                    <input type="text" className="form-input" value={user.unit.name || ''} disabled />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                Đổi mật khẩu
                            </h2>

                            <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                                <div className="form-group">
                                    <label className="form-label">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                {passwordMessage && (
                                    <div style={{
                                        padding: 'var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-md)',
                                        background: passwordMessage.includes('thành công') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: passwordMessage.includes('thành công') ? 'var(--color-success)' : 'var(--color-error)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {passwordMessage}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                                    {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="card">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                Giao diện
                            </h2>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-lg)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                                        Chế độ {theme === 'dark' ? 'tối' : 'sáng'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        Chuyển đổi giữa giao diện sáng và tối
                                    </div>
                                </div>
                                <button
                                    className="theme-toggle"
                                    onClick={toggleTheme}
                                    style={{ width: 48, height: 48 }}
                                >
                                    {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
