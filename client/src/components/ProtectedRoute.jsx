import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'CUSTOMER') return <Navigate to="/" replace />;
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/staff'} replace />;
    }

    return children;
};

export default ProtectedRoute;
