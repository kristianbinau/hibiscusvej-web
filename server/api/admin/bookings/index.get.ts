export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);

	const communalBookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.orderBy(desc(tables.communalBookings.from))
		.all();

	return {
		communalBookings: communalBookings,
	};
});
