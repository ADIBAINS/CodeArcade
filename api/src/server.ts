import "dotenv/config";
import { closeApp, app } from "./app";
import { getEnv } from "./config/env";

const env = getEnv();

const server = app.listen(env.PORT, () => {
  console.log(`CodeArcade API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    try {
      await closeApp();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

