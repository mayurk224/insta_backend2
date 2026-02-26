import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    return children;
};

export default ProtectedRoute;
