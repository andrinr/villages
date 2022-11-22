import type { Matrix4 } from "three";

export class Animation {
    timeline : Float32Array;
    transformation : Matrix4[];

    constructor(timeline : Float32Array, transformations : Matrix4[]) {
        this.timeline = timeline;
        this.transformation = transformations;
    }
        
    getTransformation(time : number) : Matrix4 {
        const timeA = this.timeline.findIndex((t) => t > Math.floor(time));
        const timeB = this.timeline.findIndex((t) => t > Math.ceil(time));

        const matA = this.transformation[timeA];
        const matB = this.transformation[timeB];

        

    }

}