import { encrypt } from "./jsencrypt";

class TokenUtil {
  constructor(options = {}) {
    this.options = {
      ...options,
    };
    this["TOKEN_KEY"] = "aoi-access-token";
  }
  getToken() {
    return new Promise((resolve, reject) => {
      this._refreshToken()
        .then((res) => {
          resolve(res["access_token"]);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  _refreshToken() {
    return new Promise((resolve, reject) => {
      const url = `${this.options.baseUrl}/uac/auth/oauth/token`;
      const auth = `${this.options.appId}:${this.options.appSecret}:${this.options.username}:${this.options.password}`;
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${encrypt(auth)}`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (!result["access_token"]) {
            window.localStorage.removeItem(this["TOKEN_KEY"]);
            reject(result);
          } else {
             window.localStorage.setItem(this["TOKEN_KEY"], JSON.stringify({value: result}));
            resolve(result);
          }
        });
    });
  }

  clear() {
    window.clearTimeout(this.refreshFlag);
  }
}

export default TokenUtil;
