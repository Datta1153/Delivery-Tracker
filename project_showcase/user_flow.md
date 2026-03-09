# User Flow: Logistiq Delivery Tracker

The Logistiq Delivery Tracker supports three distinct user roles: **Admin**, **Staff**, and **Customer**. Below is the detailed user flow for each role, outlining their journey through the application.

---

## 1. Customer Flow

**Goal:** Register an account, track packages, and receive live updates on their deliveries.

### Registration & Login
1. **Visit Portal:** The customer visits the landing page (`/`). If not logged in, they are prompted to either "Login" or "Sign up for free".
2. **Registration:**
   - Clicks "Sign up for free" and is navigated to `/register`.
   - Steps 1: Enters Basic Info (Name, Email, Password).
   - Step 2: An OTP (One-Time Password) is sent to their email via **Nodemailer** + **Gmail SMTP**.
   - The user enters the 6-digit OTP to verify their email address.
   - Upon successful verification, the account is activated.
3. **Login:** The user logs in via `/login`. The system detects the `CUSTOMER` role and redirects them to the Tracking Portal (`/`).

### Tracking Packages
1. **Dashboard View ("My Deliveries"):** 
   - Upon logging in, the portal automatically fetches and displays a list of all shipments registered to the customer's email address.
2. **Search by ID:**
   - The customer can manually enter a `Tracking ID` into the search bar.
3. **Live Timeline:**
   - Clicking on a delivery or searching an ID opens the shipment timeline.
   - The customer sees a visual progress bar (Order Created → Picked Up → In Transit → Delivered).
   - If the package is "Delivered", a button appears to view the uploaded **Proof of Delivery** (signature/photo).
4. **Real-time Updates:**
   - The tracking page is connected to a **Socket.io** WebSocket. If a delivery driver updates the parcel's status while the customer is on the page, the timeline animates and updates instantly without a page refresh.

---

## 2. Staff (Delivery Driver) Flow

**Goal:** View assigned deliveries, update package statuses on the road, and upload Proof of Delivery.

### Login
1. **Login:** The staff member visits `/login` and enters their assigned credentials (e.g., `staff@logistiq.com`).
2. **Redirection:** The system detects the `STAFF` role and redirects them to the Staff Dashboard (`/staff`).

### Route Management
1. **Dashboard View:**
   - The staff member sees two columns: "Active Packages" (their assigned route) and a "Status Update Panel".
   - The package list is automatically filtered so they *only* see shipments assigned to them by the Admin.
2. **Updating a Status:**
   - The driver clicks on a package from their list.
   - They select the next logical status from a dropdown (e.g., changing from "Out for Delivery" to "Delivered"). The system enforces strict workflow transitions (they cannot skip steps).
   - They can optionally add a "Current Location" or description note.
3. **Proof of Delivery:**
   - If the selected status is **"Delivered"**, a file upload dropzone appears.
   - The driver takes a photo of the delivered package or uploads a signature PDF.
4. **Submission:**
   - When the driver clicks "Confirm Status Update":
     - The backend saves the update and uploads the proof image via **Multer**.
     - An automated **Email Notification** is fired off to the Customer alerting them of the new status.
     - A **Socket.io** event is emitted to instantly update any tracking portals watching that package.

---

## 3. Admin Flow

**Goal:** Manage all shipments, oversee staff accounts, and maintain system operations.

### Login
1. **Login:** The Admin visits `/login` and enters their master credentials (e.g., `admin@logistiq.com`).
2. **Redirection:** The system detects the `ADMIN` role and redirects them to the Admin Dashboard (`/admin`).

### Shipment Management (`/admin/shipments`)
1. **Creation:**
   - The Admin clicks "New Shipment".
   - A modal appears where they input Sender details, Receiver details, Package Weight, Customer Email, and assign a specific Staff member to deliver it.
   - Upon creation, a unique `Tracking ID` and `Barcode` are generated, and a confirmation email is sent to the customer.
2. **Oversight:**
   - The Admin can view *all* shipments in the company, paginated and searchable by keyword/status.
   - The Admin sees the live status and the staff member currently responsible for each package.
3. **Deletion:** The Admin has the exclusive right to delete a shipment from the database.

### Staff Management (`/admin/staff`)
1. **Creation:**
   - The Admin can register new Delivery Drivers/Staff members to the system.
2. **Management:**
   - The Admin can view all active staff members.
   - Using a custom warning modal, the Admin can permanently delete staff accounts when they leave the company.

---

## Technical Flow Diagram Summary
**Frontend (React)** -> `Axios` Request + `JWT Bearer Token` -> **Backend (Node/Express)** -> `Auth Middleware (Role Check)` -> `Controller` -> **Database (MongoDB)**
