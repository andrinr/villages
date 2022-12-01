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

interface CameraSettingsMap {
    [key: number]: {
        name: string,
        position: Vector3,
    }
}

export class VillageAnimation extends ThreeAnimation {

	scene: Scene;
	private tweenPos: Tween<Vector3>;
    private tweenLookAt: Tween<Vector3>;
    private controls : OrbitControls;
    private highlight : Mesh;
    private scale : number = 0.03;

    private cameraSettings : CameraSettingsMap;

    //DEBUG
    private 

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

        this.cameraSettings = {};

        this.addLights(sunPosition);

        this.addSky(sunPosition);

        //this.addHightlight();
        
        this.addModels();
    }

    public animateCamera(itemID: number, duration : number) {
        const nextLookAt = new Vector3(0,0,0);
        const nextPos = new Vector3(0,0,0);
        const centerPos = new Vector3(0,2,3);
        const proximity = 0.5; //number 0-1 how close is camera to object

        if(itemID == 0) {
            nextLookAt.set(0,0,0);
            nextPos.set(0,2,3);
            console.log("Setting default pos");
        } else {
            let indexString = itemID.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            });
            let cameraSetting = this.cameraSettings[itemID];
            console.log("Setting pos for " + indexString);
            console.log(cameraSetting);


            nextLookAt.x = cameraSetting.position.x * this.scale;
            nextLookAt.y = cameraSetting.position.y * this.scale;
            nextLookAt.z = cameraSetting.position.z * this.scale;

            //get Camera position from CAMPOS objects
            this.utilityObjArray.forEach((pos) => {
                if(pos.name.includes(indexString) && pos.name.includes("CAMPOS")){
                    console.log("Camera position" + pos.name + ":"+ pos.posX + ":" + pos.posY + ":" + pos.posZ); 
    
                    nextPos.x = pos.posX * 0.03;
                    nextPos.y = pos.posY * 0.03;
                    nextPos.z = pos.posZ * 0.03;
                }
            });
            //Calculating final position
            nextPos.x = proximity * (nextLookAt.x - centerPos.x) + centerPos.x;
            nextPos.y = proximity * (nextLookAt.y - centerPos.y) + centerPos.y;
            nextPos.z = proximity * (nextLookAt.z - centerPos.z) + centerPos.z;

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
            if(child.name.includes("ANCHOR") || child.name.includes("CAMPOS") || child.name.includes("GLOW")){
                console.log(child);
                const newpos = {   
                    name: child.userData.name,
                    posX: child.position.x,
                    posY: child.position.y,
                    posZ: child.position.z
                };
                this.utilityObjArray.push(newpos);
            if(child.name.includes("ANCHOR")) {
                const id = +child.name.match(/\d+/)[0]
                console.log("ID is " + id);
                this.cameraSettings[id] = {
                    position: new Vector3(
                        child.position.x,
                        child.position.y,
                        child.position.z
                    ),
                    name: child.name,
                };
            }
        });

        console.log(this.cameraSettings);
	}
}