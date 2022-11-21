<script lang="ts">
	import type { Camera, Scene, Renderer, Material, HemisphereLight, Raycaster } from 'three';
	import { MeshBasicMaterial } from 'three';
	import { onMount } from 'svelte';

	import * as THREE from 'three';
	import { loadGLTF } from './ts/loader';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
	import { EffectComposer, BlendFunction, SelectiveBloomEffect, EdgeDetectionMode, SMAAPreset, EffectPass, RenderPass, BloomEffect} from 'postprocessing';
	import { Sky } from 'three/examples/jsm/objects/Sky.js';
	import { Water } from 'three/examples/jsm/objects/Water.js';
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
			renderer = new THREE.WebGLRenderer();
			// @ts-ignore
			renderer.shadowMap.enabled = true;
			// @ts-ignore
			renderer.shadowMap.type = THREE.VSMShadowMap; // default THREE.PCFShadowMap

			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.outputEncoding = THREE.sRGBEncoding;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.3;

			const parentDiv = document.getElementById("three");
			parentDiv.appendChild( renderer.domElement );

			scene = new THREE.Scene();
			const color = 0xbbb4c2;  // white
			const near = 1;
			const far = 18;

			scene.fog = new THREE.Fog(color, near, far);
			//scene.background =  new THREE.Color(0x97dede);
	
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

			prevTime = Date.now();

			await loadGLTF('models/map_collection.glb', 'models/draco/', scene);
			console.log(scene.children);

            scene.children[0].children.forEach((child) => {
                child.castShadow = true;
                child.receiveShadow = true;
				child.roughness = 0.6;
            });
			
			scene.children[0].scale.x = 0.03;
			scene.children[0].scale.y = 0.03;
			scene.children[0].scale.z = 0.03;

			const light = new THREE.DirectionalLight( 0xf59e33, 1 );
			light.position.set(2, 2.6, 4 ); //default; light shining from top

			light.castShadow = true; // default false
			scene.add( light );
			//const helper = new THREE.CameraHelper( light.shadow.camera );
			//scene.add( helper );

			//Set up shadow properties for the light
			light.shadow.mapSize.width = 512; 
			light.shadow.mapSize.height = 512;
			light.shadow.camera.near = 0.5;
			light.shadow.camera.far = 20;
			light.shadow.bias = -0.0001;

			const ambientLight = new THREE.AmbientLight( 0x4c6061 );
			scene.add( ambientLight );
						
			const sky = new Sky();
			sky.scale.setScalar( 450000 );
			scene.add( sky );

			const uniforms = sky.material.uniforms;
			uniforms[ 'turbidity' ].value = 10;
			uniforms[ 'rayleigh' ].value = 1.8;
			uniforms[ 'mieCoefficient' ].value = 0.0;
			uniforms[ 'mieDirectionalG' ].value = 0.7;

			const phi = THREE.MathUtils.degToRad( 90 - 10 );
			const theta = THREE.MathUtils.degToRad( 30 );
			
			const sun = new THREE.Vector3();
			sun.setFromSphericalCoords( 1, phi, theta );

			uniforms[ 'sunPosition' ].value.copy( sun );

			console.log(uniforms);
			//uniforms[ 'exposure' ].value = 0.5;

			console.log(scene);

			// @ts-ignore
			composer = new EffectComposer(renderer);
			const effect = new SelectiveBloomEffect(scene, camera, {
				blendFunction: BlendFunction.ADD,
				mipmapBlur: true,
				luminanceThreshold: 0.7,
				luminanceSmoothing: 0.3,
				intensity: 3.0
			});

			composer.addPass(new RenderPass(scene, camera));
			//composer.addPass(new EffectPass(camera, effect));

			animate();

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

			//composer.render();
			renderer.render( scene, camera );
		}

		init();
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