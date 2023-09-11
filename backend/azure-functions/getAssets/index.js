const { CosmosClient } = require("@azure/cosmos");


// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "assets"; // your Cosmos DB container id

module.exports = async function (context, req) {
    context.log('Getting assets from Cosmos DB');

    const client = new CosmosClient({ endpoint, key });

    const database = client.database(databaseId);
    const container = database.container(containerId);

    const publisherId = (req.query.publisherId || (req.body && req.body.publisherId));
    if (!publisherId) {
        context.res = {
            status: 400,
            body: "Please pass a publisherId on the query string or in the request body"
        };
        return;
    }

    // query to get all assets of a particular publisher
    // query to get all assets of a particular publisher that are not deleted
    const querySpec = {
        query: "SELECT * FROM Assets a WHERE a.publisherId = @publisherId AND (NOT IS_DEFINED(a.isDeleted) OR a.isDeleted = false)",
        parameters: [
            {
                name: "@publisherId",
                value: publisherId
            }
        ]
    };


    const { resources: assets } = await container.items.query(querySpec).fetchAll();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: assets
    };
}


