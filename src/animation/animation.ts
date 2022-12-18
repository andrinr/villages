import { WebGLRenderer, PerspectiveCamera } from "three";

export abstract class ThreeAnimation {
    private lastTime : number = 0;
    private startTime : number = 0;
    public secondsPassed : number = 0;

    public renderer : WebGLRenderer;
    public camera : PerspectiveCamera;
    public rendererElement : HTMLElement;

    protected mouseOnScreen : boolean = false;

    constructor(rendererElement : HTMLElement) {
        this.rendererElement = rendererElement;
        this.loop = this.loop.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);

        window.addEventListener( 'resize', this.onWindowResize );
        rendererElement.addEventListener( 'mousedown', this.onMouseDown );
        rendererElement.addEventListener( 'mousemove', this.onMouseMove );
        rendererElement.addEventListener( 'mouseup', this.onMouseUp );
        rendererElement.addEventListener( 'mouseover', this.onMouseOver );
        rendererElement.addEventListener( 'mouseleave', this.onMouseLeave );

        this.start();
    }

    public abstract init() : void;

    public abstract update(delta : number) : void;

    public abstract onMouseMove(event : MouseEvent) : void;
    public abstract onMouseDown(event : MouseEvent) : void;
    public abstract onMouseUp(event : MouseEvent) : void;

    public onMouseLeave(event: MouseEvent): void {
        this.mouseOnScreen = false;
        return;
    }

    private onMouseOver(event: MouseEvent): void {
        this.mouseOnScreen = true;
        return;
    }

    private start () {
        this.renderer = new WebGLRenderer(
            {
                antialias: true,
                powerPreference: "high-performance"
            }
        );
        this.rendererElement.appendChild( this.renderer.domElement );
        this.camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.001, 1000 );
        this.init();
        this.startTime = Date.now();
        this.secondsPassed = 0;
        this.loop();
    }

    private loop () {
		requestAnimationFrame( this.loop );
        const time : number = performance.now();
        const dt : number = Date.now() - this.lastTime;
		this.lastTime = Date.now();
        this.secondsPassed = (Date.now() - this.startTime) / 1000;
        this.update(dt);
    }

    private onWindowResize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}