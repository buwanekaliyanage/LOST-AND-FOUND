# 🔍 Lost & Found System — MERN + QR Code

**BSc (Hons) Software Engineering — University of Plymouth | PUSL3190**

A full-featured web application with QR code functionality, admin dashboard, claims verification, and notifications.

---

## 🚀 Quick Start (VS Code)

### Prerequisites
| Tool | Download |
|------|----------|
| Node.js v18+ | https://nodejs.org |
| MongoDB Community | https://www.mongodb.com/try/download/community |

### Step 1 — Open two terminals in VS Code
`Terminal → New Terminal` + `Terminal → Split Terminal`

### Step 2 — Start MongoDB (run once)
- **Windows:** `net start MongoDB`
- **macOS:**   `brew services start mongodb-community`

### Step 3 — Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
✅ `MongoDB connected` + `Server running on http://localhost:5000`
✅ Admin auto-created: **admin@lostandfound.com / admin123**

### Step 4 — Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```
✅ Browser opens at **http://localhost:3000**

---

## 🌐 Pages

| Page | URL | Access |
|------|-----|--------|
| Home | / | Public |
| Lost Items | /lost | Public |
| Found Items | /found | Public |
| Item Detail + QR | /item/:id | Public |
| Report Lost | /report-lost | Login required |
| Report Found | /report-found | Login required |
| Profile + Notifications | /profile | Login required |
| **Admin Dashboard** | **/admin** | Admin only |
| Login | /login | Public |
| Sign Up | /signup | Public |

---

## 🔑 Default Admin Login
```
Email:    admin@lostandfound.com
Password: admin123
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 JWT Auth | Secure login with bcrypt password hashing |
| 📱 QR Codes | Auto-generated per item, scan to view & report |
| 📋 Claims | Submit ownership evidence, admin approves/rejects |
| 🔔 Notifications | QR scan alerts, claim status updates |
| 🔍 Search + Filter | By keyword, category, and location |
| 👑 Admin Dashboard | Stats, manage users/items/claims |
| 🖼️ Image Upload | Photos for all reports (max 5MB) |
| 📊 Profile | My reports, claims, and notifications in tabs |

---

## 🗂 Project Structure

```
lostandfound/
├── backend/
│   ├── models/      User.js, Item.js, Claim.js
│   ├── routes/      auth.js, items.js, users.js, claims.js, admin.js
│   ├── middleware/  auth.js (JWT protect)
│   ├── uploads/     (item images stored here)
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── pages/   Home, Login, Signup, Lost, Found, ItemDetail,
        │             ReportLost, ReportFound, Profile, AdminDashboard
        ├── components/ Navbar, Footer, Toast, ContactModal, ProtectedRoute
        ├── context/    AuthContext.js
        └── api.js
```

---

## ⚙️ Environment (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/lostandfound
JWT_SECRET=lostandfound_secret_key_2026
FRONTEND_URL=http://localhost:3000
```
