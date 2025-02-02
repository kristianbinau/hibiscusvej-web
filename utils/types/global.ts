import type { InternalApi } from 'nitropack';

export type ApartmentsApiResponse = InternalApi['/api/app/apartments']['get'];

export type Apartment = ApartmentsApiResponse[0];
