import type { InternalApi } from 'nitropack';
export type AdminUsersApiResponse = InternalApi['/api/admin/users']['get'];
export type AdminBookingsApiResponse =
	InternalApi['/api/admin/bookings']['get'];
export type ApartmentsApiResponse = InternalApi['/api/apartments']['get'];

export type User = {
	sessions: AdminUsersApiResponse['userSessions'];
	logins: AdminUsersApiResponse['userLogins'];
	persons: AdminUsersApiResponse['userPersons'];
} & AdminUsersApiResponse['users'][0];

export type Booking = AdminBookingsApiResponse['communalBookings'][0];

export type Apartment = ApartmentsApiResponse[0];

export type ConfictingApartment = {
	apartmentId: Apartment['id'];
	users: User[];
};

export type ConfictingPerson = {
	users: User[];
};
