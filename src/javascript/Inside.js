import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { createShape } from './pedestal_item.js'; 

export function createInside() {
    const scene = new THREE.Scene();

    const warnaLantai = 0xF9F6EE;
    const warnaKotak = 0xdddddd;
    const warnaDoor = 0x8B4513;
    const warnaPedestal = 0xaaaaaa;

    // Floor
    const gridHelper = new THREE.GridHelper(200, 100, warnaKotak, warnaKotak);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: warnaLantai })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const point = new THREE.PointLight(0xffffff, 1, 100);
    point.position.set(0, 20, 0);
    scene.add(ambient, point);

    // Exit door
    const exitDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.2),
        new THREE.MeshStandardMaterial({ color: warnaDoor })
    );
    exitDoor.position.set(-1, 2, 5);
    scene.add(exitDoor);
    exitDoor.name = 'exitDoor';

    // ========================= Pedestals =========================
    const tubeRadius = 0.5;
    const tubeHeight = 2;
    const tubeSegments = 32;
    const tubeRange_width = 6;
    const tubeRange_length = 1;
    const pedestal_count = 9; 
    const spacing = 6;

    const shapes = ['cube','sphere','cone','cylinder','torus','tetrahedron','octahedron','dodecahedron','icosahedron','torusKnot'];
    const rotatingItems = []; 

    function createPedestal(x, z, shapeIndex) {
        // Tube
        const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeHeight, tubeSegments),
            new THREE.MeshStandardMaterial({ color: warnaPedestal })
        );
        tube.position.set(x, tubeHeight / 2, z);
        tube.castShadow = true;
        tube.receiveShadow = true;
        scene.add(tube);

        // Flat top
        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius + 1, tubeRadius + 1, 0.1, tubeSegments),
            new THREE.MeshStandardMaterial({ color: warnaPedestal })
        );
        top.position.set(x, tubeHeight + 0.05, z);
        top.castShadow = true;
        top.receiveShadow = true;
        scene.add(top);

        // Shape on pedestal
        const shapeGeo = createShape(shapes[shapeIndex]);
        const shapeMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const shape = new THREE.Mesh(shapeGeo, shapeMat);
        shape.position.set(x, tubeHeight + 1, z); // Taro atas pedestal
        shape.castShadow = true;
        shape.receiveShadow = true;
        scene.add(shape);

        rotatingItems.push(shape); // animation
    }

    // Left pedestals
    for (let i = 0; i <= pedestal_count; i++) {
        createPedestal(-tubeRange_width, -tubeRange_length * (i * spacing), i % shapes.length);
    }

    // Right pedestals
    for (let i = 0; i <= pedestal_count; i++) {
        createPedestal(tubeRange_width, -tubeRange_length * (i * spacing), i % shapes.length);
    }

    // Moving light
    const cameraLight = new THREE.PointLight(0xffffff, 0.8, 15);
    cameraLight.position.set(0, -5, 0);
    scene.add(cameraLight);

    return { scene, exitDoor, cameraLight, rotatingItems };
}
