// @flow
import JSEncrypt from 'jsencrypt';

class RSAEncrypt {
    constructor () {
        //RSA 位数，这里要跟后端对应
        this.bits = 1024;
        //当前JSEncrypted对象
        this.thisKeyPair = {};
    }

    //生成密钥对(公钥和私钥)
    genKeyPair (bits = this.bits) {
        const genKeyPair = {};
        this.thisKeyPair = new JSEncrypt({'default_key_size': bits});
        //获取私钥
        genKeyPair.privateKey = this.thisKeyPair.getPrivateKeyB64();
        //获取公钥
        genKeyPair.publicKey = this.thisKeyPair.getPublicKeyB64();
        return genKeyPair;
    }

    //公钥加密
    encrypt(plaintext, publicKey) {
        if (plaintext instanceof Object) {
            //1、JSON.stringify
            plaintext = JSON.stringify(plaintext);
        }
        if (publicKey) this.thisKeyPair.setPublicKey(publicKey);
        return this.thisKeyPair.encrypt(plaintext);
    }

    //私钥解密
    decrypt(ciphertext, privateKey) {
        if (privateKey) this.thisKeyPair.setPrivateKey(privateKey);
        let decString = this.thisKeyPair.decrypt(ciphertext);
        if (decString.charAt(0) === "{" || decString.charAt(0) === "[") {
            //JSON.parse
            decString = JSON.parse(decString);
        }
        return decString;
    }
}

export default RSAEncrypt;
