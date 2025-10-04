import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export function createRoom() {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // Lights
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(10, 20, 10);
    dir.castShadow = false;
    scene.add(dir);

    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = 0;
    scene.add(ground);

    // Example object(s)
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    cube.position.set(0, 0.5, -4);
    scene.add(cube);

    const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x3366ff })
    );
    box2.position.set(3, 1, -6);
    scene.add(box2);

    return scene;
}
