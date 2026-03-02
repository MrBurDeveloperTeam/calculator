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
        console.log('sessionData response:', sessionData);
        return data
      } catch (error) {
      //   const fallback = {
      //   user_id: supabaseUserId,
      //   email: user?.email || '',
      //   name: user?.name || '',
      //   account_type: user?.accountType || 'individual',
      //   phone: user?.phone || '',
      //   position: user?.position || '',
      //   company_name: user?.clinicName || null,
      //   avatar_url: finalAvatar,
      //   background_url: finalBackground
      // };
      // const { error: upsertError } = await supabase.from('profiles').upsert(fallback, { onConflict: 'user_id' });
        console.log('error during SSO exchange, likely no active session:', error);
        // navigate('/login', { replace: true });
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // optional
    retry: false,              // ✅ stop retry immediately
    refetchOnWindowFocus: false,
  })
}