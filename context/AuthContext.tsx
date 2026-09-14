import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { exchangeSsoToken, signUpDual } from '../lib/odooApi';
import { api } from '@/lib/api';
import { loginOdoo } from '@/lib/loginOdoo';
import applink from '@/lib/app_link';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: typeof signUpDual;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    signIn: async () => { },
    signUp: signUpDual,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const authGenerationRef = useRef(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        let initialResolutionComplete = false;

        const resolveSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
            const generation = ++authGenerationRef.current;
            setIsLoading(true);
            setProfile(null);
            setUser(session?.user ?? null);

            if (!session?.user) {
                if (isMountedRef.current && generation === authGenerationRef.current) {
                    setIsLoading(false);
                }
                return;
            }

            await fetchProfile(session.user.id, generation);
        };

        const initializeAuth = async () => {
            // 1. Attempt SSO Exchange first (silently configures Supabase session if Odoo cookie is valid)
            await exchangeSsoToken().catch(console.warn);

            // 2. Get initial session from Supabase (now potentially populated by the SSO exchange)
            const { data: { session } } = await supabase.auth.getSession();
            await resolveSession(session);
            initialResolutionComplete = true;
        };

        initializeAuth();

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Supabase may emit an initial null event while the explicit SSO
            // exchange above is still running. The initializer owns the UI
            // until it has conclusively resolved that exchange and session.
            if (!initialResolutionComplete) return;
            void resolveSession(session);
        });

        return () => {
            isMountedRef.current = false;
            authGenerationRef.current += 1;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string, generation: number) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (!isMountedRef.current || generation !== authGenerationRef.current) return;

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
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

    const signIn = async (email: string, password: string) => {
        const response = await loginOdoo(email.trim(), password);
        const odooUser = response?.data?.result ?? response?.result ?? response?.sessionInfo;

        if (!odooUser?.uid) {
            throw new Error('Invalid login credentials');
        }

        await applink(odooUser);
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp: signUpDual, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
