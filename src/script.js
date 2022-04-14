import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Cursor 
const cursor = {
    x:0,
    y:0
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = -(event.clientX / sizes.width - 0.5)
    cursor.y = event.clientY / sizes.height - 0.5
})

// var mousePosition = new THREE.Vector2(cursor.x, cursor.y)

// Webgl

const textureLoader = new THREE.TextureLoader()

const imageTexture = textureLoader.load('./textures/st-laurent.png')
const depthMap = textureLoader.load('./textures/st-laurent-depth-map.png')

const shaderMat = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms:
    {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: imageTexture },
        uDepthMap: { value: depthMap }, 
        uMouse: { value: new THREE.Vector2()}
    }
})



let geo = new THREE.PlaneGeometry(1,1);
let tex = new THREE.MeshBasicMaterial({color:0xff0000});
let mesh = new THREE.Mesh(geo, shaderMat);
scene.add(mesh)




// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    shaderMat.uniforms.uTime.value += 0.05;

    shaderMat.uniforms.uMouse.value.x = cursor.x * 0.1;
    shaderMat.uniforms.uMouse.value.y = cursor.y * 0.1;
    // console.log(shaderMat.uniforms.uMouse)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()