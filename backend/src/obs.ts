import OBSWebSocket from "npm:obs-websocket-js@5";

import config from "./config.js";
//import state from "./state.ts";

import { Spot, orm } from "./db.ts";

export default {
	obs: undefined,
	vlcSceneItem: 0,

	connect: async function () {
		this.obs = new OBSWebSocket();

		await this.obs.connect(config.url, config.pw, {});
		await this.init();
	},

	init: async function () {
		// Delete all scenes

		const { scenes } = await this.obs!.call("GetSceneList");

		for (const scene of scenes) {
			await this.obs!.call("RemoveScene", { sceneName: scene.sceneName });
		}

		// TODO: Delete all sources

		// Create VLC scene
		await this.obs!.call("CreateScene", { sceneName: "VLC" });

		// Create VLC source
		const { sceneItemId } = await this.obs!.call("CreateSceneItem", {
			sceneName: "VLC",
			sourceName: "VLC Video Source",
			sceneItemEnabled: true,
		});

		this.vlcSceneItem = sceneItemId;
	},

	restore: async function () {
		const res = orm.findMany(Spot, { where: { clause: "uuid=?", values: [state.playing] } });

		if (res.length == 0) {
			console.error("No video found");
			return;
		}

		const ending = res[0].filename!.split(".").slice(-1);
		await vlc.start(`data/${res[0].uuid}.${ending}`);
	},

	setPlaylist: async function () {},

	openProjector: async function () {
		await this.obs!.call("OpenSourceProjector", { sourceName: "VLC Video Source" });
	},
} as {
	obs: undefined | OBSWebSocket;

	vlcSceneItem: number;

	connect: () => Promise<void>;
	restore: () => Promise<void>;
	init: () => Promise<void>;
};
