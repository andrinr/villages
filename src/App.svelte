<script lang="ts">
	import type { Camera, Scene, Renderer, Material, HemisphereLight, Raycaster } from 'three';
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

	let raycaster: THREE.Raycaster;
	let pointer: THREE.Vector2;

	let m = { x: 0, y: 0 };

	function onPointerMove( event ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	}
	window.addEventListener( 'pointermove', onPointerMove );

	onMount( async() => {

		const init = async () =>
		{
			renderer = new THREE.WebGLRenderer( { 
				powerPreference: "high-performance",
				stencil: true,
				depth: true,
				antialias: true 
			} );
			// @ts-ignore
			renderer.shadowMap.enabled = true;
			// @ts-ignore
			renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

			renderer.setSize( window.innerWidth, window.innerHeight );
			const parentDiv = document.getElementById("three");
			parentDiv.appendChild( renderer.domElement );

			scene = new THREE.Scene();
			const color = 0xFFFFFF;  // white
			const near = 8;
			const far = 12;

			scene.fog = new THREE.Fog(color, near, far);
			scene.background =  new THREE.Color(0xffffff);

			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
			camera.position.z = 3;
			camera.position.y = 3;

			raycaster = new THREE.Raycaster();
			pointer = new THREE.Vector2();

			controls = new OrbitControls(
				camera, renderer.domElement
			);
			controls.update();
			material = new THREE.MeshPhongMaterial();

			//const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
			//scene.add( light );

			const light = new THREE.DirectionalLight( 0xffffff, 1 );
			light.position.set( 0, 5, 5 ); //default; light shining from top
			light.castShadow = true; // default false
			scene.add( light );

			//Set up shadow properties for the light
			light.shadow.mapSize.width = 1024; // default
			light.shadow.mapSize.height = 1024; // default
			light.shadow.camera.near = 0.5; // default
			light.shadow.camera.far = 10; // default

			const helper = new THREE.CameraHelper( light.shadow.camera );
			scene.add( helper );

			prevTime = Date.now();
			
			loadGLTF('models/map_9.gltf', 'models/draco/', scene);
			loadGLTF('models/map_9.gltf', 'models/draco/', scene);
			loadGLTF('models/map_9.gltf', 'models/draco/', scene);
			scene.scale.x = 0.04;
			scene.scale.y = 0.04;
			scene.scale.z = 0.04;
	

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
			//.render();

			const pos = new THREE.Vector3(10.0,0,0);
			pos.project(camera);
			const element = document.getElementById('sample-content');

			const w = document.body.clientWidth;
			const h = document.body.clientHeight;
			element.style.top = String(-pos.y *  h/2.0 + h/2.0) + 'px';
			element.style.left = String(pos.x * w/2.0 + w/2.0) + 'px';


			// update the picking ray with the camera and pointer position
			pointer.x = m.x;
			pointer.y = m.y;
			raycaster.setFromCamera( pointer, camera );

			// calculate objects intersecting the picking ray
			const intersects = raycaster.intersectObjects( scene.children );
			//console.log(intersects);

			for ( let i = 0; i < intersects.length; i ++ ) {
				//@ts-ignore
				//intersects[ i ].object.material.color.set( 0xff0000 );
			}

			renderer.render( scene, camera );
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