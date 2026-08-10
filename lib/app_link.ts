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
                  });
      if(data && data.result.url){
              window.location.assign(data.result.url);
              return data;
    }
      throw new Error("Calculator SSO did not return a launch URL");
    } catch (err: any) {
      console.error("Redirection error:", err);
      throw new Error(err.message || "SSO redirection failed");
    }
}

export default applink;
