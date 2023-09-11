const { CosmosClient } = require("@azure/cosmos");

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "assets"; // your Cosmos DB container id

module.exports = async function (context, req) {
    try {
        context.log('Starting execution of function: Adding a new asset to Cosmos DB for a specific publisher');

        context.log(`Endpoint: ${endpoint}`);
        context.log(`Key: ${key}`);
        context.log(`Database ID: ${databaseId}`);
        context.log(`Container ID: ${containerId}`);

        const client = new CosmosClient({ endpoint, key });

        const database = client.database(databaseId);
        const container = database.container(containerId);

        context.log('Azure Cosmos DB client, database, and container created');

        const newAsset = (req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const publisherId = (req.query && req.query.publisherId);

        context.log('Printing Request Body:', req.body);
        context.log('Printing Asset from Request Body:', newAsset);
        context.log('Printing Publisher ID from Request Query:', publisherId);

        if (!newAsset || !publisherId) {
            context.log('Error: Missing asset or publisherId in request body or query.');
            context.res = {
                status: 400,
                body: "Please pass an asset in the request body and publisherId in the request query"
            };
            return;
        }

        newAsset.publisherId = publisherId; // attach publisherId to newAsset

        context.log('Attempting to create new asset:', newAsset);

        const { resource: createdAsset } = await container.items.create(newAsset);
        context.log('Successfully created asset:', createdAsset);

        context.res = {
            body: createdAsset
        };
    } catch (error) {
        context.log('Error occurred:', error);
        context.log('Printing Error Message:', error.message);
        context.log('Printing Error Stack:', error.stack);
        context.res = {
            status: 500,
            body: "Error occurred"
        };
    }
}

