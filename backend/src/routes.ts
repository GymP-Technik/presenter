import { Router, RouterContext } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import state from "./stores/state.ts";

import { Videos } from "./db/models.ts";

import { vlc } from "./player.ts";

type ctx = RouterContext<any, any, any>;

const router = new Router();

async function vlcStop(ctx: ctx) {
	if (!state.running) {
		throw new Error("Not running");
	}

	await vlc.kill();

	state.running = false;
	state.fetching = false;
	state.text = "Disabled";

	state.save();

	ctx.response.body = state;
	ctx.response.status = 200;
}

async function vlcStart(ctx: ctx) {
	if (state.running) {
		throw new Error("Already running");
	}

	// Build playlist
	const playlist = await state.getPlaylist();

	await vlc.start(playlist);

	state.running = true;
	state.fetching = false;
	state.text = "Running";

	state.save();

	ctx.response.body = state;
	ctx.response.status = 200;
}

// General
router.get("/ping", (ctx) => {
	ctx.response.body = "pong";
});

// Redirects
router.get("/", (ctx) => {
	ctx.response.redirect("/index.html");
});

// Playlist // Array of uuids for videos
router.post("/timeline", async (ctx) => {
	const body = await ctx.request.body().value;
	state.playlistBackup = body.playlist;

	await state.save();

	if (state.running) {
		await vlcStop(ctx);
		await vlcStart(ctx);
	}

	ctx.response.status = 200;
	ctx.response.body = {};
});

router.get("/timeline", async (ctx) => {
	ctx.response.body = state.playlistBackup;
	ctx.response.status = 200;
});

// VLC
router.put("/vlc/stop", vlcStop);
router.put("/vlc/start", async (ctx) => {
	await vlcStart(ctx);
});
router.put("/vlc/restart", async (ctx) => {
	if (!state.running) {
		throw new Error("Not running");
	}

	await vlcStop(ctx);
	await vlcStart(ctx);
});
router.get("/vlc", (ctx) => {
	ctx.response.body = state;
	ctx.response.status = 200;
});

// Videos
router.get("/videos", async (ctx) => {
	const res = await Videos().find({}).toArray();

	ctx.response.body = res;
	ctx.response.status = 200;
});
router.delete("/videos/:uuid", async (ctx) => {
	// Check if video exists
	const res = await Videos().findOne({ uuid: ctx.params.uuid });

	if (res == undefined) {
		throw new Error("No video found");
	}

	await Videos().deleteOne({ uuid: ctx.params.uuid });

	const ending = res.filename?.split(".").slice(-1);
	await Deno.remove(`data/videos/${res.uuid}.${ending}`);

	ctx.response.status = 200;
	ctx.response.body = await Videos().find({}).toArray();
});
router.post("/upload", async (ctx) => {
	const body = await ctx.request.body({
		type: "form-data",
	});

	const form = await body.value.read({
		maxFileSize: 262144000,
	});

	if (form.files?.length == 0) {
		throw new Error("No files uploaded");
	}

	// Create video
	const uuid = crypto.randomUUID();

	await Videos().insertOne({
		uuid: uuid,
		filename: form.files![0]!.originalName,
		date: new Date(),
	});

	// Copy video
	const ending = form.files![0]!.filename?.split(".").slice(-1);
	await Deno.copyFile(`${form.files![0]!.filename}`, `data/videos/${uuid}.${ending}`);

	ctx.response.redirect("/");
});

export default router;
