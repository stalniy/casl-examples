import { createApp } from "./createApp";
import { config } from "./config";
import { repairLegacyTimestamps } from "./prisma/repairLegacyTimestamps";

createApp(config)
  .then(async app => {
    await app.prisma.$connect();
    await repairLegacyTimestamps(app.prisma, app.log);
    await app.listen({ port: config.SERVER_PORT })
  })
  .catch(console.error)
