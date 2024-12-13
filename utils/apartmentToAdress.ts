import type { InternalApi } from 'nitropack';
type ApartmentsApiResponse = InternalApi['/api/apartments']['get'];

type Apartment = ApartmentsApiResponse[0];

export default (apartment: Apartment) => {
	const streetAdress = `${apartment.street} ${apartment.number}`;
	const apartmentAdress =
		apartment.floor && apartment.door
			? `, ${apartment.floor}, ${apartment.door}`
			: '';

	return `${streetAdress}${apartmentAdress}`;
};
