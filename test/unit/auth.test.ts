import { describe, test, expect, beforeAll } from 'vitest';
import {
	generateTokensWithKey,
	verifyTokenWithKey,
	deriveRolesFromAudience,
	getAccessAudience,
	getRefreshAudience,
	ACCESS_AUDIENCE,
	ACCESS_AUDIENCE_ADMIN,
	ACCESS_AUDIENCE_SYSTEM_ADMIN,
	REFRESH_AUDIENCE,
	REFRESH_AUDIENCE_ADMIN,
	REFRESH_AUDIENCE_SYSTEM_ADMIN,
} from '../../server/lib/jwt-core';

const TEST_SECRET = 'test-jwt-secret-for-vitest';

function getKey() {
	return new TextEncoder().encode(TEST_SECRET);
}

describe('JWT auth', () => {
	beforeAll(() => {
		process.env.NUXT_JWT_SECRET = TEST_SECRET;
	});

	describe('token generation', () => {
		test('regular user token has access audience', async () => {
			const { accessToken } = await generateTokensWithKey(
				42,
				false,
				false,
				'test-family',
				getKey(),
			);
			const verified = await verifyTokenWithKey(accessToken, getKey());

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE);
			expect(verified.payload.sub).toBe('42');
		});

		test('admin token has admin audience', async () => {
			const { accessToken } = await generateTokensWithKey(
				1,
				true,
				false,
				'test-family',
				getKey(),
			);
			const verified = await verifyTokenWithKey(accessToken, getKey());

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE_ADMIN);
			expect(verified.payload.sub).toBe('1');
		});

		test('system admin token has system admin audience', async () => {
			const { accessToken } = await generateTokensWithKey(
				1,
				true,
				true,
				'test-family',
				getKey(),
			);
			const verified = await verifyTokenWithKey(accessToken, getKey());

			expect(verified.payload.aud).toBe(ACCESS_AUDIENCE_SYSTEM_ADMIN);
			expect(verified.payload.sub).toBe('1');
		});

		test('refresh token has correct audience per role', async () => {
			const userTokens = await generateTokensWithKey(
				1,
				false,
				false,
				'test-family',
				getKey(),
			);
			const adminTokens = await generateTokensWithKey(
				1,
				true,
				false,
				'test-family',
				getKey(),
			);
			const sysAdminTokens = await generateTokensWithKey(
				1,
				true,
				true,
				'test-family',
				getKey(),
			);

			expect(
				(await verifyTokenWithKey(userTokens.refreshToken, getKey())).payload
					.aud,
			).toBe(REFRESH_AUDIENCE);
			expect(
				(await verifyTokenWithKey(adminTokens.refreshToken, getKey())).payload
					.aud,
			).toBe(REFRESH_AUDIENCE_ADMIN);
			expect(
				(await verifyTokenWithKey(sysAdminTokens.refreshToken, getKey()))
					.payload.aud,
			).toBe(REFRESH_AUDIENCE_SYSTEM_ADMIN);
		});
	});

	describe('audience selection', () => {
		test('regular user gets access audience', () => {
			expect(getAccessAudience(false, false)).toBe(ACCESS_AUDIENCE);
		});

		test('admin gets admin audience', () => {
			expect(getAccessAudience(true, false)).toBe(ACCESS_AUDIENCE_ADMIN);
		});

		test('system admin gets system admin audience', () => {
			expect(getAccessAudience(true, true)).toBe(ACCESS_AUDIENCE_SYSTEM_ADMIN);
		});

		test('refresh audience matches role', () => {
			expect(getRefreshAudience(false, false)).toBe(REFRESH_AUDIENCE);
			expect(getRefreshAudience(true, false)).toBe(REFRESH_AUDIENCE_ADMIN);
			expect(getRefreshAudience(true, true)).toBe(
				REFRESH_AUDIENCE_SYSTEM_ADMIN,
			);
		});
	});

	describe('role derivation from audience', () => {
		test('regular user: admin=false, systemAdmin=false', () => {
			const { admin, systemAdmin } = deriveRolesFromAudience(ACCESS_AUDIENCE);

			expect(admin).toBe(false);
			expect(systemAdmin).toBe(false);
		});

		test('admin: admin=true, systemAdmin=false', () => {
			const { admin, systemAdmin } = deriveRolesFromAudience(
				ACCESS_AUDIENCE_ADMIN,
			);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(false);
		});

		test('system admin: admin=true, systemAdmin=true', () => {
			const { admin, systemAdmin } = deriveRolesFromAudience(
				ACCESS_AUDIENCE_SYSTEM_ADMIN,
			);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(true);
		});

		test('system admin implies admin (passes useAuthAdmin check)', () => {
			const { admin, systemAdmin } = deriveRolesFromAudience(
				ACCESS_AUDIENCE_SYSTEM_ADMIN,
			);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(true);
		});

		test('admin does not imply system admin (fails useAuthSystemAdmin check)', () => {
			const { admin, systemAdmin } = deriveRolesFromAudience(
				ACCESS_AUDIENCE_ADMIN,
			);

			expect(admin).toBe(true);
			expect(systemAdmin).toBe(false);
		});

		test('regular user fails admin check', () => {
			const { admin } = deriveRolesFromAudience(ACCESS_AUDIENCE);

			expect(admin).toBe(false);
		});

		test('regular user fails system admin check', () => {
			const { systemAdmin } = deriveRolesFromAudience(ACCESS_AUDIENCE);

			expect(systemAdmin).toBe(false);
		});
	});

	describe('token verification', () => {
		test('valid token passes verification', async () => {
			const { accessToken } = await generateTokensWithKey(
				1,
				true,
				true,
				'test-family',
				getKey(),
			);
			const verified = await verifyTokenWithKey(accessToken, getKey());

			expect(verified.payload.sub).toBe('1');
		});

		test('invalid token throws', async () => {
			await expect(
				verifyTokenWithKey('invalid.token.here', getKey()),
			).rejects.toThrow();
		});

		test('token signed with wrong key throws', async () => {
			const { accessToken } = await generateTokensWithKey(
				1,
				true,
				true,
				'test-family',
				new TextEncoder().encode('wrong-secret'),
			);

			await expect(verifyTokenWithKey(accessToken, getKey())).rejects.toThrow();
		});
	});
});
