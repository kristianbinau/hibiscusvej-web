export default eventHandler(async () => {
    // TODO - Implement registration logic

    // TODO handle already created uniques

    const user = await useDrizzle().insert(tables.users).values({
        apartmentId: 231866,
        admin: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning().get()

    const userLogin = await useDrizzle().insert(tables.userLogins).values({
        userId: user.id,
        email: 'kristian@binau.me',
        password: 'kristian@binau.me',
        singleUse: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning().get()

    const userPerson = await useDrizzle().insert(tables.userPersons).values({
        userId: user.id,
        name: 'Kristian',
        phone: '12345678',
        email: 'kristian@binau.me',
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning().get()

    // TODO correct return type
    return true
})