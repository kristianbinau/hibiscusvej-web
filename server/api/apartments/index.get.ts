export default defineEventHandler(async () => {
	const apartments = await useDrizzle().select().from(tables.apartments).all();

	// TODO: Cache

	return apartments;
});
