export default eventHandler(async (event) => {
    const authHeader = getRequestHeader(event, 'Authorization')

    if (!authHeader) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await verifyToken(token)

        return {
            user: {
                id: decodedToken.payload.sub,
            },
        }
    } catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }
})