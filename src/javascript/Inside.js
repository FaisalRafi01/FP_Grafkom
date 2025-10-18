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
    const ambient = new THREE.AmbientLight(0xffffff, 0.01);
    const point = new THREE.PointLight(0xffffff, 1, 25);
    point.position.set(0, 20, 0);
    point.castShadow = true;
    scene.add(ambient, point);

    // Exit door
    const exitDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.2),
        new THREE.MeshStandardMaterial({ color: warnaDoor })
    );
    exitDoor.position.set(0, 2, 5);
    exitDoor.castShadow = true;
    exitDoor.receiveShadow = true;
    scene.add(exitDoor);
    exitDoor.name = 'exitDoor';

    // Pedestals setup
    const tubeRadius = 0.5;
    const tubeHeight = 2;
    const tubeSegments = 32;
    const pedestal_count = 9; 
    const spacing = 6;

    const shapes = [
        'cube','sphere','cone','cylinder',
        'torus','tetrahedron','octahedron','dodecahedron','icosahedron','torusKnot'
    ];
    const rotatingItems = []; 

    // Reflection envMap for top surfaces
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);

    const envMapMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 1,
        roughness: 0.1,
        envMap: cubeRenderTarget.texture
    });

    function createPedestal(x, z, shapeIndex) {
        const shapeName = shapes[shapeIndex];
        console.log(`Creating pedestal at (${x}, ${z}) with shape: ${shapeName}`);

        const group = new THREE.Group();
        const heightOffset = (Math.random() * 0.4) - 0.2; // vary height slightly

        // Base (stone-like wide bottom)
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius * 2, tubeRadius * 2.2, 0.4, tubeSegments),
            new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, metalness: 0.2 })
        );
        base.position.y = 0.2 + heightOffset;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Column (main pedestal body)
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeHeight, tubeSegments),
            new THREE.MeshStandardMaterial({ color: warnaPedestal, roughness: 0.5, metalness: 0.3 })
        );
        column.position.y = tubeHeight / 2 + heightOffset;
        column.castShadow = true;
        column.receiveShadow = true;
        group.add(column);

        // Top Cap (reflective metal plate)
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius + 0.8, tubeRadius + 0.8, 0.15, tubeSegments),
            envMapMaterial
        );
        cap.position.y = tubeHeight + 0.1 + heightOffset;
        cap.castShadow = true;
        cap.receiveShadow = true;
        group.add(cap);

        // Small emissive glow ring
        const glow = new THREE.Mesh(
            new THREE.TorusGeometry(tubeRadius + 0.6, 0.05, 16, 100),
            new THREE.MeshStandardMaterial({ color: 0x99ccff, emissive: 0x99ccff, emissiveIntensity: 0.5 })
        );
        glow.position.y = tubeHeight + 0.18 + heightOffset;
        glow.rotation.x = Math.PI / 2;
        group.add(glow);

        // Shape on top
        const shape = createShape(shapeName);
        shape.position.y = tubeHeight + 1 + heightOffset;
        shape.castShadow = true;
        shape.receiveShadow = true;
        group.add(shape);
        rotatingItems.push(shape);

        // Group position
        group.position.set(x, 0, z);
        scene.add(group);
    }

    // Left pedestals
    for (let i = 0; i <= pedestal_count; i++) {
        createPedestal(-6, -(i * spacing), i % shapes.length);
    }

    // Right pedestals
    for (let i = 0; i <= pedestal_count; i++) {
        createPedestal(6, -(i * spacing), i % shapes.length);
    }

    // Moving light
    const cameraLight = new THREE.PointLight(0xffffff, 1, 20);
    cameraLight.position.set(0, 5, 0);
    cameraLight.castShadow = true;
    scene.add(cameraLight);

    return { scene, exitDoor, cameraLight, rotatingItems, cubeCamera };
}
