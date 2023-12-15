<script lang="ts">
	import Footer from "./lib/Footer.svelte";

	import Router from "svelte-spa-router";

	import routes from "./routes";
</script>

<Router {routes} />

<Footer />
