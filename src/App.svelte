<script lang="ts">
	import { Camera, Scene, Renderer, Material, HemisphereLight, Raycaster } from 'three';
	import { onMount } from 'svelte';

	import * as THREE from 'three';
	import { loadGLTF } from './ts/loader';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
	import { EffectComposer, RenderPass, EffectPass,  DepthOfFieldEffect, SSAOEffect, SelectiveBloomEffect, GlitchEffect} from 'postprocessing';
	let camera: Camera;
	let scene: Scene;
	let renderer: Renderer;
	let material: Material;
	let prevTime: number;
	let ambientLight: THREE.AmbientLight;
	let controls: OrbitControls;
	let composer: EffectComposer;


	onMount( async() => {

		const init = async () =>
		{
			renderer = new THREE.WebGLRenderer( { 
				powerPreference: "high-performance",
				stencil: true,
				depth: true,
				antialias: true 
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
			material = new THREE.MeshPhongMaterial();

			const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
			scene.add( light );

			prevTime = Date.now();
			
			loadGLTF('models/map_6.glb', 'models/draco/').then((gltf) => {
				console.log(gltf);
				scene.add(gltf.scene);
				/*gltf.scene.children.forEach(element => {
					//@ts-ignore
					//element.material = material;
					scene.add(element);
				});*/
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

			const pos = new THREE.Vector3(10.0,0,0);
			pos.project(camera);
			const element = document.getElementById('sample-content');

			const w = document.body.clientWidth;
			const h = document.body.clientHeight;
			element.style.top = String(-pos.y *  h/2.0 + h/2.0) + 'px';
			element.style.left = String(pos.x * w/2.0 + w/2.0) + 'px';

			//renderer.render( scene, camera );
		}

		init();
		animate();
	});

</script>

<main>

	<div class="visualization">
		<div id='sample-content' >
			Object A
		</div>
	
		<div id="three">
		</div>
	</div>

</main>

<style>
	#three {
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
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