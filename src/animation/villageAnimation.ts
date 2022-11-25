// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    Scene, 
    Fog, 
    Vector3,
    DirectionalLight, 
    AmbientLight,
    MathUtils,
    VSMShadowMap} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// Animaions
import { Tween, Easing } from "@tweenjs/tween.js";
// Local imports
import { loadGLTF } from './loader';
import { ThreeAnimation } from "./animation";

export class VillageAnimation extends ThreeAnimation {

	scene: Scene;
	private prevTime: number;
	private tweenPos: Tween;
    private tweenLookAt: Tween;
    private prevLookAt : Vector3;
    private controls : OrbitControls;

    public init(): void {
        // @ts-ignore
        this.renderer.shadowMap.enabled = true;
        // @ts-ignore
        this.renderer.shadowMap.type = VSMShadowMap; // THREE.PCFShadowMap

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        // @ts-ignore
        this.renderer.outputEncoding = sRGBEncoding;
        // @ts-ignore
        this.renderer.toneMapping = ACESFilmicToneMapping;
        // @ts-ignore
        this.renderer.toneMappingExposure = 0.4;

        const parentDiv : HTMLElement = document.getElementById("three");
        parentDiv.appendChild( this.renderer.domElement );

        this.scene = new Scene();
        this.scene.fog = new Fog(0xbbb4c2, 1, 18);

        this.camera.position.z = 3;
        this.camera.position.y = 3;

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.tweenPos = new Tween(this.camera.position);
        this.tweenPos.start();
        this.tweenLookAt = new Tween(this.camera.lookAt);
        this.tweenLookAt.start();

        this.prevTime = Date.now();

        const sunPosition : Vector3 = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 30 );
        sunPosition.setFromSphericalCoords( 1, phi, theta );

        this.addLights(sunPosition);

        this.addSky(sunPosition);
        
        this.addModels();
    }

    public animateCamera(nexPosition : Vector3, nextLookAt : Vector3, duration : number) {
        this.tweenPos.stop();
        this.tweenPos = new Tween(this.camera.position)
            .to(nexPosition, duration)
            .easing(Easing.Cubic.InOut);

        this.tweenPos.start();

        this.tweenLookAt.stop();
        this.tweenLookAt = new Tween(this.controls.target)
            .to(nextLookAt, duration)
            .easing(Easing.Cubic.InOut);

        this.tweenLookAt.start();

        console.log("Camera animation started");
    }

    public update(delta: number): void {
        this.tweenPos.update();
        this.tweenLookAt.update();
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
    }

    public onMouse(event: MouseEvent): void {
        return;
    }

	private addSky (sunPosition : Vector3) {
		const sky : Sky = new Sky();
		sky.scale.setScalar( 450000 );
		this.scene.add( sky );

		const uniforms = sky.material.uniforms;
		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 1.8;
		uniforms[ 'mieCoefficient' ].value = 0.0;
		uniforms[ 'mieDirectionalG' ].value = 0.7;

		uniforms[ 'sunPosition' ].value.copy( sunPosition );
	}

	private addLights( sunPosition : Vector3) {
		const light = new DirectionalLight( 0xf59e33, 1 );
		const scale : number = 4.0;
		light.position.set(sunPosition.x * scale, sunPosition.y * scale, sunPosition.z * scale);

		light.castShadow = true;
		this.scene.add( light );
		//const helper = new THREE.CameraHelper( light.shadow.camera );
		//scene.add( helper );

		//Set up shadow properties for the light
		light.shadow.mapSize.width = 512; 
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 20;
		light.shadow.bias = -0.0001;

		const ambientLight = new AmbientLight( 0x9d81a6 );
		this.scene.add( ambientLight );
	}

	private async addModels() {
		const id = this.scene.children.length;
		await loadGLTF('models/map_collection.glb', 'models/draco/', this.scene);

		this.scene.children[id].children.forEach((child) => {
			child.castShadow = true;
			child.receiveShadow = true;
			// @ts-ignore
			child.roughness = 0.6;
		});
		
		this.scene.children[id].scale.x = 0.03;
		this.scene.children[id].scale.y = 0.03;
		this.scene.children[id].scale.z = 0.03;
	}
}