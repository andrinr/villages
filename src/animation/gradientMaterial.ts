import { ShaderMaterial, Color, AdditiveBlending, DoubleSide} from "three";

export const generateGradientMaterial = (color : Color, scale : number) => {
    return new ShaderMaterial({
        uniforms: {
            color: {
                value: color
            },
            scale: {
                value: scale
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
            uniform float scale;
            varying vec3 vUv;
      
            void main() {
                float y = vUv.y*0.2;
                gl_FragColor = vec4(mix(color, vec3(1.0), 1.0-y), 0.3 * (1.0-y));
            }
        `,
        transparent: true,
        blending: AdditiveBlending,
        wireframe: false,
        side: DoubleSide,
    });
}