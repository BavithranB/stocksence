# STOCKSENSE — Intelligent Demand Forecasting & Inventory Management Platform

A production-style MERN stack web application for retail businesses to manage inventory, monitor stock levels, analyze sales, forecast demand, and generate replenishment recommendations.

> **Phase 1 — Base Project Setup**: This is the foundation release. It includes the full project structure, authentication system, dashboard UI, and connected frontend/backend. Business modules (forecasting engine, PO generation) are implemented as polished placeholders ready for Phase 2.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| Charts | Recharts |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Dev Tools | concurrently + nodemon |

---

## Project Structure

```
stocksense/
├── client/                         # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/             # AppLayout, Sidebar, TopNav
│       │   └── ui/                 # StatCard, EmptyState, ErrorState, PlaceholderPage
│       ├── context/                # AuthContext, ToastContext
│       ├── pages/                  # All page components
│       ├── routes/                 # ProtectedRoute
│       ├── services/               # api.js (Axios)
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/                         # Express backend
│   ├── config/                     # db.js (MongoDB connection)
│   ├── controllers/                # authController, dashboardController
│   ├── middleware/                 # auth.js (JWT), errorHandler.js
│   ├── models/                     # User.js
│   ├── routes/                     # authRoutes.js, dashboardRoutes.js
│   ├── app.js                      # Express app
│   └── server.js                   # Entry point
├── package.json                    # Root (concurrently)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **MongoDB** 6+ running locally, or a MongoDB Atlas connection string

---

## Installation

### 1. Clone and install all dependencies

```bash
# Install root + server + client dependencies
npm run install:all
```

Or manually:

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure environment variables

**Server** — copy and fill in:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stocksense
JWT_SECRET=your_strong_random_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> ⚠️ Generate a strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

---

## Running the Application

### Development (both servers simultaneously)

```bash
npm run dev
```

This starts:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:5173`

### Individual servers

```bash
npm run server    # Backend only
npm run client    # Frontend only
```

---

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + DB status |

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + set cookie |
| POST | `/api/auth/logout` | Private | Clear session |
| GET | `/api/auth/me` | Private | Get current user |

### Dashboard (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | KPI summary cards |
| GET | `/api/dashboard/sales-trend` | Sales trend (last 30 days) |
| GET | `/api/dashboard/recent-sales` | Recent transactions |
| GET | `/api/dashboard/low-stock` | Low-stock product list |

---

## Authentication

- Passwords are hashed with **bcrypt** (12 rounds). Plaintext passwords are never stored.
- JWT tokens are stored in **HttpOnly cookies** (not localStorage) to prevent XSS.
- Token is also returned in the response body for API clients.
- Tokens expire in **7 days**.
- All protected routes return `401` with a clear message if the token is missing or expired.

---

## Application Pages

| Route | Page | Status |
|-------|------|--------|
| `/login` | Login | ✅ Functional |
| `/register` | Register | ✅ Functional |
| `/dashboard` | Dashboard | ✅ Functional (empty states) |
| `/products` | Products | 🔲 Phase 2 |
| `/inventory` | Inventory | 🔲 Phase 2 |
| `/sales` | Sales | 🔲 Phase 2 |
| `/forecasting` | Demand Forecasting | 🔲 Phase 3 |
| `/replenishment` | Replenishment | 🔲 Phase 3 |
| `/alerts` | Alerts | 🔲 Phase 2 |
| `/settings` | Settings | 🔲 Phase 2 |

---

## Verification Checklist

After setup, verify:

```bash
# 1. Health endpoint
curl http://localhost:5000/api/health

# 2. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"secret123","role":"admin"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"secret123"}'

# 4. Protected route (replace TOKEN with value from login response)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/me
```

---

## Security Notes

- Never commit `.env` files (they are gitignored).
- Change `JWT_SECRET` to a strong, random value in production.
- Set `NODE_ENV=production` and configure `secure: true` cookies in production.
- Configure CORS `CLIENT_URL` to your production domain.

---

## Development Notes

- The Vite dev server proxies all `/api/*` requests to `localhost:5000`, so no CORS issues during development.
- Dashboard endpoints return valid empty states in Phase 1 — no fabricated business data.
- The frontend shows an onboarding banner when the database is empty.
- All API errors are caught and displayed via the toast notification system.
