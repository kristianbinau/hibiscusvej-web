import { H3Event, EventHandlerRequest } from 'h3';

export const useAuthUser = async (event: H3Event<EventHandlerRequest>) => {
	const decodedToken = await useDecodedToken(event);

	return {
		user: {
			id: decodedToken.payload.sub,
		},
		session: {
			family: decodedToken.payload.jti as string,
		},
	};
};

export const useAuthAdmin = async (event: H3Event<EventHandlerRequest>) => {
	const authUser = await useAuthUser(event);

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
