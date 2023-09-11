const fetch = require("node-fetch");

module.exports = async function (context, req) {
    context.log('Processing request. req.headers.authorization is :' + req.headers.authorization);

    // Make a request to the token validation Azure Function
    const validationResponse = await fetch('https://digitpop-identity-provider.azurewebsites.net/api/ValidateAccessToken?code=zKi9K7H9MmxoqSJsNE62uh4oXJmORVXvA_UlvYEoFEqoAzFuOgDbpg==', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization
        }
    });

    const validationData = await validationResponse.json();
    context.log('After call to validation');
    if(validationData != undefined)
    {
context.log('ValidationData is not undefined');
    }

    if (validationData.valid) {
        context.log('Access granted.');
        // If the token is valid, return a success response
        context.res = {
            status: 200,
            body: { 
                valid: true,
                payload: validationData.payload
            }
        };
    } else {
        context.log('Access denied.');
        // If the token is not valid, return a failure response
        context.res = {
            status: 401,
            body: "Invalid token"
        };
    }
};
