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
    Mesh,
    Color,
    Camera,
    MOUSE,
    TextureLoader,
    HemisphereLight,
    Raycaster,
    Vector2} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// Animaions
import { Tween, Easing } from "@tweenjs/tween.js";
// Local imports
import { loadGLTF } from './loader';
import { ThreeAnimation } from "./animation";
import { generateGradientMaterial } from './gradientMaterial';
import * as dat from 'lil-gui'

interface Map<T> {
    [key: number]: {
        name: string,
        data: T
    }
}

export class VillageAnimation extends ThreeAnimation {
	scene: Scene;
	private tweenPos: Tween<Vector3>;
    private tweenLookAt: Tween<Vector3>;
    private controls : OrbitControls;
    private scale : number = 0.03;

    private cameraAnchors : Map<Vector3>;
    private cameraPositions : Map<Vector3>;
    private highlights : Map<Mesh>;

    private previousCameraID : number = 0;

    private textureLoader : TextureLoader;

    private mouseHasMoved : boolean = false;
    
    private gui : dat.GUI;
    private contentIDCallback : (id : number) => void;

    public constructor(rendererElement : HTMLElement, contentIDCallback : (id : number) => void) {
        super(rendererElement);
        this.contentIDCallback = contentIDCallback;
    }

    private setButtonsVisibility(visible : boolean) : void {
        const buttons : HTMLElement = document.getElementById("buttons");
        buttons.style.visibility = visible ? "visible" : "hidden";
    }


    public init(): void {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // THREE.PCFShadowMap

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.4;

        const parentDiv : HTMLElement = document.getElementById("three");
        parentDiv.appendChild( this.renderer.domElement );

        this.scene = new Scene();
        this.scene.fog = new Fog(0xbbb4c2, 1, 18);

        this.gui = new dat.GUI();

        // this.gui.add(this.camera.position, 'x', -20,20,0.01);
        // this.gui.add(this.camera.position, 'y', -20,20,0.01);
        // this.gui.add(this.camera.position, 'z', -20,20,0.01);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxDistance = 5;
        this.controls.minDistance = 0.3;
        this.controls.dampingFactor = 0.1
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = false;
        this.controls.enableRotate = false;
        this.controls.autoRotate = false;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false;
    
        this.controls.mouseButtons = {
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        }
        //this.controls.autoRotateSpeed = 0.1;

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
        this.cameraAnchors[0] = {name: "Default", data: new Vector3(0,0,0)};
        this.cameraPositions[0] = {name: "Default", data: new Vector3(69,30,86)};
        
        this.highlights = {};

        this.previousCameraID = 0;

        this.textureLoader = new TextureLoader();

        this.addLights(sunPosition);

        this.addSky(sunPosition);

        //this.addHightlight();

        this.addModels();
        
    }

    public animateCamera(itemID: number, duration : number) {
        const anchor = this.cameraAnchors[itemID].data.clone().multiplyScalar(this.scale);
        const pos = this.cameraPositions[itemID].data.clone().multiplyScalar(this.scale);

        if (this.highlights[itemID]) 
            this.highlights[itemID].data.visible = true;
        
        if (this.highlights[this.previousCameraID]) 
            this.highlights[this.previousCameraID].data.visible = false;
        
        this.previousCameraID = itemID;

        this.tweenPos.stop();
        this.tweenPos = new Tween(this.camera.position)
            .to(pos, duration)
            .easing(Easing.Cubic.InOut);
        this.tweenPos.start();

        this.tweenLookAt.stop();
        this.tweenLookAt = new Tween(this.controls.target)
            .to(anchor, duration)
            .easing(Easing.Cubic.InOut);

        this.tweenLookAt.start();

        if(itemID == 0){
            this.setButtonsVisibility(false);
        }else{
            this.setButtonsVisibility(true);
        }
    }

    public update(delta: number): void {
        this.tweenPos.update();
        this.camera.updateProjectionMatrix();
        this.tweenLookAt.update();
        //this.controls.target.clamp( new Vector3(-1, 0, -1), new Vector3(1, 1, 1) );
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
    }

    public onMouseMove(event: MouseEvent): void {
        this.mouseHasMoved = true;
        return;
    }

