import type { H3Event, EventHandlerRequest } from 'h3';

export const useAuthUser = async (event: H3Event<EventHandlerRequest>) => {
	const decodedToken = await useDecodedToken(event);

	if (
		decodedToken.payload.sub === undefined ||
		isNaN(Number(decodedToken.payload.sub))
	) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const audience = decodedToken.payload.aud as string;
	const systemAdmin = audience === ACCESS_AUDIENCE_SYSTEM_ADMIN;
	const admin = systemAdmin || audience === ACCESS_AUDIENCE_ADMIN;

	return {
		user: {
			id: Number(decodedToken.payload.sub),
			admin: admin,
			systemAdmin: systemAdmin,
		},
		session: {
			family: decodedToken.payload.jti as string,
		},
	};
};

async function validateSessionPassword(
	sessionFamily: string,
	currentSessionPassword: string,
) {
	const currentSession = await useDrizzle()
		.select()
		.from(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, sessionFamily))
		.get();

	if (!currentSession) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const currentLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.id, currentSession.userLoginId))
		.get();

	if (!currentLogin) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const passwordMatch = await comparePassword(
		currentSessionPassword,
		currentLogin.password,
	);
	if (!passwordMatch) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	return {
		session: {
			id: currentSession.id,
		},
		login: {
			id: currentLogin.id,
		},
	};
}

export const useAuthValidatedUser = async (
	event: H3Event<EventHandlerRequest>,
	currentSessionPassword: string,
) => {
	const authUser = await useAuthUser(event);

	const validation = await validateSessionPassword(
		authUser.session.family,
		currentSessionPassword,
	);

	return {
		...authUser,
		session: {
			...authUser.session,
			...validation.session,
		},
		login: validation.login,
	};
};

export const useAuthAdmin = async (event: H3Event<EventHandlerRequest>) => {
	const authUser = await useAuthUser(event);

	if (!authUser.user.admin) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}

	return {
		...authUser,
	};
};

export const useAuthValidatedAdmin = async (
	event: H3Event<EventHandlerRequest>,
	currentSessionPassword: string,
) => {
	const authAdmin = await useAuthAdmin(event);

	const validation = await validateSessionPassword(
		authAdmin.session.family,
		currentSessionPassword,
	);

	return {
		...authAdmin,
		session: {
			...authAdmin.session,
			...validation.session,
		},
		login: validation.login,
	};
};

export const useAuthSystemAdmin = async (
	event: H3Event<EventHandlerRequest>,
) => {
	const authAdmin = await useAuthAdmin(event);

	if (!authAdmin.user.systemAdmin) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}

	return {
		...authAdmin,
	};
};

export const assertCanActOnTarget = async (
	actingAdmin: { user: { id: number; systemAdmin: boolean } },
	targetUserId: number,
) => {
	if (actingAdmin.user.systemAdmin) return;

	const targetUser = await useDrizzle()
		.select({ systemAdmin: tables.users.systemAdmin })
		.from(tables.users)
		.where(eq(tables.users.id, targetUserId))
		.get();

	if (targetUser?.systemAdmin) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}
};

export const assertCanActOnTargets = async (
	actingAdmin: { user: { id: number; systemAdmin: boolean } },
	targetUserIds: number[],
) => {
	if (actingAdmin.user.systemAdmin) return;

	const systemAdminTargets = await useDrizzle()
		.select({ id: tables.users.id })
		.from(tables.users)
		.where(
			and(
				inArray(tables.users.id, targetUserIds),
				eq(tables.users.systemAdmin, true),
			),
		)
		.all();

	if (systemAdminTargets.length > 0) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}
};

export const useAuthValidatedSystemAdmin = async (
	event: H3Event<EventHandlerRequest>,
	currentSessionPassword: string,
) => {
	const authSystemAdmin = await useAuthSystemAdmin(event);

	const validation = await validateSessionPassword(
		authSystemAdmin.session.family,
		currentSessionPassword,
	);

	return {
		...authSystemAdmin,
		session: {
			...authSystemAdmin.session,
			...validation.session,
		},
		login: validation.login,
	};
};

const useDecodedToken = async (event: H3Event<EventHandlerRequest>) => {
	const authHeader = getRequestHeader(event, 'Authorization');

	if (!authHeader) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const token = authHeader.split(' ')[1] as string;

	try {
		const decodedToken = await verifyToken(token);

		return decodedToken;
	} catch {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}
};
