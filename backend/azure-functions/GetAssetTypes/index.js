const CosmosClient = require("@azure/cosmos").CosmosClient;

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "assetTypes"; // your Cosmos DB container id

module.exports = async function (context, req) {
    // Create new instance of CosmosClient
    const client = new CosmosClient({ endpoint, key });

    // Get a reference to the database
    const database = client.database(databaseId);

    // Get a reference to the container
    const container = database.container(containerId);

    // Querying the container
    const { resources: assetTypes } = await container.items
        .query("SELECT * FROM c")
        .fetchAll();

    // Responding with the fetched data
    context.res = {
        status: 200,
        body: assetTypes
    };
};
