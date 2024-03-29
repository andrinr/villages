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
    PCFShadowMap,
    Mesh,
    Color,
    MOUSE,
    HemisphereLight,
    Raycaster,
    Vector2,
    Object3D,
    TOUCH,
    ShaderMaterial,
    DirectionalLightHelper} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
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
    private scale : number;
    private raycaster : Raycaster;

    private cameraAnchors : Map<Vector3>;
    private cameraPositions : Map<Vector3>;
    private highlights : Map<Mesh>;
    private sunPosition : Vector3;
    private displayGui : boolean = false;

    private previousHighlightID : number = 0;
    private mouseHasMoved : boolean = false;
    private contentIDCallback : (id : number) => void;
    private loadedCallback : () => void;
    private highilightMat : ShaderMaterial;
    private cameraReset : boolean = false;
    private gui : dat.GUI;

    public constructor(
        canvas: HTMLCanvasElement, 
        wrapper: HTMLElement, 
        contentIDCallback : (id : number) => void,
        loadedCallback : () => void
        ) {
        super(canvas, wrapper);
        this.contentIDCallback = contentIDCallback;
        this.loadedCallback = loadedCallback;
    }

    public init(): void {
        this.scale = 0.002;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // 

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.40;
        
        this.scene.fog = new Fog(0xb4c1c2, 20 * this.scale / 0.03, 45 * this.scale / 0.03);
        this.controls.touches.ONE = TOUCH.PAN;

        //this.controls.enableDamping = false;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = false;
        this.controls.screenSpacePanning = false;
        this.controls.panSpeed = 0.5;
        this.controls.maxDistance = 30 * this.scale / 0.03;
        this.controls.minDistance = 3 * this.scale / 0.03;
    
        this.controls.mouseButtons = {
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        }
        if (this.displayGui) this.gui = new dat.GUI();

        this.tweenPos = new Tween(this.camera.position);
        this.tweenPos.start();
        this.tweenLookAt = new Tween(this.controls.target);
        this.tweenLookAt.start();

        this.cameraAnchors = {};
        this.cameraPositions = {};
        this.cameraAnchors[0] = {name: "Default", data: new Vector3(0,0,0)};
        this.cameraPositions[0] = {name: "Default", data: new Vector3(69,30,86)};
        this.camera.position.x = 3.0;
        this.camera.position.y = 3.0;
        this.camera.position.z = 3.0;
        if (this.displayGui){
            this.gui.add(this.camera.position, 'x', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'y', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'z', -10, 10).step(0.1);
        }
        this.raycaster = new Raycaster();
        this.highlights = {};

        this.previousHighlightID = 0;

        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 30 );
        const theta : number = MathUtils.degToRad( 80 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.highilightMat = generateGradientMaterial(new Color(0x045e85), 0.5);

        this.addLights();
        this.addSky();
        this.addModels(); 
    }

    public animateCamera(itemID: number, duration : number) {
        const anchor = this.cameraAnchors[itemID].data.clone().multiplyScalar(this.scale);
        if (itemID != 0) {
            if (!this.portraitMode ) {
                anchor.add(new Vector3(-0.5, 0, 0).multiplyScalar(this.scale / 0.03));
            }
            else {
                anchor.add(new Vector3(0, -0.2, 0).multiplyScalar(this.scale / 0.03));
            }
        }
  
        this.hightlightItem(itemID);

        //const pos = this.cameraPositions[itemID].data.clone().multiplyScalar(this.scale);
        const offset = new Vector3(0.6, 0.4, 1.0).multiplyScalar(this.scale / 0.03);
        //const offset = new Vector3(0, 0.4,0).multiplyScalar(this.scale / 0.03);
        offset.multiplyScalar(itemID == 0 ? 10.0 : 4.5);
        offset.multiplyScalar(this.portraitMode ? 2.0 : 1.0);
        const pos = anchor.clone().add(offset);

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
    }

    public hightlightItem(itemID: number) {
        if (this.previousHighlightID == itemID) return;

        if (itemID == -1) {
            if (this.highlights[this.previousHighlightID]) 
                this.highlights[this.previousHighlightID].data.visible = false;
            this.previousHighlightID = -1;
            return;
        }

        if (this.highlights[itemID]) 
            this.highlights[itemID].data.visible = true;
    
        if (this.highlights[this.previousHighlightID]) 
            this.highlights[this.previousHighlightID].data.visible = false;

        this.previousHighlightID = itemID;
    }
    
    public update(delta: number): void {
        const dist = this.controls.target.distanceTo(new Vector3(0,0,0));
        const limit = this.portraitMode ? 3.9 * this.scale / 0.03 : 3.6 * this.scale / 0.03;
        if (dist > limit && !this.cameraReset) {
            this.animateCamera(0, 1000);
            this.cameraReset = true;
        }
        else if (dist <= limit) 
            this.cameraReset = false;
        
        this.controls.update();
        this.tweenPos.update();
        this.tweenLookAt.update();
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
                this.canvas.style.cursor = "pointer";
            }
            else{
                this.canvas.style.cursor = "default";
                this.hightlightItem(-1);
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
                this.animateCamera(id, 2000);
                this.contentIDCallback(id);
                return;
            } else {
                this.animateCamera(0, 2000);
                this.contentIDCallback(0);
                return;
            }
        });
    }

    public onMouseDown(event: MouseEvent): void {
        this.mouseHasMoved = false;
    }

	private addSky () {
		const sky : Sky = new Sky();
		sky.scale.setScalar( 20 * this.scale / 0.03 );
		this.scene.add( sky );

		const uniforms = sky.material.uniforms;
		uniforms[ 'turbidity' ].value = 0.6;
		uniforms[ 'rayleigh' ].value = 0.8;
		uniforms[ 'mieCoefficient' ].value = 0.01;
		uniforms[ 'mieDirectionalG' ].value = 0.7;
		uniforms[ 'sunPosition' ].value.copy( this.sunPosition );
	}

	private addLights() {
		const light = new DirectionalLight( "#ffd1d1", 3.5 );
	    light.position.multiplyScalar(0).add(this.sunPosition.clone().multiplyScalar(200));

		light.castShadow = true;

		light.shadow.mapSize.width = 2048; 
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 3;
		light.shadow.bias = -0.00001;
        light.shadow.radius = 0.7;

        //const helper = new DirectionalLightHelper( light, 5 );
        //this.scene.add( helper );

		const ambientLight = new AmbientLight( "0xa68195");
        ambientLight.intensity = 0.3;
        
        const hemiLight = new HemisphereLight( "#4dc1ff", "#ffdca8", 0.4);

        if (this.gui) {
            
            this.gui.add(light, 'intensity', 0,10,0.01).name("Sun Light");
            this.gui.add(ambientLight, 'intensity', 0,5,0.01).name("Ambient Light");
            this.gui.add(hemiLight, 'intensity', 0,5,0.01).name("Hemi Light");

            this.gui.addColor(light, 'color').name("Sun Color");
            this.gui.addColor(ambientLight, 'color').name("Ambient Color");
            this.gui.addColor(hemiLight, 'color').name("Hemi Color Sky");
            this.gui.addColor(hemiLight, 'groundColor').name("Hemi Color Ground");
        }
        this.scene.add(hemiLight);
        this.scene.add(light);
		this.scene.add(ambientLight);
	}

	private async addModels() {
		const id = this.scene.children.length;
		await loadGLTF('models/models3.gltf', this.scene);

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
                childMesh.material = this.highilightMat;
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

        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}