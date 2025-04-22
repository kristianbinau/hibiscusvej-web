import type { InternalApi } from 'nitropack';

export type ApartmentsApiResponse = InternalApi['/api/app/apartments']['get'];

export type BookingApiResponse = InternalApi['/api/app/bookings']['get'];

export type Apartment = ApartmentsApiResponse[0];

export type Booking = BookingApiResponse[0];
