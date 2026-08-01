
# 🚀 Multi-Tenant SaaS Booking Platform (Week 1 Foundation)

A scalable, secure, and modern multi-tenant SaaS booking architecture built with **Next.js**, **Node.js/Express**, **MongoDB**, and **BetterAuth**. 

This platform supports dynamic wildcard subdomains (e.g., `apex.localhost:3000`), complete tenant data isolation via Express request context, and seamless tenant onboarding.

---

# 🗓️ Week 2: Booking APIs & Calendar UI

## 📌 Overview

The primary focus of Week 2 was building a reliable, secure, and type-safe **Booking Management System** for the multi-tenant SaaS platform. This phase involved implementing **Zod Validation**, an **Idempotency Key Middleware**, and a **Standardized Error Handling Framework** on the backend, alongside an interactive **Dashboard UI**, **Create Booking Modal**, and **Toast Notifications** on the frontend.

---

## 🎯 Completed Objectives

* [x] **Strict Zod Input Validation:** Built request schemas on the backend to sanitize and validate incoming request payloads.
* [x] **Idempotency Protection:** Implemented an `x-idempotency-key` header middleware to prevent duplicate bookings caused by network retries or multiple clicks.
* [x] **Standard Error Response Schema:** Created a centralized and predictable error response schema across all endpoints.
* [x] **Postman/Insomnia Collection:** Prepared structured API collections for documentation and testing.
* [x] **Dashboard Booking UI:** Built a clean dashboard layout featuring summary metrics, live search/filtering, and responsive booking cards.
* [x] **Create Booking Form & Modal:** Developed a modal form equipped with client-side validation and automated idempotency key generation.
* [x] **CRUD Operations & Feedback:** Integrated status updating, deletion workflows, and user notifications via `react-hot-toast`.
* [x] **Mobile Responsiveness:** Designed a mobile-first, responsive layout suitable for all screen sizes.

---

## 🏗️ Architecture & Features

### 1. Backend Enhancements

* **Validation Schema (`src/validations/bookings.validation.js`):**
* Validates fields such as `customerName`, `customerEmail`, `serviceName`, `bookingDate`, `startTime`, `endTime`, and `status`.


* **Idempotency Engine (`src/middleware/idempotency.js`):**
* Intercepts `x-idempotency-key` headers and caches successful responses for 24 hours to prevent duplicate data insertion.


* **Global Error Handler (`src/middleware/errorHandler.js`):**
* Captures Zod, Mongoose CastError, Duplicate Key, and Server Errors, formatting them into a standard response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  }
}

```

### 2. Frontend Dashboard Features

* **Live Search & Filter:** Filter appointments by customer name, email, service, booking date, or status.
* **Interactive Quick Stats:** Displays high-level counters for Total, Confirmed, Pending, and Cancelled bookings.
* **Idempotency Integration:** Automatically generates a unique `x-idempotency-key` for every new booking submission.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Headers Required |
| --- | --- | --- | --- |
| `GET` | `/api/bookings` | Fetch tenant bookings (supports `date` & `status` filters) | `x-tenant-subdomain` |
| `POST` | `/api/bookings` | Create a new booking | `x-tenant-subdomain`, `x-idempotency-key` |
| `PATCH` | `/api/bookings/:id` | Update booking status or details | `x-tenant-subdomain` |
| `DELETE` | `/api/bookings/:id` | Delete a booking record | `x-tenant-subdomain` |

---

## 🧪 Postman Collection Payload Sample

Example request header and body for testing the `POST` endpoint:

```http
POST http://apex.localhost:5000/api/bookings
Content-Type: application/json
x-idempotency-key: unique-uuid-v4-key

{
  "customerName": "Salah Uddin",
  "customerEmail": "salahuddin@example.com",
  "customerPhone": "+8801700000000",
  "serviceName": "Full Body Checkup",
  "bookingDate": "2026-08-01",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "confirmed",
  "notes": "First time patient"
}

```

---


3. **Access Dashboard:**
Open your browser and navigate to your tenant subdomain (e.g., `[http://apex.localhost:3000/dashboard](http://apex.localhost:3000/dashboard)`) to manage bookings.
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
