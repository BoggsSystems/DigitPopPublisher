const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const assetsContainerId = process.env.COSMOS_DB_ASSETS_CONTAINER_ID;
const client = new CosmosClient({ endpoint, key });


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const assetId = req.body && req.body.assetId;

    context.log(`Asset id is : ${assetId}`);

    if (!assetId) {
        context.log("Asset ID not provided");
        context.res = {
            status: 400,
            body: "Please provide an asset ID"
        };
        return;
    }


    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [
                {
                    name: "@id",
                    value: assetId
                }
            ]
        };

        context.log(`Executing query: ${JSON.stringify(querySpec)}`);
        const { resources: assets } = await client
            .database(databaseId)
            .container(assetsContainerId)
            .items
            .query(querySpec)
            .fetchAll();

        context.log(`Query result: ${JSON.stringify(assets)}`);

        if (assets && assets.length > 0) {
            context.log(`Asset found with price: ${assets[0].price}`);
            context.res = {
                status: 200,
                body: assets[0].price
            };
        } else {
            context.log("No asset found with the given ID");
            context.res = {
                status: 404,
                body: "No asset found with the given ID"
            };
        }
    } catch (err) {
        context.log(`Error occurred while retrieving the asset price: ${err}`);
        context.res = {
            status: 500,
            body: "An error occurred while retrieving the asset price: " + err
        };
    }
};
