const { CosmosClient } = require("@azure/cosmos");

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "assets"; // your Cosmos DB container id

module.exports = async function (context, req) {
    context.log('Getting an asset from Cosmos DB');

    const client = new CosmosClient({ endpoint, key });

    const database = client.database(databaseId);
    const container = database.container(containerId);

    const assetId = req.query.assetId; // changed from req.params.assetId
    if (!assetId) {
        context.res = {
            status: 400,
            body: "Please pass an asset id on the query string or in the request body"
        };
        return;
    }

    // query to get specific asset by its id
    const querySpec = {
        query: "SELECT * FROM Assets a WHERE a.id = @assetId AND (NOT IS_DEFINED(a.isDeleted) OR a.isDeleted = false)",
        parameters: [
            {
                name: "@assetId",
                value: assetId
            }
        ]
    };

    const { resources: assets } = await container.items.query(querySpec).fetchAll();

    // If no asset found, return a 404 status
    if(assets.length === 0){
        context.res = {
            status: 404,
            body: "Asset not found"
        };
        return;
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: assets[0] // Assuming that asset ids are unique, so we return the first one
    };
}
