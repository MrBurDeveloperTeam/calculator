import axios from "axios";

const APP_LINK_ENDPOINT = 'https://calculator.snabbb.com/api/v1/sso/app_link';

/**
 * Keep the signed SSO path/query/hash returned by the backend, but send the
 * browser back to the deployment where login started. This keeps Cloudflare
 * preview logins on their preview URL while production stays on production.
 */
const getCurrentDeploymentRedirect = (ssoUrl: string) => {
  const returnedUrl = new URL(ssoUrl, window.location.origin);
  const redirectUrl = new URL(window.location.origin);

  redirectUrl.pathname = returnedUrl.pathname || '/';
  redirectUrl.search = returnedUrl.search;
  redirectUrl.hash = returnedUrl.hash;

  return redirectUrl.toString();
};

const applink = async (param: any) => {
    try {
        const {data} = await axios.post(APP_LINK_ENDPOINT, {
                    "jsonrpc": "2.0",
                    "method": "call",
                    "params": {
                      "app_code": "calculator",
                      "email": param.username || param.email,
                      "name": param.name || param.partner_display_name,
                      "company_id": 2,
                      "portal": true
                    },
                    "id": 1
                  }, { withCredentials: true });
      if (data?.error) {
        throw new Error(data.error?.data?.message || data.error?.message || 'SSO redirection failed');
      }
      if(data?.result?.url){
              window.location.assign(getCurrentDeploymentRedirect(data.result.url));
              return data;
    }
      throw new Error('The login service did not return a Calculator link.');
    } catch (err: any) {
      console.error("Redirection error:", err);
      throw new Error(err.message || "SSO redirection failed");
    }
}

export default applink;
