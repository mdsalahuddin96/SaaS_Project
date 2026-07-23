
# 🚀 Multi-Tenant SaaS Booking Platform (Week 1 Foundation)

A scalable, secure, and modern multi-tenant SaaS booking architecture built with **Next.js**, **Node.js/Express**, **MongoDB**, and **BetterAuth**. 

This platform supports dynamic wildcard subdomains (e.g., `apex.localhost:3000`), complete tenant data isolation via Express request context, and seamless tenant onboarding.

---

## 📌 Features Built (Week 1 Objectives)

- **Tech Stack:** Next.js (App Router), Express.js (ESM), MongoDB/Mongoose, BetterAuth, Tailwind CSS.
- **Environment Safety:** Strict `.env` schema validation using **Zod** to prevent runtime configuration failures.
- **Local Infrastructure:** Single-command database setup using **Docker Compose** (MongoDB + Mongo Express UI).
- **Multi-Tenant Schema & Isolation:**
  - Standardized schema for `Tenant`, `User`, and `Booking`.
  - Middleware-driven tenant context (`tenantContext.js`) extracting subdomains and enforcing query isolation by `tenantId`.
- **Data Seeding:** Custom seed script (`npm run seed`) to rapidly generate test tenants, users, and booking data.
- **Tenant Onboarding & Auth:**
  - Automated organization setup via `onboardingController`.
  - Admin user creation integrated with **BetterAuth**.
- **Wildcard Subdomain Routing:**
  - Dynamic route matching for subdomains (e.g., `tenant.localhost:3000`).
  - Isolated dashboard shell with responsive navigation.

---

## 🛠️ System Architecture & Approach

### 1. Data Isolation Approach
Instead of separate database instances per tenant (high cost), we implemented a **Logical Data Isolation (Shared DB, Separate Schema Context)** pattern. Every document contains a `tenantId` field. Express middleware parses the incoming request header/host, resolves the tenant, and injects `req.tenantId` globally into request handlers, guaranteeing zero cross-tenant data leaks.

### 2. Subdomain Resolution
The architecture relies on parsing `Host` headers. In development, subdomains like `apex.localhost:3000` resolve automatically to `localhost`. Next.js routes traffic via custom middleware while Express extracts the subdomain context for API requests.

---

## 🚦 Getting Started & Run Instructions

Follow these instructions to run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) 
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

Copy the `.env.example` templates to create `.env` files in the backend and frontend directories:

```bash
# Set up Backend Environment
cp backend/.env.example backend/.env

# Set up Frontend Environment (if applicable)
cp frontend/.env.example frontend/.env

```

---

### Step 3: Start Infrastructure via Docker Compose

Spin up MongoDB (configured with a Replica Set for transactions) and Mongo Express UI:

```bash
docker compose up -d

```

> 💡 **Database Admin UI:** Access Mongo Express at [http://localhost:8081](http://localhost:8081) to visually inspect collections and documents.

---

### Step 4: Install Dependencies & Run Backend

Open a terminal for the backend server:

```bash
cd backend
npm install

# Seed initial test data (Creates 'apex' tenant, users & sample bookings)
npm run seed

# Start Express Backend API
npm run dev

```

> 📡 **Backend API** will be available at `http://localhost:5000`

---

### Step 5: Install Dependencies & Run Frontend

Open a new terminal tab or window for the frontend application:

```bash
cd frontend
npm install

# Start Next.js Development Server
npm run dev

```

---

## 🧪 Testing Subdomain Routing

Open your browser and visit:

* **Main Landing Page:** [http://localhost:3000](http://localhost:3000)
* **Tenant Subdomain (Apex):** [http://apex.localhost:3000](https://www.google.com/search?q=http://apex.localhost:3000)
* **Backend API Status:** [http://localhost:5000](http://localhost:5000)

```

```
