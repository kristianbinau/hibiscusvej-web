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
