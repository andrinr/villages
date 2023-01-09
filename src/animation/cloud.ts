
import { Mesh, Group, MeshPhongMaterial, Scene, SphereGeometry, Vector3 } from "three";

export class Cloud {
    private group : Group
    private velocity : Vector3;
    private acceleration : Vector3;
    private material : MeshPhongMaterial;
    constructor(scene : Scene) {
        this.group = new Group();
        this.group.position.multiplyScalar(0).add(this.genRandomVector(10, 2, 10));
        console.log(this.group);
        this.material = new MeshPhongMaterial({color: 0xffffff});
        this.velocity = new Vector3();
        this.acceleration = new Vector3();
        for (let i = 0; i < 10; i++) {
            let sphere = new SphereGeometry(Math.random()*0.1 +0.03, 8, 8);
            let mesh = new Mesh(sphere, this.material);
            mesh.position.add(this.genRandomVector(0.5, 0.2, 0.5));
            this.group.add(mesh);
        }
        scene.add(this.group);
        console.log(this.group);
    }

    private genRandomVector(xRange : number, yRange : number, zRange : number) : Vector3 {
        return new Vector3(
            Math.random() * xRange - xRange / 2,
            Math.random() * yRange - yRange / 2,
            Math.random() * zRange - zRange / 2
        );
    }

    public update(dt){
        this.group.position.add(this.velocity.clone().multiplyScalar(dt));
        this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
        this.acceleration.add(this.genRandomVector(0.1, 0.1, 0.1));
    }
}