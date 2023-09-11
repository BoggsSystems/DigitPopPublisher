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
    context.log("Authentication endpoint called.");

    if (req.method === "POST") {
        const { username, password } = req.body;
        if (typeof username !== 'string' || typeof password !== 'string') {
            return context.res = {
                status: 400,
                body: "Username and password must be strings",
            };
        }

        // Query Cosmos DB to check if the user exists
        const querySpec = {
            query: "SELECT * FROM c WHERE c.username = @username",
            parameters: [
                { name: "@username", value: username },
            ],
        };

        let users;
        try {
            const result = await container.items.query(querySpec).fetchAll();
            users = result.resources;
        } catch (error) {
            context.log.error(`Error querying Cosmos DB: ${error}`);
            return context.res = {
                status: 500,
                body: "Error querying the database",
            };
        }

        // Directly compare passwords
        if (users.length === 1 && password === users[0].password) {
            context.log("User authenticated successfully");

            const user = users[0];
            const tokenPayload = {
                username: user.username,
                popCoins: user.popCoins,
            };

            let token;
            try {
                token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "1h" });
            } catch (error) {
                context.log.error(`Error signing JWT token: ${error}`);
                return context.res = {
                    status: 500,
                    body: "Error generating token",
                };
            }

            const response = {
                message: "Authentication successful",
                user: {
                    username: user.username,
                    popCoins: user.popCoins,
                },
                token: token,
            };

            context.res = {
                status: 200,
                body: response,
            };
        } else {
            context.res = {
                status: 401,
                body: "Invalid credentials",
            };
        }
    } else {
        context.res = {
            status: 400,
            body: "Bad Request",
        };
    }
};