    public onMouseUp(event: MouseEvent): void {
        console.log("mouse up");
        if(this.mouseHasMoved || !this.mouseOnScreen)
            return;

        console.log("mouse up registered")
    
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        raycaster.setFromCamera( mouse, this.camera );
        const intersects = [];
        raycaster.intersectObjects( this.scene.children, true, intersects );
        if ( intersects.length > 0 ) {
            const object = intersects[0].object;
    
            if(object.name.includes("ANCHOR") || object.name.includes("GLOW")){
                const id = +object.name.match(/\d+/)[0];
                if(id == this.previousCameraID)
                    return;
                this.animateCamera(id, 2000);
                this.contentIDCallback(id);
                return;
            } else {
                this.animateCamera(0, 2000);
                this.contentIDCallback(0);
                return;
            }
           
            // Do something with the object, such as highlighting it or displaying information about it
          }
        return;
    }

    public onMouseDown(event: MouseEvent): void {
        this.mouseHasMoved = false;
        return;
    }

	private addSky (sunPosition : Vector3) {
		const sky : Sky = new Sky();
		sky.scale.setScalar( 450000 );
		this.scene.add( sky );

		const uniforms = sky.material.uniforms;
		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 1;
		uniforms[ 'mieCoefficient' ].value = 0.0;
		uniforms[ 'mieDirectionalG' ].value = 0.7;

        // const skyFolder = this.gui.addFolder( 'Sky' );
        // skyFolder.add( sky.material, 'turbidity', 2, 20 ).name( 'Turbidity' );

		uniforms[ 'sunPosition' ].value.copy( sunPosition );
	}

	private addLights( sunPosition : Vector3) {
		const light = new DirectionalLight( "#ff947b", 2.87 );
		const scale : number = 4.0;
		light.position.set(sunPosition.x * scale, sunPosition.y * scale, sunPosition.z * scale);

		light.castShadow = true;

		light.shadow.mapSize.width = 1024; 
		light.shadow.mapSize.height = 1024;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 20;
		light.shadow.bias = -0.0001;

		const ambientLight = new AmbientLight( "0x9d81a6");
        ambientLight.intensity = 0.4;
        
        const hemiLight = new HemisphereLight( "#4dc1ff", "#d191ff", 0.5);

        //this.gui.add(light, 'color');
        this.gui.add(light, 'intensity', 0,10,0.01).name("Sun Light");
        this.gui.add(ambientLight, 'intensity', 0,5,0.01).name("Ambient Light");
        this.gui.add(hemiLight, 'intensity', 0,5,0.01).name("Hemi Light");
        
        this.scene.add(hemiLight);
        this.scene.add( light );
		this.scene.add( ambientLight );
	}

	private async addModels() {
		const id = this.scene.children.length;
		await loadGLTF('models/map_new_added.gltf', 'models/draco/', this.scene);

		this.scene.children[id].children.forEach((child) => {
			child.castShadow = true;
			child.receiveShadow = true;
		});

		this.scene.children[id].scale.multiplyScalar(this.scale);

        this.scene.children[id].children.forEach((child) => {
            const childMesh = child as Mesh;

            if(childMesh.name.includes("ANCHOR")) {
                const id = +childMesh.name.match(/\d+/)[0]
                const data = {
                    data: childMesh.position.clone(),
                    name: childMesh.name,
                };
                this.cameraAnchors[id] = data;
            }
            else if(childMesh.name.includes("CAMPOS")) {
                const id = +childMesh.name.match(/\d+/)[0];
                const data = {
                    data: childMesh.position.clone(),
                    name: childMesh.name,
                };
                this.cameraPositions[id] = data;
            }
            else if(childMesh.name.includes("GLOW")) {
                childMesh.material = generateGradientMaterial(new Color(0xff9a47), this.scale);
                childMesh.castShadow = false;
                childMesh.receiveShadow = false;
                childMesh.visible = false;

                const id = +childMesh.name.match(/\d+/)[0]
                const data = {
                    data: childMesh,
                    name: childMesh.name,
                };
                this.highlights[id] = data;
            }   
        });

        this.animateCamera(0, 0);
	}
}