import { z } from 'zod';

const schema = z.object({
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const body = await readValidatedBody(event, schema.parse);
	const authUser = await useAuthValidatedUser(
		event,
		body.currentSessionPassword,
	);

	const userId = authUser.user.id;

	await anonymizeUser(userId);

	return true;
});
