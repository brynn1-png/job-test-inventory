import { app } from "./app.js";
import { env } from "./config/env.js";
import { getPool } from "./database/pool.js";

async function start() {
  await getPool();
  app.listen(env.PORT, () => {
    console.log(`Inventory API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("API startup failed", error);
  process.exitCode = 1;
});

