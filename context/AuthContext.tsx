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
    const currentUserIdRef = useRef<string | null>(null);

    useEffect(() => {
    isMountedRef.current = true;
    let initialResolutionComplete = false;
    let revalidateInFlight = false;

    const resolveSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
        const generation = ++authGenerationRef.current;
        const nextUserId = session?.user?.id ?? null;
        currentUserIdRef.current = nextUserId;
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

    // A tab open before someone logs out of Snabbb elsewhere never finds
    // out on its own, so we re-run exchangeSsoToken() whenever this tab
    // regains focus -- a 401 there signs this tab out too (see
    // lib/odooApi.ts). Two guards matter here:
    // 1. initialResolutionComplete: opening this page in a NEW TAB (e.g.
    //    following the ?sso_token=... link) can fire a 'focus' event on
    //    window almost immediately -- before initializeAuth()'s own
    //    exchangeSsoToken() call above has resolved. Without this guard,
    //    that fires a second, redundant exchange call that races with (and
    //    can cancel) the one actually processing the fresh sso_token,
    //    breaking login entirely.
    // 2. revalidateInFlight: visibilitychange and focus can both fire for
    //    the same tab switch, which would otherwise fire two overlapping
    //    exchange calls at once.
    const revalidateOnFocus = () => {
        console.log('AuthContext: revalidateOnFocus fired');
        if (!initialResolutionComplete || revalidateInFlight) return;
        if (document.visibilityState === 'visible') {
            revalidateInFlight = true;
            exchangeSsoToken()
                .catch(console.warn)
                .finally(() => { revalidateInFlight = false; });
        }
    };
    document.addEventListener('visibilitychange', revalidateOnFocus);
    window.addEventListener('focus', revalidateOnFocus);

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!initialResolutionComplete) return;

        const nextUserId = session?.user?.id ?? null;

        if (
            nextUserId !== null &&
            nextUserId === currentUserIdRef.current &&
            (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')
        ) {
            setUser(session?.user ?? null);
            return;
        }

        void resolveSession(session);
    });

    return () => {
        isMountedRef.current = false;
        authGenerationRef.current += 1;
        subscription.unsubscribe();
        document.removeEventListener('visibilitychange', revalidateOnFocus);
        window.removeEventListener('focus', revalidateOnFocus);
    };
}, []);

const fetchProfile = async (userId: string, generation: number) => {
    try {
        // Don't trust the local Supabase session by itself -- that's
        // exactly what stays "valid" for a while after the user logs out
        // of Snabbb elsewhere, which is the bug we're chasing. Re-run the
        // SSO exchange here too: if the shared cookie is already gone,
        // exchangeSsoToken() gets a 401 and signs this tab out for real
        // (see lib/odooApi.ts), and we bail out below before ever
        // fetching or displaying stale profile data.
        await exchangeSsoToken().catch(() => { });

        const { data: { session } } = await supabase.auth.getSession();
        if (
            !session ||
            session.user.id !== userId ||
            !isMountedRef.current ||
            generation !== authGenerationRef.current
        ) {
            return;
        }

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
        }
    } catch (err) {
        console.error('Unexpected error fetching profile:', err);
    } finally {
        if (isMountedRef.current && generation === authGenerationRef.current) {
            setIsLoading(false);
        }
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
