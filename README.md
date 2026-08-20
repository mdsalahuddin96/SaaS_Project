# 🚀 Multi-Tenant SaaS Booking Platform

A scalable, secure, and high-performance multi-tenant SaaS booking architecture built with **Next.js**, **Node.js/Express**, **MongoDB**, **Redis**, and **BetterAuth**. 

This platform supports dynamic wildcard subdomains (e.g., `apex.localhost:3000`), complete tenant data isolation via Express request context, real-time collaboration, and high-availability caching with graceful degradation.

---

# 🚀 Week 1: Multi-Tenant Architecture & Auth Foundation

* **Tenant Isolation**: Wildcard subdomains (`*.localhost:3000`) and request-context-based tenant boundary enforcement.
* **Authentication**: Integrated **BetterAuth** with multi-tenant user and session management.
* **Database Design**: Automated tenant schema association and initial seed scripts.

---

# 🗓️ Week 2: Booking APIs & Calendar UI

* **Type-Safe Validation**: Integrated **Zod** schema validation for all API routes.
* **Resilience**: Implemented custom **Idempotency Key Middleware** and standardized error handling.
* **Dashboard UI**: Interactive booking calendar, create/edit modals, and toast notification alerts.

---

# 💳 Week 3: Multi-Tenant Stripe Subscription & Billing

* **Subscriptions**: Integrated **Stripe API SDK** for dynamic tier management (Free, Pro, Enterprise).
* **Webhook Engine**: Idempotent webhook listener for real-time payment event processing.
* **Tenant-Aware Login**: Custom login support tailored for tenant subdomains.

---

# ⚡ Week 4: Real-Time Collaborative Notes (Yjs + TipTap)

* **CRDT Collaboration**: Embedded **Yjs** CRDT engine with **TipTap Rich Text Editor**.
* **WebSocket Server**: Built a custom Node.js WebSocket pipeline supporting dynamic namespaces (`${subdomain}:${bookingId}`) for zero cross-tenant data leaks.
* **Live Presence**: Real-time multiplayer badges, active typing indicators, and colored remote cursors.
* **Binary Persistence**: Binary Yjs state serialization saved directly to **MongoDB**.
* **Fallback Auto-Save**: Seamless network reconnection strategy with debounced REST fallback on connection loss.

---

# ⚡ Week 5: Advanced Caching (Redis) & Settings UI

### 📌 Key Accomplishments & Features

1. **Redis Cache-Aside Architecture**:
   - Integrated **Redis via Docker Compose** to cache tenant-specific configuration settings (`tenant:{subdomain}:settings`).
   - Achieved near-instant response times for tenant-wide settings reads, bypassing database queries on cache hits.

2. **Automated Cache Invalidation**:
   - Implemented write-through cache invalidation strategy on settings updates (`PUT /api/tenant-settings/:subdomain`).
   - Flushes and updates stale cache keys instantly to maintain 100% cache coherency across subdomains.

3. **High-Availability Graceful Degradation**:
   - Designed non-blocking Redis connection handlers using `ioredis`.
   - **Automatic DB Fallback**: If the Redis service goes offline or crashes, backend endpoints seamlessly degrade to MongoDB reads without throwing 500 errors or stopping the application.

4. **Automated Cache Coherency Test Suite**:
   - Built an automated **Jest** test suite using `mongodb-memory-server`.
   - Asserts 100% coverage for Cache Misses, Cache Hits, Cache Invalidation on updates, and DB Fallback execution when Redis is disconnected.

5. **Tenant Admin Settings UI & Live Indicators**:
   - Developed a modern **Tenant Admin Settings UI** page for managing tenant branding, colors, and booking slot durations.
   - Real-time visual status badges:
     - ⚡ **Cached (Redis)**: Served instantly from memory.
     - 🗄️ **Database (Direct)**: Fresh query from MongoDB.
     - ⚠️ **DB Fallback**: Redis offline notice.
     - 🔄 Live **Save Indicators** with instant feedback on cache refresh.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide React, Hot Toast, TipTap (`@tiptap/react`, `@tiptap/extension-collaboration`), Yjs, `y-websocket`
* **Backend**: Node.js, Express.js, WebSocket (`ws`), Yjs (`yjs`), `ioredis`, Mongoose
* **Caching & In-Memory**: Redis (Docker)
* **Database**: MongoDB (Replica Set enabled for transactions) with Mongo Express UI
* **Authentication**: Better Auth
* **Payments**: Stripe API SDK & Webhooks
* **Testing**: Jest, Supertest, `mongodb-memory-server`

---

## 🔑 Access Dashboard

Open your browser and navigate to your tenant subdomain (e.g., `http://apex.localhost:3000/dashboard`) to manage bookings, settings, and collaborative notes.

For Login as apex admin use:
* **Email**: `admin@admin.com`
* **Password**: `admin.1234`

---

## 🚦 Getting Started & Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/mdsalahuddin96/SaaS_Project.git
cd SaaS_Project

```

---

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` in both frontend and backend directories:

```bash
# Set up Backend Environment
cp backend/.env.example backend/.env

# Set up Frontend Environment
cp frontend/.env.example frontend/.env

```

Ensure the following variables are set:

* **Backend `.env`:**

```env
PORT=5000
WS_PORT=5000
MONGO_URI=mongodb://localhost:27017/saas_booking?replicaSet=rs0
REDIS_URL=redis://localhost:6379

```

* **Frontend `.env`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000/yjs

```

---

### Step 3: Start Services via Docker Compose

Spin up MongoDB (with Replica Set setup), Mongo Express, and **Redis**:

```bash
docker compose up -d

```

> 💡 **Database Admin UI:** Access Mongo Express at [http://localhost:8081](http://localhost:8081).
> ⚡ **Redis Cache Service:** Running locally on `localhost:6379`.

---

### Step 4: Testing Webhooks Locally (Optional)

To test Stripe payment events locally:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook

```

---

### Step 5: Install Dependencies & Run Backend

```bash
cd backend
npm install

# Seed initial test data (Creates 'apex' tenant, users, bookings & default settings)
npm run seed

# Start Express Backend & Yjs WebSocket Server
npm run dev

```

> 📡 **Backend API & WebSockets** available at `http://localhost:5000`

---

### Step 6: Install Dependencies & Run Frontend

```bash
cd frontend
npm install

# Start Next.js Development Server
npm run dev

```

---

## 🧪 Automated Testing & Cache Verification

### Run Automated Jest Tests

To execute backend integration and cache coherency test suites:

```bash
cd backend
npm test

```

### Manual Redis Cache & Degradation Verification

1. **Cache Miss & Cache Hit**: Visit `http://apex.localhost:3000/deshboard/settings`. The badge will read 🗄️ **Database (Direct)** on first load and switch to ⚡ **Cached (Redis)** upon refresh.
2. **Cache Invalidation**: Update settings via the Admin UI. The cache will immediately invalidate and rebuild with new data.
3. **Graceful Degradation Test**: Stop Redis (`docker stop saas_booking_redis`) and refresh the page. The app will smoothly switch to ⚠️ **DB Fallback** mode without erroring out.

