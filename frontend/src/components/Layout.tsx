import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
    LayoutDashboard,
    Calendar,
    Users,
    DoorOpen,
    Camera,
    FileText,
    LogOut,
    Scan,
    Sun,
    Moon,
    UserX,
    Settings,
    FileCode2,
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const mainNavItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/sessions', icon: Calendar, label: 'Buổi học/họp' },
        { path: '/persons', icon: Users, label: 'Nhân sự' },
        { path: '/rooms', icon: DoorOpen, label: 'Phòng' },
        { path: '/cameras', icon: Camera, label: 'Camera' },
        { path: '/reports', icon: FileText, label: 'Báo cáo' },
    ];

    const secondaryNavItems = [
        { path: '/unknown-faces', icon: UserX, label: 'Khuôn mặt lạ' },
        { path: '/settings', icon: Settings, label: 'Cài đặt' },
        { path: '/system-design', icon: FileCode2, label: 'Thiết kế HT' },
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Scan size={24} />
                        <span>Smart APP</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Menu chính</div>
                        {mainNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                                end={item.path === '/'}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Khác</div>
                        {secondaryNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Bottom section */}
                <div style={{
                    padding: 'var(--space-md)',
                    borderTop: '1px solid var(--color-border)',
                    background: 'rgba(139, 92, 246, 0.02)'
                }}>
                    {/* Theme toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-sm)',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500
                        }}>
                            {theme === 'dark' ? 'Tối' : 'Sáng'}
                        </span>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            style={{ width: 36, height: 36 }}
                            title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>

                    {/* User profile */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-sm)',
                        padding: 'var(--space-sm)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                color: 'white',
                                fontSize: '0.875rem',
                                flexShrink: 0
                            }}
                        >
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                color: 'var(--color-text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user?.fullName}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--color-text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-secondary btn-sm"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            gap: 'var(--space-xs)'
                        }}
                        onClick={handleLogout}
                    >
                        <LogOut size={14} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
