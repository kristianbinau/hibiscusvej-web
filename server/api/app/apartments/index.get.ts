export default cachedEventHandler(async () => {
	return await useDrizzle().select().from(tables.apartments).all();
}, cacheOneWeek());
