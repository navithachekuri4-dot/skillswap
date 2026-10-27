# SkillSwap - Campus Skill Exchange Platform

A full-stack MERN application where college students can **exchange skills** with peers on campus — no money involved, just knowledge.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (bcryptjs) |
| Styling | Vanilla CSS (Custom Design System) |
| Icons | Lucide React |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend
# Create .env file (already created with defaults)
# Edit MONGO_URI if using Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skillswap

npm install
npm run dev        # Starts on http://localhost:5000
```

### 2. Seed the Database (optional demo data)

```bash
cd backend
node seed.js
```

This creates 5 demo users with skills. Login with any of:
- `priya@demo.com` / `password123`
- `arjun@demo.com` / `password123`
- `sneha@demo.com` / `password123`
- `rahul@demo.com` / `password123`
- `kavya@demo.com` / `password123`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

Open: **http://localhost:5173**

---

## 🔑 Core Features

### 1. Authentication & Profile
- JWT-based signup/login with validation
- Complete profile: name, college, year, bio, skills, availability
- Profile completeness meter (up to 100%)

### 2. Skill Offers & Requests
- Post what you can teach (Skill Offers)
- Post what you want to learn (Skill Requests)
- Browse with category filters and search
- Toggle offer visibility (active/hidden)

### 3. Matching & Proposals
- AI-driven matching based on your skills wanted/offered
- Recommended matches on Dashboard
- Send proposals with message, offered skill, wanted skill, preferred time
- Accept with session scheduling / Reject with reason / Cancel

### 4. Session Management
- Schedule sessions upon acceptance (date, time, mode, meet link)
- Both users mark session as complete
- Reschedule with reason (notifies other party)
- Cancel with reason

### 5. Reputation System
- 1-5 star ratings with written feedback
- Tag-based commendations (Patient, Knowledgeable, etc.)
- Reputation score computed from all reviews
- Displayed on profile and match cards

---

## 📁 Project Structure

```
Mern_Final_Project/
├── backend/
│   ├── middleware/
│   │   ├── auth.js           # JWT protect middleware
│   │   └── errorHandler.js   # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── SkillOffer.js
│   │   ├── SkillRequest.js
│   │   ├── Proposal.js
│   │   ├── Session.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js           # /api/auth
│   │   ├── users.js          # /api/users
│   │   ├── offers.js         # /api/offers
│   │   ├── requests.js       # /api/requests
│   │   ├── proposals.js      # /api/proposals
│   │   ├── sessions.js       # /api/sessions
│   │   ├── reviews.js        # /api/reviews
│   │   └── dashboard.js      # /api/dashboard
│   ├── .env
│   ├── seed.js               # Demo data seeder
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── Avatar.jsx
        │   ├── UserCard.jsx
        │   ├── ProposalModal.jsx
        │   └── ReviewModal.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Browse.jsx
        │   ├── Proposals.jsx
        │   ├── Sessions.jsx
        │   ├── Profile.jsx
        │   └── MySkills.jsx
        ├── services/
        │   └── api.js
        └── index.css         # Full design system
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/dashboard` | Dashboard stats + matches |
| GET | `/api/offers` | Browse skill offers |
| POST | `/api/offers` | Create offer |
| GET | `/api/requests` | Browse skill requests |
| POST | `/api/requests` | Create request |
| POST | `/api/proposals` | Send proposal |
| GET | `/api/proposals/received` | Received proposals |
| PUT | `/api/proposals/:id/accept` | Accept + schedule session |
| PUT | `/api/proposals/:id/reject` | Reject proposal |
| GET | `/api/sessions` | All user sessions |
| PUT | `/api/sessions/:id/complete` | Mark complete |
| PUT | `/api/sessions/:id/reschedule` | Reschedule |
| POST | `/api/reviews` | Submit review |
| GET | `/api/users/matches` | Get smart matches |
| GET | `/api/users/search` | Search users |

---

## 🎨 Design System

- **Primary:** `#3B82F6` (Soft Blue)
- **Font:** Inter (Google Fonts)
- **Light theme** with white background
- Soft shadows, rounded cards, hover micro-animations
- Left sidebar + top navbar layout
- Fully responsive (mobile overlay sidebar)
- Beautiful loading skeletons, empty states, error states

---

## 📝 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=skillswap_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```
