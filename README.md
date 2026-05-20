# TaskFlow — Team Task Manager

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Railway-Ready-purple?logo=railway" alt="Railway" />
</div>

---

A production-ready, full-stack collaborative project management platform built with the MERN stack. Features Kanban task boards, role-based access control, real-time notifications, and an analytics dashboard.

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
- 👥 **Role-Based Access** — Admin and Member roles with granular permissions  
- 📁 **Project Management** — Create, edit, delete projects with progress tracking
- ✅ **Kanban Board** — Drag-and-drop task management with 4 status columns
- 📊 **Analytics Dashboard** — Charts for task distribution, priority breakdown, overdue monitoring
- 🔔 **Notifications** — Auto-generated alerts for task assignments, comments, and updates
- 👤 **Team Management** — Invite/remove members, update roles, manage team
- 🌙 **Dark/Light Mode** — Full theme switching with CSS variable system
- 📱 **Responsive Design** — Mobile-first layout with slide-out mobile sidebar
- 🚀 **Railway Ready** — Deployment config included

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| shadcn/ui (Radix UI) | Component library |
| Redux Toolkit | State management |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| React Hook Form + Zod | Forms + validation |
| Recharts | Analytics charts |
| @hello-pangea/dnd | Drag-and-drop Kanban |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| multer | File uploads (avatars) |
| helmet | Security headers |
| express-rate-limit | Rate limiting |

## 📁 Folder Structure

```
Task Manager/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Navbar, MobileSidebar
│   │   │   ├── dashboard/      # StatsCard
│   │   │   └── ui/             # Button, Badge, Modal, Skeleton, EmptyState, Toaster, FormFields
│   │   ├── pages/              # All 12 pages
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/         # authSlice, projectSlice, taskSlice, notificationSlice, uiSlice
│   │   ├── services/           # API service functions
│   │   ├── routes/             # AppRouter with protected routes
│   │   ├── layouts/            # DashboardLayout
│   │   └── utils/              # cn, date helpers, class utilities
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                     # Node.js backend
    ├── controllers/            # authController, projectController, taskController, ...
    ├── models/                 # User, Project, Task, Notification
    ├── routes/                 # auth, users, projects, tasks, notifications, dashboard
    ├── middleware/             # auth, role, validate, error, upload
    ├── config/                 # db.js (MongoDB connection)
    ├── utils/                  # ApiError, ApiResponse, generateToken, sendNotification
    └── index.js                # Express entry point
```

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

**Server** — Create `server/.env` (copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Client** — Create `client/.env` (copy from `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

App will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/api/health

## 🚀 Railway Deployment

### Deploy Backend

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Add environment variables in the Railway dashboard:
   - `MONGO_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Strong random secret
   - `JWT_EXPIRE` — `7d`
   - `NODE_ENV` — `production`
   - `CLIENT_URL` — Your frontend Railway URL
5. Railway auto-detects `railway.json` and deploys

### Deploy Frontend

1. Add another Railway service in the same project
2. Set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` — Your backend Railway URL + `/api`
4. Build command: `npm run build`
5. Start command: `npx serve dist`

### MongoDB Atlas Setup
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` for Railway IPs
4. Copy the connection string and set as `MONGO_URI`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login user |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/profile | ✅ | Update profile |
| PUT | /api/auth/change-password | ✅ | Change password |

### Projects
| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | /api/projects | ✅ | Any |
| POST | /api/projects | ✅ | Admin |
| GET | /api/projects/:id | ✅ | Member+ |
| PUT | /api/projects/:id | ✅ | Admin |
| DELETE | /api/projects/:id | ✅ | Admin |
| POST | /api/projects/:id/members | ✅ | Admin |
| DELETE | /api/projects/:id/members/:userId | ✅ | Admin |

### Tasks
| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | /api/tasks | ✅ | Any |
| POST | /api/tasks | ✅ | Admin |
| GET | /api/tasks/:id | ✅ | Any |
| PUT | /api/tasks/:id | ✅ | Any |
| DELETE | /api/tasks/:id | ✅ | Admin |
| POST | /api/tasks/:id/comments | ✅ | Any |
| DELETE | /api/tasks/:id/comments/:commentId | ✅ | Author/Admin |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/stats | Task/project counts |
| GET | /api/dashboard/activity | Recent task activity |
| GET | /api/dashboard/overdue | Overdue tasks list |
| GET | /api/dashboard/priority-stats | Task priority distribution |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/notifications | Get all (paginated) |
| PUT | /api/notifications/:id/read | Mark one as read |
| PUT | /api/notifications/read-all | Mark all as read |
| DELETE | /api/notifications/:id | Delete one |
| DELETE | /api/notifications/clear-all | Clear all |

## 🎨 Pages

| Page | Route | Access |
|---|---|---|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Dashboard | `/dashboard` | Auth |
| Projects | `/projects` | Auth |
| Project Detail | `/projects/:id` | Member+ |
| Tasks (Kanban) | `/tasks` | Auth |
| Task Detail | `/tasks/:id` | Auth |
| Team | `/team` | Admin |
| Notifications | `/notifications` | Auth |
| Profile | `/profile` | Auth |
| 404 | `*` | Public |

## 🔮 Future Improvements

- [ ] WebSocket real-time updates (Socket.io)
- [ ] File attachments for tasks
- [ ] Gantt chart view for projects
- [ ] Email notifications (Nodemailer)
- [ ] Task time tracking
- [ ] Project templates
- [ ] Export to CSV/PDF
- [ ] Two-factor authentication

## 📸 Screenshots

_Screenshots will appear here after deployment_

---

Built with ❤️ using the MERN Stack
