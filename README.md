# Smart App - Mô tả Thiết kế Hệ thống

## 1. Tổng quan
## 2. Kiến trúc hệ thống

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Web UI]
        API_Client[API Client]
    end

    subgraph Backend["Backend (Bun + Hono)"]
        REST[REST API]
        WS[WebSocket Server]
        Auth[JWT Authentication]
    end

    subgraph Database["Database"]
        PG[(PostgreSQL)]
    end

    subgraph AI_Service["AI Service (External)"]
        FR[Face Recognition API]
    end

    subgraph Hardware["Hardware"]
        CAM[IP Cameras]
    end

    UI --> API_Client
    API_Client --> REST
    API_Client <--> WS
    REST --> Auth
    REST --> PG
    WS --> PG
    CAM --> FR
    FR --> REST
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, React Router |
| **Backend** | Bun runtime, Hono framework, TypeScript |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **Realtime** | WebSocket (Bun native) |
| **AI** | External Face Recognition API |

---

## 4. Database Schema

```mermaid
erDiagram
    organizations ||--o{ units : has
    organizations ||--o{ users : has
    units ||--o{ users : has
    units ||--o{ persons : has
    units ||--o{ rooms : has
    rooms ||--o{ cameras : has
    rooms ||--o{ sessions : held_in
    users ||--o{ sessions : hosts
    sessions ||--o{ session_roster : has
    sessions ||--o{ attendance_records : has
    persons ||--o{ session_roster : in
    persons ||--o{ attendance_records : has
    persons ||--o{ face_profiles : has
    cameras ||--o{ ai_events : generates

    organizations {
        uuid id PK
        string name
        string code
        json settings
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
        uuid unit_id FK
        uuid organization_id FK
    }

    persons {
        uuid id PK
        string full_name
        string employee_id
        string email
        string phone
        uuid unit_id FK
        enum enrollment_status
    }

    rooms {
        uuid id PK
        string name
        string location
        int capacity
        uuid unit_id FK
    }

    cameras {
        uuid id PK
        string name
        string rtsp_url
        enum type
        enum status
        uuid room_id FK
        float threshold
    }

    sessions {
        uuid id PK
        string title
        string description
        datetime start_time
        datetime end_time
        int grace_period
        enum status
        uuid room_id FK
        uuid host_id FK
    }

    session_roster {
        uuid id PK
        uuid session_id FK
        uuid person_id FK
    }

    attendance_records {
        uuid id PK
        uuid session_id FK
        uuid person_id FK
        datetime check_in_time
        datetime check_out_time
        enum status
        string method
    }

    face_profiles {
        uuid id PK
        uuid person_id FK
        blob embedding
        string image_url
    }

    ai_events {
        uuid id PK
        uuid camera_id FK
        uuid session_id FK
        string event_type
        json detection_data
        datetime timestamp
    }
```

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Lấy thông tin user |
| POST | `/api/auth/change-password` | Đổi mật khẩu |

### Sessions (Buổi điểm danh)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/sessions` | Danh sách buổi |
| POST | `/api/sessions` | Tạo buổi mới |
| GET | `/api/sessions/:id` | Chi tiết buổi |
| POST | `/api/sessions/:id/start` | Bắt đầu buổi |
| POST | `/api/sessions/:id/end` | Kết thúc buổi |
| POST | `/api/sessions/:id/lock` | Khóa buổi |

### Attendance (Điểm danh)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/attendance/session/:id` | Điểm danh theo buổi |
| POST | `/api/attendance/checkin` | Điểm danh thủ công |

### Persons (Nhân sự)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/persons` | Danh sách nhân sự |
| POST | `/api/persons` | Thêm nhân sự |
| PUT | `/api/persons/:id` | Cập nhật |
| DELETE | `/api/persons/:id` | Xóa |

### Rooms & Cameras
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST | `/api/rooms` | CRUD phòng |
| GET/POST | `/api/cameras` | CRUD camera |
| POST | `/api/cameras/:id/test` | Test kết nối |

### Reports
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reports/dashboard` | Dashboard stats |
| GET | `/api/reports/session/:id` | Báo cáo buổi |
| GET | `/api/reports/export/session/:id` | Export Excel |

---

## 6. Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App layout với sidebar
│   │   ├── Modal.tsx           # Reusable modal
│   │   ├── ConfirmDialog.tsx   # Confirmation dialogs
│   │   └── Create*Modal.tsx    # CRUD modals
│   ├── pages/
│   │   ├── Login.tsx           # Đăng nhập
│   │   ├── Dashboard.tsx       # Tổng quan
│   │   ├── Sessions.tsx        # Quản lý buổi
│   │   ├── SessionDetail.tsx   # Chi tiết buổi
│   │   ├── Persons.tsx         # Quản lý nhân sự
│   │   ├── Rooms.tsx           # Quản lý phòng
│   │   ├── Cameras.tsx         # Quản lý camera
│   │   ├── Reports.tsx         # Báo cáo
│   │   ├── Settings.tsx        # Cài đặt
│   │   └── UnknownFaces.tsx    # Khuôn mặt lạ
│   ├── hooks/
│   │   ├── useAuth.tsx         # Authentication context
│   │   └── useTheme.tsx        # Theme context
│   ├── lib/
│   │   └── api.ts              # API client
│   └── styles/
│       └── index.css           # Design system
```

---

## 7. Luồng hoạt động

### 7.1 Luồng điểm danh tự động
```mermaid
sequenceDiagram
    participant Camera
    participant AI as AI Service
    participant Backend
    participant WS as WebSocket
    participant Frontend

    Camera->>AI: Stream video
    AI->>AI: Detect face
    AI->>Backend: POST /ai-events (face detected)
    Backend->>Backend: Match với face_profiles
    alt Nhận diện được
        Backend->>Backend: Tạo attendance_record
        Backend->>WS: Broadcast update
        WS->>Frontend: Realtime notification
    else Không nhận diện
        Backend->>Backend: Lưu unknown face
    end
```

### 7.2 Luồng tạo buổi điểm danh
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Click "Tạo buổi mới"
    Frontend->>Frontend: Hiện modal
    User->>Frontend: Nhập thông tin + chọn roster
    Frontend->>Backend: POST /sessions
    Backend->>DB: Insert session + roster
    DB-->>Backend: Success
    Backend-->>Frontend: Session created
    Frontend->>User: Cập nhật danh sách
```

---

## 8. Bảo mật

- **Authentication**: JWT tokens với expiry time
- **Authorization**: Role-based (super_admin, admin, user)
- **Password**: Hashed với bcrypt
- **API**: CORS configured, rate limiting
- **Data**: Multi-tenant isolation by organization_id

---

## 9. Scalability

- **Horizontal**: Multiple backend instances behind load balancer
- **Database**: Connection pooling, read replicas
- **AI**: Separate microservice, queue-based processing
- **Cache**: Redis for session data (future)
