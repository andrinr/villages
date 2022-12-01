import { ShaderMaterial, Color, AdditiveBlending, DoubleSide, NormalBlending} from "three";

export const generateHighlightMaterial = (color : Color) => {
    return new ShaderMaterial({
        uniforms: {
            color: {
                value: color
            },
            time: {
                value : 0.0
            }
        },
        vertexShader: `
            varying vec3 vUv; 

            void main() {
                vUv = position; 
            
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition; 
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float time;
            varying vec3 vUv;
      
            void main() {   
       
                //float y = (vUv.y + 0.5) * 0.5;
                gl_FragColor = vec4(mix(vec3(0.5), color, sin(vUv.y * 0.01 * time)), 1.0);
            
              //gl_FragColor = vec4(mix(vec3(1.0), color, (vUv.y + 0.5) * 0.5), (vUv.y + 0.5) * 0.5);
            }
        `,
        transparent: true,
        blending: NormalBlending,
        wireframe: false,
        side: DoubleSide
    });
}