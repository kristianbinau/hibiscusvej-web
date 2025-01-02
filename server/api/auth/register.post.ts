import { z } from 'zod';

const LOG_MODULE = 'Api/Auth/Register';

const schema = z.object({
	apartmentId: z.number(),
	email: z.string().email(),
	password: z.string(),
	persons: z
		.array(
			z.object({
				name: z.string().min(1).max(255),
				email: z.string().email().min(1).max(255),
				phone: z.string().min(1).max(255),
			}),
		)
		.min(1)
		.max(2),
});

export default eventHandler(async (event) => {
	const body = await readValidatedBody(event, schema.parse);

	// If Email is already in use, return 409 Conflict
	const userByEmail = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.email, body.email))
		.get();
	if (userByEmail) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Conflict',
		});
	}

	// If ApartmentId is not found, return 404 Not Found
	const apartment = await useDrizzle()
		.select()
		.from(tables.apartments)
		.where(eq(tables.apartments.id, body.apartmentId))
		.get();
	if (!apartment) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	const now = new Date();

	// Try to create a new user
	let user = null;
	try {
		user = await useDrizzle()
			.insert(tables.users)
			.values({
				apartmentId: apartment.id,
				admin: false,
				createdAt: now,
				updatedAt: now,
			})
			.returning()
			.get();
	} catch (error) {
		logError(LOG_MODULE, 'Failed Create User', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	// Try to create a new userLogin
	let userLogin = null;
	try {
		const hashedPassword = await hashPassword(body.password);

		userLogin = await useDrizzle()
			.insert(tables.userLogins)
			.values({
				userId: user.id,
				email: body.email,
				password: hashedPassword,
				singleUse: false,
				createdAt: now,
				updatedAt: now,
			})
			.returning()
			.get();
	} catch (error) {
		// Remove user if userLogin fails
		await useDrizzle().delete(tables.users).where(eq(tables.users.id, user.id));

		logError(LOG_MODULE, 'Failed Create UserLogin', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	// Try to create userPersons
	let userPersons = [];
	try {
		for (const person of body.persons) {
			userPersons.push(
				await useDrizzle()
					.insert(tables.userPersons)
					.values({
						userId: user.id,
						name: person.name,
						email: person.email,
						phone: person.phone,
						createdAt: now,
						updatedAt: now,
					})
					.get(),
			);
		}
	} catch (error) {
		// Remove user, userLogin, and userPersons if userPerson fails
		await useDrizzle().delete(tables.users).where(eq(tables.users.id, user.id));
		await useDrizzle()
			.delete(tables.userLogins)
			.where(eq(tables.userLogins.userId, user.id));
		await useDrizzle()
			.delete(tables.userPersons)
			.where(eq(tables.userPersons.userId, user.id));

		logError(LOG_MODULE, 'Failed Create Persons', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	// Notify Admins
	const admins = await useDrizzle()
		.select()
		.from(tables.users)
		.where(eq(tables.users.admin, true))
		.all();
	const adminUserIds = admins.map((admin) => admin.id);

	const topic = `admin_notify_new_user-${user.id}`;

	const pushMessage = {
		data: JSON.stringify({
			title: 'Ny bruger',
			body: 'Der er oprettet en ny bruger, der skal verificeres.',
			tag: topic,
			link: `/admin/users?userId=${user.id}`,
			silent: true,
		}),
		options: {
			topic: topic,
			ttl: 86400,
			urgency: 'normal' as const,
		},
	} as WebPushMessage;

	await sendPushNotificationToUserIds(adminUserIds, pushMessage);

	setResponseStatus(event, 201);
	return true;
});
