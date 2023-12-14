import app from "./api.ts";
import docker from "./docker/index.ts";
import manager from "./manager.ts";

import { connect } from "./db/mongo.ts";

// Start services
await docker.reachable(true);
await docker.helpers.ensureSwarm();
await docker.helpers.ensureServices();

// Connect to db
await connect();

// Cleanup local data
await manager.clean();

// Start api
await app.listen({ port: 3001 });
