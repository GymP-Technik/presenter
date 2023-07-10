import { Application, Router, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { orm, Video } from "./db.ts";
import { vlc } from "./player.ts";

const app = new Application();
const router = new Router();

// Error handling
app.use(async (context, next) => {
	try {
		await next();
	} catch (err) {
		console.error(err.message);
		console.error(err);

		context.response.status = 500;

		context.response.body = { error: err };
		context.response.type = "json";
	}
});

// State
const state = { running: false, text: "Disabled", fetching: false, playing: "" };

router
	.get("/ping", (ctx) => {
		ctx.response.body = "pong";
	})
	.put("/vlc/stop", async (ctx) => {
		if (!state.running) {
			throw new Error("Not running");
		}

		await vlc.kill();

		state.running = false;
		state.fetching = false;
		state.text = "Disabled";

		ctx.response.body = state;
		ctx.response.status = 200;
	})
	.put("/vlc/start", async (ctx) => {
		if (state.running) {
			throw new Error("Already running");
		}

		// Get body
		const body = await ctx.request.body().value;

		// Check if video exists
		const res = orm.findMany(Video, { where: { clause: "uuid=?", values: [body.uuid] } });

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

		ctx.response.body = state;
		ctx.response.status = 200;
	})
	.put("/vlc/restart", (ctx) => {
		throw new Error("TODO");
	})
	.get("/vlc", (ctx) => {
		ctx.response.body = state;
		ctx.response.status = 200;
	})
	.get("/videos", (ctx) => {
		const res = orm.findMany(Video, {});

		ctx.response.body = res;
		ctx.response.status = 200;
	})
	.delete("/videos/:uuid", async (ctx) => {
		// Check if video exists
		const res = orm.findMany(Video, { where: { clause: "uuid = ?", values: [ctx.params.uuid] } });

		if (res.length == 0) {
			throw new Error("No video found");
		}

		orm.delete(res[0]);

		const ending = res[0].filename?.split(".").slice(-1);
		await Deno.remove(`data/${res[0].uuid}.${ending}`);

		ctx.response.status = 200;
		ctx.response.body = {};
	})
	.post("/upload", async (ctx) => {
		const body = await ctx.request.body({
			type: "form-data",
		});

		const form = await body.value.read();

		if (form.files?.length == 0) {
			throw new Error("No files uploaded");
		}

		// Create video
		const video = new Video();
		const uuid = crypto.randomUUID();
		video.filename = form.files![0]!.originalName;
		video.uuid = uuid;

		orm.save(video);

		// Copy video
		const ending = form.files![0]!.filename?.split(".").slice(-1);
		await Deno.copyFile(`${form.files![0]!.filename}`, `data/${uuid}.${ending}`);

		ctx.response.redirect("/");
	})
	// Redirects
	.get("/", (ctx) => {
		ctx.response.redirect("/index.html");
	});

app.use(
	oakCors({
		origin: "*",
	})
);

app.use(router.routes());
app.use(router.allowedMethods());

// static files
app.use(async (context, next) => {
	const root = `${Deno.cwd()}/static`;
	try {
		await context.send({ root });
	} catch {
		next();
	}
});

// 404
app.use(async (context) => {
	context.response.status = Status.NotFound;
	context.response.body = `"${context.request.url}" not found`;
});

const port = 3001;

app.addEventListener("listen", () => {
	console.log(`Listening on http://localhost:${port}`);
});

await app.listen({ port: port });
