import type { InternalApi } from 'nitropack';
import type { Apartment } from './global';

export type AdminUsersApiResponse = InternalApi['/api/app/admin/users']['get'];
export type AdminBookingsApiResponse =
	InternalApi['/api/app/admin/bookings']['get'];
export type AdminUserRepremandsApiResponse =
	InternalApi['/api/app/admin/users/:id/repremands']['get'];

export type User = {
	sessions: AdminUsersApiResponse['userSessions'];
	logins: AdminUsersApiResponse['userLogins'];
	persons: AdminUsersApiResponse['userPersons'];
} & AdminUsersApiResponse['users'][0];

export type UserSession = User['sessions'][0];
export type UserLogin = User['logins'][0];
export type UserPerson = User['persons'][0];
export type UserRepremand = AdminUserRepremandsApiResponse[0];

export type Booking = AdminBookingsApiResponse['communalBookings'][0];

export type ConfictingApartment = {
	apartmentId: Apartment['id'];
	users: User[];
};

export type ConfictingPerson = {
	users: User[];
};
