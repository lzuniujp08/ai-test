import { encrypt } from "./jsencrypt";

/**
 * Token工具类
 * @class
 * @classdesc 用于获取和管理认证Token
 */
class TokenUtil {
  constructor(options = {}) {
    this.options = {
      ...options,
    };
    this["TOKEN_KEY"] = "aoi-access-token";
  }

  /**
   * 获取Token
   * @returns {Promise<String>} Token字符串
   */
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

  /**
   * 刷新Token
   * @private
   * @returns {Promise<Object>} Token对象
   */
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
