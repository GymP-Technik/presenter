export function sleep(timeout: number) {
	return new Promise<void>((resolve, _reject) => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}
