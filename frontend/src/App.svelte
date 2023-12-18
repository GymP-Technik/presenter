<script lang="ts">
	import Router from "svelte-spa-router";

	import Footer from "./lib/Footer.svelte";

	import routes from "./routes";
	import auth from "./stores/auth";
	import { push } from "svelte-spa-router";

	let extended = [];

	if (localStorage.getItem("extended") !== null) {
		extended = JSON.parse(localStorage.getItem("extended"));
	}

	$: localStorage.setItem("extended", JSON.stringify(extended));
</script>

{#if $auth.authenticated}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<nav>
		<div class="category box" on:click={() => push("/")}>
			<p>Dashboard</p>
		</div>
		{#if $auth.roles.includes("management")}
			<div class="category box">
				<p>Management</p>
			</div>
			{#if extended.includes("management")}
				<div class="sub box">
					<p>Users</p>
				</div>
			{/if}
			{#if extended.includes("management") && $auth.roles.includes("management.system")}
				<div class="sub box">
					<p>System</p>
				</div>
			{/if}
		{/if}
		<div class="category box" on:click={() => push("/settings")}>
			<p>Settings</p>
		</div>
		<div class="category box" on:click={auth.logout}>
			<p>Logout</p>
		</div>
		<div class="footer">
			<Footer ping={true} build={false} />
		</div>
	</nav>
{/if}
<div class="content">
	<Router {routes} />
	<Footer ping={false} build={true} />
</div>

<style>
	@media only screen and (max-width: 1000px) {
		nav {
			display: none !important;
		}
	}

	nav {
		width: 320px;

		float: left;
		display: flex;
		flex-direction: column;

		border-right: 1px solid #dfdfdf;
	}

	nav > .footer {
		margin-top: auto;
	}

	.box {
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
		height: 64px;
		width: 100%;

		transition: 0.2s;
	}

	.box:hover {
		background-color: rgb(238, 238, 238);
	}

	.box > p {
		font-size: 16px;
		font-weight: 500;
	}

	.category {
		border-bottom: 1px solid #dfdfdf;
		background-color: #f7f7f9;
	}

	.content {
		float: left;

		min-height: 100vh;
		width: 100%;

		display: flex;
		flex-direction: column;

		overflow: hidden;
	}

	:global(#app) {
		flex-direction: row;
	}
</style>
