const { CosmosClient } = require("@azure/cosmos");
const jwt = require("jsonwebtoken");

// Azure Cosmos DB config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_USERS_CONTAINER_ID;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

const jwtSecret = process.env.JWT_SECRET;

module.exports = async function (context, req) {
    context.log("Token endpoint called.");

    // 1. Check if request method is POST
    if (req.method !== "POST") {
        return { status: 400, body: "Bad Request" };
    }

    // 2. Log request body for debugging
    context.log(`Request body: ${JSON.stringify(req.body)}`);

    try {
        const { token, assetId } = req.body;

        // Check if token and assetId exist and are strings
        if (typeof token !== 'string' || typeof assetId !== 'string') {
            throw new Error("Expected token and assetId to be strings.");
        }

        const decodedToken = jwt.verify(token, jwtSecret);
        context.log(`Decoded token: ${JSON.stringify(decodedToken)}`);

        if (!decodedToken) {
            throw new Error("Invalid JWT token");
        }

        const popCoinsRequired = await getAssetPrice(assetId);
        context.log(`PopCoins required for asset ${assetId}: ${popCoinsRequired}`);

        const popCoinsBalance = await getConsumerPopCoins(decodedToken.username);
        context.log(`PopCoins balance for user ${decodedToken.username}: ${popCoinsBalance}`);

        if (popCoinsBalance < popCoinsRequired) {
            // For the insufficient Pop-Coins response:
            return {
                status: 403,
                body: "Insufficient Pop-Coins",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        await deductPopCoins(decodedToken.username, popCoinsRequired);
        const accessToken = generateAccessToken(decodedToken.username);
        context.log(`Generated access token: ${accessToken}`);


        context.res = {
            status: 200,
            body: { access_token: accessToken },
            headers: {
                'Content-Type': 'application/json'
            }
        };


    } catch (error) {
        context.log.error(`An error occurred: ${error.message}`);
        return {
            status: error.message === "Invalid JWT token" || error.message === "Expected token and assetId to be strings." ? 401 : 500,
            body: error.message,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

const getAssetPrice = async (assetId) => {
    // Query CosmosDB for asset price by its ID
    const querySpec = {
        query: "SELECT TOP 1 c.price FROM c WHERE c.id = @assetId",
        parameters: [
            { name: "@assetId", value: assetId }
        ]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0]?.price || 0;
};

const getConsumerPopCoins = async (username) => {
    // Query CosmosDB for user's Pop-Coins by their username
    const querySpec = {
        query: "SELECT TOP 1 c.popCoins FROM c WHERE c.username = @username",
        parameters: [
            { name: "@username", value: username }
        ]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0]?.popCoins || 0;
};

const deductPopCoins = async (username, amount) => {
    // Fetch the current user's document
    const querySpec = {
        query: "SELECT TOP 1 * FROM c WHERE c.username = @username",
        parameters: [
            { name: "@username", value: username }
        ]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    const user = resources[0];
    if (!user) {
        throw new Error("User not found");
    }
    // Deduct the coins and update the document
    user.popCoins -= amount;
    const { resource } = await container.item(user.id).replace(user);
    return resource;
};

const generateAccessToken = (username) => {
    // Generate a JWT token with the username as payload
    return jwt.sign({ username: username }, jwtSecret, { expiresIn: '1h' }); // Setting expiration to 1 hour for example
};