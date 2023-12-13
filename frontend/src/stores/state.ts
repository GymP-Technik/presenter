import { writable } from "svelte/store";

export const state = writable({ running: false, text: "Loading", fetching: true, playing: "" });
export const playlist = writable([]);
export const unsavedChanges = writable(false);
