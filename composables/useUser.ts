import type { InternalApi } from 'nitropack';
type UserResponse = InternalApi['/api/auth/user']['get'];

export const useUser = async () => {
	const authUser = ref<UserResponse | null>(null);

	try {
		const { data } = await useFetch('/api/auth/user');

		if (data.value === null) {
			authUser.value = null;
		} else {
			authUser.value = data.value;
		}
	} catch (error: any) {
		authUser.value = null;
	}

	return {
		authUser,
	};
};
