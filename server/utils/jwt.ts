import * as jose from 'jose';

const LOG_MODULE = 'Utils/JWT';

const ISSUER = 'hibiscusvej:web';

const ACCESS_LIFETIME = '2 hours';
export const ACCESS_AUDIENCE = 'hibiscusvej:access';
export const ACCESS_AUDIENCE_ADMIN = 'hibiscusvej:access-admin';

const REFRESH_LIFETIME = '60 days';
export const REFRESH_AUDIENCE = 'hibiscusvej:refresh';
export const REFRESH_AUDIENCE_ADMIN = 'hibiscusvej:refresh-admin';
export const REFRESH_COOKIE_NAME = 'REFRESH-TOKEN';

export async function generateTokens(
	userId: number,
	isAdmin: boolean,
	family: string | null,
): Promise<{
	refreshToken: string;
	accessToken: string;
}> {
	const familyKey = family || crypto.randomUUID();

	const refreshToken = await generateRefreshToken(userId, isAdmin, familyKey);
	const accessToken = await generateAccessToken(userId, isAdmin, familyKey);

	return {
		refreshToken: refreshToken,
		accessToken: accessToken,
	};
}

async function generateRefreshToken(
	subject: number,
	isAdmin: boolean,
	familyKey: string,
): Promise<string> {
	const { alg, key } = await getJWTPrivateKey();

	try {
		return await new jose.SignJWT()
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setIssuer(ISSUER)
			.setAudience(isAdmin ? REFRESH_AUDIENCE_ADMIN : REFRESH_AUDIENCE)
			.setSubject(subject.toString())
			.setJti(familyKey)
			.setExpirationTime(REFRESH_LIFETIME)
			.sign(key);
	} catch (error) {
		logError(LOG_MODULE, 'Failed to generate refresh token', error);
		throw new Error('Failed to generate refresh token');
	}
}

async function generateAccessToken(
	subject: number,
	isAdmin: boolean,
	familyKey: string,
): Promise<string> {
	const { alg, key } = await getJWTPrivateKey();

	try {
		return await new jose.SignJWT()
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setIssuer(ISSUER)
			.setAudience(isAdmin ? ACCESS_AUDIENCE_ADMIN : ACCESS_AUDIENCE)
			.setSubject(subject.toString())
			.setJti(familyKey)
			.setExpirationTime(ACCESS_LIFETIME)
			.sign(key);
	} catch (error) {
		logError(LOG_MODULE, 'Failed to generate access token', error);
		throw new Error('Failed to generate access token');
	}
}

export async function verifyToken(token: string) {
	const { key } = await getJWTPublicKey();

	return jose.jwtVerify(token, key, {
		issuer: ISSUER,
	});
}

export function decodeToken(token: string): {
	iat: number;
	exp: number;
	iss: string;
	sub: string;
	jti: string;
} {
	const payload = token.split('.')[1];
	const decoded = atob(payload);
	return JSON.parse(decoded);
}

async function getJWTPrivateKey() {
	const runtimeConfig = useRuntimeConfig();
	const jwtPrivateKey =
		process.env.NUXT_JWT_PRIVATE_KEY || runtimeConfig.jwtPrivateKey;

	if (!jwtPrivateKey) {
		logError(LOG_MODULE, 'JWT Private Key undefined');
		throw new Error('JWT Private Key is undefined');
	}

	try {
		const privateKey = await jose.importPKCS8(jwtPrivateKey, 'PS256');
		return { alg: 'PS256', key: privateKey };
	} catch (error) {
		logError(LOG_MODULE, 'JWT Private Key invalid', error);
		throw new Error('JWT Private Key is invalid');
	}
}

async function getJWTPublicKey() {
	const runtimeConfig = useRuntimeConfig();
	const jwtPublicKey =
		process.env.NUXT_PUBLIC_JWT_PUBLIC_KEY || runtimeConfig.jwtPublicKey;

	if (!jwtPublicKey) {
		logError(LOG_MODULE, 'JWT Public Key undefined');
		throw new Error('JWT Public Key is undefined');
	}

	try {
		const publicKey = await jose.importSPKI(jwtPublicKey, 'PS256');
		return { alg: 'PS256', key: publicKey };
	} catch (error) {
		logError(LOG_MODULE, 'JWT Public Key invalid', error);
		throw new Error('JWT Public Key is invalid');
	}
}
