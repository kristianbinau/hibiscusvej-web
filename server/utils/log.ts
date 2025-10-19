export const logAdminAction = async (params: {
	logModule: string;
	adminAction: string;
	adminActionParam: string;
	adminUserId: number;
}) => {
	const { logModule, adminAction, adminActionParam, adminUserId } = params;
	const now = new Date();

	try {
		await useDrizzle()
			.insert(tables.adminLogs)
			.values({
				userId: adminUserId,
				action: `${adminAction}: ${adminActionParam}`,
				createdAt: now,
			});
	} catch (error) {
		void logError(logModule, 'Failed AdminLog', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
};

export const logError = async (
	module: string,
	message: string,
	error: unknown = '',
) => {
	if (error === '') {
		console.error(`${module}: ${message}`);
		return;
	}

	console.error(`${module}: ${message} - `, error);
};
