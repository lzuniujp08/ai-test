// @flow
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import PadPkcs7 from 'crypto-js/pad-pkcs7';
import ModeEcb from 'crypto-js/mode-ecb';

class AESEncrypt {
    constructor () {
        this.test = 'test';
    }

    //获取key，
    genKey (length = 16) {
        const random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let str = "";
        for (let i = 0; i < length; i++) {
            str  = str + random.charAt(Math.random() * random.length);
        }
        return str;
    }

    //加密
    encrypt  (plaintext, key) {
        if (plaintext instanceof Object) {
            //JSON.stringify
            plaintext = JSON.stringify(plaintext);
        }
        const encrypted = AES.encrypt(Utf8.parse(plaintext), Utf8.parse(key), {mode: ModeEcb, padding: PadPkcs7});
        return encrypted.toString();
    }

    //解密
    decrypt  (ciphertext, key) {
        const decrypt = AES.decrypt(ciphertext, Utf8.parse(key), {mode: ModeEcb, padding: PadPkcs7});
        let decString = Utf8.stringify(decrypt).toString();
        if (decString.charAt(0) === "{" || decString.charAt(0) === "[") {
            //JSON.parse
            decString = JSON.parse(decString);
        }
        return decString;
    }
}

export default AESEncrypt;
