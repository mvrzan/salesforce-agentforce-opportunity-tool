import { Router } from "express";
import { initSalesforceSdk } from "../middleware/heroku-service-mesh.js";
import { getCurrentTimestamp } from "../utils/loggingUtil.js";
import opportunitiesHandler from "../controllers/opportunitiesHandler.js";

const salesforceRoutes = Router();

const initMiddleware = async () => {
  try {
    console.log(`${getCurrentTimestamp()} 🔧 - Initializing Salesforce routes...`);
    const { salesforceMiddleware, withSalesforceConfig } = await initSalesforceSdk();

    salesforceRoutes.post(
      "/v1/opportunities",
      withSalesforceConfig({ parseRequest: true }),
      salesforceMiddleware,
      opportunitiesHandler
    );

    console.log(`${getCurrentTimestamp()} ✅ Salesforce routes registered successfully!`);
  } catch (error) {
    console.error(`${getCurrentTimestamp()} ❌ Failed to initialize Salesforce routes: ${error.message}`);
  }
};

await initMiddleware();

export default salesforceRoutes;
