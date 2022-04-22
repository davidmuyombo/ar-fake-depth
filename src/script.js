import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as ZapparThree from "@zappar/zappar-threejs";
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * ZapAr
 */
const camera = new ZapparThree.Camera();
scene.background = camera.backgroundTexture;

// Request camera permissions and start the camera 
ZapparThree.permissionRequestUI().then(granted => {
    if (granted) camera.start();
    else ZapparThree.permissionDeniedUI();
});

// Load Trackers
const stLaurentImageTracker = new ZapparThree.ImageTracker();
stLaurentImageTracker.loadTarget('./zpt/vivre-st-laurent.zpt').then(()=>{
    console.log("Living St Laurent Image Target has been loaded")
});

// Add trackers to the scene
let stLaurentImageAnchorGroup = new ZapparThree.ImageAnchorGroup(camera, stLaurentImageTracker);
scene.add(stLaurentImageAnchorGroup);

let frameAnchorGroup = new ZapparThree.ImageAnchorGroup(camera, stLaurentImageTracker);
scene.add(frameAnchorGroup);

// Load Textures
const cielTex = textureLoader.load('./textures/ciel-min.png')
const montagneTex = textureLoader.load('./textures/montagne-min.png')
const montagneBTex = textureLoader.load('./textures/montagne-b-min.png')
const montagneCTex = textureLoader.load('./textures/montagne-c-min.png')
const sticker = textureLoader.load('./textures/st-lawrence-river-sticker.png')
const splashTex = textureLoader.load('./textures/whales-splash-min.png')
const seaMap = textureLoader.load('./textures/mer-min.png')


const cielGeo = new THREE.PlaneGeometry(20,20,1,1);
const cielMat = new THREE.MeshBasicMaterial({map:cielTex}); 
const cielMesh = new THREE.Mesh(cielGeo,cielMat);
const cielBMesh = cielMesh.clone();
cielMesh.position.set(0,-0.7,-9);
cielMesh.renderOrder = 2;
cielMesh.visible = false;
stLaurentImageAnchorGroup.add(cielMesh);
// cielBMesh.rotation.set(0,Math.PI*0.5,0);
// cielBMesh.position.set(-10,0,0)
// cielBMesh.visible = false
// stLaurentImageAnchorGroup.add(cielBMesh);

const montagneGeo = new THREE.PlaneGeometry(19,10.8,1,1);
const montagneMat = new THREE.MeshBasicMaterial({map:montagneTex,transparent:true}); 
const montagneMesh = new THREE.Mesh(montagneGeo,montagneMat);
montagneMesh.position.set(0.9,0.3,-6);
montagneMesh.visible = false;
montagneMesh.renderOrder = 0;
stLaurentImageAnchorGroup.add(montagneMesh);

const montagneBGeo = new THREE.PlaneGeometry(19,10.8,1,1);
const montagneBMat = new THREE.MeshBasicMaterial({map:montagneBTex,transparent:true}); 
const montagneBMesh = new THREE.Mesh(montagneBGeo,montagneBMat);
montagneBMesh.position.set(0,-0.2,-6.5);
montagneBMesh.visible = false;
montagneBMesh.renderOrder = 0;
stLaurentImageAnchorGroup.add(montagneBMesh);

const montagneCGeo = new THREE.PlaneGeometry(19,10.8,1,1);
const montagneCMat = new THREE.MeshBasicMaterial({map:montagneCTex,transparent:true}); 
const montagneCMesh = new THREE.Mesh(montagneCGeo,montagneCMat);
montagneCMesh.position.set(0,-0.3,-7.5);
montagneCMesh.visible = false;
montagneCMesh.renderOrder = 0;
stLaurentImageAnchorGroup.add(montagneCMesh);

const stickerGeo = new THREE.PlaneGeometry(1,1,1,1)
const stickerMat = new THREE.MeshBasicMaterial({map:sticker,transparent:true})
const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
stickerMesh.scale.set(0.3,0.3,0.3)
stickerMesh.position.set(0.6,0.9,0)
stLaurentImageAnchorGroup.add(stickerMesh)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms:
    {
        uTime:{value:0},

        uBigWavesElevation:{value:0.02},
        uBigWavesFrequency:{value: new THREE.Vector2(4,1.5)},
        uBigWavesSpeed:{value:1.3},

        uTexture:{value: seaMap },
        uColorOffset:{value: 0.178}, 
        uColorMultiplier:{value: 4.573}, 

        uSmallWavesElevation:{value: 4},
        uSmallWavesFrequency:{value: 0.1},
        uSmallWavesSpeed:{value: 0.01},
        uSmallIterations:{value: 0.5}
    }
})


/**
 * Model
 */
let meshGltf, waterMat, boatMesh, whale;
gltfLoader.load(
    './models/boat_and_whale.gltf',
    (gltf) =>
    {
        // console.log(gltf.scene)
        meshGltf = gltf.scene;
        meshGltf.scale.set(3.7, 3.7, 3.7);
        meshGltf.position.set(0,0,0);
        meshGltf.visible = false;

        meshGltf.traverse(function(child) {
            if (child.name === "occlude_object") {
                child.material.colorWrite = false; //apply same material to all meshes
                //  child.renderOrder = 3; //apply same material to all meshes
            }else if (child.name === "sea"){
                console.log(child.material)
                child.material.emissiveMap.wrapS = THREE.MirroredRepeatWrapping;
                child.material.emissiveMap.wrapT = THREE.MirroredRepeatWrapping;
                waterMat = child.material.emissiveMap;
                child.material = waterMaterial;
                waterMaterial.uniforms.uTexture.value = waterMat;
                waterMat.repeat = THREE.MirroredRepeatWrapping;
                child.renderOrder = 1
            }else if(child.name === "boat"){
                    boatMesh = child;
                    // child.renderOrder = 0;
            }else if(child.name === "whaleGroup"){
                whale = child;
            }
        });
        stLaurentImageAnchorGroup.add(meshGltf);    
    }
)



// Trackers Event
stLaurentImageTracker.onVisible.bind(anchor => {
    // console.log("New anchor has appeared:", anchor.id);
    meshGltf.visible = true;
    montagneMesh.visible = true;
    montagneBMesh.visible = true;
    montagneCMesh.visible = true;
    stickerMesh.visible = true;
    cielMesh.visible = true;   
    cielBMesh.visible = true;   
});

stLaurentImageTracker.onNotVisible.bind(anchor => {
    // console.log("Anchor is not visible:", anchor.id);
    meshGltf.visible = false;
    montagneMesh.visible = false;
    montagneBMesh.visible = false;
    montagneCMesh.visible = false;
    stickerMesh.visible = false;
    cielMesh.visible = false;
    cielBMesh.visible = false;   
});

/**
 * Render
 */
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

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Cursor 
const cursor = {
    x:0,
    y:0
}

window.addEventListener('mousemove', (event) =>{
    cursor.x = -(event.clientX / sizes.width - 0.5)
    cursor.y = event.clientY / sizes.height - 0.5
})

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

// The Zappar library needs the WebGL context to process camera images
// Use this function to set your context
ZapparThree.glContextSet(renderer.getContext());

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    waterMaterial.uniforms.uTime.value = elapsedTime;

    if(boatMesh){
        boatMesh.position.y -= Math.sin(elapsedTime*1.3)*0.1
    }

    if(whale){
        whale.position.y += Math.sin(elapsedTime*1.3)*0.1
        // splashMesh.position.y -= Math.sin(elapsedTime*1.3)*0.1
    }
    //Update frame from camera
    camera.updateFrame(renderer);
    
    // Render
    renderer.render(scene, camera)
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()