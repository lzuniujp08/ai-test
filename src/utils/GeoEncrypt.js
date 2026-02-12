import AESEncrypt from "./AESEncrypt.js";
import RSAEncrypt from "./RSAEncrypt.js";

const aesEncrypt = new AESEncrypt();
const rasEncrypt = new RSAEncrypt();

class GeoserverEncrypt {
    constructor() {
        this.name = 'GeoserverEncrypt';
    }

    getKeyPair() {
        return rasEncrypt.genKeyPair();
    }

    decrypt (result, privateKey) {
        //1.先获取明文aesKey
        const aesKey = rasEncrypt.decrypt(result.any.aesKey, privateKey);
        //2.再用明文key去解密数据
        const str = result.result.split('\r\n').join('');
        return aesEncrypt.decrypt(str, aesKey);
    }

    stringToUint8Array(str) {
        const arr = [];
        for (let i = 0, j = str.length; i < j; ++i) {
            arr.push(str.charCodeAt(i));
        }

        return new Uint8Array(arr);
    }
}

export default GeoserverEncrypt;
