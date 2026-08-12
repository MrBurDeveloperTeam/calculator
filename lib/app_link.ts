import axios from "axios";

const applink = async (param: any) => {
    try {
        const {data} = await axios.post('https://calculator.snabbb.com/api/v1/sso/app_link', {
                    "jsonrpc": "2.0",
                    "method": "call",
                    "params": {
                      "app_code": "calculator",
                      "email": param.username,
                      "name": param.name,
                      "company_id": 2,
                      "portal": true
                    },
                    "id": 1
                  }, { withCredentials: true });
      if (data?.error) {
        throw new Error(data.error?.data?.message || data.error?.message || 'SSO redirection failed');
      }
      if(data && data.result.url){
              window.open(data.result.url, "_self");
              return data;
    }
      throw new Error('The login service did not return a Calculator link.');
    } catch (err: any) {
      console.error("Redirection error:", err);
      throw new Error(err.message || "SSO redirection failed");
    }
}

export default applink;