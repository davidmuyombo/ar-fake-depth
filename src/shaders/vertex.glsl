uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec2 uv;
varying vec2 vUv;

attribute vec2 position;

void main()
{

    gl_Position =  vec4( position , 0, 1);

    vUv = uv;
}