import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function useSsoExchange() {
  return useQuery({
    queryKey: ['sso-exchange'],
    queryFn: async () => {
      const { data } = await api.get('/sso/exchange')
      return data
    },
    staleTime: 5 * 60 * 1000, // optional
  })
}