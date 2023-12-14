import { Bson } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

import { db } from "./mongo.ts";

// Defining schema interface
export interface VideoSchema {
	_id: Bson.ObjectId;

	filename: string;
	uuid: string;

	date: Date;
}

export const Videos = () => db!.collection<VideoSchema>("videos");
