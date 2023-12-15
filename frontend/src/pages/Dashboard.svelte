<script lang="ts">
	import { onMount } from "svelte";
	import Clips from "../lib/Clips.svelte";
	import Controls from "../lib/Controls.svelte";

	import { push } from "svelte-spa-router";

	import auth from "../stores/auth";

	$: if (!$auth.authenticated) {
		push("/login");
	}
</script>

<main>
	<div class="clips">
		<Clips />
	</div>
	<div class="controls">
		<Controls />
	</div>
</main>

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

	@media only screen and (max-width: 600px) {
		main {
			width: calc(100% - 48px);
			padding: 16px;
		}
	}

	.clips {
		min-width: 300px;
		height: 100%;
		flex: 1;
		width: 100%;
	}

	.controls {
		min-width: 300px;
		height: 100%;
		flex: 1;
		width: 100%;
	}
</style>
