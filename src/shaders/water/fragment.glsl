uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform sampler2D uTexture;

varying vec2 vUv;

varying float vElevation;

void main()
{
    float mixStrength = (vElevation  + uColorOffset )* uColorMultiplier;
    vec3 mixedColor = mix(uDepthColor, uSurfaceColor, mixStrength);

    vec4 textureColor = texture2D(uTexture, vUv);

    gl_FragColor = textureColor ;
}