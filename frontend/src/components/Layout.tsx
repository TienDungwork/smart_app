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

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/sessions', icon: Calendar, label: 'Buổi học/họp' },
        { path: '/persons', icon: Users, label: 'Nhân sự' },
        { path: '/rooms', icon: DoorOpen, label: 'Phòng' },
        { path: '/cameras', icon: Camera, label: 'Camera' },
        { path: '/reports', icon: FileText, label: 'Báo cáo' },
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Scan size={28} />
                        <span>Smart APP</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Menu chính</div>
                        {navItems.map((item, index) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                                end={item.path === '/'}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Bottom section with theme toggle and user profile */}
                <div style={{ 
                    padding: 'var(--space-lg)', 
                    borderTop: '1px solid var(--color-border)',
                    background: 'rgba(139, 92, 246, 0.02)'
                }}>
                    {/* Theme toggle */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-md)',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <span style={{ 
                            fontSize: '0.8125rem', 
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500
                        }}>
                            {theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
                        </span>
                        <button 
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>

                    {/* User profile */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-md)', 
                        marginBottom: 'var(--space-md)',
                        padding: 'var(--space-md)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: 'white',
                                fontSize: '1rem',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                                fontWeight: 600, 
                                fontSize: '0.9rem', 
                                color: 'var(--color-text-primary)',
                                marginBottom: '2px'
                            }}>
                                {user?.fullName}
                            </div>
                            <div style={{ 
                                fontSize: '0.75rem', 
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
                        className="btn btn-secondary" 
                        style={{ 
                            width: '100%',
                            justifyContent: 'center',
                            gap: 'var(--space-sm)'
                        }} 
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
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
