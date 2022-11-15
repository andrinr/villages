import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

const loadGLTF = (modelPath, dracoPath, scene : THREE.Scene) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
        
    gltfLoader.load(
        modelPath,
        (gltf) => {
            gltf.scene.children.forEach((child) => {
                console.log(child.name);
                if (!child.name.includes('Plane') && !child.name.includes('mountain')) {
                    //child.castShadow = true;
                }
                child.castShadow = true;
                child.receiveShadow = true;
                //child.side =  THREE.FrontSide;
                //child.shadowSide = THREE.FrontSide;
                //@ts-ignore
                //child.material = material;
                console.log(child.name);
                scene.add(child);
            });

        });
}

export {loadGLTF}