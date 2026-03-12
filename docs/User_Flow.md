# Delivery Tracker - User Flows

This document details the distinct user journeys for the 3 main roles in the Logistiq Delivery Tracker system: **Customer**, **Staff (Delivery Driver)**, and **Admin**.

---

## 1. Customer Flow
The primary goal of the customer is to securely register, verify their email, and track the real-time status of packages shipped to them.

### Registration & Onboarding
1. **Sign Up:** The user navigates to `/register` and enters their Name, Email, and Password.
2. **OTP Generation:** The backend creates an inactive `CUSTOMER` account, generates a 6-digit OTP, hashes it, and emails the plaintext code via Google SMTP.
3. **Verification:** The user is prompted to enter the OTP on the website. If successful, the account is marked `isVerified: true` and a JWT token is issued.
4. **Login:** Unverified users are blocked from logging in. Verified users are logged in and routed to the Tracking Portal (`/`).

### Tracking Packages
1. **My Deliveries Dashboard:** Upon logging in, the Customer is routed to the Tracking Portal. The system automatically fetches and displays all active and past shipments linked to the customer's email address.
2. **Search by ID:** The customer can also manually input a Tracking ID in the search bar.
3. **View Timeline:** Clicking a shipment opens a detailed view showing the package origin, destination, and a vertical timeline of status events (e.g., *Order Created* -> *In Transit* -> *Delivered*).
4. **Live Updates:** Because the website utilizes Socket.io, if a driver updates the package status while the customer has the page open, the timeline will visually update in real-time without refreshing.

---

## 2. Staff (Delivery Driver) Flow
The primary goal of the staff member is to process packages through the logistics network by scanning barcodes and updating their current status.

### Authentication
1. **Login:** A Staff member navigates to `/login` and enters their system-provided credentials (seeded by the Admin).
2. **Access Control:** The system recognizes the `STAFF` role and redirects them exclusively to the Staff Dashboard (`/staff`). They are blocked from accessing Admin routes.

### Managing Deliveries
1. **System Deliveries:** Any logged-in Staff member can access the global deliveries view. They aren't restricted to a single assigned route; instead, they can scan or select any active package in the system to process it.
2. **Status Updates:** The driver selects a package and chooses a valid next logical status (e.g., transitioning from *In Transit* to *Out for Delivery*).
3. **Proof of Delivery:** If the driver selects the final *Delivered* status, they must upload an image or PDF as "Proof of Delivery" (handled via Multer).
4. **Automated Notifications:** Confirming the update saves the new status to the database, logs a historical `TrackingEvent`, and automatically triggers an email notification to the Customer informing them of the delivery progress.

---

## 3. Admin Flow
The primary goal of the Admin is to oversee the entire logistics system, manage personnel, and generate shipments.

### Authentication
1. **Login:** The Admin navigates to `/login` with credentials stored in the DB (via `seed.js`). 
2. **Access Control:** The system identifies the `ADMIN` role and routes them to the comprehensive Admin Dashboard (`/admin`).

### Dashboard & Analytics
1. **High-Level Statistics:** The main dashboard aggregates global data, displaying the total number of active shipments, packages delivered today, and active staff members.
2. **Recent Activity:** A quick-glance table shows the latest status changes across the entire logistics network.

### Shipment Management
1. **Creation:** Under `/admin/shipments`, the Admin can create a new order by inputting sender/receiver details, weight, and the Customer's Email.
2. **Automated Generation:** The system automatically assigns a unique alphanumeric Tracking ID and generates a scannable 2D Barcode image.
3. **Dispatch Email:** Once created, the system immediately emails the Customer their new Tracking ID so they can monitor the delivery.
4. **Action & Verification:** The Admin has the exclusive authority to delete erroneous shipments from the system. They can also view the **Proof of Delivery** image directly from the shipments table for any package marked as *Delivered*.

### Staff Management
1. **Personnel Dashboard:** Under `/admin/staff`, the Admin views a list of all active drivers in the system.
2. **Creation & Deletion:** The Admin can register new driver accounts or execute a strict deletion of ex-employees via secure backend API routes.
