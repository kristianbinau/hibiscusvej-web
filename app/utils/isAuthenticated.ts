export default async () => {
	const { authUser } = await useUser();
	return authUser.value !== null;
};
