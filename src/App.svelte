<script lang="ts">
	// Svelte imports
	import { onMount } from 'svelte';
	import { VillageAnimation } from './animation/villageAnimation';
	import { Vector3 } from 'three';
  	import Tile from './Tile.svelte';

	// @ts-ignore
	import * as data from './content.json';
	let contentId = 0;

	let villageAnimation : VillageAnimation;

	function onKeyDown(e) {
		console.log(e);
		switch(e.keyCode) {
			case 38:
				contentId = (contentId + 1) % data.content.length;
				villageAnimation.animateCamera(
					new Vector3(data.content[contentId].camera),
					new Vector3(data.content[contentId].target),
					1000
				);
				console.log(contentId);
				break;
			case 40:
				contentId = (contentId - 1  + data.content.length) % data.content.length;
				console.log(contentId);
				villageAnimation.animateCamera(
					new Vector3(data.content[contentId].camera),
					new Vector3(data.content[contentId].target),
					1000
				);
				break;
		}
	}

	onMount( async() => {
		const parentDiv : HTMLElement = document.getElementById("three");
		villageAnimation = new VillageAnimation(parentDiv);
		//villageAnimation.camera.position.set(

		console.log(data);
	});

</script>

<main>
	<div class="visualization">
		<Tile title={data.content[contentId].title}  description={data.content[contentId].description}/>
	
		<div id="three">
		</div>
	</div>

</main>

<svelte:window on:keydown={onKeyDown} />

<style>
	#three {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
	}

	.tile {
		z-index: 1;
	}

	#sample-content {
		text-align: center;
		opacity: 0.9;
		border-radius: 5px;
		z-index: 10;
		position:absolute;
		padding: 10px;
		background-color: white;
		overscroll-behavior: none;
	}

	.visualization {
		overflow: hidden;
	}
</style>