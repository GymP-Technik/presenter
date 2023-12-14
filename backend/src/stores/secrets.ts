// Generates and stores passwords and keys in plain text
import * as toml from "https://deno.land/std@0.144.0/encoding/toml.ts";

import log from "local/src/utils/log.ts";

const secrets: {
	secrets: any;
	file: string;

	load: () => Promise<void>;
	get: (path: string, replacement: any) => Promise<any>;
	set: (path: string, value: any) => Promise<any>;
} = {
	secrets: {},
	file: "data/secrets.toml",

	load: async function () {
		let secretFile;

		try {
			secretFile = await Deno.readTextFile(this.file);
		} catch (err) {
			log.debug(`[secrets] Secret file file not found: ${err}`);
			return;
		}

		try {
			this.secrets = toml.parse(secretFile) as { [key: string]: any };

			log.info(`[config] Successfully loaded secrets from '${this.file}'`);
		} catch (err) {
			log.error(`[config] Unable to parse secret file: ${err}`);
		}
	},

	async get(path, replacement) {
		let obj = this.secrets;

		for (const segment of path.split(".")) {
			if (obj[segment] === undefined) {
				log.info(`[secret] Secret '${path}' created`);

				await this.set(path, replacement);

				return replacement;
			}

			obj = obj[segment];
		}

		return obj;
	},

	async set(path, value) {
		let obj = this.secrets;

		let i = 0;
		for (const segment of path.split(".")) {
			if (obj[segment] === undefined) {
				obj[segment] = {};
			}

			if (i == path.split(".").length - 1) {
				obj[segment] = value;
			} else {
				obj = obj[segment];
			}

			i++;
		}

		obj = value;

		await Deno.writeTextFile(this.file, toml.stringify(this.secrets));
	},
};

await secrets.load();

export default secrets;
