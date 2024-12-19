export const logError = async (
	module: string,
	message: string,
	error: unknown,
) => {
	console.error(`${module}: ${message} - `, error);
};
