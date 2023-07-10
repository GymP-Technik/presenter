import { Application, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import router from "./routes.ts";

const app = new Application();

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

app.addEventListener("listen", () => {
	console.log(`Listening on http://localhost:${port}`);
});

await app.listen({ port: port });
