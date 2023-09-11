const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcrypt");
const saltRounds = 10; // A good default for bcrypt

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const registrationContainerId = "registrations"

const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
    context.log('Publisher registration process started.');
    context.log('Request:', req);

    // Accessing the data sent in the request body
    const registrationData = req.body;
    context.log('Registration Data:', registrationData);

    // Server-side validation
    if (!registrationData.companyInfo.companyName || registrationData.companyInfo.companyName.length < 2) {
        context.log('Invalid input: companyName must be at least 2 characters long.');
        context.res = {
            status: 400,
            body: "Invalid input: companyName must be at least 2 characters long."
        };
        return;
    }

    if (!registrationData.personalInfo.email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(registrationData.personalInfo.email)) {
        context.log('Invalid input: Please provide a valid email.');
        context.res = {
            status: 400,
            body: "Invalid input: Please provide a valid email."
        };
        return;
    }

    // Hash the password before storing it
    const hashedPassword = bcrypt.hashSync(registrationData.accountDetails.password, saltRounds);
    registrationData.accountDetails.password = hashedPassword;
    delete registrationData.accountDetails.confirmPassword; // remove confirmPassword from the stored data

    context.log('Connecting to database:', databaseId);
    const database = client.database(databaseId);
    const container = database.container(registrationContainerId);

    context.log('Adding data to container:', registrationContainerId);
    registrationData.status = "pending";

    const { resource: newRegistration } = await container.items.create(registrationData);

    context.log('New registration created, ID:', newRegistration.id);
    context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: "Publisher registration created successfully.",
            id: newRegistration.id
        })
    };

};
