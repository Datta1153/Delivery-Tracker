# Project Folder Structure

The Logistiq Delivery Tracker is built as a complete full-stack application using the MERN stack (MongoDB, Express, React, Node.js). The project is separated into a `client` (frontend) and `server` (backend) directory.

```text
Delivery-Tracker/
│
├── client/                     # FRONTEND (Vite + React.js)
│   ├── public/                 # Static assets (favicons, etc.)
│   └── src/
│       ├── components/         # Reusable UI elements
│       │   ├── Layout.jsx           # Master layout wrapper
│       │   ├── ProtectedRoute.jsx   # Role-based route guard for authentication
│       │   └── Sidebar.jsx          # Dynamic sidebar navigation (Admin/Staff/Customer)
│       │
│       ├── context/            # React Context Providers
│       │   └── AuthContext.jsx      # Manages global user state, login, logout, and tokens
│       │
│       ├── pages/              # Application Pages/Views
│       │   ├── admin/               # Admin specific views
│       │   │   ├── AdminDashboard.jsx     # Overview metrics
│       │   │   ├── AdminShipments.jsx     # Full shipment oversight and creation
│       │   │   └── AdminStaff.jsx         # Employee management
│       │   │
│       │   ├── staff/               # Staff specific views
│       │   │   └── StaffDashboard.jsx     # Dynamic route list and status update tool
│       │   │
│       │   ├── Login.jsx            # Secure login portal
│       │   ├── Register.jsx         # 2-step registration (Info + Email OTP)
│       │   └── TrackingPortal.jsx   # Customer tracking dashboard & live timeline
│       │
│       ├── services/           # External Data fetching
│       │   └── api.js               # Axios instance with automatic JWT token injection
│       │
│       ├── App.jsx             # Main Router configuration
│       ├── index.css           # Tailwind configuration and global styles
│       └── main.jsx            # Vite React DOM mounting point
│
└── server/                     # BACKEND (Node.js + Express.js)
    ├── controllers/            # Business Logic Handlers
    │   ├── authController.js        # Login, Staff/User Registration, OTP generation & Verification
    │   └── shipmentController.js    # CRUD operations for packages, tracking events, notifications
    │
    ├── middlewares/            # Request Interceptors
    │   └── authMiddleware.js        # Validates JWT tokens and enforces Admin/Staff role requirements
    │
    ├── models/                 # MongoDB Database Schemas (Mongoose)
    │   ├── Shipment.js              # Shipment details, addresses, status, and assigned staff
    │   ├── TrackingEvent.js         # Historical logs of all timeline status changes
    │   └── User.js                  # User accounts, Role enums, password hashes, and OTPs
    │
    ├── routes/                 # API Endpoint Definitions
    │   ├── authRoutes.js       
    │   ├── shipmentRoutes.js   
    │   └── uploadRoutes.js          # Handles multipart/form-data for proof of delivery
    │
    ├── utils/                  # Helper Modules
    │   ├── generator.js             # Generates unique Tracking IDs and Barcode URLs
    │   └── mailer.js                # Nodemailer configuration for Gmail SMTP Integration
    │
    ├── uploads/                # Automatically generated storage directory for proof images
    │
    ├── .env                    # Environment variables (Database URI, JWT Secret, Gmail Credentials)
    ├── index.js                # Main Express Server & Socket.io initialization
    └── seed.js                 # Database seeding script for initial Admin/Staff setup
```

## Key Architectural Decisions

1. **Role-based Separation:** The frontend physically separates components by role (`pages/admin`, `pages/staff`) and guards them using `ProtectedRoute.jsx`. The backend enforces this using the `authMiddleware.js`.
2. **JWT Authentication:** Stateful sessions are handled via JWTs stored in `localStorage`, automatically attached to every outgoing API request by the `api.js` Axios interceptor.
3. **Decoupled Timeline:** Instead of repeatedly mutating a string array in the `Shipment` model, tracking updates are saved to a separate `TrackingEvent` model. This creates an immutable history log, providing rich data (time, location, notes, author) for the Customer's Tracking Portal timeline.
4. **Real-time Engine:** The server mounts `Socket.io` directly on top of the Express server in `index.js`, injecting the `io` instance into all routes so the `shipmentController` can broadcast updates the exact millisecond a database save completes.
