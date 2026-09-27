import {
	ACCESS_AUDIENCE,
	ACCESS_AUDIENCE_ADMIN,
	ACCESS_AUDIENCE_SYSTEM_ADMIN,
	REFRESH_AUDIENCE,
	REFRESH_AUDIENCE_ADMIN,
	REFRESH_AUDIENCE_SYSTEM_ADMIN,
	REFRESH_COOKIE_NAME,
	verifyTokenWithKey,
	generateTokensWithKey,
} from '../lib/jwt-core';

export {
	ACCESS_AUDIENCE,
	ACCESS_AUDIENCE_ADMIN,
	ACCESS_AUDIENCE_SYSTEM_ADMIN,
	REFRESH_AUDIENCE,
	REFRESH_AUDIENCE_ADMIN,
	REFRESH_AUDIENCE_SYSTEM_ADMIN,
	REFRESH_COOKIE_NAME,
};

const LOG_MODULE = 'Utils/JWT';

export async function generateTokens(
	userId: number,
	isAdmin: boolean,
	isSystemAdmin: boolean,
	family: string | null,
): Promise<{ refreshToken: string; accessToken: string }> {
	const { key } = getJWTSecret();
	return generateTokensWithKey(userId, isAdmin, isSystemAdmin, family, key);
}

export function verifyToken(token: string) {
	const { key } = getJWTSecret();
	return verifyTokenWithKey(token, key);
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
		void logError(LOG_MODULE, 'JWT Secret undefined');
		throw new Error('JWT Secret is undefined');
	}

	const key = new TextEncoder().encode(jwtSecret);
	const alg = 'HS256';

	return { alg, key };
}
