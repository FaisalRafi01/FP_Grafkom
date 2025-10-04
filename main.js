import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { createRoom } from './room.js';
import { createFPSCamera } from './camera.js';

const scene = createRoom();

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create FPS camera
const { camera, yawObject, update } = createFPSCamera(renderer.domElement);

// Add the player root to the scene
scene.add(yawObject);

// Request pointer lock when user clicks the canvas
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// FPS Counter
const fpsCounter = document.getElementById("fpsCounter");

// Animate
let lastFrameTime = performance.now();
let fpsLastUpdate = performance.now();
frames = 0;

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
        fpsCounter.textContent = frames;
        frames = 0;
        fpsLastUpdate = now;
    }
}
animate();

// Window Size Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
