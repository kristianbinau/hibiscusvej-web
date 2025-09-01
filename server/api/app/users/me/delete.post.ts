import { z } from 'zod/v4';

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));
	const authUser = await useAuthValidatedUser(
		event,
		body.currentSessionPassword,
	);

	const userId = authUser.user.id;

	await anonymizeUser(userId);

	return true;
});
