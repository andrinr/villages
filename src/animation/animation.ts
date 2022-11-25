import { WebGLRenderer, PerspectiveCamera } from "three";

export abstract class ThreeAnimation {
    private lastTime : number = 0;

    public renderer : WebGLRenderer;
    public camera : PerspectiveCamera;
    public rendererElement : HTMLElement;

    constructor(rendererElement : HTMLElement) {
        this.rendererElement = rendererElement;
        this.loop = this.loop.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener( 'resize', this.onWindowResize, false );
        window.addEventListener( 'pointermove', this.onMouse );
        this.start();
    }

    public abstract init() : void;

    public abstract update(delta : number) : void;

    public abstract onMouse(event : MouseEvent) : void;

    private start () {
        this.renderer = new WebGLRenderer(
            {
                antialias: true,
                powerPreference: "high-performance"
            }
        );
        this.rendererElement.appendChild( this.renderer.domElement );
        this.camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
        this.init();
        this.loop();
    }

    private loop () {
		requestAnimationFrame( this.loop );
        const dt : number = Date.now() - this.lastTime;
		this.lastTime = Date.now();
        this.update(dt);
    }

    private onWindowResize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}