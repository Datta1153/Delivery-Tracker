import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PackageProvider } from './context/PackageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

// Pages (lazy-loaded for faster initial render)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const TrackPage = React.lazy(() => import('./pages/TrackPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PackageDetailPage = React.lazy(() => import('./pages/PackageDetailPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
// RouteOptimizerPage removed
const RatingsPage = React.lazy(() => import('./pages/RatingsPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PackageProvider>
          <div className="App">
            <Navbar />
            <Suspense fallback={<div style={{padding:40,textAlign:'center'}}>Loading...</div>}>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packages/:id"
                element={
                  <ProtectedRoute>
                    <PackageDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              {/* Route optimizer removed */}
              <Route
                path="/ratings"
                element={
                  <ProtectedRoute>
                    <RatingsPage />
                  </ProtectedRoute>
                }
              />
              </Routes>
            </Suspense>
          </div>
        </PackageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
