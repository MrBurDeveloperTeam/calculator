import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { exchangeSsoToken } from '../lib/odooApi';
import { api } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            // 1. Attempt SSO Exchange first (silently configures Supabase session if Odoo cookie is valid)
            await exchangeSsoToken().catch(console.warn);

            // 2. Get initial session from Supabase (now potentially populated by the SSO exchange)
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        // 1. Clear local Supabase session first to guarantee local logout
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('is_sso_session');
        } catch (err) {
            console.error('Error clearing local session:', err);
        }

        // 2. Attempt to notify the backend and any openers
        try {
            await api.post('/logout');
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                    { type: 'SSO_LOGOUT', source: 'miniapp' },
                    'https://app.snabbb.com'
                );
            }
        } catch (err) {
            console.error('Error during backend sign out:', err);
        } finally {
            // 3. Always redirect, regardless of success or failure
            window.location.href = 'https://app.snabbb.com';
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
