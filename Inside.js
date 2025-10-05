// Inside.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export function createInside(onExitDoorClick) {
    const scene = new THREE.Scene();

    // =========================
    // Colors and Sizes
    // =========================
    const warnaLantai =  0xF9F6EE;
    const warnaKotak = 0xdddddd;

    // =========================
    // Infinite-like Floor (Checker Pattern)
    // =========================
    const size = 200;
    const divisions = 100;

    const gridHelper = new THREE.GridHelper(size, divisions, warnaKotak, warnaKotak);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshStandardMaterial({ color: warnaLantai });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ========================= Lighting =========================
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const point = new THREE.PointLight(0xffffff, 1, 100);
    point.position.set(0, 10, 0);
    scene.add(ambient, point);

    // ========================= Exit Door Behind Player =========================
    const doorGeo = new THREE.BoxGeometry(2, 4, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2222ff });
    const exitDoor = new THREE.Mesh(doorGeo, doorMat);
    exitDoor.position.set(0, 2, 5); 
    scene.add(exitDoor);
    exitDoor.name = 'exitDoor'; 

    // ========================= Light for Door =========================
    const doorLight = new THREE.PointLight(0x4444ff, 1, 10);
    doorLight.position.set(0, 3, 4);
    scene.add(doorLight);

    scene.fog = new THREE.FogExp2(0xffffff, 0.02);

    return { scene, exitDoor };
}
