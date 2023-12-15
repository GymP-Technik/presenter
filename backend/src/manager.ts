import { Users } from "local/src/db/models.ts";

import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import secrets from "local/src/stores/secrets.ts";
import log from "local/src/utils/log.ts";

export default {
	clean: async function () {
		console.log("Clean");
	},
	root: async function () {
		const count = await Users().countDocuments();

		if (count === 0) {
			// Create root user
			const hash = await bcrypt.hash(
				"password",
				await secrets.get("auth.salt", await bcrypt.genSalt())
			);

			Users().insertOne({
				username: "root",
				password: hash,
				roles: [],
			});

			log.info(`[manager] Created 'root' user with password 'password'. Change password asap`);
		}
	},
};
