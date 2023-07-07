<script lang="ts">
	import { onMount } from "svelte";

	let status = { running: false, text: "Loading", fetching: true };

	async function req(action: string) {
		status.fetching = true;

		const res = await fetch(`${window.apiHost}/vlc/${action}`);

		const body = await res.json();

		statusbar = body;
	}

	onMount(async () => {
		const res = await fetch(`${window.apiHost}/vlc`);

		const body = await res.json();

		status = body;
	});
</script>

<div class="container">
	<div class="status">
		<p>{status.text}</p>
	</div>
	<div class="controlls">
		{#if status.running}
			<button disabled={status.fetching} on:click={() => req("restart")}>Restart</button>
			<button disabled={status.fetching} on:click={() => req("Stop")}>Stop</button>
		{:else}
			<button disabled={status.fetching} on:click={() => req("start")}>Start</button>
		{/if}
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;

		background-color: #f7f7f9;

		border: 1px solid #dfdfdf;
		border-radius: 8px;

		overflow: hidden;
	}

	.status {
		width: 100%;
		height: 24px;

		border-bottom: 1px solid #dfdfdf;

		display: flex;
		flex-direction: row;
		align-items: center;

		padding: 8px;
		padding-left: 16px;
	}

	.controlls {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 16px;

		gap: 24px;
	}

	p {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
	}
</style>
