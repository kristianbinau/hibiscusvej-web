import { digest } from 'ohash';

export const useHash = () => {
	async function hash(message: string) {
		return base64UrlToHex(digest(message));
	}

	return { hash };
};

function base64UrlToHex(base64UrlString: string): string {
	// 1. Prepare for standard Base64 decoding (atob)
	// Base64Url uses '-' instead of '+', '_' instead of '/', and removes padding '='
	let base64String = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');

	// Add padding if necessary. Base64 strings should have a length that is a multiple of 4
	switch (base64String.length % 4) {
		case 2:
			base64String += '==';
			break;
		case 3:
			base64String += '=';
			break;
	}

	// 2. Decode the Base64 string to a binary string
	const binaryString = atob(base64String);

	// 3. Convert the binary string to Hex
	let hexString = '';
	for (let i = 0; i < binaryString.length; i++) {
		const hexByte = binaryString.charCodeAt(i).toString(16).padStart(2, '0');
		hexString += hexByte;
	}

	return hexString;
}
