import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export function createFPSCamera(domElement = document.body) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Yaw (left/right) and Pitch (up/down) objects
    const yawObject = new THREE.Object3D();
    const pitchObject = new THREE.Object3D();
    yawObject.add(pitchObject);
    pitchObject.add(camera);

    // Initial Position (player height)
    yawObject.position.set(0, 2, 5);

    // Input State
    const keys = {};
    let yaw = 0;
    let pitch = 0;

    // Event Handlers
    function onKeyDown(e) { keys[e.code] = true; }
    function onKeyUp(e) { keys[e.code] = false; }

    function onMouseMove(e) {
        if (document.pointerLockElement === domElement) {
            yaw -= e.movementX * 0.0025;
            pitch -= e.movementY * 0.0025;
            const max = Math.PI / 2 - 0.01;
            pitch = Math.max(-max, Math.min(max, pitch));

            yawObject.rotation.y = yaw;
            pitchObject.rotation.x = pitch;
        }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);

    function update(delta) {
        let speed = 5;

        // Sprint: multiply speed by 3 when Shift is held
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            speed *= 3;
        }

        const move = new THREE.Vector3();

        if (keys['KeyW']) move.z -= 1;
        if (keys['KeyS']) move.z += 1;
        if (keys['KeyA']) move.x -= 1;
        if (keys['KeyD']) move.x += 1;

        if (move.lengthSq() > 0) {
            move.normalize();
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yawObject.quaternion);
            const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(yawObject.quaternion);

            yawObject.position.addScaledVector(forward, -move.z * speed * delta);
            yawObject.position.addScaledVector(right, move.x * speed * delta);
        }
    }


    function dispose() {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('mousemove', onMouseMove);
    }

    return {
        camera,
        yawObject,
        update,
        dispose
    };
}
