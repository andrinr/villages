import { ShaderMaterial, Color, AdditiveBlending, DoubleSide} from "three";

export const generateGradientMaterial = (color : Color) => {
    return new ShaderMaterial({
        uniforms: {
            color: {
                value: color
            },
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
            varying vec3 vUv;
      
            void main() {   
       
                float y = (vUv.y + 0.5) * 0.5;
                gl_FragColor = vec4(mix(vec3(1.0), color, y), y);
            

              //gl_FragColor = vec4(mix(vec3(1.0), color, (vUv.y + 0.5) * 0.5), (vUv.y + 0.5) * 0.5);
            }
        `,
        transparent: true,
        blending: AdditiveBlending,
        wireframe: false,
        side: DoubleSide
    });
}