import { useState } from 'react';
import { FileText, Database, Server, Layout, Shield, Workflow, Layers, Users, Zap, Globe, Lock, Clock, CheckCircle, Target } from 'lucide-react';
import Mermaid from '../components/Mermaid';

export default function SystemDesign() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: 'Tổng quan', icon: FileText },
        { id: 'architecture', label: 'Kiến trúc', icon: Server },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'api', label: 'API Endpoints', icon: Layers },
        { id: 'workflow', label: 'Luồng nghiệp vụ', icon: Workflow },
        { id: 'future', label: 'Tính năng tương lai', icon: Target },
        { id: 'security', label: 'Bảo mật', icon: Shield },
    ];

    // === ARCHITECTURE DIAGRAM ===
    const architectureDiagram = `
flowchart TB
    subgraph ClientLayer[Client Layer]
        Browser[Web Browser]
        MobileApp[Mobile App]
    end
    
    subgraph FrontendLayer[Frontend Layer - React + Vite]
        ReactApp[React 18 Application]
        Router[React Router]
        AuthContext[Auth Context]
        ThemeContext[Theme Context]
        ApiClient[API Client]
        WebSocketClient[WebSocket Client]
    end
    
    subgraph BackendLayer[Backend Layer - Bun + Hono]
        RestAPI[REST API Server]
        WebSocketServer[WebSocket Server]
        AuthMiddleware[JWT Auth Middleware]
        RBACMiddleware[Permission Middleware]
        RouteHandlers[Route Handlers]
    end
    
    subgraph DataLayer[Data Layer]
        DrizzleORM[Drizzle ORM]
        PostgreSQL[(PostgreSQL Database)]
        Redis[(Redis Cache)]
        ObjectStorage[(Object Storage)]
    end
    
    subgraph AILayer[AI Processing Layer]
        AIGateway[AI Gateway]
        FaceDetection[Face Detection Service]
        FaceRecognition[Face Recognition Service]
        EmbeddingDB[(Vector Database)]
    end
    
    subgraph HardwareLayer[Hardware Layer]
        IPCameras[IP Cameras]
        NVR[Network Video Recorder]
    end
    
    Browser --> ReactApp
    MobileApp --> ReactApp
    ReactApp --> Router
    Router --> AuthContext
    AuthContext --> ApiClient
    AuthContext --> WebSocketClient
    
    ApiClient --> RestAPI
    WebSocketClient <--> WebSocketServer
    
    RestAPI --> AuthMiddleware
    AuthMiddleware --> RBACMiddleware
    RBACMiddleware --> RouteHandlers
    RouteHandlers --> DrizzleORM
    DrizzleORM --> PostgreSQL
    RouteHandlers --> Redis
    RouteHandlers --> ObjectStorage
    
    IPCameras --> NVR
    NVR --> AIGateway
    AIGateway --> FaceDetection
    FaceDetection --> FaceRecognition
    FaceRecognition --> EmbeddingDB
    FaceRecognition --> RestAPI
    
    WebSocketServer --> RouteHandlers
`;

    // === DATABASE ERD ===
    const erdDiagram = `
erDiagram
    organizations ||--o{ units : contains
    organizations ||--o{ organization_settings : has
    
    units ||--o{ units : parent_child
    units ||--o{ users : has
    units ||--o{ persons : manages
    units ||--o{ rooms : contains
    
    users ||--o{ user_roles : has
    users ||--o{ sessions : hosts
    users ||--o{ audit_logs : creates
    users ||--o{ notifications : receives
    
    roles ||--o{ user_roles : assigned_to
    roles ||--o{ role_permissions : has
    permissions ||--o{ role_permissions : granted_by
    
    rooms ||--o{ cameras : has
    rooms ||--o{ sessions : hosts
    rooms ||--o{ room_schedules : has
    
    cameras ||--o{ device_statuses : reports
    cameras ||--o{ recognition_events : generates
    cameras ||--o{ unknown_faces : captures
    
    sessions ||--o{ session_rosters : has
    sessions ||--o{ attendance_records : tracks
    sessions ||--o{ recognition_events : receives
    sessions ||--o{ unknown_faces : captures
    sessions ||--o{ session_reports : generates
    
    persons ||--o{ session_rosters : participates
    persons ||--o{ attendance_records : has
    persons ||--o{ face_profiles : enrolled_with
    persons ||--o{ person_groups : belongs_to

    organizations {
        uuid id PK
        string name
        string code
        json settings
        timestamp created_at
    }
    
    units {
        uuid id PK
        string name
        int level
        uuid organization_id FK
        uuid parent_id FK
    }
    
    users {
        uuid id PK
        string email
        string password_hash
        string full_name
        enum status
        uuid unit_id FK
    }
    
    persons {
        uuid id PK
        string full_name
        string employee_id
        string email
        string phone
        uuid unit_id FK
        enum status
    }
    
    sessions {
        uuid id PK
        string title
        text description
        datetime start_time
        datetime end_time
        int grace_period
        enum status
        uuid room_id FK
        uuid host_id FK
    }
    
    attendance_records {
        uuid id PK
        uuid session_id FK
        uuid person_id FK
        enum status
        datetime checkin_time
        datetime checkout_time
        boolean is_manual
    }
`;

    // === MAIN BUSINESS FLOW ===
    const mainBusinessFlow = `
flowchart TD
    subgraph Phase1[Phase 1: Setup]
        A1[Tạo Organization] --> A2[Tạo Units/Phòng ban]
        A2 --> A3[Import Nhân sự]
        A3 --> A4[Enroll Khuôn mặt]
        A4 --> A5[Setup Phòng và Camera]
    end
    
    subgraph Phase2[Phase 2: Operations]
        B1[Tạo Session điểm danh] --> B2[Chọn Roster từ nhân sự]
        B2 --> B3[Bắt đầu Session]
        B3 --> B4{Điểm danh}
        B4 -->|Tự động| B5[AI nhận diện từ Camera]
        B4 -->|Thủ công| B6[Admin check-in]
        B5 --> B7[Cập nhật Attendance]
        B6 --> B7
        B7 --> B8[Kết thúc Session]
    end
    
    subgraph Phase3[Phase 3: Review]
        C1[Xem báo cáo buổi] --> C2[Review Unknown Faces]
        C2 --> C3{Nhận diện được?}
        C3 -->|Có| C4[Assign cho Person]
        C3 -->|Không| C5[Ignore hoặc Add mới]
        C4 --> C6[Cập nhật Attendance]
        C5 --> C6
        C6 --> C7[Lock Session]
    end
    
    subgraph Phase4[Phase 4: Reports]
        D1[Dashboard tổng quan] --> D2[Báo cáo theo Session]
        D2 --> D3[Báo cáo theo Person]
        D3 --> D4[Báo cáo theo Unit]
        D4 --> D5[Export Excel/PDF]
    end
    
    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
`;

    // === AUTO ATTENDANCE FLOW ===
    const autoAttendanceFlow = `
sequenceDiagram
    autonumber
    participant Cam as IP Camera
    participant NVR as NVR/Stream
    participant AI as AI Service
    participant API as Backend API
    participant DB as Database
    participant WS as WebSocket
    participant UI as Frontend
    
    Note over Cam,UI: Session đang chạy (status = running)
    
    Cam->>NVR: Stream RTSP
    NVR->>AI: Forward frames
    AI->>AI: Detect faces in frame
    AI->>AI: Extract face embeddings
    AI->>AI: Search matching in vector DB
    
    alt Match found - confidence > threshold
        AI->>API: POST /ai-events/recognition
        API->>DB: Save recognition_event
        API->>DB: Get session info
        API->>API: Calculate status (present/late)
        API->>DB: Update attendance_record
        API->>WS: Broadcast to session channel
        WS->>UI: Push realtime update
        UI->>UI: Update attendance list
        UI->>UI: Show success notification
    else No match - Unknown face
        AI->>API: POST /ai-events/unknown
        API->>DB: Save unknown_face record
        API->>DB: Save snapshot to storage
        API->>WS: Broadcast unknown alert
        WS->>UI: Push alert notification
        UI->>UI: Show pending review badge
    end
`;

    // === SESSION LIFECYCLE ===
    const sessionLifecycle = `
stateDiagram-v2
    [*] --> DRAFT: Create session
    
    DRAFT --> SCHEDULED: Confirm roster
    DRAFT --> [*]: Delete
    
    SCHEDULED --> RUNNING: Start session
    SCHEDULED --> CANCELLED: Cancel
    SCHEDULED --> SCHEDULED: Edit details
    
    RUNNING --> PAUSED: Pause
    RUNNING --> ENDED: End session
    
    PAUSED --> RUNNING: Resume
    PAUSED --> ENDED: End session
    
    ENDED --> REVIEWING: Review attendance
    ENDED --> LOCKED: Lock immediately
    
    REVIEWING --> LOCKED: Approve and lock
    REVIEWING --> ENDED: Need more review
    
    LOCKED --> [*]: Archived
    CANCELLED --> [*]: Archived
    
    note right of DRAFT
        - Có thể chỉnh sửa mọi thứ
        - Chưa thông báo ai
    end note
    
    note right of SCHEDULED
        - Đã gửi thông báo
        - Chỉ sửa được roster
    end note
    
    note right of RUNNING
        - Camera đang hoạt động
        - AI đang nhận diện
        - Realtime cập nhật
    end note
    
    note right of LOCKED
        - Không thể thay đổi
        - Dùng cho audit
        - Export report
    end note
`;

    // === PERSON ENROLLMENT FLOW ===
    const enrollmentFlow = `
sequenceDiagram
    autonumber
    participant Admin as Admin
    participant UI as Frontend
    participant API as Backend
    participant Storage as Object Storage
    participant AI as AI Service
    participant VDB as Vector Database
    
    Admin->>UI: Upload ảnh khuôn mặt
    UI->>UI: Preview và crop
    UI->>API: POST /persons/:id/faces
    API->>Storage: Upload image
    Storage-->>API: Image URL
    
    API->>AI: Request face embedding
    AI->>AI: Detect face in image
    AI->>AI: Check quality score
    
    alt Quality OK
        AI->>AI: Generate embedding vector
        AI->>VDB: Store embedding
        VDB-->>AI: Embedding reference
        AI-->>API: Success + embedding_ref
        API->>API: Create face_profile
        API-->>UI: Enrollment success
        UI->>UI: Show enrolled status
    else Quality Poor
        AI-->>API: Quality too low
        API-->>UI: Error - need better photo
        UI->>UI: Show retry message
    end
`;

    // === UNKNOWN FACE REVIEW FLOW ===
    const unknownFaceFlow = `
sequenceDiagram
    autonumber
    participant Admin as Reviewer
    participant UI as Frontend
    participant API as Backend
    participant DB as Database
    participant AI as AI Service
    
    Admin->>UI: Open Unknown Faces page
    UI->>API: GET /unknown-faces?status=pending
    API-->>UI: List of pending faces
    
    UI->>UI: Display face images with session info
    
    Admin->>UI: Select unknown face
    UI->>API: GET /persons (search)
    API-->>UI: Matching person suggestions
    
    alt Recognize the person
        Admin->>UI: Select matching person
        UI->>API: POST /unknown/:id/assign
        API->>DB: Update unknown_face status
        API->>DB: Create recognition_event
        API->>DB: Update attendance_record
        API->>AI: Optionally add to training
        API-->>UI: Assigned successfully
    else Do not recognize
        Admin->>UI: Click Ignore
        UI->>API: POST /unknown/:id/ignore
        API->>DB: Update status = ignored
        API-->>UI: Ignored
    else New person - Add to system
        Admin->>UI: Click Add New Person
        UI->>UI: Open create person modal
        Admin->>UI: Fill person info
        UI->>API: POST /persons + assign unknown
        API->>DB: Create person
        API->>DB: Create face_profile from unknown
        API->>DB: Update attendance
        API-->>UI: Person created and assigned
    end
`;

    // === REPORTING FLOW ===
    const reportingFlow = `
flowchart TD
    subgraph DataSources[Data Sources]
        S1[Sessions]
        S2[Attendance Records]
        S3[Persons]
        S4[Units]
        S5[Recognition Events]
    end
    
    subgraph ReportTypes[Report Types]
        R1[Dashboard Summary]
        R2[Session Report]
        R3[Person Report]
        R4[Unit Report]
        R5[Trend Analysis]
        R6[Exception Report]
    end
    
    subgraph Outputs[Outputs]
        O1[Web Dashboard]
        O2[Excel Export]
        O3[PDF Report]
        O4[Email Report]
        O5[API Integration]
    end
    
    S1 --> R1
    S1 --> R2
    S2 --> R1
    S2 --> R2
    S2 --> R3
    S2 --> R4
    S3 --> R3
    S4 --> R4
    S2 --> R5
    S5 --> R5
    S2 --> R6
    
    R1 --> O1
    R2 --> O1
    R2 --> O2
    R2 --> O3
    R3 --> O2
    R4 --> O2
    R4 --> O3
    R5 --> O1
    R5 --> O4
    R6 --> O4
    R1 --> O5
`;

    // === FUTURE: NOTIFICATION FLOW ===
    const notificationFlow = `
flowchart TD
    subgraph Triggers[Trigger Events]
        T1[Session sắp bắt đầu]
        T2[Điểm danh thành công]
        T3[Đi muộn]
        T4[Vắng mặt]
        T5[Unknown face detected]
        T6[Camera offline]
        T7[Report ready]
    end
    
    subgraph Processing[Notification Processing]
        P1[Event Handler]
        P2[Template Engine]
        P3[User Preferences]
        P4[Notification Queue]
    end
    
    subgraph Channels[Delivery Channels]
        C1[In-app Notification]
        C2[Email]
        C3[SMS]
        C4[Push Notification]
        C5[Zalo/Telegram Bot]
    end
    
    subgraph Recipients[Recipients]
        R1[Session Host]
        R2[Unit Admin]
        R3[Person/Employee]
        R4[Super Admin]
    end
    
    T1 --> P1
    T2 --> P1
    T3 --> P1
    T4 --> P1
    T5 --> P1
    T6 --> P1
    T7 --> P1
    
    P1 --> P2
    P2 --> P3
    P3 --> P4
    
    P4 --> C1
    P4 --> C2
    P4 --> C3
    P4 --> C4
    P4 --> C5
    
    C1 --> R1
    C1 --> R2
    C2 --> R1
    C2 --> R3
    C3 --> R3
    C4 --> R1
    C4 --> R2
    C5 --> R3
`;

    // === FUTURE: MOBILE APP FLOW ===
    const mobileFlow = `
flowchart TD
    subgraph MobileApp[Mobile Application]
        M1[Login Screen]
        M2[Dashboard]
        M3[My Sessions]
        M4[Self Check-in]
        M5[My Attendance History]
        M6[Notifications]
        M7[Profile Settings]
    end
    
    subgraph SelfCheckin[Self Check-in Flow]
        SC1[Open Session]
        SC2[Face Capture]
        SC3[Liveness Detection]
        SC4[Face Verification]
        SC5[GPS Verification]
        SC6[Submit Check-in]
    end
    
    subgraph Backend[Backend Services]
        B1[Auth Service]
        B2[Session Service]
        B3[Attendance Service]
        B4[AI Verification]
        B5[Location Service]
    end
    
    M1 --> B1
    M2 --> B2
    M3 --> B2
    M4 --> SC1
    
    SC1 --> SC2
    SC2 --> SC3
    SC3 --> SC4
    SC4 --> B4
    B4 --> SC5
    SC5 --> B5
    B5 --> SC6
    SC6 --> B3
    
    M5 --> B3
    M6 --> B1
    M7 --> B1
`;

    // === FUTURE: INTEGRATION FLOW ===
    const integrationFlow = `
flowchart LR
    subgraph SmartAttendance[Smart Attendance System]
        Core[Core System]
        API[REST API]
        Webhooks[Webhook Events]
    end
    
    subgraph HRSystems[HR Systems]
        HR1[SAP HR]
        HR2[Oracle HCM]
        HR3[Custom HRIS]
    end
    
    subgraph PayrollSystems[Payroll]
        P1[Payroll System]
        P2[Timesheet Export]
    end
    
    subgraph AccessControl[Access Control]
        AC1[Door Access System]
        AC2[Turnstile Gates]
        AC3[Parking System]
    end
    
    subgraph Analytics[Analytics]
        A1[BI Dashboard]
        A2[Data Warehouse]
        A3[Custom Reports]
    end
    
    subgraph Communication[Communication]
        C1[Email Server]
        C2[SMS Gateway]
        C3[Zalo OA]
        C4[Microsoft Teams]
    end
    
    Core --> API
    Core --> Webhooks
    
    HR1 <--> API
    HR2 <--> API
    HR3 <--> API
    
    API --> P1
    API --> P2
    
    AC1 --> API
    AC2 --> API
    AC3 --> API
    
    Webhooks --> A1
    API --> A2
    A2 --> A3
    
    Webhooks --> C1
    Webhooks --> C2
    Webhooks --> C3
    Webhooks --> C4
`;

    // === FUTURE: ANALYTICS FLOW ===
    const analyticsFlow = `
flowchart TD
    subgraph DataCollection[Data Collection]
        D1[Attendance Records]
        D2[Recognition Events]
        D3[Session History]
        D4[User Actions]
    end
    
    subgraph Processing[Data Processing]
        P1[ETL Pipeline]
        P2[Aggregation Engine]
        P3[ML Models]
    end
    
    subgraph Analytics[Analytics Features]
        A1[Attendance Trends]
        A2[Punctuality Scores]
        A3[Anomaly Detection]
        A4[Prediction Models]
        A5[Department Comparison]
        A6[Peak Time Analysis]
    end
    
    subgraph Insights[Business Insights]
        I1[Late Pattern Detection]
        I2[Absence Prediction]
        I3[Optimal Scheduling]
        I4[Performance Correlation]
    end
    
    D1 --> P1
    D2 --> P1
    D3 --> P1
    D4 --> P1
    
    P1 --> P2
    P2 --> A1
    P2 --> A2
    P2 --> A5
    P2 --> A6
    
    P1 --> P3
    P3 --> A3
    P3 --> A4
    
    A1 --> I1
    A3 --> I1
    A4 --> I2
    A6 --> I3
    A2 --> I4
`;

    return (
        <div>
            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl) var(--space-xxl)',
                marginBottom: 'var(--space-xl)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)',
                    pointerEvents: 'none'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9, marginBottom: 8 }}>
                        System Design Document
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Smart Attendance System
                    </h1>
                    <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: 600 }}>
                        Hệ thống điểm danh thông minh sử dụng AI nhận diện khuôn mặt, cập nhật realtime qua WebSocket
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                        {[
                            { icon: Users, label: '15 Database Tables' },
                            { icon: Layers, label: '50+ API Endpoints' },
                            { icon: Globe, label: 'Multi-tenant' },
                            { icon: Lock, label: 'JWT + RBAC' },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: 'var(--radius-lg)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.85rem'
                            }}>
                                <item.icon size={16} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-lg)' }}>
                {/* Navigation */}
                <div className="card" style={{ padding: 'var(--space-sm)', height: 'fit-content', position: 'sticky', top: 'var(--space-lg)' }}>
                    <div style={{ padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                            Nội dung
                        </div>
                    </div>
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
                                fontSize: '0.85rem',
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                1. Tổng quan Hệ thống
                            </h2>

                            <div style={{
                                padding: 'var(--space-lg)',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-xl)',
                                borderLeft: '4px solid var(--color-primary)'
                            }}>
                                <p style={{ color: 'var(--color-text-primary)', lineHeight: 1.8, margin: 0 }}>
                                    <strong>Smart Attendance System</strong> là hệ thống điểm danh thông minh sử dụng công nghệ nhận diện khuôn mặt (Face Recognition) tích hợp AI để tự động hóa quá trình chấm công/điểm danh. Hệ thống hỗ trợ cập nhật realtime qua WebSocket và có kiến trúc multi-tenant cho phép nhiều tổ chức sử dụng.
                                </p>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                                Mục tiêu hệ thống
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                                {[
                                    { icon: Zap, title: 'Tự động hóa', desc: 'Điểm danh tự động bằng AI, giảm thiểu thao tác thủ công' },
                                    { icon: CheckCircle, title: 'Chính xác', desc: 'Tracking đi muộn/vắng mặt với grace period configurable' },
                                    { icon: Clock, title: 'Realtime', desc: 'Cập nhật kết quả theo thời gian thực qua WebSocket' },
                                    { icon: Users, title: 'Multi-tenant', desc: 'Hỗ trợ nhiều tổ chức với data isolation hoàn toàn' },
                                ].map(item => (
                                    <div key={item.title} style={{
                                        padding: 'var(--space-lg)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                            <div style={{ padding: 8, background: 'rgba(139, 92, 246, 0.15)', borderRadius: 'var(--radius-md)' }}>
                                                <item.icon size={18} color="var(--color-primary)" />
                                            </div>
                                            <strong style={{ color: 'var(--color-text-primary)' }}>{item.title}</strong>
                                        </div>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                                Tech Stack
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                                {[
                                    { label: 'Frontend', value: 'React 18 + TypeScript + Vite', color: '#61dafb' },
                                    { label: 'Backend', value: 'Bun + Hono Framework', color: '#e0234e' },
                                    { label: 'Database', value: 'PostgreSQL + Drizzle ORM', color: '#336791' },
                                    { label: 'Auth', value: 'JWT + bcrypt + RBAC', color: '#22c55e' },
                                    { label: 'Realtime', value: 'WebSocket (Bun native)', color: '#8b5cf6' },
                                    { label: 'AI Service', value: 'Face Recognition API', color: '#f97316' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        borderTop: `3px solid ${item.color}`
                                    }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'architecture' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                2. Kiến trúc Hệ thống
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                Kiến trúc đa lớp: Client, Frontend, Backend, Data, AI Processing, Hardware
                            </p>
                            <Mermaid chart={architectureDiagram} id="arch-diagram" />
                        </div>
                    )}

                    {activeSection === 'database' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                                3. Database Schema
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                Entity Relationship Diagram - Quan hệ giữa các bảng chính
                            </p>
                            <Mermaid chart={erdDiagram} id="erd-diagram" />
                        </div>
                    )}

                    {activeSection === 'api' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                                4. API Endpoints
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                RESTful API với 11 nhóm, 50+ endpoints
                            </p>

                            {[
                                {
                                    title: 'Authentication',
                                    endpoints: [
                                        { method: 'POST', path: '/api/auth/login', desc: 'Đăng nhập' },
                                        { method: 'POST', path: '/api/auth/register', desc: 'Đăng ký' },
                                        { method: 'GET', path: '/api/auth/me', desc: 'Thông tin user' },
                                        { method: 'POST', path: '/api/auth/change-password', desc: 'Đổi mật khẩu' },
                                    ]
                                },
                                {
                                    title: 'Sessions',
                                    endpoints: [
                                        { method: 'GET', path: '/api/sessions', desc: 'Danh sách' },
                                        { method: 'POST', path: '/api/sessions', desc: 'Tạo mới' },
                                        { method: 'GET', path: '/api/sessions/:id', desc: 'Chi tiết' },
                                        { method: 'POST', path: '/api/sessions/:id/start', desc: 'Bắt đầu' },
                                        { method: 'POST', path: '/api/sessions/:id/end', desc: 'Kết thúc' },
                                        { method: 'POST', path: '/api/sessions/:id/lock', desc: 'Khóa' },
                                    ]
                                },
                                {
                                    title: 'Attendance',
                                    endpoints: [
                                        { method: 'GET', path: '/api/attendance/session/:id', desc: 'Theo buổi' },
                                        { method: 'GET', path: '/api/attendance/person/:id', desc: 'Theo người' },
                                        { method: 'POST', path: '/api/attendance/checkin', desc: 'Check-in' },
                                        { method: 'POST', path: '/api/attendance/checkout', desc: 'Check-out' },
                                    ]
                                },
                                {
                                    title: 'Persons',
                                    endpoints: [
                                        { method: 'GET', path: '/api/persons', desc: 'Danh sách' },
                                        { method: 'POST', path: '/api/persons', desc: 'Thêm mới' },
                                        { method: 'POST', path: '/api/persons/import', desc: 'Import' },
                                        { method: 'POST', path: '/api/persons/:id/faces', desc: 'Enroll face' },
                                    ]
                                },
                                {
                                    title: 'Reports',
                                    endpoints: [
                                        { method: 'GET', path: '/api/reports/dashboard', desc: 'Dashboard' },
                                        { method: 'GET', path: '/api/reports/session/:id', desc: 'Báo cáo buổi' },
                                        { method: 'GET', path: '/api/reports/person/:id', desc: 'Báo cáo người' },
                                        { method: 'GET', path: '/api/reports/export/session/:id', desc: 'Export' },
                                    ]
                                },
                                {
                                    title: 'AI Events',
                                    endpoints: [
                                        { method: 'POST', path: '/api/ai-events/recognition', desc: 'Nhận diện' },
                                        { method: 'POST', path: '/api/ai-events/unknown', desc: 'Unknown face' },
                                        { method: 'POST', path: '/api/ai-events/unknown/:id/assign', desc: 'Assign' },
                                        { method: 'POST', path: '/api/ai-events/unknown/:id/ignore', desc: 'Ignore' },
                                    ]
                                },
                            ].map(group => (
                                <div key={group.title} style={{ marginBottom: 'var(--space-lg)' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
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
                                                    padding: '3px 8px',
                                                    borderRadius: 4,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    background: ep.method === 'GET' ? '#22c55e' : '#3b82f6',
                                                    color: 'white',
                                                    minWidth: 45,
                                                    textAlign: 'center'
                                                }}>
                                                    {ep.method}
                                                </span>
                                                <code style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', flex: 1 }}>
                                                    {ep.path}
                                                </code>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    {ep.desc}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === 'workflow' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                5. Luồng nghiệp vụ
                            </h2>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                5.1 Tổng quan quy trình nghiệp vụ
                            </h3>
                            <Mermaid chart={mainBusinessFlow} id="main-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                5.2 Luồng điểm danh tự động (AI)
                            </h3>
                            <Mermaid chart={autoAttendanceFlow} id="auto-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                5.3 Vòng đời Session (State Machine)
                            </h3>
                            <Mermaid chart={sessionLifecycle} id="session-lifecycle" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                5.4 Luồng Enroll khuôn mặt
                            </h3>
                            <Mermaid chart={enrollmentFlow} id="enrollment-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                5.5 Luồng xử lý Unknown Face
                            </h3>
                            <Mermaid chart={unknownFaceFlow} id="unknown-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                5.6 Hệ thống báo cáo
                            </h3>
                            <Mermaid chart={reportingFlow} id="reporting-flow" />
                        </div>
                    )}

                    {activeSection === 'future' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                6. Tính năng tương lai
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                Các tính năng sẽ được phát triển để hoàn thiện hệ thống
                            </p>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>
                                6.1 Hệ thống thông báo (Notification System)
                            </h3>
                            <Mermaid chart={notificationFlow} id="notification-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                6.2 Mobile Application
                            </h3>
                            <Mermaid chart={mobileFlow} id="mobile-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                6.3 Tích hợp hệ thống bên ngoài (Integration)
                            </h3>
                            <Mermaid chart={integrationFlow} id="integration-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-primary)' }}>
                                6.4 Analytics và Business Intelligence
                            </h3>
                            <Mermaid chart={analyticsFlow} id="analytics-flow" />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 'var(--space-xl) 0 var(--space-md)', color: 'var(--color-text-primary)' }}>
                                Roadmap phát triển
                            </h3>
                            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                {[
                                    { phase: 'Phase 1 - Core', status: 'Done', items: ['Authentication & Authorization', 'Session Management', 'Manual Attendance', 'Basic Reports'] },
                                    { phase: 'Phase 2 - AI Integration', status: 'In Progress', items: ['Face Recognition API', 'Auto Attendance', 'Unknown Face Review', 'Real-time WebSocket'] },
                                    { phase: 'Phase 3 - Advanced Features', status: 'Planned', items: ['Notification System', 'Advanced Reports', 'Export PDF/Excel', 'Audit Logging'] },
                                    { phase: 'Phase 4 - Mobile & Integration', status: 'Future', items: ['Mobile App (React Native)', 'Self Check-in với GPS', 'HR System Integration', 'Payroll Export'] },
                                    { phase: 'Phase 5 - Analytics', status: 'Future', items: ['BI Dashboard', 'Trend Analysis', 'Anomaly Detection', 'Predictive Models'] },
                                ].map(phase => (
                                    <div key={phase.phase} style={{
                                        padding: 'var(--space-lg)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        borderLeft: `4px solid ${phase.status === 'Done' ? '#22c55e' : phase.status === 'In Progress' ? '#f59e0b' : '#6b7280'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                            <strong style={{ color: 'var(--color-text-primary)' }}>{phase.phase}</strong>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: phase.status === 'Done' ? 'rgba(34, 197, 94, 0.2)' : phase.status === 'In Progress' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                                color: phase.status === 'Done' ? '#22c55e' : phase.status === 'In Progress' ? '#f59e0b' : '#6b7280'
                                            }}>
                                                {phase.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                            {phase.items.map(item => (
                                                <span key={item} style={{
                                                    padding: '4px 8px',
                                                    background: 'var(--color-bg-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-text-secondary)'
                                                }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                                7. Bảo mật
                            </h2>

                            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                {[
                                    { label: 'Authentication', desc: 'JWT tokens với expiry 7 ngày, Bearer token trong Authorization header' },
                                    { label: 'Authorization', desc: 'Role-based Access Control: super_admin, admin, host, user với permission matrix' },
                                    { label: 'Password Security', desc: 'Hashed với bcrypt (cost factor 10), không lưu plaintext, enforce complexity' },
                                    { label: 'Permission System', desc: 'Format resource:action (sessions:create, attendance:update), inheritance support' },
                                    { label: 'API Security', desc: 'CORS configured, Rate limiting, Input validation với Zod schema' },
                                    { label: 'Data Isolation', desc: 'Multi-tenant isolation by organization_id, Row-level security' },
                                    { label: 'Audit Logging', desc: 'Ghi nhận mọi thay đổi: user, action, entity, old/new value, IP address, timestamp' },
                                    { label: 'AI API Security', desc: 'API Key authentication cho AI service, request signing, replay protection' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-lg)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
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
