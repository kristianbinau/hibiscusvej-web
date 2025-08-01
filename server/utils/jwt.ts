import * as jose from 'jose';
import { randomUUID } from 'uncrypto';

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
	const familyKey = family || randomUUID();

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
	const { alg, key } = getJWTSecret();

	return await new jose.SignJWT()
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(isAdmin ? REFRESH_AUDIENCE_ADMIN : REFRESH_AUDIENCE)
		.setSubject(subject.toString())
		.setJti(familyKey)
		.setExpirationTime(REFRESH_LIFETIME)
		.sign(key);
}

async function generateAccessToken(
	subject: number,
	isAdmin: boolean,
	familyKey: string,
): Promise<string> {
	const { alg, key } = getJWTSecret();

	return await new jose.SignJWT()
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(isAdmin ? ACCESS_AUDIENCE_ADMIN : ACCESS_AUDIENCE)
		.setSubject(subject.toString())
		.setJti(familyKey)
		.setExpirationTime(ACCESS_LIFETIME)
		.sign(key);
}

export function verifyToken(token: string) {
	const { key } = getJWTSecret();

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
	const payload = token.split('.')[1] as string;
	const decoded = atob(payload);
	return JSON.parse(decoded);
}

function getJWTSecret() {
	const runtimeConfig = useRuntimeConfig();
	const jwtSecret = process.env.NUXT_JWT_SECRET || runtimeConfig.jwtSecret;

	if (!jwtSecret) {
		logError(LOG_MODULE, 'JWT Secret undefined');
		throw new Error('JWT Secret is undefined');
	}

	const key = new TextEncoder().encode(jwtSecret);
	const alg = 'HS256';

	return {
		alg: alg,
		key: key,
	};
}
