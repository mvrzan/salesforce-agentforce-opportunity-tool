import { getCurrentTimestamp } from "../utils/loggingUtil.js";

const opportunitiesHandler = async (req, res) => {
  try {
    console.log(`${getCurrentTimestamp()} 📥 - opportunitiesHandler - Request received...`);

    if (!req.sdk || !req.sdk.context || !req.sdk.context.org) {
      console.error(`${getCurrentTimestamp()} 🚨 - opportunitiesHandler - SDK context or org not found!`);

      res.status(500).json({
        message: "SDK context or org not found!",
      });

      return;
    }

    const { context } = req.sdk;
    const org = context.org;
    const requestBody = req.body;
    const query = requestBody?.query;
    const userId = org.user.id;

    console.log(`${getCurrentTimestamp()} 🕵️‍♀️ - opportunitiesHandler - Query received: ${query}`);

    if (!query) {
      console.error(`${getCurrentTimestamp()} 🚨 - opportunitiesHandler - Query not found!`);

      res.status(500).json({
        message: "Query not found!",
      });
      return;
    }

    let processedQuery = query;

    const userIdPatterns = [
      /USER_ID/gi,
      /\{USER_ID\}/gi,
      /\{user_id\}/gi,
      /\{userId\}/gi,
      /\{current_user_id\}/gi,
      /\{currentUserId\}/gi,
      /\$USER_ID/gi,
      /\$user_id/gi,
      /\$userId/gi,
      /<USER_ID>/gi,
      /<user_id>/gi,
      /<userId>/gi,
      /\[USER_ID\]/gi,
      /\[user_id\]/gi,
      /\[userId\]/gi,
      /CURRENT_USER_ID/gi,
      /currentUserId/g,
      /current_user_id/gi,
      /'PLACEHOLDER_USER_ID'/gi,
      /"PLACEHOLDER_USER_ID"/gi,
      /:User\.Id/gi,
      /:user\.id/gi,
      /:CurrentUser\.Id/gi,
      /:current_user\.id/gi,
      /:\$User\.Id/gi,
    ];

    let hasUserIdPattern = false;
    for (const pattern of userIdPatterns) {
      if (pattern.test(query)) {
        hasUserIdPattern = true;
        processedQuery = processedQuery.replace(pattern, `'${userId}'`);
      }
    }

    if (hasUserIdPattern) {
      console.log(
        `${getCurrentTimestamp()} 🔄 - opportunitiesHandler - Replaced user ID placeholders with userId: ${userId}`
      );
      console.log(`${getCurrentTimestamp()} 📝 - opportunitiesHandler - Original query: ${query}`);
      console.log(`${getCurrentTimestamp()} 📝 - opportunitiesHandler - Processed query: ${processedQuery}`);
    }

    const results = await org.dataApi.query(processedQuery);

    console.log(`${getCurrentTimestamp()} 🤖  - opportunitiesHandler - Checking results...`, results);

    if (results.totalSize === 0) {
      console.error(`${getCurrentTimestamp()} 🚨 - opportunitiesHandler - No results found!`);
      res.status(500).json({
        message: "No opportunities found matching your query.",
      });
      return;
    }

    const opportunities = results.records.map((rec) => rec.fields);

    if (opportunities[0]?.expr0) {
      res.status(200).json({
        message: "success",
        opportunities: [],
        result: opportunities[0]?.expr0,
      });

      console.log(`${getCurrentTimestamp()} 🧮  - opportunitiesHandler - Calculation successfully provided!`);

      return;
    }

    console.log(`${getCurrentTimestamp()} 📋  - opportunitiesHandler - Opportunities found:`, opportunities);
    console.log(`${getCurrentTimestamp()} ✅  - opportunitiesHandler - Query successfully executed!`);

    res.status(200).json({
      message: "success",
      opportunities,
    });
  } catch (error) {
    console.error(`${getCurrentTimestamp()} ❌ - opportunitiesHandler - Error occurred: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

export default opportunitiesHandler;
