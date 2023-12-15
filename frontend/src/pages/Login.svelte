<script lang="ts">
	import { push } from "svelte-spa-router";
	import auth from "../stores/auth";

	// State
	let loading = false;
	let username = "";
	let password = "";

	let errorMessage = undefined;

	async function submit(e: Event) {
		// State
		loading = true;
		e.preventDefault();
		errorMessage = undefined;

		// Login
		const { success, error } = await auth.login(username, password);

		if (success) {
			push("/");
		} else {
			errorMessage = error;
			loading = false;
		}
	}
</script>

<main>
	{#if errorMessage !== undefined}
		<div class="error">
			<h1>Login Error</h1>
			<p>{errorMessage}</p>
		</div>
	{/if}
	<form on:submit={submit}>
		<input
			type="text"
			name="username"
			required
			placeholder="Username"
			id="username"
			disabled={loading}
			bind:value={username}
		/>
		<input
			type="password"
			name="password"
			required
			placeholder="Password"
			id="password"
			disabled={loading}
			bind:value={password}
		/>

		<button type="submit" class:loading
			>{#if loading}
				Loading
			{:else}
				Submit
			{/if}</button
		>
	</form>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		gap: 16px;

		height: calc(100vh - 24px);
	}

	form {
		display: flex;
		flex-direction: column;

		align-items: center;
	}

	input {
		font-size: 17px;
		padding: 12px;
		padding-left: 20px;
		padding-right: 20px;

		border-radius: 0px;

		border: 1px solid #dfdfdf;

		color: rgb(82, 82, 82);

		background-color: #f7f7f9;
	}

	#username {
		border-top-right-radius: 8px;
		border-top-left-radius: 8px;
	}

	#password {
		border-top: none;

		border-bottom-right-radius: 8px;
		border-bottom-left-radius: 8px;
	}

	button {
		margin-top: 8px;

		font-size: 18px;

		padding: 12px;
		padding-left: 20px;
		padding-right: 20px;

		width: fit-content;
		transition: 0.2s;
	}

	.loading {
		background-color: #f7f7f9;
		cursor: default !important;
	}

	/* Error */
	.error {
		background-color: #ff555544;
		border: 2px solid #ff5555;

		display: flex;
		flex-direction: column;
		gap: 10px;
		border-radius: 8px;

		padding: 18px;
		padding-top: 12px;

		width: 300px;
	}

	.error > h1 {
		margin: 0;
		font-size: 22px;

		color: #f52323;
	}

	.error > p {
		margin: 0;
		font-size: 17px;
	}
</style>
