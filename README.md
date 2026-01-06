# Smart APP

> Hệ thống điểm danh tự động bằng AI nhận diện khuôn mặt

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Bun + Hono + Drizzle ORM |
| **Frontend** | React 18 + Vite + TypeScript |
| **Database** | PostgreSQL |
| **Realtime** | WebSocket (Bun native) |
| **Styling** | Vanilla CSS (Custom Design System) |

## 📁 Project Structure

```
face-attendance/
├── backend/
│   ├── src/    
│   │   ├── db/
│   │   │   ├── schema.ts      # Drizzle schema (14 tables)
│   │   │   ├── index.ts       # DB connection
│   │   │   └── seed.ts        # Sample data
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT + RBAC
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── organizations.ts
│   │   │   ├── units.ts
│   │   │   ├── users.ts
│   │   │   ├── persons.ts
│   │   │   ├── rooms.ts
│   │   │   ├── cameras.ts
│   │   │   ├── sessions.ts
│   │   │   ├── attendance.ts
│   │   │   ├── ai-events.ts
│   │   │   └── reports.ts
│   │   └── index.ts           # Hono server
│   ├── drizzle.config.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.tsx
    │   ├── hooks/
    │   │   └── useAuth.tsx
    │   ├── lib/
    │   │   └── api.ts
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Sessions.tsx
    │   │   ├── SessionDetail.tsx
    │   │   ├── Persons.tsx
    │   │   ├── Rooms.tsx
    │   │   ├── Cameras.tsx
    │   │   └── Reports.tsx
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🛠️ Quick Start

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://postgresql.org/) >= 14

### Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Push schema to database
bun run db:push

# Seed sample data
bun run db:seed

# Start development server
bun run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

### Demo Login
- **Email**: `admin@demo.com`
- **Password**: `admin123`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/organizations` | List organizations |
| GET | `/api/units` | List units |
| GET | `/api/users` | List users |
| GET | `/api/persons` | List persons |
| GET | `/api/rooms` | List rooms |
| GET | `/api/cameras` | List cameras |
| GET | `/api/sessions` | List sessions |
| POST | `/api/sessions/:id/start` | Start session |
| POST | `/api/sessions/:id/end` | End session |
| GET | `/api/attendance/session/:id` | Get attendance |
| POST | `/api/ai-events/recognition` | AI recognition event |
| GET | `/api/reports/dashboard` | Dashboard stats |

## 🗃️ Database Schema

14 tables covering:
- **Organizations & Auth**: organizations, units, users, roles, permissions
- **Persons & Faces**: persons, face_profiles
- **Rooms & Devices**: rooms, cameras, device_statuses
- **Sessions & Attendance**: sessions, session_rosters, attendance_records
- **AI Events**: recognition_events, unknown_faces
- **Audit**: audit_logs

## 🎨 Features

- ✅ Multi-organization, multi-unit support
- ✅ Role-based access control (RBAC)
- ✅ Session management (create, start, end, lock)
- ✅ Realtime attendance tracking via WebSocket
- ✅ Camera management (Entry/Exit type)
- ✅ AI event ingestion API
- ✅ Unknown face review queue
- ✅ Reports with Excel export
- ✅ Full audit logging
- ✅ Dark theme UI

## 📄 License

MIT
