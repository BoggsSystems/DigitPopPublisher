const { CosmosClient } = require("@azure/cosmos");
const { startOfDay, endOfDay, startOfWeek, startOfMonth, formatISO } = require('date-fns');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = "transactions"; 

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

module.exports = async function (context, req) {
  const publisherId = req.body.publisherId;  
  const todayStart = formatISO(startOfDay(new Date()));
  const weekStart = formatISO(startOfWeek(new Date()));
  const monthStart = formatISO(startOfMonth(new Date()));

  const querySpec = {
    query: "SELECT * FROM c WHERE c.publisherId = @publisherId",
    parameters: [
      {
        name: "@publisherId",
        value: publisherId
      }
    ]
  };

  try {
    const { resources: transactions } = await container.items.query(querySpec).fetchAll();

    let allTimeSales = transactions.length;
    let todaySales = transactions.filter(t => t.purchaseDate > todayStart).length;
    let weekSales = transactions.filter(t => t.purchaseDate > weekStart).length;
    let monthSales = transactions.filter(t => t.purchaseDate > monthStart).length;

    let allTimeRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
    let todayRevenue = transactions.filter(t => t.purchaseDate > todayStart).reduce((sum, t) => sum + t.price, 0);
    let weekRevenue = transactions.filter(t => t.purchaseDate > weekStart).reduce((sum, t) => sum + t.price, 0);
    let monthRevenue = transactions.filter(t => t.purchaseDate > monthStart).reduce((sum, t) => sum + t.price, 0);
    
    // Generate individual asset analytics
    let assetAnalytics = {};
    transactions.forEach(t => {
      if(!assetAnalytics[t.assetId]){
        assetAnalytics[t.assetId] = { allTimeSales: 0, todaySales: 0, weekSales: 0, monthSales: 0, allTimeRevenue: 0, todayRevenue: 0, weekRevenue: 0, monthRevenue: 0};
      }
      assetAnalytics[t.assetId].allTimeSales += 1;
      assetAnalytics[t.assetId].allTimeRevenue += t.price;
      if(t.purchaseDate > todayStart){
        assetAnalytics[t.assetId].todaySales += 1;
        assetAnalytics[t.assetId].todayRevenue += t.price;
      }
      if(t.purchaseDate > weekStart){
        assetAnalytics[t.assetId].weekSales += 1;
        assetAnalytics[t.assetId].weekRevenue += t.price;
      }
      if(t.purchaseDate > monthStart){
        assetAnalytics[t.assetId].monthSales += 1;
        assetAnalytics[t.assetId].monthRevenue += t.price;
      }
    });

    let aggregateAnalytics = {
      allTimeSales,
      todaySales,
      weekSales,
      monthSales,
      allTimeRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue
    };

    context.res = {
      status: 200,
      body: { aggregateAnalytics, assetAnalytics }
    };

  } catch (error) {
    context.res = {
        status: 500,
        body: `Error fetching transactions: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`
    };
  }
};
