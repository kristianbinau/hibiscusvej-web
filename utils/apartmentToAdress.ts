import type { Apartment } from '~/utils/types/global';

export default (apartment: Apartment) => {
	const streetAdress = `${apartment.street} ${apartment.number}`;
	const apartmentAdress =
		apartment.floor && apartment.door
			? `, ${apartment.floor}, ${apartment.door}`
			: '';

	return `${streetAdress}${apartmentAdress}`;
};
