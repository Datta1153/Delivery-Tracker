# Technology Stack & Feature Mapping

Here is the breakdown of the technologies used to build the Logistiq Delivery Tracker, mapped directly to the features they power.

## Core Stack Overview
* **Frontend:** React.js (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ORM)
* **Real-time:** Socket.io

---

## Feature-by-Feature Technology Mapping

### 1. Account Authentication & Security
**Feature:** Secure login, role-based access control (Admin, Staff, Customer), and password protection.
* **Technology Used:**
  * **JSON Web Tokens (JWT):** Generates secure, stateless session tokens on the backend.
  * **Bcrypt.js:** Hashes user passwords before saving them to MongoDB so they are never stored in plain text.
  * **React Context (`AuthContext`):** Manages the global authentication state across the frontend.
  * **React Router v6:** Handles the frontend routing and uses custom wrapper components (`<ProtectedRoute>`) to block unauthorized users from specific pages.

### 2. Customer Registration & Email Verification (OTP)
**Feature:** Customers register an account, and the system sends a 6-digit One-Time Password to their email to verify ownership before activating the account.
* **Technology Used:**
  * **Nodemailer:** Node.js module used to construct and send the verification emails.
  * **Gmail SMTP:** Serves as the email transport layer to reliably deliver messages to user inboxes.
  * **Node.js Crypto Module:** Hashes the 6-digit OTP before saving it to the database for security, along with an expiration time parameter.

### 3. Automated Delivery Notifications
**Feature:** Whenever an Admin creates an order, or a Driver updates a package location, the Customer receives a professionally formatted email alert.
* **Technology Used:**
  * **Nodemailer / Express.js:** Embedded directly into the database controller functions (`createShipment`, `updateShipmentStatus`) to trigger asynchronous email deployments upon successful MongoDB writes.

### 4. Live Package Tracking (Real-time Timeline)
**Feature:** A visual timeline on the Customer portal that updates instantly (without refreshing) the moment a driver updates the parcel's status.
* **Technology Used:**
  * **Socket.io (Server):** Opens a WebSocket connection. When a customer enters a Tracking ID, they "join" a specific socket room named after that ID.
  * **Socket.io-client (React):** Listens for `status_update` events on the frontend and instantly injects the new data into the React state, triggering a smooth CSS animation.
  * **Lucide-React:** Provides the beautiful, scalable SVG icons used throughout the tracking timeline progress bar.
  * **Date-fns:** Handles complex date formatting to ensure timestamps on the timeline are perfectly localized and readable.

### 5. Proof of Delivery (Photo/PDF Upload)
**Feature:** Delivery drivers can upload a photo of a package at a door, or a PDF of a signature, when marking an order as "Delivered".
* **Technology Used:**
  * **Multer:** A specialized Node.js middleware for handling `multipart/form-data`. It intercepts the image upload, extracts it from the request body, and safely writes the binary file to the server's `uploads/` directory.
  * **Express Static:** Used to expose the `uploads/` directory to the public web so the frontend can securely render the uploaded image.
  * **JS FormData API:** Used on the frontend to programmatically construct the multipart file wrapper before transmitting via Axios.

### 6. Admin Dashboards & UI/UX
**Feature:** Responsive, modern interfaces with dynamic sidebars, smooth transitions, and modal popups for data management.
* **Technology Used:**
  * **Tailwind CSS:** A utility-first CSS framework used for all styling. It enables the sleek, modern design system (custom color palettes, glassmorphism, responsive grids) without writing external CSS files.
  * **Axios (with Interceptors):** Used for all HTTP requests to the backend. The interceptor is configured to automatically attach the user's JWT token to every request header, simplifying the frontend code.
