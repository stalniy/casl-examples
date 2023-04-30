import { createApp } from "./createApp";
import { config } from "./config";

createApp(config)
  .then(async app => {
    await app.prisma.$connect();
    await app.listen({ port: config.SERVER_PORT })
  })
  .catch(console.error)
