import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (credentials: Record<string, string>) => Promise<void>;
    register: (details: Record<string, string>) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    // Fetch user profile on startup if token exists
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/api/user');
                    setUser(response.data);
                } catch (err: any) {
                    console.error('Session restoration failed:', err);
                    handleSessionTermination();
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, [token]);

    const handleSessionTermination = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
    };

    const login = async (credentials: Record<string, string>) => {
        setError(null);
        try {
            const response = await api.post('/api/login', credentials);
            const { access_token, user: userData } = response.data;
            localStorage.setItem('access_token', access_token);
            setToken(access_token);
            setUser(userData);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            throw err;
        }
    };

    const register = async (details: Record<string, string>) => {
        setError(null);
        try {
            const response = await api.post('/api/register', details);
            const { access_token, user: userData } = response.data;
            localStorage.setItem('access_token', access_token);
            setToken(access_token);
            setUser(userData);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed. Please check your details.';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
        } catch (err) {
            console.error('Logout error on server:', err);
        } finally {
            handleSessionTermination();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                loading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
