import { Mesh, MeshBasicMaterial, MeshPhongMaterial, Scene, SphereGeometry, Vector3 } from "three";

export class Cloud {
    private spheres : Mesh[];
    private positions : Vector3;
    private material : MeshPhongMaterial;
    constructor(scene : Scene) {
        this.spheres = [];
        this.positions = this.genRandomVector(10, 10, 10);
        this.material = new MeshPhongMaterial({color: 0xffffff});

        for (let i = 0; i < 10; i++) {
            let sphere = new SphereGeometry(Math.random()*0.1 +0.03, 8, 8);
            let mesh = new Mesh(sphere, this.material);
            mesh.position.add(this.positions).add(this.genRandomVector(0.5, 0.2, 0.5));
            this.spheres.push(mesh);
            scene.add(mesh);
        }
    }

    private genRandomVector(xRange : number, yRange : number, zRange : number) : Vector3 {
        return new Vector3(
            Math.random() * xRange - xRange / 2,
            Math.random() * yRange - yRange / 2,
            Math.random() * zRange - zRange / 2
        );
    }
}