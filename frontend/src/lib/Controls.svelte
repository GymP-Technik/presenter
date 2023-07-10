<script lang="ts">
	import { onMount } from "svelte";
	import { state, selectedVideo } from "../stores/state";

	async function req(action: string) {
		state.update((state) => {
			state.fetching = true;
			return state;
		});

		const res = await fetch(`${window.apiHost}/vlc/${action}`, {
			method: "put",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				uuid: $selectedVideo,
			}),
		});

		const body = await res.json();

		state.set(body);
	}

	onMount(async () => {
		const res = await fetch(`${window.apiHost}/vlc`);

		const body = await res.json();
		state.set(body);
	});
</script>

<div class="container">
	<div class="status">
		<p>{$state.text}</p>
	</div>
	<div class="controlls">
		{#if $state.running}
			<button disabled={$state.fetching} on:click={() => req("restart")}>Restart</button>
			<button disabled={$state.fetching} on:click={() => req("stop")}>Stop</button>
		{:else}
			<button disabled={$state.fetching} on:click={() => req("start")}>Start</button>
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
