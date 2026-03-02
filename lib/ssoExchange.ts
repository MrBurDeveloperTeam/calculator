import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import { useNavigate } from 'react-router-dom';

export function useSsoExchange() {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ['sso-exchange'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/sso/exchange')
        return data
      } catch (error) {
        console.log('error during SSO exchange, likely no active session:', error);
        // navigate('/login', { replace: true });
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // optional
  })
}