# SkillSwap — Peer-to-Peer Skill Exchange Platform

**Learn together. Teach each other. Grow together.**

🔗 **Live Website:** [SkillSwap](https://frontend-lovat-two-kb4dupu997.vercel.app/)

💻 **GitHub Repository:** [View Source Code](https://github.com/navithachekuri4-dot/skillswap)

🎥 **Project Demo Video:** [Watch the Demo](https://drive.google.com/file/d/1ps41qyTgO7p5A8ejX9scuEpFFldeN3G9/view?usp=sharing)

---

## 📌 Problem Statement

Students often want to learn new skills but face difficulties finding the right learning resources, affordable guidance, and people who can help them understand specific topics. At the same time, many students already possess valuable skills that they could teach to others.

Traditional learning platforms often focus on one-way teaching and may require learners to pay for courses or tutors. They also provide limited opportunities for students to exchange knowledge directly with one another.

This creates a gap between students who want to learn and students who are willing to teach.

## 💡 Proposed Solution

**SkillSwap** is a peer-to-peer skill exchange platform that connects students who want to learn with students who can teach.

Users can offer skills they know, discover skills they want to learn, send learning proposals, schedule sessions, and exchange knowledge with other students.

Instead of treating learning as a one-way process, SkillSwap encourages collaborative learning, where every student can be both a learner and a teacher.

The platform provides a centralized place to discover skills, manage learning interactions, track sessions, and build credibility through reviews and ratings.

## ✨ Key Features

### 🔐 Authentication
- User registration and login.
- JWT-based authentication.
- Protected routes for authenticated users.
- Demo login for exploring the application.

### 👤 User Profiles
- View and update profile information.
- Add skills to teach.
- Add skills to learn.
- Manage personal learning preferences and availability.

### 🔎 Browse and Discover Skills
- Explore skills offered by other students.
- Discover potential learning partners.
- Find people with complementary skills and learning interests.

### 🤝 Skill Exchange Proposals
- Send proposals to other students.
- View sent and received proposals.
- Accept or reject incoming proposals.
- Manage proposal status.

### 📅 Session Management
- Schedule learning sessions.
- View upcoming and completed sessions.
- Track session status.
- Manage cancellations and rescheduling where supported.

### ⭐ Reviews and Reputation
- Submit reviews for completed learning sessions.
- View ratings and feedback.
- Build a reputation based on learning interactions.

### 📊 Dashboard
- View an overview of learning activity.
- Track proposals and sessions.
- View reputation and review information.
- Access important platform features from one place.

### 🧪 Demo Experience
- Use the demo login to explore the application.
- Explore sample users, skill offers, proposals, and sessions when demo data is available.

## 🛠️ Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

**Backend**
- Node.js
- Express.js
- REST APIs
- JSON Web Tokens (JWT)
- bcrypt / password hashing, where implemented

**Database**
- MongoDB Atlas
- Mongoose

**Deployment and Tools**
- Vercel — frontend hosting
- Render — backend hosting
- Git and GitHub — version control

## 🏗️ Application Architecture

SkillSwap follows a client-server architecture.

1. The React frontend provides the user interface.
2. Axios sends HTTP requests to the Express backend.
3. Express routes and controllers process requests and apply business logic.
4. Mongoose communicates with MongoDB Atlas to store and retrieve application data.
5. JWT authentication protects endpoints that require a logged-in user.
6. The backend returns JSON responses to the frontend, which updates the interface.

```text
                 ┌──────────────────────┐
                 │      User / Browser  │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │   React + Vite UI    │
                 │   Hosted on Vercel   │
                 └──────────┬───────────┘
                            │ HTTP / REST API
                 ┌──────────▼───────────┐
                 │   Node.js + Express  │
                 │    Hosted on Render  │
                 └──────────┬───────────┘
                            │ Mongoose
                 ┌──────────▼───────────┐
                 │    MongoDB Atlas     │
                 └──────────────────────┘
```

## 🚀 Getting Started

Follow these steps to run SkillSwap locally.

### Prerequisites

Install the following:
- Node.js (version 18 or later)
- npm
- Git
- A MongoDB Atlas database or local MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/navithachekuri4-dot/skillswap.git
cd skillswap
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using the environment variables required by your backend configuration.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

Replace the example values with your own configuration. Never commit your real `.env` file, database password, or JWT secret to GitHub.

Start the backend:

```bash
npm start
```

If your `package.json` does not define a start script, use the start command specified by your project configuration.

### 3. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

The frontend API service appends `/api` to this base URL, so do not add `/api` to the value.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

> **Note:** The exact environment variables, seed scripts, and npm commands should match the configuration in your repository.

## 🌐 Live Deployment

The application is deployed using:

- **Frontend:** [Vercel Deployment](https://frontend-lovat-two-kb4dupu997.vercel.app/)
- **Backend:** Render
- **Database:** MongoDB Atlas

The frontend communicates with the deployed backend through REST API endpoints. Environment variables are configured separately for deployment.

## 🎥 Project Demonstration

Watch the recorded demonstration to see SkillSwap's main workflows, including authentication, skill discovery, proposals, sessions, and the dashboard.

**Demo Video:** [Watch SkillSwap](PASTE_YOUR_VIDEO_LINK_HERE)

## 🔮 Future Enhancements

- Real-time chat between learning partners.
- Automated matching based on complementary skills.
- Calendar integration and session reminders.
- Video conferencing integration.
- Advanced search and filtering.
- Notifications for proposals and upcoming sessions.
- Improved analytics for learning progress.
- More detailed reputation and feedback analytics.

## 🎯 Project Objective

The objective of SkillSwap is to make peer learning more accessible by allowing students to exchange knowledge, collaborate with one another, and build practical skills through structured learning interactions.

The platform demonstrates the development of a full-stack web application with authentication, database integration, REST APIs, and cloud deployment.

## 👩‍💻 Author

**Navitha Chekuri**

GitHub: [navithachekuri4-dot](https://github.com/navithachekuri4-dot)

---

*SkillSwap — Share your skills. Discover new ones. Learn together.*
