import { z } from 'zod/v4';
import { logAdminAction } from '~~/server/utils/log';

const LOG_MODULE = 'Api/Admin/Users/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

const ADMIN_ACTION = 'DeleteUser';

export default defineEventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));
	const authAdmin = await useAuthValidatedAdmin(
		event,
		body.currentSessionPassword,
	);

	const userId = params.id;

	await anonymizeUser(userId);

	await logAdminAction({
		logModule: LOG_MODULE,
		adminAction: ADMIN_ACTION,
		adminActionParam: `${userId}`,
		adminUserId: authAdmin.user.id,
	});

	return true;
});
