<script lang="ts">
	import { onMount } from "svelte";

	let connectionState = "Pending";

	// Try to ping host
	let fetcher = fetch(`${window.apiHost}/ping`);

	onMount(async () => {
		const res = await fetcher;

		if (!res.ok) {
			connectionState = "Unreachable";
			return;
		}

		connectionState = "Reachable";
	});
</script>

<footer>
	<div class="left">
		<div class="status" style={`background-color: var(--color-${connectionState})`} />
		<p>{connectionState}</p>
	</div>
</footer>

<style>
	footer {
		--color-Pending: rgb(247, 210, 0);
		--color-Unreachable: rgb(241, 69, 16);
		--color-Reachable: rgb(49, 165, 38);

		width: 100%;
		background-color: #f7f7f9;
		height: 24px;

		border-top: 1px solid #dfdfdf;

		margin-top: auto;

		display: flex;
		flex-direction: row;
		gap: 16px;
		align-items: center;
	}

	.left {
		display: flex;
		flex-direction: row;
		gap: 8px;
		align-items: center;

		padding-left: 16px;
		padding-right: 32px;
	}

	.status {
		border-radius: 50%;
		width: 10px;
		height: 10px;
		border: 1px solid #dfdfdf;
	}

	p {
		margin: 0;

		font-size: 12px;
		font-weight: 400;
		color: rgb(37, 37, 37);
	}
</style>
