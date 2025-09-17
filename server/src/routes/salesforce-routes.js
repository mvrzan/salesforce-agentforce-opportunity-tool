import { Router } from "express";
import { initSalesforceSdk } from "../middleware/heroku-service-mesh.js";
import { getCurrentTimestamp } from "../utils/loggingUtil.js";

const salesforceRoutes = Router();

const initMiddleware = async () => {
  try {
    console.log(`${getCurrentTimestamp()} 🔧 - Initializing Salesforce routes...`);
    const { salesforceMiddleware, withSalesforceConfig, asyncMiddleware } = await initSalesforceSdk();

    salesforceRoutes.get(
      "/v1/test",
      withSalesforceConfig({ parseRequest: true }),
      salesforceMiddleware,
      (_req, res) => {
        console.log("Request happened! ");

        res.status(200).json({
          message: "success",
        });
      }
    );

    console.log(`${getCurrentTimestamp()} ✅ Salesforce routes registered successfully!`);
  } catch (error) {
    console.error(`${getCurrentTimestamp()} ❌ Failed to initialize Salesforce routes: ${error.message}`);
  }
};

await initMiddleware();

export default salesforceRoutes;
