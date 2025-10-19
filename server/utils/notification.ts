/**
 * ADMIN NOTIFICATION - BOOKING REQUEST
 *
 * Send notification to all admins about a booking request
 */
export const sendBookingRequestNotificationForAdmin = async (params: {
	logModule: string;
	userId: number;
	bookingRequestId: number;
	title: string;
	body: string;
}) => {
	const { logModule, userId, bookingRequestId, title, body } = params;
	const topic = `admin_book_req-${userId}-${bookingRequestId}`;

	await _sendAdminNotification(
		logModule,
		topic,
		title,
		body,
		'/u/admin/booking-requests',
	);
};

export const sendBookingRequestNotificationForUser = async (params: {
	logModule: string;
	userId: number;
	bookingRequestId: number;
	title: string;
	body: string;
}) => {
	const { logModule, userId, bookingRequestId, title, body } = params;
	const topic = `user_book_req-${userId}-${bookingRequestId}`;

	await _sendUserNotification(
		logModule,
		userId,
		topic,
		title,
		body,
		'/u/communal/me-requests',
	);
};

export const sendVerifiedNotificationForUser = async (params: {
	logModule: string;
	userId: number;
	title: string;
	body: string;
}) => {
	const { logModule, userId, title, body } = params;
	const topic = `user_veri-${userId}`;

	await _sendUserNotification(logModule, userId, topic, title, body, '/u');
};

const _sendAdminNotification = async (
	logModule: string,
	topic: string,
	title: string,
	body: string,
	link: string,
) => {
	try {
		const admins = await useDrizzle()
			.select()
			.from(tables.users)
			.where(eq(tables.users.admin, true))
			.all();
		const adminUserIds = admins.map((admin) => admin.id);

		const pushMessage = {
			data: JSON.stringify({
				title: title,
				options: {
					body: body,
					tag: topic,
					link: link,
					silent: true,
				},
			}),
			options: {
				topic: topic,
				ttl: 86400,
				urgency: 'normal' as const,
			},
		} as WebPushMessage;

		await sendPushNotificationToUserIds(adminUserIds, pushMessage);
	} catch (error) {
		void logError(logModule, 'Failed Notify Admins', error);
	}
};

const _sendUserNotification = async (
	logModule: string,
	userId: number,
	topic: string,
	title: string,
	body: string,
	link: string,
) => {
	try {
		const pushMessage = {
			data: JSON.stringify({
				title: title,
				options: {
					body: body,
					tag: topic,
					link: link,
					silent: true,
				},
			}),
			options: {
				topic: topic,
				ttl: 86400,
				urgency: 'normal' as const,
			},
		} as WebPushMessage;

		await sendPushNotificationToUserIds([userId], pushMessage);
	} catch (error) {
		void logError(logModule, 'Failed Notify Users', error);
	}
};
