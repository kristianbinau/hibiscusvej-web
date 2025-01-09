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

	return {
		user: {
			id: Number(decodedToken.payload.sub),
			admin: Boolean(decodedToken.payload.aud === ACCESS_AUDIENCE_ADMIN),
		},
		session: {
			family: decodedToken.payload.jti as string,
		},
	};
};

export const useAuthValidatedUser = async (
	event: H3Event<EventHandlerRequest>,
	currentSessionPassword: string,
) => {
	const authUser = await useAuthUser(event);

	const currentSession = await useDrizzle()
		.select()
		.from(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, authUser.session.family))
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

	// If currentSessionPassword does not match, return 401 Unauthorized
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
		...authUser,
		session: {
			...authUser.session,
			id: currentSession.id,
		},
		login: {
			id: currentLogin.id,
		},
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

	const currentSession = await useDrizzle()
		.select()
		.from(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, authAdmin.session.family))
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

	// If currentSessionPassword does not match, return 401 Unauthorized
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
		...authAdmin,
		session: {
			...authAdmin.session,
			id: currentSession.id,
		},
		login: {
			id: currentLogin.id,
		},
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

	const token = authHeader.split(' ')[1];

	try {
		const decodedToken = await verifyToken(token);

		return decodedToken;
	} catch (error) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}
};
