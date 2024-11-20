export default defineEventHandler(async (event) => {
	const apartments = await useDrizzle().select().from(tables.apartments).all();

	// TODO: Cache

	return apartments;
});
