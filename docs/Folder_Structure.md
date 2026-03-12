# Delivery Tracker - Folder Structure

This document outlines the architecture and directory structure of the Logistiq Delivery Tracker application. The project follows a standard MERN stack architecture, separated into a React frontend (`client`) and a Node.js/Express backend (`server`).

## Root Directory
```text
Delivery-Tracker/
├── client/          # Frontend React Application (Vite)
├── server/          # Backend Node.js & Express Application
└── docs/            # Project documentation and showcase files
```

---

## Client (Frontend) Architecture
The frontend is structured to promote component reusability and separation of concerns using React Context for state management.

```text
client/
├── public/                 # Static assets like images and icons
├── src/                    
│   ├── components/         # Reusable UI components
│   │   ├── Layout.jsx      # Main application layout wrapper
│   │   ├── ProtectedRoute.jsx # Authentication guard for secure routes
│   │   └── Sidebar.jsx     # Navigation sidebar (dynamic based on roles)
│   ├── context/            # React Context for global state
│   │   └── AuthContext.jsx # Manages user authentication state & login/logout
│   ├── pages/              # Main application views/pages
│   │   ├── admin/          # Admin-specific pages
│   │   │   ├── AdminDashboard.jsx # High-level system overview
│   │   │   ├── AdminShipments.jsx # Shipment CRUD operations
│   │   │   └── AdminStaff.jsx     # Staff CRUD operations
│   │   ├── staff/          # Staff-specific pages
│   │   │   └── StaffDashboard.jsx # Delivery route and status updates
│   │   ├── Login.jsx       # Universal login page
│   │   ├── Register.jsx    # Customer registration & OTP verification
│   │   └── TrackingPortal.jsx # Public/Customer view for tracking packages
│   ├── services/           # External API integrations
│   │   └── api.js          # Axios configuration with JWT interceptors
│   ├── App.jsx             # Main React component establishing React Router
│   ├── index.css           # Global stylesheet & Tailwind directives
│   └── main.jsx            # Application entry point
├── package.json            # Frontend dependencies (React, Vite, Tailwind, etc.)
├── tailwind.config.js      # Tailwind CSS theme and utility configuration
└── vite.config.js          # Vite build tool configuration
```

---

## Server (Backend) Architecture
The backend follows a standard MVC (Model-View-Controller) design pattern to keep business logic separate from routing.

```text
server/
├── controllers/            # Business logic for handling requests
│   ├── analyticsController.js # Aggregates data for the Admin Dashboard
│   ├── authController.js      # Login, Registration, and OTP Verification
│   └── shipmentController.js  # Shipment CRUD and Status Updates
├── middlewares/            # Express middlewares
│   └── authMiddleware.js      # Validates JWTs and enforces Role-Based Access
├── models/                 # Mongoose Database Schemas
│   ├── Shipment.js            # Package details and current status
│   ├── TrackingEvent.js       # Historical logs of status changes
│   └── User.js                # System users (Admin, Staff, Customer)
├── routes/                 # Express route definitions
│   ├── analyticsRoutes.js     # Routes mapping to analytics controllers
│   ├── authRoutes.js          # Routes mapping to auth controllers
│   ├── shipmentRoutes.js      # Routes mapping to shipment controllers
│   └── uploadRoutes.js        # Routes for handling Multer file uploads
├── uploads/                # Directory storing Proof of Delivery images/PDFs
├── utils/                  # Helper functions
│   ├── generator.js           # Generates unique Tracking IDs and Barcodes
│   └── mailer.js              # Nodemailer configuration for sending emails/OTPs
├── .env                    # Environment variables (DB URI, JWT Secret, SMTP config)
├── index.js                # Express Server entry point & Socket.io integration
├── package.json            # Backend dependencies (Express, Mongoose, Socket.io)
└── seed.js                 # Script to populate initial Admin/Staff database records
```
