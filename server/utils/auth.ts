import { H3Event, EventHandlerRequest } from 'h3';

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
