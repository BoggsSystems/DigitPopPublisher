const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const purchasesContainerId = process.env.COSMOS_DB_PURCHASES_CONTAINER_ID;


const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(purchasesContainerId);


module.exports = async function (context, req) {
    const userId = req.query.userId || (req.body && req.body.userId);
    const assetId = req.query.assetId || (req.body && req.body.assetId);

    if (!userId || !assetId) {
        context.res = {
            status: 400,
            body: "Please provide both userId and assetId."
        };
        return;
    }

    try {
        const querySpec = {
            query: "SELECT * FROM purchases p WHERE p.userId = @userId AND p.assetId = @assetId",
            parameters: [
                { name: "@userId", value: userId },
                { name: "@assetId", value: assetId }
            ]
        };

        const { resources: results } = await container.items.query(querySpec).fetchAll();
        if (results.length === 0) {
            context.res = {
                status: 404,
                body: "Purchase record not found."
            };
        } else {
            context.res = {
                status: 200,
                body: results[0]   // Return the first match, assuming userId and assetId together are unique.
            };
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: `Error occurred while querying the database: ${error.message}`
        };
    }
};

function generateTransactionId() {
    // Implementation of the function to generate a unique transaction ID. 
    // This can be a simple UUID or any other algorithm as per requirements.
    return require('uuid').v4();
}
