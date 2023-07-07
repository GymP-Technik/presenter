import { SSQL, SSQLTable } from "https://deno.land/x/smallorm_sqlite@0.2.1/mod.ts";

export class Video extends SSQLTable {
	name = "";
	created = Date.now();
}

try {
	await Deno.stat("data");
} catch (error) {
	if (error instanceof Deno.errors.NotFound) {
		await Deno.mkdir("data");
	} else {
		throw error;
	}
}

export const orm = new SSQL("data/static.sqlite", [Video]);
