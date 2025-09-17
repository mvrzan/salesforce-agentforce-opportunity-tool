import { getCurrentTimestamp } from "../utils/loggingUtil.js";
import salesforceSdk from "@heroku/applink";

const customAsyncHandlers = {};

export const initSalesforceSdk = async () => {
  console.log(`${getCurrentTimestamp()} 🏋  - herokuServiceMesh - Loading up the middleware...`);

  const salesforceMiddleware = async (req, res, next) => {
    req.sdk = salesforceSdk.init();

    const skipParsing = req.route?.salesforceConfig?.parseRequest === false;

    if (!skipParsing) {
      try {
        const parsedRequest = req.sdk.salesforce.parseRequest(req.headers, req.body, req.log || console);

        req.sdk = Object.assign(req.sdk, parsedRequest);
      } catch (error) {
        console.error(`${getCurrentTimestamp()} ❌ Salesforce authentication error:`, error.message);

        return res.status(401).json({
          error: "Invalid request",
          message: "Missing or invalid Salesforce authentication",
        });
      }
    }
    next();
  };

  const withSalesforceConfig = (options = {}) => {
    return (req, _res, next) => {
      req.route.salesforceConfig = options;
      next();
    };
  };

  const asyncMiddleware = (handler) => {
    return async (req, res, next) => {
      console.log(`${getCurrentTimestamp()} 🔄 Async response for ${req.method} ${req.path}`);

      const routeKey = `${req.method} ${req.path}`;
      customAsyncHandlers[routeKey] = handler;

      res.status(201).send({
        message: `Async ${routeKey} completed!`,
      });

      try {
        await handler(req, res);
        req.sdk.asyncComplete = true;
        console.log(`${getCurrentTimestamp()} 🔄 Async ${routeKey} completed!`);
      } catch (error) {
        console.error(`${getCurrentTimestamp()} ❌ Error in async handler for ${routeKey}:`, error);
      }
      next();
    };
  };

  console.log(`${getCurrentTimestamp()} 🦾 - herokuServiceMesh - Middleware ready!`);

  return {
    salesforceMiddleware,
    asyncMiddleware,
    withSalesforceConfig,
  };
};

export default initSalesforceSdk;
