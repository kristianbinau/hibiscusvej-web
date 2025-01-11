import { sha256 } from 'ohash';

export const useHash = () => {
	async function hash(message: string) {
		return sha256(message);
	}

	return { hash };
};
