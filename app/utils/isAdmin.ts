export default async () => {
	const { authUser } = await useUser();

	if (authUser.value === null) {
		return false;
	}

	if (authUser.value.user.admin) {
		return true;
	}

	return false;
};
