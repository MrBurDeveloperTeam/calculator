import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://sso.snabbb.com/api";

export const odooApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

odooApi.interceptors.response.use(
    (res) => res,
    (err) => {
        const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err.message;
        const error = new Error(msg) as any;
        error.status = err?.response?.status;
        return Promise.reject(error);
    }
);

interface SignUpParams {
    email: string;
    fullName: string;
    password?: string;
    accountType?: 'individual' | 'company';
    companyName?: string;
    phone?: string;
    position?: string;
    dob?: string;
    country?: string;
    referralCode?: string;
    agreedToTerms?: boolean;
}

/** Register only in the central Odoo account system.
 * Supabase is hydrated later through SSO, so signing up here as well would
 * create a second account and send a second verification email.
 */
export async function signUpDual({
    email,
    password,
    fullName,
    accountType = 'individual',
    companyName,
    phone,
    position,
    dob,
    country,
    referralCode,
    agreedToTerms,
}: SignUpParams) {
    const odooPayload = {
        email: email.trim().toLowerCase(),
        name: fullName.trim(),
        password,
        account_type: accountType,
        company_name: companyName?.trim() || undefined,
        phone: phone?.trim() || undefined,
        position: position?.trim() || undefined,
        dob,
        country,
        referral_code: referralCode?.trim() || undefined,
        agreed_to_terms: agreedToTerms,
    };
    const { data } = await odooApi.post('/calculator/sign-up', odooPayload);
    const result = data?.data?.result ?? data?.result ?? data;

    if (data?.error || result?.ok === false) {
        throw new Error(
            data?.error?.data?.message ||
            data?.error?.message ||
            result?.message ||
            result?.error ||
            'Failed to create account'
        );
    }

    return result;
}

/**
 * Contacts the SSO endpoint to retrieve access/refresh tokens and injects them into the Supabase session
 */
export async function exchangeSsoToken() {
    try {
        const token = new URLSearchParams(window.location.search).get('token');
        const sso = await odooApi.get('/sso/exchange', token ? {
            headers: { Authorization: `Bearer ${token}` },
        } : undefined);
        if (sso?.data?.access_token && sso?.data?.refresh_token) {
            const { error } = await supabase.auth.setSession({
                access_token: sso.data.access_token,
                refresh_token: sso.data.refresh_token,
            });
            if (error) throw error;
            localStorage.setItem('is_sso_session', 'true');
            if (token) window.history.replaceState({}, '', '/');
            return true;
        }
    } catch (err: any) {
        console.warn('No active SSO session to exchange.', err.message);
        const { data: sessionData } = await supabase.auth.getSession();
        
        // If there is an authorization failure and we previously had an SSO session
        if (sessionData.session && (err.status === 401 || err.status === 403 || err.status === 404) && localStorage.getItem('is_sso_session') === 'true') {
            await supabase.auth.signOut();
            localStorage.removeItem('is_sso_session');
        }
        return false;
    }
    return false;
}
