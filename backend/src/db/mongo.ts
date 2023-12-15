import secrets from "../stores/secrets.ts";

import { Database, MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const client = new MongoClient();

export let db: undefined | Database = undefined;

export async function connect() {
	await client.connect(
		`mongodb://presenter:${await secrets.get(
			"mongo.password",
			""
		)}@localhost:27017/?authMechanism=SCRAM-SHA-1`
	);

	db = client.database("presenter");
}
