export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);

	const communalBookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(isNull(tables.communalBookings.deletedAt))
		.orderBy(desc(tables.communalBookings.from))
		.all();

	return {
		communalBookings: communalBookings,
	};
});
