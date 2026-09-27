import * as jose from 'jose';
import { randomUUID } from 'uncrypto';

export const ISSUER = 'hibiscusvej:web';

export const ACCESS_LIFETIME = '2 hours';
export const ACCESS_AUDIENCE = 'hibiscusvej:access';
export const ACCESS_AUDIENCE_ADMIN = 'hibiscusvej:access-admin';
export const ACCESS_AUDIENCE_SYSTEM_ADMIN = 'hibiscusvej:access-system-admin';

export const REFRESH_LIFETIME = '60 days';
export const REFRESH_AUDIENCE = 'hibiscusvej:refresh';
export const REFRESH_AUDIENCE_ADMIN = 'hibiscusvej:refresh-admin';
export const REFRESH_AUDIENCE_SYSTEM_ADMIN = 'hibiscusvej:refresh-system-admin';
export const REFRESH_COOKIE_NAME = 'REFRESH-TOKEN';

export function getAccessAudience(
	isAdmin: boolean,
	isSystemAdmin: boolean,
): string {
	return isSystemAdmin
		? ACCESS_AUDIENCE_SYSTEM_ADMIN
		: isAdmin
			? ACCESS_AUDIENCE_ADMIN
			: ACCESS_AUDIENCE;
}

export function getRefreshAudience(
	isAdmin: boolean,
	isSystemAdmin: boolean,
): string {
	return isSystemAdmin
		? REFRESH_AUDIENCE_SYSTEM_ADMIN
		: isAdmin
			? REFRESH_AUDIENCE_ADMIN
			: REFRESH_AUDIENCE;
}

export async function signToken(
	subject: number,
	audience: string,
	familyKey: string,
	lifetime: string,
	key: Uint8Array,
): Promise<string> {
	return await new jose.SignJWT()
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(audience)
		.setSubject(subject.toString())
		.setJti(familyKey)
		.setExpirationTime(lifetime)
		.sign(key);
}

export async function verifyTokenWithKey(
	token: string,
	key: Uint8Array,
): Promise<jose.JWTVerifyResult> {
	return await jose.jwtVerify(token, key, { issuer: ISSUER });
}

export function deriveRolesFromAudience(audience: string): {
	admin: boolean;
	systemAdmin: boolean;
} {
	const systemAdmin = audience === ACCESS_AUDIENCE_SYSTEM_ADMIN;
	const admin = systemAdmin || audience === ACCESS_AUDIENCE_ADMIN;
	return { admin, systemAdmin };
}

export async function generateTokensWithKey(
	userId: number,
	isAdmin: boolean,
	isSystemAdmin: boolean,
	family: string | null,
	key: Uint8Array,
): Promise<{ refreshToken: string; accessToken: string }> {
	const familyKey = family || randomUUID();

	const refreshToken = await signToken(
		userId,
		getRefreshAudience(isAdmin, isSystemAdmin),
		familyKey,
		REFRESH_LIFETIME,
		key,
	);
	const accessToken = await signToken(
		userId,
		getAccessAudience(isAdmin, isSystemAdmin),
		familyKey,
		ACCESS_LIFETIME,
		key,
	);

	return { refreshToken, accessToken };
}
