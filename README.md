
# 🚀 Multi-Tenant SaaS Booking Platform (Week 1 Foundation)

A scalable, secure, and modern multi-tenant SaaS booking architecture built with **Next.js**, **Node.js/Express**, **MongoDB**, and **BetterAuth**. 

This platform supports dynamic wildcard subdomains (e.g., `apex.localhost:3000`), complete tenant data isolation via Express request context, and seamless tenant onboarding.

---

# 🗓️ Week 2: Booking APIs & Calendar UI

## 📌 Overview

The primary focus of Week 2 was building a reliable, secure, and type-safe **Booking Management System** for the multi-tenant SaaS platform. This phase involved implementing **Zod Validation**, an **Idempotency Key Middleware**, and a **Standardized Error Handling Framework** on the backend, alongside an interactive **Dashboard UI**, **Create Booking Modal**, and **Toast Notifications** on the frontend.

---
# 🚀 Week 3: Multi-Tenant Stripe Subscription & Billing Management

This repository contains the Week-3 implementation of our Multi-Tenant SaaS platform. In this phase, we integrated **Stripe Subscriptions**, **Secure Idempotent Webhook Engine**, **Pricing & Billing Management UI**, and **Tenant-Aware Better Auth Login Support**.

---
## 📌 Features & Key Accomplishments

### 1. 💳 Stripe Backend Integration & Architecture
* **Customer & Session Management**: Automated Stripe Customer creation and hosted Checkout Session generation based on tenant subdomain context.
* **Customer Portal Integration**: Provided direct links for users to manage credit cards, download invoices, and cancel/reactivate subscriptions via Stripe's hosted portal.
* **Tenant Isolation**: Payment events are strictly attached to `x-tenant-subdomain` headers and database references.

### 2. 🛡️ Secure & Idempotent Webhook Engine
* **Raw Body Parsing**: Implemented express raw body parser specifically for Stripe webhook endpoints to preserve cryptographic signature integrity.
* **Signature Verification**: Validates `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.
* **Idempotency Protection**: Uses a dedicated `ProcessedWebhook` MongoDB model to log event IDs and prevent duplicate event execution.
* **Supported Lifecycle Events**:
  * `checkout.session.completed` -> Upgrades tenant plan and records `stripeCustomerId`.
  * `customer.subscription.updated` -> Updates renewal periods, status (`active`, `past_due`), and cancellation requests.
  * `customer.subscription.deleted` -> Downgrades tenant to `free` plan automatically.
  * `invoice.payment_failed` -> Flags account as `past_due`.

### 3. 🎨 Frontend Pricing & Billing Dashboards
* **Pricing Page (`/dashboard/pricing`)**: Modern UI featuring multi-tier subscription plans (Starter, Pro, Enterprise) with instant Stripe Checkout redirection.
* **Billing Portal (`/dashboard/billing`)**: Real-time status badge (`Active`, `Past Due`, `Canceled`), billing period calendar tracker, and seamless Stripe Portal button.
* **Feedback Handling**: Toast alerts and clean route navigation upon returning from Stripe Checkout (`?success=true` / `?canceled=true`).

### 4. 🔐 Subdomain-Isolated Tenant Admin Authentication (Better Auth)
 Implemented secure multi-tenant access control using Better Auth and Next.js middleware, ensuring tenant admins must authenticate at their specific organization subdomain before accessing /dashboard by strictly validating matching tenantIds, preserving cross-subdomain session cookies, and seamlessly redirecting them back to their requested page post-login.

---
## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React, Hot Toast
* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose & Native Adapter
* **Authentication**: Better Auth
* **Payments & Billing**: Stripe API SDK & Webhooks
---

## Access Dashboard:
Open your browser and navigate to your tenant subdomain (e.g., `[http://apex.localhost:3000/dashboard](http://apex.localhost:3000/dashboard)`) to manage bookings. 
For Login as apex admin use:
* **email**:admin@admin.com
* **password**:admin.1234
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

Copy the `.env.example` templates from forntend and backend folder to create `.env` files in the backend and frontend directories:

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

### Step 4: Testing Webhooks Locally

To test Stripe payment events (like successful subscriptions or payment failures) during local development, follow these steps using the Stripe CLI:

* **Install the Stripe CLI**  
   Follow the official guide to install [Stripe CLI](https://stripe.com/docs/stripe-cli) for your operating system.

* **Authenticate the CLI**  
   Run the login command and follow the instructions in your browser:
   ```bash
   stripe login
   ```

* **Forward Webhook Events to Backend**
  Forward Stripe events directly to your running Express backend server:
  ```bash
  stripe listen --forward-to localhost:5000/api/payments/webhook
  
  ```
* **Set Webhook Secret**
  Copy the `whsec_...` secret key outputted in your terminal after running the listener command, and add it to your backend `.env` file:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_your_generated_local_secret
  
  ```
---
### Step 5: Install Dependencies & Run Backend

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

### Step 6: Install Dependencies & Run Frontend

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
