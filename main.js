import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { createRoom } from './Outside.js';
import { createInside } from './Inside.js'; 
import { createFPSCamera } from './camera.js';


// ===================== Variables =====================
const { scene, pintu } = createRoom();
let Pointerlock = false;
let insideScene = false;

// ===================== Renderer =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//===================== FPS Camera =====================
const { camera, yawObject, update } = createFPSCamera(renderer.domElement);
scene.add(yawObject);

//===================== Pointer Lock =====================
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'q') {
        if (!Pointerlock) {
            renderer.domElement.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }
});

document.addEventListener('pointerlockchange', () => {
    Pointerlock = (document.pointerLockElement === renderer.domElement);
    console.log(Pointerlock ? '🔒 Pointer locked' : '🔓 Pointer unlocked');
});

//===================== Raycaster Setup =====================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('click', () => {
    if (!Pointerlock) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    if (!insideScene) {
        // === OUTSIDE ===
        const intersects = raycaster.intersectObject(pintu);
        if (intersects.length > 0) {
            const { scene: insideSceneObj, exitDoor } = createInside();

            renderer.renderLists.dispose();
            while (scene.children.length > 0) scene.remove(scene.children[0]);
            insideSceneObj.children.forEach(obj => scene.add(obj));
            scene.add(yawObject);

            // inside = true
            scene.userData.exitDoor = exitDoor;
            insideScene = true;
        }
    } else {
        // === INSIDE ===
        const exitDoor = scene.userData.exitDoor;
        if (exitDoor) {
            const intersects = raycaster.intersectObject(exitDoor);
            if (intersects.length > 0) {
                const { scene: outsideSceneObj, pintu: pintuLuar } = createRoom();

                renderer.renderLists.dispose();
                while (scene.children.length > 0) scene.remove(scene.children[0]);
                outsideSceneObj.children.forEach(obj => scene.add(obj));
                scene.add(yawObject);

                // inside = false
                scene.userData.pintu = pintuLuar;
                insideScene = false;
            }
        }
    }
});


// ===================== FPS Counter =====================
const fpsCounter = document.getElementById("fpsCounter");
let lastFrameTime = performance.now();
let fpsLastUpdate = performance.now();
let frames = 0;

//===================== Animation Loop =====================
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    update(delta);
    renderer.render(scene, camera);

    // FPS
    frames++;
    if (now - fpsLastUpdate >= 1000) {
        fpsCounter.textContent = 'FPS: ' + frames;
        frames = 0;
        fpsLastUpdate = now;
    }
}
animate();

// ===================== Resize Handling =====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
