# Delivery Tracker - Features & Technology Stack

This document categorizes the core features of the Logistics application and specifies exactly which programming languages, libraries, and technologies power them under the hood.

---

## 1. Core Frameworks (The MERN Stack)
The application leverages the industry-standard MERN stack for a robust, Javascript-driven architecture.
- **MongoDB:** NoSQL Database chosen for flexible schema design (ideal for varying shipment details and event logs).
- **Express.js:** Fast, unopinionated web framework for Node.js used to build the backend REST API.
- **React.js (via Vite):** Frontend UI library chosen for its component-based architecture and state reactivity.
- **Node.js:** JavaScript runtime environment executing the backend server.

---

## 2. Authentication & Authorization
**Features:** Secure user registration, password protection, stateless login sessions, and role-based route protection (Customer, Staff, Admin).
- **Technology:** `jsonwebtoken (JWT)`
  - Used to generate secure, signed access tokens passed via HTTP Headers (Bearer).
- **Technology:** `bcryptjs`
  - Utilized to irreversibly hash user passwords before storing them in the MongoDB database.
- **Technology:** `React Router (v6)`
  - Used on the frontend (via custom `ProtectedRoute` components) to evaluate the JWT payload and block unauthorized UI navigation.

---

## 3. Email Automation & OTP Verification
**Features:** Customers are emailed a 6-digit verification code upon sign-up. Additionally, Customers automatically receive emails when a package is created and whenever a driver updates the delivery status.
- **Technology:** `Nodemailer`
  - Node.js module used to interface over SMTP.
- **Technology:** `Gmail SMTP`
  - Leverages Google's secure App Passwords to reliably deliver emails from the application to user inboxes, completely bypassing spam filters.
- **Technology:** Node `crypto` Module
  - Used to securely hash the 6-digit OTP codes before storing them in the database for later verification.

---

## 4. Real-Time Status Tracking
**Features:** When a Customer is viewing the Tracking route, any status update pushed by a Staff driver is instantly reflected on the Customer's timeline without requiring a page refresh.
- **Technology:** `Socket.io`
  - Enables bidirectional, event-based communication. The backend emits an event upon a database `PUT`, which the React frontend instantly catches and uses to update the React State.

---

## 5. File Uploads (Proof of Delivery)
**Features:** When a Delivery Driver marks a package as "Delivered," they are prompted to upload a photo of the package at the door. Resulting images are instantly accessible to Customers via the portal, and to Admins/Staff via their respective dashboards.
- **Technology:** `Multer`
  - Node.js middleware for handling `multipart/form-data`. It intercepts the image payload, saves the raw file to the server's local `uploads/` directory, and passes the resulting Relative File Path back to Mongoose to attach to the Shipment record.

---

## 6. Frontend Styling & UI Components
**Features:** Responsive layouts, modern typography, dynamic navigation sidebars, modally driven forms, and comprehensive UI feedback (spinners, alerts).
- **Technology:** `Tailwind CSS`
  - Utility-first CSS framework allowing for rapid, inline styling and responsive design.
- **Technology:** `Lucide React`
  - Used for consistent, modern SVG iconography throughout the application (e.g., packages, trucks, user icons).
- **Technology:** `Date-Fns`
  - Lightweight date utility library used in the React frontend to properly format MongoDB timestamp data into human-readable strings.

---

## 7. Database Modeling & Relationships
**Features:** Structuring the data to ensure every package knows which Customer is waiting for it and maintains a full history of its status changes and location movements.
- **Technology:** `Mongoose`
  - Object Data Modeling (ODM) library for MongoDB. Features strict Schema definitions to maintain data integrity across hundreds of concurrent delivery events.
