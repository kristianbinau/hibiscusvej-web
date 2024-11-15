export default eventHandler(async () => {
    // TODO - Implement registration logic

    const user = await useDrizzle().insert(tables.users).values({
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning().get()

    console.log(user);

    return user
})