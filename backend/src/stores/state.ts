// LEgacy State management
// TODO: Modernize
import * as toml from "https://deno.land/std@0.144.0/encoding/toml.ts";
import { Videos } from "local/src/db/models.ts";

const state: {
	running: boolean;
	text: string;
	fetching: boolean;
	playlistBackup: string[];

	load: () => Promise<void>;
	save: () => Promise<void>;
	getPlaylist: () => Promise<string[]>;
} = {
	running: false,
	fetching: false,
	text: "First start",
	playlistBackup: [],

	load: async function () {
		try {
			const configFile = await Deno.readTextFile("data/state.toml");
			const parsed = toml.parse(configFile) as {
				running: boolean;
				text: string;
				fetching: boolean;
				playlistBackup: string[];
			};

			this.running = parsed.running;
			this.text = parsed.text;
			this.fetching = parsed.fetching;
			this.playlistBackup = parsed.playlistBackup;

			if (this.playlistBackup === undefined) {
				this.playlistBackup = [];
				await this.save();
			}
		} catch (err) {
			console.error(err);
		}

		try {
			await Deno.mkdir("data/videos");
		} catch (_err) {}
	},
	save: async function () {
		try {
			await Deno.mkdir("data/").catch(() => {});
			await Deno.writeTextFile("data/state.toml", toml.stringify(this));
		} catch (err) {
			console.error(err);
		}
	},
	getPlaylist: async function () {
		if (this.playlistBackup === undefined) {
			return [];
		}

		return await Promise.all(
			this.playlistBackup.map(async (entry) => {
				// Check if video exists
				const res = await Videos().findOne({
					uuid: entry,
				});

				if (res == undefined) {
					throw new Error("No video found for " + entry);
				}

				// Play video
				const ending = res.filename?.split(".").slice(-1);

				return `data/videos/${res.uuid}.${ending}`;
			})
		);
	},
};

await state.load();

export default state;
