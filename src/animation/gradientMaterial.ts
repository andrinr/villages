import { 
    ShaderMaterial, 
    ShaderChunk,
    Color, 
    AdditiveBlending, 
    DoubleSide} from "three";

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
        vertexShader: 
            ShaderChunk.common + '\n' + ShaderChunk.logdepthbuf_pars_vertex + `
            #ifdef LOGARITHMICDEPTH
                gl_FragDepthEXT = log2(vFragmentDepth) * logarithmicDepthConstant * 0.5;
            #endif

            varying vec3 vUv; 

            void main() {
                vUv = position; 
            
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition; 
            ` + ShaderChunk.logdepthbuf_vertex + `
            }
            `,
        fragmentShader: 
            ShaderChunk.logdepthbuf_pars_fragment + `
            uniform vec3 color;
            uniform float scale;
            varying vec3 vUv;
      
            void main() {
                float y = vUv.y*0.2;
                gl_FragColor = vec4(mix(color, vec3(1.0), 1.0-y), 0.3 * (1.0-y));
                //gl_FragColor = vec4(1.0);
            ` + ShaderChunk.logdepthbuf_fragment + `
            }
            `,
        transparent: true,
        blending: AdditiveBlending,
        wireframe: false,
        side: DoubleSide,
        depthWrite: true,
        depthTest: true,
    });
}