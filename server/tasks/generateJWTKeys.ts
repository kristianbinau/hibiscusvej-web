import * as jose from 'jose';

export default defineTask({
	meta: {
		name: 'jwt:generateKeys',
		description: 'Generate public and private keys for JWT signing',
	},
	async run() {
		const { publicKey, privateKey } = await jose.generateKeyPair('PS256');

		const pkcs8Pem = await jose.exportPKCS8(privateKey);
		const spkiPem = await jose.exportSPKI(publicKey);

		return { result: { private: pkcs8Pem, public: spkiPem } };
	},
});
