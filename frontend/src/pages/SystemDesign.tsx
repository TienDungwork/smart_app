import { useState } from 'react';
import { FileText, Database, Server, Layout, Shield, Workflow, Layers } from 'lucide-react';

export default function SystemDesign() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: 'Tổng quan', icon: FileText },
        { id: 'architecture', label: 'Kiến trúc', icon: Server },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'api', label: 'API Endpoints', icon: Layers },
        { id: 'frontend', label: 'Frontend', icon: Layout },
        { id: 'workflow', label: 'Luồng hoạt động', icon: Workflow },
        { id: 'security', label: 'Bảo mật', icon: Shield },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Thiết kế Hệ thống</h1>
                    <p className="page-subtitle">Mô tả kiến trúc và thiết kế Smart App</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-lg)' }}>
                {/* Navigation */}
                <div className="card" style={{ padding: 'var(--space-sm)', height: 'fit-content', position: 'sticky', top: 'var(--space-lg)' }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)',
                                width: '100%',
                                padding: 'var(--space-sm) var(--space-md)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: activeSection === section.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                color: activeSection === section.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: activeSection === section.id ? 600 : 400,
                                textAlign: 'left',
                                transition: 'all 0.15s'
                            }}
                        >
                            <section.icon size={16} />
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card">
                    {activeSection === 'overview' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                1. Tổng quan
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                                <strong>Smart App</strong> là hệ thống điểm danh thông minh sử dụng nhận diện khuôn mặt (Face Recognition)
                                để tự động hóa quá trình chấm công/điểm danh trong các buổi học, cuộc họp.
                            </p>

                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                                Tech Stack
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                                {[
                                    { label: 'Frontend', value: 'React 18, TypeScript, Vite' },
                                    { label: 'Backend', value: 'Bun, Hono, TypeScript' },
                                    { label: 'Database', value: 'PostgreSQL + Drizzle ORM' },
                                    { label: 'Auth', value: 'JWT (JSON Web Tokens)' },
                                    { label: 'Realtime', value: 'WebSocket (Bun native)' },
                                    { label: 'AI', value: 'External Face Recognition API' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'architecture' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                2. Kiến trúc Hệ thống
                            </h2>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-xl)',
                                padding: 'var(--space-xl)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)'
                            }}>
                                {/* Frontend */}
                                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 200
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>Frontend</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>React + Vite</div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>↓ REST API / WebSocket ↓</div>

                                {/* Backend */}
                                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 150
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>REST API</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Hono</div>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 150
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>WebSocket</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Realtime</div>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 150
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>JWT Auth</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Authentication</div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>↓ Drizzle ORM ↓</div>

                                {/* Database & AI */}
                                <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 180
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>PostgreSQL</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Database</div>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-lg)',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'white',
                                        textAlign: 'center',
                                        minWidth: 180
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>AI Service</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Face Recognition</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'database' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                3. Database Schema
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                                {[
                                    { name: 'organizations', fields: ['id', 'name', 'code', 'settings'], color: '#3b82f6' },
                                    { name: 'units', fields: ['id', 'name', 'level', 'organization_id', 'parent_id'], color: '#3b82f6' },
                                    { name: 'users', fields: ['id', 'email', 'password_hash', 'full_name', 'unit_id'], color: '#3b82f6' },
                                    { name: 'persons', fields: ['id', 'full_name', 'employee_id', 'email', 'unit_id', 'enrollment_status'], color: '#8b5cf6' },
                                    { name: 'face_profiles', fields: ['id', 'person_id', 'embedding', 'image_url'], color: '#8b5cf6' },
                                    { name: 'rooms', fields: ['id', 'name', 'location', 'capacity', 'unit_id'], color: '#22c55e' },
                                    { name: 'cameras', fields: ['id', 'name', 'rtsp_url', 'type', 'status', 'room_id'], color: '#22c55e' },
                                    { name: 'sessions', fields: ['id', 'title', 'start_time', 'end_time', 'status', 'room_id', 'host_id'], color: '#f97316' },
                                    { name: 'session_roster', fields: ['id', 'session_id', 'person_id'], color: '#f97316' },
                                    { name: 'attendance_records', fields: ['id', 'session_id', 'person_id', 'check_in_time', 'status'], color: '#f97316' },
                                    { name: 'ai_events', fields: ['id', 'camera_id', 'session_id', 'event_type', 'detection_data'], color: '#ec4899' },
                                ].map(table => (
                                    <div key={table.name} style={{
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            background: table.color,
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.8rem'
                                        }}>
                                            {table.name}
                                        </div>
                                        <div style={{ padding: 'var(--space-sm)' }}>
                                            {table.fields.map(field => (
                                                <div key={field} style={{
                                                    padding: '2px var(--space-sm)',
                                                    fontSize: '0.7rem',
                                                    color: 'var(--color-text-muted)',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {field}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'api' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                4. API Endpoints
                            </h2>

                            {[
                                {
                                    title: 'Authentication',
                                    endpoints: [
                                        { method: 'POST', path: '/api/auth/login', desc: 'Đăng nhập' },
                                        { method: 'GET', path: '/api/auth/me', desc: 'Lấy thông tin user' },
                                        { method: 'POST', path: '/api/auth/change-password', desc: 'Đổi mật khẩu' },
                                    ]
                                },
                                {
                                    title: 'Sessions',
                                    endpoints: [
                                        { method: 'GET', path: '/api/sessions', desc: 'Danh sách buổi' },
                                        { method: 'POST', path: '/api/sessions', desc: 'Tạo buổi mới' },
                                        { method: 'GET', path: '/api/sessions/:id', desc: 'Chi tiết buổi' },
                                        { method: 'POST', path: '/api/sessions/:id/start', desc: 'Bắt đầu buổi' },
                                        { method: 'POST', path: '/api/sessions/:id/end', desc: 'Kết thúc buổi' },
                                    ]
                                },
                                {
                                    title: 'Attendance',
                                    endpoints: [
                                        { method: 'GET', path: '/api/attendance/session/:id', desc: 'Điểm danh theo buổi' },
                                        { method: 'POST', path: '/api/attendance/checkin', desc: 'Điểm danh thủ công' },
                                    ]
                                },
                                {
                                    title: 'Persons',
                                    endpoints: [
                                        { method: 'GET', path: '/api/persons', desc: 'Danh sách nhân sự' },
                                        { method: 'POST', path: '/api/persons', desc: 'Thêm nhân sự' },
                                    ]
                                },
                                {
                                    title: 'Reports',
                                    endpoints: [
                                        { method: 'GET', path: '/api/reports/dashboard', desc: 'Dashboard stats' },
                                        { method: 'GET', path: '/api/reports/session/:id', desc: 'Báo cáo buổi' },
                                    ]
                                },
                            ].map(group => (
                                <div key={group.title} style={{ marginBottom: 'var(--space-xl)' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
                                        {group.title}
                                    </h3>
                                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        {group.endpoints.map((ep, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-md)',
                                                padding: 'var(--space-sm) var(--space-md)',
                                                borderBottom: i < group.endpoints.length - 1 ? '1px solid var(--color-border)' : 'none'
                                            }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    background: ep.method === 'GET' ? '#22c55e' : ep.method === 'POST' ? '#3b82f6' : '#f97316',
                                                    color: 'white',
                                                    minWidth: 40,
                                                    textAlign: 'center'
                                                }}>
                                                    {ep.method}
                                                </span>
                                                <code style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', flex: 1 }}>
                                                    {ep.path}
                                                </code>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {ep.desc}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === 'frontend' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                5. Frontend Structure
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                        📁 components/
                                    </h3>
                                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                                        {['Layout.tsx', 'Modal.tsx', 'ConfirmDialog.tsx', 'CreateSessionModal.tsx', 'CreatePersonModal.tsx', 'CreateRoomModal.tsx', 'CreateCameraModal.tsx'].map(f => (
                                            <div key={f} style={{ padding: '4px 0', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                        📁 pages/
                                    </h3>
                                    <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                                        {['Login.tsx', 'Dashboard.tsx', 'Sessions.tsx', 'SessionDetail.tsx', 'Persons.tsx', 'Rooms.tsx', 'Cameras.tsx', 'Reports.tsx', 'Settings.tsx', 'UnknownFaces.tsx'].map(f => (
                                            <div key={f} style={{ padding: '4px 0', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'workflow' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                6. Luồng hoạt động
                            </h2>

                            <div style={{ marginBottom: 'var(--space-xl)' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                    Luồng điểm danh tự động
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    flexWrap: 'wrap',
                                    padding: 'var(--space-lg)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)'
                                }}>
                                    {['📷 Camera', '→', '🤖 AI Service', '→', '🔍 Detect Face', '→', '💾 Backend', '→', '✅ Match Profile', '→', '📡 WebSocket', '→', '👤 Frontend Update'].map((step, i) => (
                                        <span key={i} style={{
                                            padding: step === '→' ? '0' : 'var(--space-sm) var(--space-md)',
                                            background: step === '→' ? 'transparent' : 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.8rem',
                                            color: step === '→' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                            border: step === '→' ? 'none' : '1px solid var(--color-border)'
                                        }}>
                                            {step}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                    Luồng tạo buổi điểm danh
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    flexWrap: 'wrap',
                                    padding: 'var(--space-lg)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)'
                                }}>
                                    {['👤 User Click', '→', '📝 Modal Form', '→', '📤 POST /sessions', '→', '💾 Insert DB', '→', '✅ Success', '→', '🔄 Refresh List'].map((step, i) => (
                                        <span key={i} style={{
                                            padding: step === '→' ? '0' : 'var(--space-sm) var(--space-md)',
                                            background: step === '→' ? 'transparent' : 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.8rem',
                                            color: step === '→' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                            border: step === '→' ? 'none' : '1px solid var(--color-border)'
                                        }}>
                                            {step}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                7. Bảo mật
                            </h2>

                            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                {[
                                    { icon: '🔐', label: 'Authentication', desc: 'JWT tokens với expiry time' },
                                    { icon: '👥', label: 'Authorization', desc: 'Role-based (super_admin, admin, user)' },
                                    { icon: '🔒', label: 'Password', desc: 'Hashed với bcrypt' },
                                    { icon: '🌐', label: 'API', desc: 'CORS configured, rate limiting' },
                                    { icon: '🏢', label: 'Data Isolation', desc: 'Multi-tenant isolation by organization_id' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
