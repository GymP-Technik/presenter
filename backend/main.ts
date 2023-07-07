import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { orm, Video } from "./db.ts";

const app = new Application();
const router = new Router();

// State
const state = { running: false, text: "Disabled", fetching: false };

router
	.get("/ping", (ctx) => {
		ctx.response.body = "pong";
	})
	.get("/vlc/stop", (ctx) => {})
	.get("/vlc/start", (ctx) => {})
	.get("/vlc/restart", (ctx) => {})
	.get("/vlc", (ctx) => {})
	.get("/videos", (ctx) => {})
	.get("/videos/:id", (ctx) => {})
	.delete("/videos/:id", (ctx) => {})
	.post("/upload", async (ctx) => {
		const body = await ctx.request.body({
			type: "form-data",
		});

		(await body.value.read()).files![0];
	});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
