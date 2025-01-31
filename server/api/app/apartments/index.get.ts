export default cachedEventHandler(async () => {
	const apartments = await useDrizzle().select().from(tables.apartments).all();

	return apartments;
}, cacheOneWeek());
