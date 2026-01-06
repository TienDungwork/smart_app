import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Scan, Sun, Moon } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated floating orbs */}
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />
            <div className="login-orb login-orb-3" />

            {/* Theme toggle button - fixed position */}
            <button 
                className="theme-toggle"
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    top: 'var(--space-lg)',
                    right: 'var(--space-lg)',
                    zIndex: 100
                }}
                title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Scan size={44} />
                    </div>
                    <h1 className="login-title">Smart APP</h1>
                    <p className="login-subtitle">Hệ thống điểm danh thông minh</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="admin@demo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                <p style={{ 
                    textAlign: 'center', 
                    marginTop: 'var(--space-xl)', 
                    fontSize: '0.8125rem', 
                    color: 'var(--color-text-muted)',
                    opacity: 0.8
                }}>
                    Demo: admin@demo.com / admin123
                </p>
            </div>
        </div>
    );
}
