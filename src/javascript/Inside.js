import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { createShape } from './pedestal_item.js'; 
import { Gachapon, createGachapon } from './gachapon.js';
import { createGachaponItemManager } from './gachapon_item.js';

export function createInside(world) {
    const scene = new THREE.Scene();

    const warnaLantai = 0xF9F6EE;
    const warnaKotak = 0xdddddd;
    const warnaDoor = 0x8B4513;
    const warnaPedestal = 0xaaaaaa;

    // ===================== Physics World =====================
    if(world){
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
    }

    const itemnum = 100;

    // Skybox MilkyWay
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_px.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nx.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_py.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_ny.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_pz.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nz.jpg'
    ]);
    scene.background = texture;

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

    if (world) {
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0 });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
        floorBody.position.set(0, 0, 0);
        world.addBody(floorBody);
    }

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
    exitDoor.position.set(0, 2, 5);
    scene.add(exitDoor);
    exitDoor.name = 'exitDoor';

    // ===================== Gachapon System =====================
    const gachapons = [];
    let itemManager = createGachaponItemManager(scene, world);
    const positions = [
        { x: 0,  y: 0, z: -60 },
        { x: 10, y: 0, z: -60 },
        { x: -10, y: 0, z: -60 },
    ];

    for (let pos of positions) {
        const gachapon = createGachapon(scene, world, pos, 2);
        gachapon.itemManager = itemManager;
        itemManager.setPrizeAmount(itemnum);
        itemManager.generateGachaponItems(gachapon);

        gachapons.push(gachapon);
    }

console.log(`🎮 Gachapon system initialized with ${gachapons.length} gachapons`);

    // ===================== Pedestals Setup =====================
    const tubeRadius = 0.5;
    const tubeHeight = 2;
    const tubeSegments = 32;
    const tubeRange_width = 6;
    const tubeRange_length = 1;
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
        const heightOffset = (Math.random() * 0.4) - 0.2; // File2 feature

        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius * 2, tubeRadius * 2.2, 0.4, tubeSegments),
            new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, metalness: 0.2 })
        );
        base.position.y = 0.2 + heightOffset;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Column
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeHeight, tubeSegments),
            new THREE.MeshStandardMaterial({ color: warnaPedestal, roughness: 0.5, metalness: 0.3 })
        );
        column.position.y = tubeHeight / 2 + heightOffset;
        column.castShadow = true;
        column.receiveShadow = true;
        group.add(column);

        // Top Cap
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(tubeRadius + 0.8, tubeRadius + 0.8, 0.15, tubeSegments),
            envMapMaterial
        );
        cap.position.y = tubeHeight + 0.1 + heightOffset;
        cap.castShadow = true;
        cap.receiveShadow = true;
        group.add(cap);

        // Emissive glow ring
        const glow = new THREE.Mesh(
            new THREE.TorusGeometry(tubeRadius + 0.6, 0.05, 16, 100),
            new THREE.MeshStandardMaterial({ color: 0x99ccff, emissive: 0x99ccff, emissiveIntensity: 0.5 })
        );
        glow.position.y = tubeHeight + 0.18 + heightOffset;
        glow.rotation.x = Math.PI / 2;
        group.add(glow);

        // Shape
        const shape = createShape(shapeName);
        shape.position.y = tubeHeight + 1 + heightOffset;
        shape.castShadow = true;
        shape.receiveShadow = true;
        group.add(shape);
        rotatingItems.push(shape);

        // Position group
        group.position.set(x, 0, z);
        scene.add(group);
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
    const cameraLight = new THREE.PointLight(0xffffff, 1, 20);
    cameraLight.position.set(0, 5, 0);
    scene.add(cameraLight);

    return { 
        scene, 
        exitDoor, 
        cameraLight, 
        rotatingItems,
        gachapons,
        itemManager,
        cubeCamera
    };
}

// ===================== Gachapon Functions =====================
export function openGachapon(insideInstance, index = 0) {
    if (insideInstance.gachapons && insideInstance.gachapons[index]) {
        const gachapon = insideInstance.gachapons[index];
        gachapon.openGachapon();
        if (insideInstance.itemManager) {
            const gachaponId = insideInstance.itemManager.getGachaponId(gachapon);
            insideInstance.itemManager.activateGachaponItems(gachaponId);
        }
        return true;
    }
    return false;
}

export function updateGachapons(insideInstance, delta, elapsed) {
    if (insideInstance.gachapons) {
        insideInstance.gachapons.forEach(gachapon => gachapon.update());
    }
    if (insideInstance.itemManager) {
        insideInstance.itemManager.update(delta, elapsed);
    }
}
