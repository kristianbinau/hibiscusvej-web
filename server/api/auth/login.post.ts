export default eventHandler(async () => {
    const users = await useDrizzle().select().from(tables.users).all()

    // TODO - Actually implement login logic

    const user = users[0] // Logged in user

    // TODO - Implement JWT tokens generation both accessToken and refreshToken

    // TODO - Add refreshToken to UserSession table

    // TODO - Send refreshToken as a cookie

    // TODO - Return accessToken

    return user
})