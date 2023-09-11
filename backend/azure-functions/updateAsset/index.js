const { CosmosClient } = require("@azure/cosmos");

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "assets";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

module.exports = async function (context, req) {
    // Log the received request body
    context.log("Received request body:", JSON.stringify(req.body));

    if (req.body && req.body.id && req.body.publisherId) {
        const assetId = req.body.id;
        const publisherId = req.body.publisherId;
        const newItem = req.body;

        context.log("Asset ID:", assetId);
        context.log("Publisher ID:", publisherId);
        context.log("Entire Asset Passed In:", JSON.stringify(newItem));

        try {
            const querySpec = {
                query: "SELECT * FROM c WHERE c.id = @assetId AND c.publisherId = @publisherId",
                parameters: [
                    { name: "@assetId", value: assetId },
                    { name: "@publisherId", value: publisherId }
                ]
            };

            const { resources: items } = await container.items.query(querySpec).fetchAll();
            const item = items[0];

            if (!item) {
                context.res = {
                    status: 404,
                    body: "Asset not found."
                };
                return;
            }

            context.log("Current Item from DB:", JSON.stringify(item));

            // Update fields of the current item with the new item
            for (let prop in newItem) {
                context.log(`Updating property ${prop}: Current Value = ${item[prop]}, New Value = ${newItem[prop]}`);
                item[prop] = newItem[prop];
            }

            // Before updating the item in the database, log the final item
            context.log("Updated item to be saved:", JSON.stringify(item));

            // Replace the item in the database
            const { resource: updatedItem } = await container.item(assetId, assetId).replace(item);  // Note the change here

            context.log("Item successfully updated in the database:", JSON.stringify(updatedItem));

            context.res = {
                status: 200,
                body: updatedItem
            };
        } catch (error) {
            context.log("Error occurred:", error); // Added this to ensure logging captures the error
            context.res = {
                status: 500,
                body: `Error updating the asset. Details: ${error.message}. Stack: ${error.stack}`
            };
        }
    } else {
        context.res = {
            status: 400,
            body: "Please pass an id, publisherId, and the updated fields in the request body"
        };
    }
};
