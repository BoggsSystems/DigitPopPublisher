const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const assetsContainerId = process.env.COSMOS_DB_ASSETS_CONTAINER_ID;
const usersContainerId = process.env.COSMOS_DB_USERS_CONTAINER_ID;
const purchasesContainerId = process.env.COSMOS_DB_PURCHASES_CONTAINER_ID;

const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
    const assetId = req.body.assetId;
    const userId = req.body.userId;
    const publisherId = req.body.publisherId;

    const database = client.database(databaseId);
    const usersContainer = database.container(usersContainerId);
    const assetsContainer = database.container(assetsContainerId);
    const purchasesContainer = database.container(purchasesContainerId);

    // Fetch user and asset
    const { resource: user } = await usersContainer.item(userId).read();
    const { resource: asset } = await assetsContainer.item(assetId).read();

    // Verify the user's Pop-Coins and the asset price
    if (user.balance < asset.price) {
        context.res = {
            status: 400,
            body: "Insufficient Pop-Coins balance!"
        };
        return;
    }

    // Complete the transaction: subtract the price from the user's balance
    user.balance -= asset.price;
    await usersContainer.item(userId).replace(user);

    // Create a record of the purchase
    const purchase = {
        userId: userId,
        assetId: assetId,
        purchaseDate: new Date().toISOString(),
        price: asset.price,
        remainingBalance: user.balance,
        transactionId: generateTransactionId(),  // this function would need to be implemented
        publisherId: publisherId
    };

    // Store the purchase record
    try {
        await purchasesContainer.items.create(purchase);
    } catch (error) {
        context.res = {
            status: 500,
            body: "Error recording purchase: " + error.message
        };
        return;
    }

    // If everything has gone well, return a success response
    context.res = {
        status: 200,
        body: "Purchase completed successfully!"
    };
};

// Example transaction ID generator
function generateTransactionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
