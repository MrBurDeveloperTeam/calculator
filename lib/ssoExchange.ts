import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

export function useSsoExchange() {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ['sso-exchange'],
    queryFn: async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { data } = await api.get('/sso/exchange');
        const { error } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });
        
        localStorage.setItem('is_sso_session', 'true');
        console.log('sessionData response:', sessionData);
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id || null;
        console.log('userData:', userData, 'userId:', userId);
        return data
      } catch (error: any) {
        console.log('error during SSO exchange, likely no active session:', error);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session && (error.status === 401 || error.status === 403 || error.status === 404) && localStorage.getItem('is_sso_session') === 'true') {
           await supabase.auth.signOut();
           localStorage.removeItem('is_sso_session');
        }
        
        // navigate('/login', { replace: true });
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // optional
    retry: false,              // ✅ stop retry immediately
    refetchOnWindowFocus: false,
  })
}