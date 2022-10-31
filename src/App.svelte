<script lang="ts">
	import type { Camera, Scene, Renderer, BoxGeometry, Material, Mesh } from 'three';
	import { onMount } from 'svelte';

	import * as THREE from 'three';

	let camera: Camera;
	let scene: Scene;
	let renderer: Renderer;
	let box: BoxGeometry;
	let material: Material;
	let mesh: Mesh;
	let prevTime: number;

	onMount( async() => {
		const init = () =>
		{
			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
			camera.position.z = 1;

			scene = new THREE.Scene();

			box = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
			material = new THREE.MeshNormalMaterial();

			mesh = new THREE.Mesh( box, material );
			scene.add( mesh );

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setSize( window.innerWidth, window.innerHeight );
			const parentDiv = document.getElementById("three");
			parentDiv.appendChild( renderer.domElement );

			prevTime = Date.now();
		}

		const animate = () =>
		{
			requestAnimationFrame( animate );
			const dt : number = Date.now() - prevTime;
			prevTime = Date.now();
			box.rotateY(dt * 1 / 1000);
			box.rotateX(dt * 0.5 / 1000);
			box.rotateX(dt * 0.2 / 1000);

			renderer.render( scene, camera );
		}
		
		init();
		animate();
	});

</script>

<main>
	<div id="three">
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	#three {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>