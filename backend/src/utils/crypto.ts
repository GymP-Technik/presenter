// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export function makeId(length: number) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

import { encodeToString } from "https://deno.land/std@0.97.0/encoding/hex.ts";

export const hash = async (content: Uint8Array | string) => {
	if (!(content instanceof Uint8Array)) {
		content = new TextEncoder().encode(content);
	}

	return await crypto.subtle.digest("SHA-256", content).then((res) => encodeToString(new Uint8Array(res)));
};
