import * as jose from 'jose';
import { randomUUID } from 'uncrypto';
import { describe, test, expect, beforeAll } from 'vitest';

const ISSUER = 'hibiscusvej:web';

const ACCESS_AUDIENCE = 'hibiscusvej:access';
const ACCESS_AUDIENCE_ADMIN = 'hibiscusvej:access-admin';
const ACCESS_AUDIENCE_SYSTEM_ADMIN = 'hibiscusvej:access-system-admin';

const REFRESH_AUDIENCE = 'hibiscusvej:refresh';
const REFRESH_AUDIENCE_ADMIN = 'hibiscusvej:refresh-admin';
const REFRESH_AUDIENCE_SYSTEM_ADMIN = 'hibiscusvej:refresh-system-admin';

const ACCESS_LIFETIME = '2 hours';
const REFRESH_LIFETIME = '60 days';

const TEST_SECRET = 'test-jwt-secret-for-vitest';

function getKey() {
	return new TextEncoder().encode(TEST_SECRET);
}

async function generateAccessToken(
	subject: number,
	isAdmin: boolean,
	isSystemAdmin: boolean,
): Promise<string> {
	const audience = isSystemAdmin
		? ACCESS_AUDIENCE_SYSTEM_ADMIN
		: isAdmin
			? ACCESS_AUDIENCE_ADMIN
			: ACCESS_AUDIENCE;

	return await new jose.SignJWT()
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(audience)
		.setSubject(subject.toString())
		.setJti(randomUUID())
		.setExpirationTime(ACCESS_LIFETIME)
		.sign(getKey());
}

async function generateRefreshToken(
	subject: number,
	isAdmin: boolean,
	isSystemAdmin: boolean,
): Promise<string> {
	const audience = isSystemAdmin
		? REFRESH_AUDIENCE_SYSTEM_ADMIN
		: isAdmin
			? REFRESH_AUDIENCE_ADMIN
			: REFRESH_AUDIENCE;

	return await new jose.SignJWT()
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setAudience(audience)
		.setSubject(subject.toString())
		.setJti(randomUUID())
		.setExpirationTime(REFRESH_LIFETIME)
		.sign(getKey());
}

async function verifyToken(token: string) {
	return await jose.jwtVerify(token, getKey(), { issuer: ISSUER });
}

function deriveRoles(audience: string): {
	admin: boolean;
	systemAdmin: boolean;
} {
	const systemAdmin = audience === ACCESS_AUDIENCE_SYSTEM_ADMIN;
	const admin = systemAdmin || audience === ACCESS_AUDIENCE_ADMIN;
	return { admin, systemAdmin };
}

describe('JWT auth', () => {
	beforeAll(() => {
		process.env.NUXT_JWT_SECRET = TEST_SECRET;
	});

	describe('token generation', () => {
		test('regular user token has access audience', async () => {
			const token = await generateAccessToken(42, false, false);
			const verified = await verifyToken(token);

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE);
			expect(verified.payload.sub).toBe('42');
		});

		test('admin token has admin audience', async () => {
			const token = await generateAccessToken(1, true, false);
			const verified = await verifyToken(token);

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE_ADMIN);
			expect(verified.payload.sub).toBe('1');
		});

		test('system admin token has system admin audience', async () => {
			const token = await generateAccessToken(1, true, true);
			const verified = await verifyToken(token);

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE_SYSTEM_ADMIN);
			expect(verified.payload.sub).toBe('1');
		});

		test('refresh token has correct audience per role', async () => {
			const userRefresh = await generateRefreshToken(1, false, false);
			const adminRefresh = await generateRefreshToken(1, true, false);
			const sysAdminRefresh = await generateRefreshToken(1, true, true);

			expect((await verifyToken(userRefresh)).payload.aud).toBe(
				REFRESH_AUDIENCE,
			);
			expect((await verifyToken(adminRefresh)).payload.aud).toBe(
				REFRESH_AUDIENCE_ADMIN,
			);
			expect((await verifyToken(sysAdminRefresh)).payload.aud).toBe(
				REFRESH_AUDIENCE_SYSTEM_ADMIN,
			);
		});
	});

	describe('role derivation from audience', () => {
		test('regular user: admin=false, systemAdmin=false', () => {
			const { admin, systemAdmin } = deriveRoles(ACCESS_AUDIENCE);

			expect(admin).toBe(false);
			expect(systemAdmin).toBe(false);
		});

		test('admin: admin=true, systemAdmin=false', () => {
			const { admin, systemAdmin } = deriveRoles(ACCESS_AUDIENCE_ADMIN);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(false);
		});

		test('system admin: admin=true, systemAdmin=true', () => {
			const { admin, systemAdmin } = deriveRoles(ACCESS_AUDIENCE_SYSTEM_ADMIN);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(true);
		});

		test('system admin implies admin (passes useAuthAdmin check)', () => {
			const { admin, systemAdmin } = deriveRoles(ACCESS_AUDIENCE_SYSTEM_ADMIN);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(true);
		});

		test('admin does not imply system admin (fails useAuthSystemAdmin check)', () => {
			const { admin, systemAdmin } = deriveRoles(ACCESS_AUDIENCE_ADMIN);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(false);
		});

		test('regular user fails admin check', () => {
			const { admin } = deriveRoles(ACCESS_AUDIENCE);

			expect(admin).toBe(false);
		});

		test('regular user fails system admin check', () => {
			const { systemAdmin } = deriveRoles(ACCESS_AUDIENCE);

			expect(systemAdmin).toBe(false);
		});
	});

	describe('token verification', () => {
		test('valid token passes verification', async () => {
			const token = await generateAccessToken(1, true, true);
			const verified = await verifyToken(token);

			expect(verified.payload.iss).toBe(ISSUER);
			expect(verified.payload.sub).toBe('1');
		});

		test('invalid token throws', async () => {
			await expect(verifyToken('invalid.token.here')).rejects.toThrow();
		});

		test('token signed with wrong key throws', async () => {
			const token = await new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setIssuedAt()
				.setIssuer(ISSUER)
				.setAudience(ACCESS_AUDIENCE_ADMIN)
				.setSubject('1')
				.setExpirationTime('2 hours')
				.sign(new TextEncoder().encode('wrong-secret'));

			await expect(verifyToken(token)).rejects.toThrow();
		});

		test('expired token throws', async () => {
			const token = await new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setIssuedAt(Date.now() / 1000 - 3600)
				.setIssuer(ISSUER)
				.setAudience(ACCESS_AUDIENCE_ADMIN)
				.setSubject('1')
				.setExpirationTime('1 second')
				.sign(getKey());

			await new Promise((resolve) => setTimeout(resolve, 1500));

			await expect(verifyToken(token)).rejects.toThrow();
		});
	});
});
