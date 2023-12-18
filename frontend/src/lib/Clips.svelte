<script lang="ts">
	import { onMount } from "svelte";
	import { state, playlist, unsavedChanges } from "../stores/state";

	let videos = [];

	async function deleteVideo(id: string) {
		const res = await fetch(`${window.apiHost}/videos/${id}`, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		const body = await res.json();

		videos = body;
	}

	async function addVideo(uuid: string) {
		$playlist[$playlist.length] = uuid;
		$unsavedChanges = true;
	}

	async function removeVideo(uuid: string) {
		$playlist = $playlist.filter((entry) => entry != uuid);
		$unsavedChanges = true;
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
		// Video
		const resVideo = await fetch(`${window.apiHost}/videos`);
		const bodyVideo = await resVideo.json();

		videos = bodyVideo;

		// Timeline
		const resTimeline = await fetch(`${window.apiHost}/timeline`);
		const bodyTimeline = await resTimeline.json();

		$playlist = bodyTimeline;
	});
</script>

<div class="container">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="upload" on:click={openFileSelect}>
		<p>Click to upload</p>
	</div>
	<div class="list">
		{#each videos as video (video.uuid)}
			<div class="video">
				<div class="status" class:selected={$playlist.includes(video.uuid)} />
				<div class="infos">
					<p>{video.filename}</p>
					<span>{new Date(video.date)}</span>
				</div>

				<div class="position"></div>

				<div class="actions">
					<button on:click={() => addVideo(video.uuid)} disabled={$playlist.includes(video.uuid)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z"
							/></svg
						>
					</button>
					<button
						on:click={() => removeVideo(video.uuid)}
						disabled={!$playlist.includes(video.uuid)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M8 18q-.825 0-1.413-.588T6 16V8q0-.825.588-1.413T8 6h8q.825 0 1.413.588T18 8v8q0 .825-.588 1.413T16 18H8Z"
							/></svg
						>
					</button>
					<button
						on:click={() => deleteVideo(video.uuid)}
						disabled={$playlist.includes(video.uuid)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
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
	<form
		bind:this={fileForm}
		method="POST"
		enctype="multipart/form-data"
		action={`${window.apiHost}/upload`}
		style="height: 0px;"
	>
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

		color: rgb(82, 82, 82);
	}

	.infos {
		display: flex;
		flex-direction: column;

		justify-content: center;
		gap: 2px;
		padding-left: 8px;
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

		display: flex;
		flex-direction: row;

		overflow: hidden;
	}

	.actions {
		margin-left: auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		gap: 8px;
		padding-bottom: 8px;
		padding-top: 8px;
		padding-right: 8px;
	}

	p {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
	}

	span {
		font-size: 12px;
		font-weight: 300;

		color: rgb(82, 82, 82);
	}

	.selected {
		background-color: rgb(37, 96, 223);
	}

	.playing {
		background-color: rgb(11, 170, 11) !important;
	}

	.status {
		width: 4px;
	}
</style>
