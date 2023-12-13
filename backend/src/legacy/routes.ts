import { Router, RouterContext } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import state from "./state.ts";

import { orm, Spot } from "../db.ts";
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

	// Check if video exists
	const res = orm.findMany(Spot, { where: { clause: "uuid=?", values: [state.playing] } });

	if (res.length == 0) {
		throw new Error("No video found");
	}

	// Play video
	const ending = res[0].filename?.split(".").slice(-1);
	await vlc.start(`data/${res[0].uuid}.${ending}`);

	state.running = true;
	state.fetching = false;
	state.playing = res[0].uuid;
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

// VLC
router.put("/vlc/stop", vlcStop);
router.put("/vlc/start", async (ctx) => {
	const body = await ctx.request.body().value;
	state.playing = body.uuid;

	await vlcStart(ctx);
});
router.put("/vlc/restart", async (ctx) => {
	if (!state.running) {
		throw new Error("Not running");
	}

	const body = await ctx.request.body().value;
	state.playing = body.uuid;

	await vlcStop(ctx);
	await vlcStart(ctx);
});
router.get("/vlc", (ctx) => {
	ctx.response.body = state;
	ctx.response.status = 200;
});

// Videos
router.get("/videos", (ctx) => {
	const res = orm.findMany(Spot, {});

	ctx.response.body = res;
	ctx.response.status = 200;
});
router.delete("/videos/:uuid", async (ctx) => {
	// Check if video exists
	const res = orm.findMany(Spot, { where: { clause: "uuid = ?", values: [ctx.params.uuid] } });

	if (res.length == 0) {
		throw new Error("No video found");
	}

	orm.delete(res[0]);

	const ending = res[0].filename?.split(".").slice(-1);
	await Deno.remove(`data/${res[0].uuid}.${ending}`);

	ctx.response.status = 200;
	ctx.response.body = orm.findMany(Spot, {});
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
	const video = new Spot();
	const uuid = crypto.randomUUID();
	video.filename = form.files![0]!.originalName;
	video.uuid = uuid;

	orm.save(video);

	// Copy video
	const ending = form.files![0]!.filename?.split(".").slice(-1);
	await Deno.copyFile(`${form.files![0]!.filename}`, `data/${uuid}.${ending}`);

	ctx.response.redirect("/");
});

export default router;
