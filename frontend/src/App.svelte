<script lang="ts">
	import Clips from "./lib/Clips.svelte";
	import Controls from "./lib/Controls.svelte";

	import Footer from "./lib/Footer.svelte";
</script>

<main>
	<div class="clips">
		<Clips />
	</div>
	<div class="controls">
		<Controls />
	</div>
</main>

<Footer />

<style>
	main {
		width: calc(100% - 128px);
		flex: 1;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 64px;

		gap: 64px;
	}

	.clips {
		min-width: 500px;
		height: 100px;
		flex: 1;
	}

	.controls {
		min-width: 500px;
		height: 100px;
		flex: 1;
	}
</style>
