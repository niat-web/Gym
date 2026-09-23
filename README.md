# FitCore — Gym Membership, Attendance & Loyalty Platform (MERN)

FitCore is a modern, production-quality **MERN** web application (MongoDB, Express, React, Node.js) built for independent fitness studios and gyms in India.

It streamlines front-desk operations, digital membership sales, attendance quota enforcement, member check-ins via QR codes, and referral loyalty rewards with **integer paise** financial precision.

---

## 🌟 Key Features

### 👤 Member Experience (Mobile-First)
- **Active Membership Tracking**: Real-time quota progress (`daysRemaining / allocatedDays`), expiry date countdown, and auto-renewal triggers.
- **Plans & Store**: Browse Basic, Standard, and Premium packages with itemised benefit checklists.
- **Promo Coupons & Referrals**: Live coupon validation and automatic ₹200 discount for first-time buyers referred by a friend.
- **Checkout & Digital Receipts**: Interactive Mock Payment Sheet (and live Razorpay SDK integration) with printable tax receipts.
- **Attendance History**: Visual attendance log for each membership lifecycle.
- **Refer & Earn**: Unique referral codes, native Web Share API integration, and 500 loyalty points per conversion.
- **Digital QR Pass**: High-resolution QR membership pass (`qrcode.react`) for touchless front desk scanning.

### 🏋️ Trainer & Front Desk Hub
- **2-Tap Attendance Marking**: Debounced member lookup by name or Indian phone number with instant visit deduction.
- **Same-Day Re-Entry Protection**: Atomic conditional update prevents double deduction if a member visits multiple times in a single day.
- **Refusal Guarantees**: Instant refusal messages if membership is expired, suspended, or visits quota is exhausted.
- **Camera QR Scanner**: Built-in camera scanner (`html5-qrcode`) to scan digital member passes directly from mobile or desktop.
- **Live Feed & Watchlists**: Real-time stream of today's check-ins and members expiring within 7 days.

### 👑 Owner (Admin) Suite
- **Executive KPI Dashboard**: Total members, active/expired subscriptions, today's check-ins, and monthly revenue growth % vs last month.
- **Revenue Analytics**: Interactive 6-month revenue chart built with Recharts.
- **Plan Management**: Create, edit, price (in ₹ / integer paise), and activate/deactivate packages.
- **Coupons Engine**: Percentage discounts with max caps, flat rupee discounts, per-user limits, and campaign date windows.
- **Member Directory**: Assign trainers, suspend/activate accounts, record counter cash/UPI payments, and pause/resume/cancel subscriptions.
- **Referral Leaderboard**: System-wide conversion statistics and top member referrers.
- **Automated Cron Jobs**: Midnight subscription expiry, expired coupon deactivation, and 9:00 AM renewal alerts.

---

## 🛠️ Tech Stack

- **Backend**: Node.js 20 LTS, Express 4 (TypeScript), Mongoose, Zod, JWT, bcryptjs, node-cron (`Asia/Kolkata`), Helmet, CORS, Compression, express-rate-limit, Pino Logger.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Router, Lucide Icons, Recharts, `qrcode.react`, `html5-qrcode`, `canvas-confetti`.
- **Database**: MongoDB (Atlas or Local MongoDB).

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url> fitcore
cd fitcore
npm install
```

### 2. Configure Environment Variables
Copy the example configuration for the server:
```bash
cp server/.env.example server/.env
```

Default `server/.env` values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fitcore
JWT_ACCESS_SECRET=fitcore_super_secret_access_key_928374982374982374
JWT_REFRESH_SECRET=fitcore_super_secret_refresh_key_102938475610293847
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
RAZORPAY_KEY_ID=rzp_test_mockkey12345
RAZORPAY_KEY_SECRET=mock_secret_987654321
PAYMENTS_MODE=mock
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### 3. Seed Demo Data
Populates Admin, Trainer, Member, Plans, Coupons, Payments, and Attendance history:
```bash
npm run seed
```

### 4. Run Dev Servers
Start both backend API (`localhost:5000`) and Vite frontend (`localhost:5173`) concurrently:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Development Credentials

| Role | Phone | Password | Features / Notes |
|---|---|---|---|
| **Admin (Owner)** | `+919876543210` | `Admin@123` | Full dashboard, plan/coupon manager, member editor, manual payments |
| **Head Trainer** | `+919876543211` | `Trainer@123` | Front desk check-in, QR scanner, member directory |
| **Member (Priya Patel)** | `+919876543212` | `Member@123` | Active Quarterly Plan, 1,000 pts, Referral Code `PRIY49B2` |

---

## 🧪 Automated Testing

FitCore includes a suite of backend integration and unit tests covering JWT token invalidation, coupon validation matrices, atomic attendance deductions, referral idempotency, and mock payment flows:

```bash
npm run test
```

To validate TypeScript compilation across both client and server:
```bash
npm run build
```

---

## 🌐 Production Deployment

### 1. Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User and whitelist IP access (`0.0.0.0/0` for cloud host services).
3. Copy the `mongodb+srv://...` connection string.

### 2. Backend (Render Web Service)
1. Create a new **Web Service** on Render connected to this repository.
2. Root Directory: `server`
3. Build Command: `npm ci && npm run build`
4. Start Command: `node dist/server.js`
5. Health Check Path: `/health`
6. Set Environment Variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_ACCESS_SECRET=<generated-secret>`
   - `JWT_REFRESH_SECRET=<generated-secret>`
   - `PAYMENTS_MODE=mock` (or provide live Razorpay keys)
   - `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`
7. *Note on node-cron*: Render's free tier sleeps after 15 minutes of inactivity. For continuous cron execution, upgrade to a persistent instance or set up an external cron to ping `/api/v1/dev/run-job/:name`.

### 3. Frontend (Vercel)
1. Import repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
7. Deep link routing is handled by `client/vercel.json`.

---

## 📄 License
ISC © 2026 FitCore Studio Platforms.
