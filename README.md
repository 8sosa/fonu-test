# Fonu Fintech Admin & Subscription Portal
  A robust full-stack solution for managing customer KYC, automated subscriptions, and financial audit logging.

# Project Structure

  A clear map of the monorepo for easier navigation:
  
  /api: Node.js + Express + TypeScript backend.
  
  src/controllers: Business logic for Auth, KYC, and Subscriptions.
  
  src/middleware: Security layer (JWT Auth, RBAC, Rate Limiting).
  
  src/tests: Automated requirement verification suite.
  
  /web: React + Vite + Tailwind CSS frontend.
  
  src/components: Reusable UI (Admin Dashboard, Modals).
  
  src/pages: Role-based views (Login, Registration, Customer Portal).

# Quick Start (Docker)
  The entire stack (Frontend, API, and PostgreSQL) can be launched with a single command: 'docker-compose up --build' .
  The dashboard is role dependent so the view you get is based on the role your login credentials are validated to.
  
  Dashboard: http://localhost:5173/
 
  API Base URL: http://localhost:3000

# Data Lifecycle

  ### Understanding the flow:
  
  Registration: User creates a profile (Status: PENDING).
  
  KYC: Admin reviews and approves (Status: APPROVED).
  
  Subscription: Admin assigns a plan (Status: INACTIVE).
  
  Payment: Webhook receives payment.success (Status: ACTIVE).

# Credentials for Testing:

  Role - Admin
  
  Email - admin@fonu.com
  
  Password - password123
  
  
  Role - Customer
  
  Email - user@fonu.com
  
  Password - password123

# Environment Variables
  
  The following variables are required in your ./api/.env file:
  
  DATABASE_URL: postgresql://admin:password123@db:5432/fonu_db?schema=public
  
  JWT_SECRET: Your secret key for token signing
  
  WEBHOOK_SECRET: fonu_secret_123 (Shared with simulated payment provider)

# Triggering Webhook Events:
  To simulate a payment provider (like Paystack/Stripe), you can use the following curl command.
  
  Note: The API validates the x-fonu-signature header using HMAC SHA-256. 

  Simulate Payment Success
  
  // Activation of a subscription
  
  curl -X POST http://localhost:3000/webhooks/payments \
    -H "Content-Type: application/json" \
    -H "x-fonu-signature: <GENERATED_HMAC_SHA256>" \
    -d '{
      "event": "payment.success",
      "data": { "subscriptionId": "YOUR_SUB_ID" }
    }'
  
# Testing & CI

  This project includes a comprehensive suite of 5+ backend tests covering Auth, KYC Guards, and Webhook security. 
  
  ## ⚠️ Warning: Data Reset
  
  To ensure a "Clean Slate" for requirement verification, the test suite is designed to nuke the database (using TRUNCATE ... CASCADE) before execution. It is highly recommended to run tests against a dedicated test database or be aware that manual entries will be cleared.
  
  Run Locally: cd api && npm test
  
  CI Status: Powered by GitHub Actions. Every push validates the build on Node.js 22 and PostgreSQL 15.

  ### 📡 How to Simulate Webhooks (Foolproof)
  Since the API requires valid HMAC signatures, I have provided a helper script to generate the exact `curl` command for you.
  
  1. Find a Subscription ID in the Admin Dashboard or Database.
  2. Run the generator:
     ```bash
     node simulate-webhook.js <SUB_ID>

# Design Notes

  KYC Guard: Subscriptions are hard-locked to an INACTIVE state until KYC is APPROVED. The Webhook processor enforces this rule server-side.
  
  Security: Implemented Rate Limiting on Auth endpoints to prevent brute-force attacks and used HMAC signatures for secure webhook processing.
  
  Trade-offs: For this assessment, webhook processing is synchronous. In a high-traffic production app, I would implement a BullMQ/Redis queue for background processing.
  
  Auditing: Every incoming webhook is persisted in the WebhookEvent table for full financial traceability.
