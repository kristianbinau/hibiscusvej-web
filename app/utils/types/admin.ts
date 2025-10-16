import type { InternalApi } from 'nitropack';
import type { Apartment } from './global';

export type AdminUsersApiResponse = InternalApi['/api/app/admin/users']['get'];
export type AdminBookingsApiResponse =
	InternalApi['/api/app/admin/bookings']['get'];
export type AdminBookingRequestsApiResponse =
	InternalApi['/api/app/admin/bookings/requests']['get'];
export type AdminUserRepremandsApiResponse =
	InternalApi['/api/app/admin/users/:id/repremands']['get'];

export type User = {
	sessions: AdminUsersApiResponse['userSessions'];
	logins: AdminUsersApiResponse['userLogins'];
	persons: AdminUsersApiResponse['userPersons'];
} & AdminUsersApiResponse['users'][number];

export type UserSession = User['sessions'][number];
export type UserLogin = User['logins'][number];
export type UserPerson = User['persons'][number];
export type UserRepremand = AdminUserRepremandsApiResponse[number];

export type Booking = AdminBookingsApiResponse['communalBookings'][number];

export type BookingRequest =
	AdminBookingRequestsApiResponse['communalBookingRequests'][number];

export type ConfictingApartment = {
	apartmentId: Apartment['id'];
	users: User[];
};

export type ConfictingPerson = {
	users: User[];
};
