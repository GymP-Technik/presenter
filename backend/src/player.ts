export const vlc: {
	process: Deno.Process | null;

	start: (entries: string[]) => Promise<void>;
	kill: () => Promise<void>;
	buildPlaylist: (entries: string[]) => Promise<void>;
} = {
	process: null,
	start: async function (entries) {
		await this.buildPlaylist(entries);

		this.process = Deno.run({
			cwd: Deno.cwd(),
			cmd: ["vlc", "-L", "--no-video-title", "-f", "playlist.m3u"],
			stdout: "piped",
			stderr: "piped",
		});
	},
	kill: async function () {
		await this.process!.kill();
	},
	buildPlaylist: async function (entries) {
		await Deno.writeTextFile(
			`${Deno.cwd()}/playlist.m3u`,
			entries.map((entry) => `${Deno.cwd()}/${entry}`).join("\n")
		);
	},
};
