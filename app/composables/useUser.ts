import type { InternalApi } from 'nitropack';
type UserResponse = InternalApi['/api/app/auth/user']['get'];

export const useUser = async () => {
	const authUser = ref<UserResponse | null>(null);

	try {
		const { data } = await useFetch('/api/app/auth/user', {
			deep: true,
		});

		if (!data.value) {
			authUser.value = null;
		} else {
			authUser.value = data.value;
		}
	} catch {
		authUser.value = null;
	}

	return {
		authUser,
	};
};
