import bcrypt from 'bcryptjs';
import { subtle, getRandomValues } from "uncrypto";

export const hashPassword = async (password: string) => {
	return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
	return bcrypt.compare(password, hash);
};

export const clientHashPassword = async (password: string) => {
	const msgUint8 = new TextEncoder().encode(password);
	const hashBuffer = await subtle.digest('SHA-256', msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
};

export const randomPassword = () => {
	const length = 8;
	const characters =
		'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

	return Array.from(getRandomValues(new Uint32Array(length)))
		.map((x) => characters[x % characters.length])
		.join('');
};
