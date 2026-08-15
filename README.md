
# 🚀 Multi-Tenant SaaS Booking Platform (Week 1 Foundation)

A scalable, secure, and modern multi-tenant SaaS booking architecture built with **Next.js**, **Node.js/Express**, **MongoDB**, and **BetterAuth**. 

This platform supports dynamic wildcard subdomains (e.g., `apex.localhost:3000`), complete tenant data isolation via Express request context, and seamless tenant onboarding.

---

# 🗓️ Week 2: Booking APIs & Calendar UI

## 📌 Overview

The primary focus of Week 2 was building a reliable, secure, and type-safe **Booking Management System** for the multi-tenant SaaS platform. This phase involved implementing **Zod Validation**, an **Idempotency Key Middleware**, and a **Standardized Error Handling Framework** on the backend, alongside an interactive **Dashboard UI**, **Create Booking Modal**, and **Toast Notifications** on the frontend.

---

# 🚀 Week 3: Multi-Tenant Stripe Subscription & Billing Management

In this phase, we integrated **Stripe Subscriptions**, **Secure Idempotent Webhook Engine**, **Pricing & Billing Management UI**, and **Tenant-Aware Better Auth Login Support**.

---

# ⚡ Week 4: Real-Time Collaborative Notes & Document Sync (Yjs + TipTap)

In Week 4, we turned booking notes into a real-time collaborative experience, enabling multiple staff members to simultaneously edit and manage booking details without version conflicts.

### 📌 Key Accomplishments & Features

1. **CRDT-Based Collaborative Editing Engine**:
   - Integrated **Yjs** (CRDT protocol) with **TipTap Rich Text Editor** on the frontend.
   - Built a dedicated **Node.js WebSocket Server** for real-time document synchronization.
   - Live collaborative indicators featuring real-time multiplayer presence badges, colored remote cursor tracking, and active typing status.

2. **MongoDB State Persistence**:
   - Developed custom Yjs binary state persistence to store document updates in **MongoDB**.
   - Automatic room lifecycle management: loads persisted document binary blobs on room creation and flushes Yjs state to DB when all users disconnect.

3. **Multi-Tenant Room Isolation & Security**:
   - Encoded subdomains directly into dynamic WebSocket room namespaces (`${subdomain}:${bookingId}`).
   - Ensured zero cross-tenant data leakage by decoupling real-time rooms at the connection boundary.

4. **Resilient Network & Fallback Auto-Save Architecture**:
   - **Graceful Network Handling**: Reconnection strategies with visual status indicators (`Live`, `Connecting...`, `Offline`).
   - **REST Auto-Save Fallback**: Automatic debounced background fallback to REST APIs during WebSocket disconnections to guarantee zero data loss.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React, Hot Toast, TipTap (`@tiptap/react`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`), Yjs, `y-websocket`
* **Backend**: Node.js, Express.js, WebSocket (`ws`), Yjs (`yjs`, `y-protocols`, `lib0`)
* **Database**: MongoDB with Mongoose & Native Adapter
* **Authentication**: Better Auth
* **Payments & Billing**: Stripe API SDK & Webhooks

---

## 🔑 Access Dashboard:
Open your browser and navigate to your tenant subdomain (e.g., `http://apex.localhost:3000/dashboard`) to manage bookings and real-time notes.

For Login as apex admin use:
* **email**: `admin@admin.com`
* **password**: `admin.1234`

---

## 🚦 Getting Started & Run Instructions

Follow these instructions to run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone [https://github.com/mdsalahuddin96/SaaS_Project.git](https://github.com/mdsalahuddin96/SaaS_Project.git)
cd SaaS_Project

```

---

### Step 2: Configure Environment Variables

Copy the `.env.example` templates from frontend and backend directories:

```bash
# Set up Backend Environment
cp backend/.env.example backend/.env

# Set up Frontend Environment
cp frontend/.env.example frontend/.env

```

Ensure the following Webpack & WebSocket URLs are present:

* **Backend `.env`**:
```env
PORT=5000
WS_PORT=5000 # Shared HTTP/WS server

```


* **Frontend `.env`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000/yjs

```



---

### Step 3: Start Infrastructure via Docker Compose

Spin up MongoDB (configured with a Replica Set for transactions) and Mongo Express UI:

```bash
docker compose up -d

```

> 💡 **Database Admin UI:** Access Mongo Express at [http://localhost:8081](http://localhost:8081) to inspect collections and stored Yjs document states.

---

### Step 4: Testing Webhooks Locally (Stripe CLI)

To test Stripe payment events during local development:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook

```

Copy the `whsec_...` key from the terminal and add it to `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_generated_local_secret

```

---

### Step 5: Install Dependencies & Run Backend

Open a terminal for the backend server:

```bash
cd backend
npm install

# Seed initial test data (Creates 'apex' tenant, users, sample bookings & notes)
npm run seed

# Start Express Backend API & Yjs WebSocket Server
npm run dev

```

> 📡 **Backend API & WebSocket Server** will be available at `http://localhost:5000` (`ws://localhost:5000/yjs`)

---

### Step 6: Install Dependencies & Run Frontend

Open a new terminal tab or window for the frontend application:

```bash
cd frontend
npm install

# Start Next.js Development Server
npm run dev

```

---

## 🧪 Testing Subdomain Routing & Real-Time Collaboration

Open your browser and test:

* **Main Landing Page:** [http://localhost:3000](http://localhost:3000)
* **Tenant Subdomain (Apex):** [http://apex.localhost:3000](https://www.google.com/search?q=http://apex.localhost:3000)
* **Real-Time Collaborative Notes:** Open `http://apex.localhost:3000/dashboard/bookings/[bookingId]` in two separate browser windows or incognito modes to test live multiplayer cursor and text sync.

```

```
