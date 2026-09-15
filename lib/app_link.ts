import axios from "axios";

const APP_LINK_ENDPOINT = 'https://calculator.snabbb.com/api/v1/sso/app_link';

/**
 * The SSO service currently returns the production Calculator URL. Keep the
 * signed path/query/hash from that response, but return to the origin where
 * login started so Cloudflare branch previews remain on their preview URL.
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
