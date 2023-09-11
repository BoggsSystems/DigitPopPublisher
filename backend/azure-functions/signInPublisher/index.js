const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const publisherContainerId = "publishers";
const registrationContainerId = "registrations";
const jwtSecret = "iDZz0ic_tetf707JyNaIEvqxN7w7k0"; 


const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const publisherContainer = database.container(publisherContainerId);
const registrationContainer = database.container(registrationContainerId);

module.exports = async function (context, req) {
    context.log("Function triggered.");

    if (!req.body) {
        context.log("No body in the request.");
        context.res = { status: 400, body: "Request body is missing." };
        return;
    }

    // Log the entire request body for debugging
    context.log("Request Body: ", JSON.stringify(req.body));

    const email = req.body.email;
    const password = req.body.password;

    // Log the email and ensure that password is not undefined
    context.log(`Processing request for email: ${email}`);
    context.log(`Password received: ${password !== undefined}`);

    const publisherQuery = {
        query: "SELECT * FROM c WHERE c.personalInfo.email = @email",
        parameters: [{ name: "@email", value: email }]
    };

    try {
        const publisherQueryIterator = publisherContainer.items.query(publisherQuery);
        const publisherQueryResults = await publisherQueryIterator.fetchAll();

        context.log(`Number of publishers found: ${publisherQueryResults.resources.length}`);

        if (publisherQueryResults.resources.length !== 0) {
            const publisher = publisherQueryResults.resources[0];

            // Check if publisher's password is defined
            context.log(`Publisher's password present: ${publisher.accountDetails.password !== undefined}`);

            const passwordIsValid = await bcrypt.compare(password, publisher.accountDetails.password);

            if (passwordIsValid) {
                // Log details before jwt signing
                context.log(`Signing JWT with publisher id: ${publisher.id} and secret: ${jwtSecret}`);
                
                const token = jwt.sign({ id: publisher.id }, jwtSecret, { expiresIn: '1h' });
                context.res = {
                    status: 200,
                    body: {
                        message: "Publisher signed in successfully.",
                        token: token,
                        publisherId: publisher.id 
                    }
                };
            } else {
                context.log("Password validation failed.");
                context.res = {
                    status: 401,
                    body: "Invalid password."
                };
            }
            return;
        }

        const registrationQuery = {
            query: "SELECT * FROM c WHERE c.personalInfo.email = @email AND c.status = 'approved'",
            parameters: [{ name: "@email", value: email }]
        };

        const registrationQueryIterator = registrationContainer.items.query(registrationQuery);
        const registrationQueryResults = await registrationQueryIterator.fetchAll();

        context.log(`Number of approved registrations found: ${registrationQueryResults.resources.length}`);

        if (registrationQueryResults.resources.length !== 0) {
            const registration = registrationQueryResults.resources[0];
            const newPublisher = {
                personalInfo: registration.personalInfo,
                companyInfo: registration.companyInfo,
                accountDetails: {
                    username: registration.accountDetails.username,
                    password: registration.accountDetails.password
                },
                status: registration.status
            };

            const { resource: createdPublisher } = await publisherContainer.items.create(newPublisher);
            
            // Log details before jwt signing
            context.log(`Signing JWT with created publisher id: ${createdPublisher.id} and secret: ${jwtSecret}`);
            
            const token = jwt.sign({ id: createdPublisher.id }, jwtSecret, { expiresIn: '1h' });

            context.res = {
                status: 201,
                body: {
                    message: "Publisher created and signed in successfully.",
                    token: token,
                    publisherId: createdPublisher.id 
                }
            };
        } else {
            context.log("No approved registration found.");
            context.res = {
                status: 404,
                body: "No approved registration found for this email."
            };
        }
    } catch (error) {
        context.log.error(`An unexpected error occurred: ${error.message}`);
        context.res = {
            status: 500,
            body: `Unexpected error: ${error.message}`
        };
    }
};
