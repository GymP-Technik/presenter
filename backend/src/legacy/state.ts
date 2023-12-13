import * as toml from "https://deno.land/std@0.144.0/encoding/toml.ts";

let state: {
	running: boolean;
	text: string;
	fetching: boolean;
	playing: string;

	load: () => Promise<void>;
	save: () => Promise<void>;
} = {
	running: false,
	text: "First start",
	fetching: false,
	playing: "",
	load: async function () {
		try {
			const configFile = await Deno.readTextFile("data/state.toml");
			const parsed = toml.parse(configFile) as {
				running: boolean;
				text: string;
				fetching: boolean;
				playing: string;
			};

			this.running = parsed.running;
			this.text = parsed.text;
			this.fetching = parsed.fetching;
			this.playing = parsed.playing;
		} catch (err) {
			console.error(err);
		}
	},
	save: async function () {
		try {
			await Deno.mkdir("data/").catch(() => {});
			await Deno.writeTextFile("data/state.toml", toml.stringify(this));
		} catch (err) {
			console.error(err);
		}
	},
};

export default state;
