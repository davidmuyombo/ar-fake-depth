precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;
uniform sampler2D uDepthMap;
uniform vec2 uMouse;

varying vec2 vUv;

void main()
{
    vec4 depth = texture2D(uDepthMap, vUv);
    vec4 textureColor = texture2D(uTexture, vUv);
    
    vec2 um = uMouse.xy;

    gl_FragColor = texture2D(uTexture, vUv - uMouse * depth.r);
}