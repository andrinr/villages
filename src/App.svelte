<script lang="ts">
	import { Camera, Scene, Renderer, BoxGeometry, Material, Mesh, Object3D, PointLight } from 'three';
	import { onMount } from 'svelte';

	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
	import { EffectComposer, RenderPass, EffectPass,  DepthOfFieldEffect, SSAOEffect, SelectiveBloomEffect, GlitchEffect} from 'postprocessing';

	let camera: Camera;
	let scene: Scene;
	let renderer: Renderer;
	let box: BoxGeometry;
	let material: Material;
	let mesh: Mesh;
	let prevTime: number;
	let ambientLight: THREE.AmbientLight;
	let controls: OrbitControls;
	let composer: EffectComposer;

	const loadGLTF = () => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath("/models/draco/");
		const gltfLoader = new GLTFLoader();
		gltfLoader.setDRACOLoader(dracoLoader);
			
		return gltfLoader.loadAsync(
			"models/map.glb");
	}

	onMount( async() => {

		const init = async () =>
		{
			renderer = new THREE.WebGLRenderer( { 
				powerPreference: "high-performance",
				stencil: true,
				depth: true,
				antialias: false 
			} );
			renderer.setSize( window.innerWidth, window.innerHeight );
			const parentDiv = document.getElementById("three");
			parentDiv.appendChild( renderer.domElement );

			scene = new THREE.Scene();
			//scene.background =  new THREE.Color(0x404040);

			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
			camera.position.z = 10;
			//camera.position.y = 100;

			controls = new OrbitControls(
				camera, renderer.domElement
			);
			controls.update();

			box = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
			material = new THREE.MeshPhongMaterial();

			mesh = new THREE.Mesh( box, material );
			//scene.add( mesh );

			ambientLight = new THREE.AmbientLight(0x404040);
			scene.add(ambientLight);
			const pointLightA = new THREE.PointLight();
			scene.add(pointLightA);

			const pointLightB = new THREE.PointLight();
			pointLightB.translateX(100);
			scene.add(pointLightB);

			const pointLightC = new THREE.PointLight();
			pointLightC.translateZ(100);
			scene.add(pointLightC);

			prevTime = Date.now();
			
			const dracoLoader = new DRACOLoader();
			dracoLoader.setDecoderPath("/draco/");
			const gltfLoader = new GLTFLoader();
			gltfLoader.setDRACOLoader(dracoLoader);
			
			loadGLTF().then((gltf) => {
				console.log(gltf);
				gltf.scene.children.forEach(element => {
					//@ts-ignore
					element.material = material;
					scene.add(element);
				});
			});

			// @ts-ignore
			composer = new EffectComposer(renderer);
			composer.addPass(new RenderPass(scene, camera));
			const dofEffect = new DepthOfFieldEffect(camera);
			//dofEffect.
			const effectPass = new EffectPass(camera, dofEffect);
			//composer.addPass(effectPass);

			//const ssaoEffect = new SSAOEffect(camera);
			//const effectPass = new EffectPass(camera, dofEffect);
			//composer.addPass(effectPass);

		}

		const animate = () =>
		{
			requestAnimationFrame( animate );
			const dt : number = Date.now() - prevTime;
			prevTime = Date.now();
			//box.rotateY(dt * 1 / 1000);
			//box.rotateX(dt * 0.5 / 1000);
			//box.rotateX(dt * 0.2 / 1000);
			controls.update();
			composer.render();
			//renderer.render( scene, camera );
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