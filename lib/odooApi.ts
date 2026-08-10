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
    password: string;
    accountType: 'individual' | 'company';
    companyName?: string;
    phone: string;
    position: string;
    dob: string;
    country: string;
    referralCode?: string;
    agreedToTerms: boolean;
}

interface SignInParams {
    email: string;
    password: string;
}

/**
 * Attempts to register a user in Odoo and mirrors the registration to Supabase.
 * Falls back to direct Supabase registration if the Odoo endpoint fails.
 */
export async function signUpDual({ email, password, fullName, accountType, companyName, phone, position, dob, country, referralCode, agreedToTerms }: SignUpParams) {
    const normalizedEmail = email.trim().toLowerCase();
    const name = fullName.trim();
    const normalizedReferralCode = referralCode?.trim() || null;
    const metadata = {
        name,
        full_name: name,
        account_type: accountType,
        phone: phone.trim(),
        position: position.trim(),
        company_name: accountType === 'company' ? companyName?.trim() || null : null,
        dob,
        country,
        referral_code: normalizedReferralCode,
        agreed_to_terms: agreedToTerms,
    };
    const odooPayload = {
        email: normalizedEmail,
        login: normalizedEmail,
        name,
        fullName: name,
        password,
        phone: metadata.phone,
        position: metadata.position,
        account_type: metadata.account_type,
        company_name: metadata.company_name,
        companyName: metadata.company_name,
        company_email: accountType === 'company' ? normalizedEmail : null,
        companyEmail: accountType === 'company' ? normalizedEmail : null,
        contact_name: accountType === 'company' ? name : null,
        company_type: accountType === 'company' ? 'company' : 'person',
        dob: metadata.dob,
        country: metadata.country,
        referral_code: metadata.referral_code,
        referralCode: metadata.referral_code,
    };
    const supaPayload = {
        email: normalizedEmail,
        password,
        options: { data: metadata },
    };

    // Match E-learning: Odoo must succeed before Supabase registration starts.
    const { data: odooData } = await odooApi.post('/calculator/sign-up', odooPayload);
    const odooResult = odooData?.data?.result ?? odooData?.result ?? odooData;
    if (odooData?.error || odooResult?.ok === false || odooResult?.created === false) {
        throw new Error(odooData?.error?.message || odooData?.error || odooData?.data?.error?.message || 'Failed to create Calculator account');
    }

    const supaResult = await supabase.auth.signUp(supaPayload);
    if (supaResult.error) throw supaResult.error;
    return supaResult.data;
}

/**
 * Attempts to log in via Odoo, then synchronizes tokens with Supabase.
 * Falls back to Supabase auth natively if Odoo is unreachable.
 */
export async function signInDual({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });

    if (error) throw error;
    
    // Explicitly note that this is a direct, non-SSO login
    localStorage.setItem('is_sso_session', 'false');

    return data;
}

/**
 * Contacts the SSO endpoint to retrieve access/refresh tokens and injects them into the Supabase session
 */
export async function exchangeSsoToken() {
    try {
        const sso = await odooApi.get('/sso/exchange');
        if (sso?.data?.access_token && sso?.data?.refresh_token) {
            const { error } = await supabase.auth.setSession({
                access_token: sso.data.access_token,
                refresh_token: sso.data.refresh_token,
            });
            if (error) throw error;
            localStorage.setItem('is_sso_session', 'true');
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
