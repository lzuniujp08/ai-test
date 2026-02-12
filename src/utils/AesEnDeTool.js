import CryptoJS from 'crypto-js';

if (!CryptoJS) {
	throw new Error('依赖crypto-js，请先安装crypto-js');
}

const key = CryptoJS.enc.Utf8.parse('2345567890123456');
const iv = CryptoJS.enc.Utf8.parse('2345567890123456');
export function encrypt(word) {
	let encrypted = '';
	if (typeof word == 'string') {
		const srcs = CryptoJS.enc.Utf8.parse(word);
		encrypted = CryptoJS.AES.encrypt(srcs, key, {
			iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		});
	} else if (typeof word == 'object') {
		// 对象格式的转成json字符串
		const data = JSON.stringify(word);
		const srcs = CryptoJS.enc.Utf8.parse(data);
		encrypted = CryptoJS.AES.encrypt(srcs, key, {
			iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.ZeroPadding,
		});
	}
	return encrypted.ciphertext.toString();
}
export function decrypt(word) {
	const encryptedHexStr = CryptoJS.enc.Base64.parse(word);
	const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	const decrypt = CryptoJS.AES.decrypt(srcs, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.ZeroPadding,
	});
	const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
	return decryptedStr;
}
