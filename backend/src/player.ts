export const vlc: {
	process: Deno.Process | null;
	start: (clip: string) => Promise<void>;
	kill: () => Promise<void>;
} = {
	process: null,
	start: async function (clip) {
		const clipPath = `${clip}`;

		this.process = Deno.run({
			cwd: Deno.cwd(),
			cmd: ["vlc", "-L", "-f", clipPath],
			stdout: "piped",
			stderr: "piped",
		});
	},
	kill: async function () {
		await this.process!.kill();
	},
};
