import { Application, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import router from "./routes.ts";
import state from "./state.ts";
import { vlc } from "./player.ts";
import { Video, orm } from "./db.ts";

const app = new Application();

await state.load();

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

// Cors
app.use(
	oakCors({
		origin: "*",
	})
);

// Router
app.use(router.routes());
app.use(router.allowedMethods());

// Static hosting
app.use(async (context, next) => {
	const root = `${Deno.cwd()}/static`;
	try {
		await context.send({ root });
	} catch {
		next();
	}
});

// Not found handling
app.use(async (context) => {
	context.response.status = Status.NotFound;
	context.response.body = `"${context.request.url}" not found`;
});

const port = 3001;

app.addEventListener("listen", async () => {
	console.log(`Listening on http://localhost:${port}`);

	if (state.running) {
		const res = orm.findMany(Video, { where: { clause: "uuid=?", values: [state.playing] } });

		if (res.length == 0) {
			console.error("No video found");
			return;
		}

		const ending = res[0].filename!.split(".").slice(-1);
		await vlc.start(`data/${res[0].uuid}.${ending}`);
	}
});

await app.listen({ port: port });
