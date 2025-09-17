import { getCurrentTimestamp } from "../utils/loggingUtil.js";

const opportunitiesHandler = async (req, res) => {
  try {
    console.log(`${getCurrentTimestamp()} 📥 - opportunitiesHandler - Request received...`);

    const { context } = req.sdk;
    const org = context.org;
    const requestBody = req.body;
    const query = requestBody?.query;

    console.log(`${getCurrentTimestamp()} 🕵️‍♀️ - opportunitiesHandler - Query received: ${query}`);

    if (!query) {
      console.error(`${getCurrentTimestamp()} 🚨 - opportunitiesHandler - Query not found!`);

      res.status(500).json({
        message: "Query not found!",
      });
    }

    const results = await org.dataApi.query(query);

    if (results.totalSize === 0) {
      console.error(`${getCurrentTimestamp()} 🚨 - opportunitiesHandler - No results found!`);

      res.status(500).json({
        message: "No opportunities found matching your query.",
      });
    }

    const opportunities = results.records.map((rec) => rec.fields);

    console.log(`${getCurrentTimestamp()} 📋  - opportunitiesHandler - Opportunities found:`, opportunities);
    console.log(`${getCurrentTimestamp()} ✅  - opportunitiesHandler - Query successfully executed!`);

    res.status(200).json({
      message: "success",
      opportunities,
    });
  } catch (error) {
    console.error(`${getCurrentTimestamp()} ❌ - opportunitiesHandler - Error occurred: ${error.message}`);

    res.status(500).json({
      message: error,
    });
  }
};

export default opportunitiesHandler;
