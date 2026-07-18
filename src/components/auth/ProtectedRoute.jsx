import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = 'admin', redirectTo = '/login_admin' }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate(redirectTo);
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== requiredRole) {
            navigate(redirectTo);
            return;
        }

        setIsAuthorized(true);
        setIsChecking(false);
    }, [navigate, requiredRole, redirectTo]);

    if (isChecking) return null;
    return isAuthorized ? children : null;
};

export default ProtectedRoute;