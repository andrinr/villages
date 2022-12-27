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
    Vector2,
    Object3D} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// Animaions
import { Tween, Easing } from "@tweenjs/tween.js";
// Local imports
import { loadGLTF } from './loader';
import { ThreeAnimation } from "./animation";
import { generateGradientMaterial } from './gradientMaterial';
import * as dat from 'lil-gui'
import Stats from 'stats.js'

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
    private raycaster : Raycaster;

    private cameraAnchors : Map<Vector3>;
    private cameraPositions : Map<Vector3>;
    private highlights : Map<Mesh>;

    private previousHighlightID : number = 0;

    private mouseHasMoved : boolean = false;
    
    private gui : dat.GUI;
    private stats : Stats;
    private contentIDCallback : (id : number) => void;

    public constructor(rendererElement : HTMLElement, contentIDCallback : (id : number) => void) {
        super(rendererElement);
        this.contentIDCallback = contentIDCallback;
    }

    public init(): void {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // THREE.PCFShadowMap

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.45;

        const parentDiv : HTMLElement = document.getElementById("three");
        parentDiv.appendChild( this.renderer.domElement );

        this.scene = new Scene();
        this.scene.fog = new Fog(0xbbb4c2, 1, 18);

        this.gui = new dat.GUI();
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );

        this.camera.fov = 40;

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxDistance = 5;
        this.controls.minDistance = 0.3;
        this.controls.dampingFactor = 0.1;

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
        
        this.raycaster = new Raycaster();
        this.highlights = {};

        this.previousHighlightID = 0;

        this.addLights(sunPosition);

        this.addSky(sunPosition);

        this.addModels();
    }

    public animateCamera(itemID: number, duration : number) {
        const anchor = this.cameraAnchors[itemID].data.clone().multiplyScalar(this.scale);
        const pos = this.cameraPositions[itemID].data.clone().multiplyScalar(this.scale);

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
        
        //this seems unnecessary but is to make sure we always turn off the buttons when itemID = 0
        this.contentIDCallback(itemID);
    }

    public hightlightItem(itemID: number) {
        if (this.previousHighlightID == itemID) return;

        if (this.highlights[itemID]) 
            this.highlights[itemID].data.visible = true;
    
        if (this.highlights[this.previousHighlightID]) 
            this.highlights[this.previousHighlightID].data.visible = false;

        this.previousHighlightID = itemID;
    }
    
    public update(delta: number): void {
        this.stats.begin();
        this.tweenPos.update();
        this.tweenLookAt.update();
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
	    this.stats.end();
    }

    private checkIntersections(mouse : Vector2, action : (object : Object3D) => void) {

        this.raycaster.setFromCamera( mouse, this.camera );
        const intersects = [];
        this.raycaster.intersectObjects( this.scene.children, true, intersects );
        if ( intersects.length > 0 ) {
            const object = intersects[0].object;
            action(object);
        }
    }

    public onMouseMove(event: MouseEvent): void {
        this.mouseHasMoved = true;
        const mouse = new Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        this.checkIntersections(mouse, (object) => {
            if(object.name.includes("ANCHOR") || object.name.includes("GLOW")){
                const id = +object.name.match(/\d+/)[0];
                this.hightlightItem(id);
            }
        });
    }

    public onMouseUp(event: MouseEvent): void {
        if(this.mouseHasMoved || !this.mouseOnScreen)
            return;
    
        const mouse = new Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        this.checkIntersections(mouse, (object) => {
            if(object.name.includes("ANCHOR") || object.name.includes("GLOW")){
                const id = +object.name.match(/\d+/)[0];
                this.hightlightItem(id);
                this.animateCamera(id, 2000);
                this.contentIDCallback(id);
                return;
            } else {
                this.hightlightItem(0);
                this.animateCamera(0, 2000);
                this.contentIDCallback(0);
                return;
            }
        });
    }

    public onMouseDown(event: MouseEvent): void {
        this.mouseHasMoved = false;
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

		light.shadow.mapSize.width = 512; 
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 20;
		light.shadow.bias = -0.001;

		const ambientLight = new AmbientLight( "0x9d81a6");
        ambientLight.intensity = 0.21;
        
        const hemiLight = new HemisphereLight( "#4dc1ff", "#d191ff", 0.4);

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