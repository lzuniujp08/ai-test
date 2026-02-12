import * as CryptoJS from 'crypto-js'

const securityKey = '==Ciyo-AES-Auth*'

export const encrypt = (pass) => {
  // 密码加密
  const key = CryptoJS.enc.Utf8.parse(securityKey)
  return CryptoJS.AES.encrypt(pass, key, {
    iv: key,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()
}