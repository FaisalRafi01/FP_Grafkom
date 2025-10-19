import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { createRoom } from './Outside.js';
import { createInside, updateGachapons, openGachapon } from './Inside.js';
import { createFPSCamera } from './camera.js';
import { rotatePedestalItems } from './pedestal_item.js';


// ===================== Variables =====================
let { scene, pintu } = createRoom();
let activeScene = scene;
let Pointerlock = false;
let insideScene = false;
let isTransitioning = false;

// ===================== Physics World =====================
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravity bumi
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// ===================== Renderer =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//===================== FPS Camera =====================
const { camera, yawObject, gravity, update } = createFPSCamera(renderer.domElement);
scene.add(yawObject);

//===================== Raycaster Setup =====================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('click', (event) => {
    if (!Pointerlock) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    if (!insideScene) {
        // === OUTSIDE ===
        const intersects = raycaster.intersectObject(pintu);
        if (intersects.length > 0) {
            isTransitioning = true;
            startFade(1, () => {
                const insideData = createInside(world);
                disposeScene(activeScene);

                activeScene = insideData.scene;
                activeScene.add(yawObject);
                activeScene.userData.exitDoor = insideData.exitDoor;
                activeScene.userData.cameraLight = insideData.cameraLight;
                activeScene.userData.rotatingItems = insideData.rotatingItems;
                activeScene.userData.gachapons = insideData.gachapons;
                activeScene.userData.itemManager = insideData.itemManager;
                insideScene = true;
                startFade(-1, () => { isTransitioning = false; });
            });
        }

    } else {
        // === INSIDE ===
        const exitDoor = activeScene.userData.exitDoor;
        if (exitDoor) {
            const intersects = raycaster.intersectObject(exitDoor);
            if (intersects.length > 0) {
                isTransitioning = true;
                startFade(1, () => {
                    const { scene: outsideSceneObj, pintu: pintuLuar } = createRoom();
                    disposeScene(activeScene);

                    activeScene = outsideSceneObj;
                    activeScene.add(yawObject);
                    activeScene.userData.pintu = pintuLuar;
                    pintu = pintuLuar;
                    insideScene = false;
                    startFade(-1, () => { isTransitioning = false; });
                });
            }
        }

       // === GACHAPON INTERACTION ===
        const gachapons = activeScene.userData.gachapons;
        if (gachapons && gachapons.length > 0) {
            for (let gachapon of gachapons) {

                // klik body gachapon = buka
                const hitGacha = raycaster.intersectObject(gachapon.baseMesh, true);
                if (hitGacha.length > 0 && !gachapon.isOpen) {
                    console.log('🎮 Gachapon clicked! Opening...', { pos: gachapon.position });
                    openGachapon(activeScene.userData);
                    break;
                }

                // klik tombol = keluarkan item
                if (gachapon.buttonMesh) {
                    const hitButton = raycaster.intersectObject(gachapon.buttonMesh, true);
                    if (hitButton.length > 0) {
                        console.log('🎯 Button clicked! Dispensing item...');
                        gachapon.shuffleItems();
                        gachapon.releaseRandomItem(activeScene.userData.itemManager);
                        break;
                    }
                }
            }
        }
    }
});


function disposeScene(scene) {
    renderer.renderLists.dispose();
    scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => {
                    if (m.map) m.map.dispose?.();
                    m.dispose?.();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose?.();
                obj.material.dispose?.();
            }
        }
    });
}

// ===================== Effect =====================
// Fade effect
const fadePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
);
const fadeScene = new THREE.Scene();
const fadeCamera = new THREE.Camera();
fadeScene.add(fadePlane);

let fadeOpacity = 0;
let fading = false;
let fadeDirection = 0; // 1 = fade in, -1 = fade out
let fadeCallback = null;

function startFade(direction, callback) {
    fading = true;
    fadeDirection = direction;
    fadeCallback = callback;
}

//===================== Key Event =====================
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

// ===================== FPS Counter =====================
const fpsCounter = document.getElementById("fpsCounter");
let lastFrameTime = performance.now();
let fpsLastUpdate = performance.now();
let frames = 0;
let elapsedTime = 0;

//===================== Animation Loop =====================
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    elapsedTime += delta;

    // Update physics world
    world.step(1/60, delta, 3);

    update(delta);
    
    if (insideScene && activeScene.userData.cameraLight) {
        const light = activeScene.userData.cameraLight;
        light.position.copy(yawObject.position).add(new THREE.Vector3(0, 1.5, 0));
    }
    
    if (insideScene && activeScene.userData.rotatingItems) {
        rotatePedestalItems(activeScene.userData.rotatingItems, delta);
    }
    
    // Update gachapons system (physics + animation)
    if (insideScene && activeScene.userData.gachapons) {
        updateGachapons(activeScene.userData, delta, elapsedTime);
    }

    renderer.render(activeScene, camera);

    // Handle fade animation
    if (fading) {
        fadeOpacity += fadeDirection * delta * 4;
        fadeOpacity = THREE.MathUtils.clamp(fadeOpacity, 0, 1);
        fadePlane.material.opacity = fadeOpacity;

        renderer.autoClear = false;
        renderer.render(fadeScene, fadeCamera);
        renderer.autoClear = true;

        if ((fadeDirection === 1 && fadeOpacity >= 1) ||
            (fadeDirection === -1 && fadeOpacity <= 0)) {
            fading = false;
            if (fadeCallback) fadeCallback();
            fadeCallback = null;
        }
    } else if (fadeOpacity > 0) {
        renderer.autoClear = false;
        renderer.render(fadeScene, fadeCamera);
        renderer.autoClear = true;
    }

    // FPS
    frames++;
    if (now - fpsLastUpdate >= 1000) {
        fpsCounter.textContent = 'FPS: ' + frames;
        
        // Log gachapon stats setiap 5 detik (untuk debugging)
        if (insideScene && activeScene.userData.itemManager && frames % 5 === 0) {
            const stats = activeScene.userData.itemManager.getStats();
            console.log('🎮 Gachapon Stats:', stats);
        }
        
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

// ===================== Cleanup on Page Unload =====================
window.addEventListener('beforeunload', () => {
    // Cleanup physics bodies
    world.bodies.forEach(body => {
        world.removeBody(body);
    });
});

// ===================== Debug Info =====================
console.log('🎮 Main.js initialized with:');
console.log('   - Physics World: ✅');
console.log('   - Gachapon System: ✅');
console.log('   - FPS Controls: ✅');
console.log('   - Click on door to enter inside room');
console.log('   - Click on gachapon or press G to open it');