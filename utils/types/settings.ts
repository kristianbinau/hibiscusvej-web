import type { InternalApi } from 'nitropack';
export type UserMeApiResponse = InternalApi['/api/users/me']['get'];
export type UserMePersonsApiResponse =
	InternalApi['/api/users/me/persons']['get'];
export type UserMeLoginsApiResponse =
	InternalApi['/api/users/me/logins']['get'];

export type Me = UserMeApiResponse['user'];
export type MePerson = UserMePersonsApiResponse['persons'][0];
export type MeLogin = UserMeLoginsApiResponse['logins'][0];
