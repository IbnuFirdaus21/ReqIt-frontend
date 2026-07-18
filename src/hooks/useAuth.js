import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
        }
        setAuthLoading(false);
    }, []);

    const login = useCallback(async (email, password, requiredRole = null) => {
        const data = await loginUser(email, password);

        if (requiredRole && data.user.role !== requiredRole) {
            throw new Error('Akses ditolak. Hanya admin yang bisa login di halaman ini.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback((redirectTo = '/') => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        navigate(redirectTo);
    }, [navigate]);

    const requireAuth = useCallback(() => {
        if (!isLoggedIn) return false;
        return true;
    }, [isLoggedIn]);

    return { isLoggedIn, user, authLoading, login, logout, requireAuth };
};