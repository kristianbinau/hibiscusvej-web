export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);

	const communalBookingRequests = await useDrizzle()
		.select()
		.from(tables.communalBookingRequests)
		.where(and(isNull(tables.communalBookingRequests.deletedAt)))
		.orderBy(desc(tables.communalBookingRequests.fromTimestamp))
		.all();

	return {
		communalBookingRequests: communalBookingRequests,
	};
});
