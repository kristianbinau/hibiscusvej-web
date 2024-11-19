import * as jose from 'jose';

const secretKey =
	'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2';

const ISSUER = 'hibiscusvej:web';
const ACCESS_LIFETIME = '5 minutes';
const REFRESH_LIFETIME = '60 days';
const REFRESH_ABSOLUTE_LIFETIME = '1 year';

const secret = new TextEncoder().encode(secretKey);
const alg = 'HS256';

export async function generateTokens(
	userId: number,
	family: string | null,
): Promise<{
	refreshToken: string;
	accessToken: string;
}> {
	const familyKey = family || crypto.randomUUID();

	const refreshToken = await generateRefreshToken(userId, familyKey);
	const accessToken = await generateAccessToken(userId, familyKey);

	return {
		refreshToken: refreshToken,
		accessToken: accessToken,
	};
}

async function generateRefreshToken(
	subject: number,
	familyKey: string,
): Promise<string> {
	return await new jose.SignJWT()
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setSubject(subject.toString())
		.setJti(familyKey)
		.setExpirationTime(REFRESH_LIFETIME)
		.sign(secret);
}

async function generateAccessToken(
	subject: number,
	familyKey: string,
): Promise<string> {
	return await new jose.SignJWT()
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer(ISSUER)
		.setSubject(subject.toString())
		.setJti(familyKey)
		.setExpirationTime(ACCESS_LIFETIME)
		.sign(secret);
}

export function verifyToken(token: string) {
	return jose.jwtVerify(token, secret, {
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
