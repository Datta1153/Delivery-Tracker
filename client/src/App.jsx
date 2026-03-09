import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages - Lazy loaded or imported
import Login from './pages/Login';
import Register from './pages/Register';
import TrackingPortal from './pages/TrackingPortal'; // Customer page
import AdminDashboard from './pages/admin/AdminDashboard'; // We'll build this
import AdminShipments from './pages/admin/AdminShipments';
import AdminStaff from './pages/admin/AdminStaff';
import StaffDashboard from './pages/staff/StaffDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer / Shared Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'STAFF']}>
                <TrackingPortal />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="shipments" element={<AdminShipments />} />
            <Route path="staff" element={<AdminStaff />} />
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
