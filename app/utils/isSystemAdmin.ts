export default async () => {
	const { authUser } = await useUser();

	if (authUser.value === null) {
		return false;
	}

	if (authUser.value.user.systemAdmin) {
		return true;
	}

	return false;
};
