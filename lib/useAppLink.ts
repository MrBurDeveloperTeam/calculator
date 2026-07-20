import { useMutation } from '@tanstack/react-query';
import { api } from './api';

interface AppLinkParams {
  app: string;
  email: string;
  name: string;
}

interface AppLinkResponse {
  jsonrpc?: string;
  id?: number;
  result?: {
    url?: string;
    supabase_user_id?: string;
    [key: string]: unknown;
  };
}

/**
 * Mints an SSO handoff for another Snabbb app (reward, e-learning, snabbb, etc.)
 * so cross-app links land the user in an authenticated state instead of
 * bouncing to that app's own login/home page.
 *
 * Mirrors the /v1/sso/userid pattern used by the Appointment app's
 * useGetUserId hook and this project's own lib/app_link.ts.
 */
export const useAppLink = () => {
  return useMutation({
    mutationFn: async ({ app, email, name }: AppLinkParams): Promise<AppLinkResponse> => {
      const { data } = await api.post<AppLinkResponse>(
        '/v1/sso/userid',
        {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            app_code: app,
            email,
            name,
            company_id: 2,
            portal: true,
          },
          id: 1,
        },
        { withCredentials: true }
      );

      return data;
    },
  });
};
