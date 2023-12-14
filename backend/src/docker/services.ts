import secrets from "../stores/secrets.ts";

import { makeId } from "../utils/crypto.ts";

export default [
	{
		name: "mongo",
		image: "mongo:7.0.4",
		ports: [`27017:27017`],
		mounts: [
			{
				source: "data/mongo",
				target: "/data/db",
			},
		],
		env: [
			`MONGO_INITDB_ROOT_PASSWORD=${await secrets.get("mongo.password", makeId(16))}`,
			`MONGO_INITDB_ROOT_USERNAME=presenter`,
		],
	},
];
