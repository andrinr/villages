<script lang="ts">
	// THREE imports
	import type { Camera, Material } from 'three';
	import { 
		sRGBEncoding, 
		WebGLRenderer, 
		Renderer, 
		ACESFilmicToneMapping, 
		Scene, 
		Fog, 
		Raycaster, 
		PerspectiveCamera, 
		Vector2, 
		Vector3,
		DirectionalLight, 
		AmbientLight,
		MathUtils,
		VSMShadowMap,
		AnimationMixer} from 'three';
	import { Sky } from 'three/examples/jsm/objects/Sky.js';
	// Animaions
	import { Tween, Easing } from "@tweenjs/tween.js";
	// Svelte imports
	import { onMount } from 'svelte';
	// Local imports
	import { loadGLTF } from './ts/loader';

	let camera: Camera;
	let scene: Scene;
	let renderer: Renderer;
	let prevTime: number;
	let mixer: AnimationMixer;

	let raycaster: THREE.Raycaster;
	let pointer: THREE.Vector2;

	let tween: Tween;

	let m : {x : number, y : number } = { x: 0, y: 0 };

	function onPointerMove( event : MouseEvent ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	}
	window.addEventListener( 'pointermove', onPointerMove );

	onMount( async() => {

		const init = async () =>
		{
			renderer = new WebGLRenderer();
			// @ts-ignore
			renderer.shadowMap.enabled = true;
			// @ts-ignore
			renderer.shadowMap.type = VSMShadowMap; // default THREE.PCFShadowMap

			renderer.setSize( window.innerWidth, window.innerHeight );
			// @ts-ignore
			renderer.outputEncoding = sRGBEncoding;
			// @ts-ignore
			renderer.toneMapping = ACESFilmicToneMapping;
			// @ts-ignore
			renderer.toneMappingExposure = 0.4;

			const parentDiv : HTMLElement = document.getElementById("three");
			parentDiv.appendChild( renderer.domElement );

			scene = new Scene();
			scene.fog = new Fog(0xbbb4c2, 1, 18);
	
			camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
			camera.position.z = 3;
			camera.position.y = 3;

			tween = new Tween(camera.position)
				.to({ x: 0, y: 0, z: 0 }, 10000)
				.repeat(Infinity)
				.easing(Easing.Exponential.InOut);


			tween.start();

			raycaster = new Raycaster();
			pointer = new Vector2();

			prevTime = Date.now();

			const sunPosition : Vector3 = new Vector3(0, 0, 0);
			const phi : number = MathUtils.degToRad( 90 - 20 );
			const theta : number = MathUtils.degToRad( 30 );
			sunPosition.setFromSphericalCoords( 1, phi, theta );

			addLights(scene, sunPosition);

			addSky(scene, sunPosition);
			
			addModels(scene);

			animate();

		}

		const animate = () =>
		{
			requestAnimationFrame( animate );
			const dt : number = Date.now() - prevTime;
			prevTime = Date.now();
			//controls.update();

			const pos = new Vector3(10.0,0,0);
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

			for ( let i = 0; i < intersects.length; i ++ ) {
				//@ts-ignore
				//intersects[ i ].object.material.color.set( 0xff0000 );
			}

			tween.update();

			renderer.render( scene, camera );
		}

		init();
	});

	const addSky = (scene : Scene, sunPosition : Vector3) => {
		const sky : Sky = new Sky();
		sky.scale.setScalar( 450000 );
		scene.add( sky );

		const uniforms = sky.material.uniforms;
		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 1.8;
		uniforms[ 'mieCoefficient' ].value = 0.0;
		uniforms[ 'mieDirectionalG' ].value = 0.7;

		uniforms[ 'sunPosition' ].value.copy( sunPosition );
	}

	const addLights = (scene : Scene, sunPosition : Vector3) => {
		const light = new DirectionalLight( 0xf59e33, 1 );
		const scale : number = 4.0;
		light.position.set(sunPosition.x * scale, sunPosition.y * scale, sunPosition.z * scale);

		light.castShadow = true;
		scene.add( light );
		//const helper = new THREE.CameraHelper( light.shadow.camera );
		//scene.add( helper );

		//Set up shadow properties for the light
		light.shadow.mapSize.width = 512; 
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 20;
		light.shadow.bias = -0.0001;

		const ambientLight = new AmbientLight( 0x4c6061 );
		scene.add( ambientLight );
	}

	const addModels = async (scene : Scene) => {
		const id = scene.children.length;
		await loadGLTF('models/map_collection.glb', 'models/draco/', scene);

		scene.children[id].children.forEach((child) => {
			child.castShadow = true;
			child.receiveShadow = true;
			// @ts-ignore
			child.roughness = 0.6;
		});
		
		scene.children[id].scale.x = 0.03;
		scene.children[id].scale.y = 0.03;
		scene.children[id].scale.z = 0.03;
	}
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