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
    VSMShadowMap,
    CylinderGeometry,
    Mesh,
    Color} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// Animaions
import { Tween, Easing } from "@tweenjs/tween.js";
// Local imports
import { loadGLTF } from './loader';
import { ThreeAnimation } from "./animation";
import { generateGradientMaterial } from './gradientMaterial';
import * as dat from 'lil-gui'

interface PositionMap {
    [key: number]: {
        name: string,
        p: Vector3,
    }
}

export class VillageAnimation extends ThreeAnimation {

	scene: Scene;
	private tweenPos: Tween<Vector3>;
    private tweenLookAt: Tween<Vector3>;
    private controls : OrbitControls;
    private highlight : Mesh;
    private scale : number = 0.03;

    private cameraAnchors : PositionMap;
    private cameraPositions : PositionMap;
    private highlightPositions : PositionMap;


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
        const gui = new dat.GUI();

        gui.add(this.camera.position, 'x', -20,20,0.01);
        gui.add(this.camera.position, 'y', -20,20,0.01);
        gui.add(this.camera.position, 'z', -20,20,0.01);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.tweenPos = new Tween(this.camera.position);
        this.tweenPos.start();
        this.tweenLookAt = new Tween(this.controls.target);
        this.tweenLookAt.start();

        const sunPosition : Vector3 = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 30 );
        sunPosition.setFromSphericalCoords( 1, phi, theta );

        this.cameraAnchors = {};
        this.cameraPositions = {};
        this.highlightPositions = {};

        this.addLights(sunPosition);

        this.addSky(sunPosition);

        //this.addHightlight();
        
        this.addModels();
    }

    public animateCamera(itemID: number, duration : number) {
        const nextLookAt = new Vector3(0,0,0);
        const nextPos = new Vector3(0,0,0);

        if(itemID == 0) {
            nextLookAt.set(0,0,0);
            nextPos.set(0,2,3);

        } else {
            nextLookAt.x = this.cameraAnchors[itemID].p.x * this.scale;
            nextLookAt.y = this.cameraAnchors[itemID].p.y * this.scale;
            nextLookAt.z = this.cameraAnchors[itemID].p.z * this.scale;

            nextPos.x = this.cameraPositions[itemID].p.x * this.scale;
            nextPos.y = this.cameraPositions[itemID].p.y * this.scale;
            nextPos.z = this.cameraPositions[itemID].p.z * this.scale;
        }

        this.tweenPos.stop();
        this.tweenPos = new Tween(this.camera.position)
            .to(nextPos, duration)
            .easing(Easing.Cubic.InOut);
        this.tweenPos.start();

        this.tweenLookAt.stop();
        this.tweenLookAt = new Tween(this.controls.target)
            .to(nextLookAt, duration)
            .easing(Easing.Cubic.InOut);

        this.tweenLookAt.start();
    }

    public update(delta: number): void {
        this.tweenPos.update();
        this.tweenLookAt.update();
        this.controls.update();
        this.renderer.render( this.scene, this.camera );

        //console.log(this.secondsPassed);
        //this.highlight.scale.y = Math.sin(this.secondsPassed * 0.3);;
    }

    public onMouse(event: MouseEvent): void {
        //const mouseX = event.clientX / window.innerWidth * 2 - 1;
        //const mouseY = event.clientY / window.innerHeight * 2 - 1;

        return;
    }

    private addHightlight() {
        const radiusTop = 0.6;
        const radiusBottom = 0.6;
        const height = 1.0;
        const radialSegments = 96;
        const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        const posY = 0.5;
        const material = generateGradientMaterial(new Color(0xff9a47));
        //const material = new MeshBasicMaterial( { color: 0xffde26 } );
        this.highlight = new Mesh(geometry, material);
        this.highlight.position.set(0, posY, 0);
        this.highlight.rotation.x = Math.PI;

        this.scene.add(this.highlight);
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
		light.shadow.mapSize.width = 1024; 
		light.shadow.mapSize.height = 1024;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 20;
		light.shadow.bias = -0.0001;

		const ambientLight = new AmbientLight( 0x9d81a6 );
		this.scene.add( ambientLight );
	}

	private async addModels() {
		const id = this.scene.children.length;
		await loadGLTF('models/map_new_added.glb', 'models/draco/', this.scene);

		this.scene.children[id].children.forEach((child) => {
			child.castShadow = true;
			child.receiveShadow = true;
			// @ts-ignore
			child.roughness = 0.6;
		});
		
		this.scene.children[id].scale.x = this.scale;
		this.scene.children[id].scale.y = this.scale;
		this.scene.children[id].scale.z = this.scale;

        this.scene.children[id].children.forEach((child) => {

            const id = +child.name.match(/\d+/)[0]
            console.log("ID is " + id);
            const data = {
                p: new Vector3(
                    child.position.x,
                    child.position.y,
                    child.position.z
                ),
                name: child.name,
            };

            if(child.name.includes("ANCHOR")) {
                this.cameraAnchors[id] = data;
            }
            else if(child.name.includes("CAMPOS")) {
                this.cameraPositions[id] = data;
            }
            else if(child.name.includes("GLOW")) {
                this.highlightPositions[id] = data;
            }
        });
	}
}