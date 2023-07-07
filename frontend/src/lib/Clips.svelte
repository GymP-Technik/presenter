<script lang="ts">
	import { onMount } from "svelte";

	let videos = [];

	async function deleteVideo(id: string) {
		const res = await fetch(`${window.apiHost}/videos/${id}`, { method: "DELETE" });

		const body = await res.json();

		videos = body;
	}

	async function selectVideo(id: string) {
		const res = await fetch(`${window.apiHost}/videos/${id}`, { method: "GET" });

		const body = await res.json();

		videos = body;
	}

	let fileInput;
	let fileForm;

	function openFileSelect() {
		fileInput.click();
	}

	async function upload() {
		fileForm.submit();
	}

	onMount(async () => {
		const res = await fetch(`${window.apiHost}/videos`);

		const body = await res.json();

		videos = body;
	});
</script>

<div class="container">
	<div class="upload" on:click={openFileSelect}>
		<p>Click to upload</p>
	</div>
	<div class="list">
		{#each videos as video (video.id)}
			<div class="video">
				<div class="thumbnail" />
				<p>{video.id}</p>
				<span>{new Date(video.date)}</span>
				<div class="actions">
					<button on:click={() => selectVideo(video.id)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z"
							/></svg
						>
					</button>
					<button on:click={() => deleteVideo(video.id)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"
							/></svg
						>
					</button>
				</div>
			</div>
		{/each}
	</div>
	<form bind:this={fileForm} method="POST" enctype="multipart/form-data" action="/upload">
		<input
			bind:this={fileInput}
			type="file"
			name="fileUpload"
			id="fileUpload"
			style="opacity:0; height:0px;width:0px;"
			accept="video/mp4,video/x-m4v,video/*"
			on:change={upload}
		/>
	</form>
</div>

<style>
	.container {
		width: 100%;

		background-color: #f7f7f9;

		border: 1px solid #dfdfdf;
		border-radius: 8px;

		overflow: hidden;

		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 16px;
	}

	.upload {
		border: 3px dashed #dfdfdf;

		border-radius: 8px;
		min-height: 48px;

		display: flex;
		flex-direction: row;

		align-items: center;
		justify-content: center;

		cursor: pointer;
	}

	.upload > p {
		font-size: 14px;
		font-weight: 700;

		color: black;
	}

	.list {
		display: flex;
		flex-direction: column;

		gap: 16px;
	}

	.video {
		background-color: white;

		border-radius: 8px;
		border: 1px solid #dfdfdf;
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
