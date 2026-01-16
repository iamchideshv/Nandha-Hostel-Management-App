'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User, UserRole } from './types';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';


export interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('hostel_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('hostel_user', JSON.stringify(userData));
    };


    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('hostel_user');
    };

    const value = useMemo(() => ({
        user,
        login,
        logout,
        isLoading
    }), [user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
