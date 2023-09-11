const jwt = require('jsonwebtoken');

module.exports = async function(context, req) {
    context.log("In validation");
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        context.log("Access token is missing");
        context.res = {
            status: 401,
            body: 'Access token is missing.'
        };
        return;
    }

    try {
        const secretKey = process.env.JWT_SECRET;
        context.log("About to verify token")
        const decoded = jwt.verify(token, secretKey);
        context.log("Token decoded")
        // If token is valid, return a success response
        context.res = {
            status: 200,
            body: { 
                valid: true,
                payload: decoded
            }
        };
    } catch (error) {
        // If token is not valid, return an error response
        context.res = {
            status: 401,
            body: {
                valid: false,
                message: 'Invalid access token.'
            }
        };
    }
};
