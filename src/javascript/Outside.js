import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export function createRoom() {

    // ================================
    // Variables
    // ================================
    
    //Scaler
    const scale = 2;

    // ================================
    // Scene setup
    // ================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0c0ff);

    // Directional light
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(-30, 80, 50);
    dir.castShadow = true;
    dir.shadow.mapSize.set(4096, 4096);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 200;
    dir.shadow.camera.left = -100;
    dir.shadow.camera.right = 100;
    dir.shadow.camera.top = 100;
    dir.shadow.camera.bottom = -100;
    scene.add(dir);
    
    const ambient = new THREE.AmbientLight(0xffffff, 0.01);
    scene.add(ambient);

    // ===================================
    // Environment map
    // ===================================
    const loaderEnv = new THREE.CubeTextureLoader();
    const envMap = loaderEnv.load([
        '../public/assets/skybox/Sunset/px.png',
        '../public/assets/skybox/Sunset/nx.png',
        '../public/assets/skybox/Sunset/py.png',
        '../public/assets/skybox/Sunset/ny.png',
        '../public/assets/skybox/Sunset/pz.png',
        '../public/assets/skybox/Sunset/nz.png'
    ]);
    scene.background = envMap;

    // ===================================
    // Floating Island
    // ===================================
    const islandRadius = 30;
    const islandHeight = 8;

    const islandBaseGeo = new THREE.ConeGeometry(islandRadius, islandHeight * 2, 64);
    const islandBaseMat = new THREE.MeshStandardMaterial({
        color: 0x6b4f36,
        roughness: 0.9,
        metalness: 0.05
    });
    const islandBase = new THREE.Mesh(islandBaseGeo, islandBaseMat);
    islandBase.rotation.x = Math.PI;
    islandBase.position.y = -islandHeight;
    islandBase.castShadow = true;
    islandBase.receiveShadow = true;

    const grassGeo = new THREE.CircleGeometry(islandRadius * 0.9, 64);
    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x3fa63f,
        roughness: 1.0
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.1;
    grass.castShadow = true;
    grass.receiveShadow = true;

    const islandGroup = new THREE.Group();
    islandGroup.add(islandBase, grass);

    // ===================================
    // Museum Structure
    // ===================================
    const museumHeight = 4 * scale;
    const museumWidth = 10 * scale;
    const museumDepth = 8 * scale;

    const baseMat = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.6,
        metalness: 0.3,
        envMap: envMap,
        envMapIntensity: 0.4
    });

    const mainBody = new THREE.Mesh(
        new THREE.BoxGeometry(museumWidth, museumHeight, museumDepth),
        baseMat
    );
    mainBody.position.set(0, museumHeight / 2, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;

    const sideWingGeo = new THREE.BoxGeometry(museumWidth * 0.5, museumHeight * 0.7, museumDepth * 0.4);
    const sideLeft = new THREE.Mesh(sideWingGeo, baseMat);
    sideLeft.position.set(-museumWidth * 0.6, museumHeight * 0.35, 0);
    sideLeft.castShadow = true;
    sideLeft.receiveShadow = true;

    const sideRight = new THREE.Mesh(sideWingGeo, baseMat);
    sideRight.position.set(museumWidth * 0.6, museumHeight * 0.35, 0);
    sideRight.castShadow = true;
    sideRight.receiveShadow = true;

    const roofPanel = new THREE.Mesh(
        new THREE.BoxGeometry(museumWidth * 1.2, 0.3, museumDepth * 1.3),
        new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.6,
            roughness: 0.3,
            envMap: envMap
        })
    );
    roofPanel.position.set(0, museumHeight + 0.2, museumDepth * -0.025);
    roofPanel.castShadow = true;
    roofPanel.receiveShadow = true;

    const glassGeo = new THREE.PlaneGeometry(museumWidth * 0.8, museumHeight * 0.8);
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        envMap: envMap,
        metalness: 1.0,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, museumHeight / 2, museumDepth / 2 + 0.01);
    glass.castShadow = true;
    glass.receiveShadow = true;

    const doorWidth = 1.2 * scale;
    const doorHeight = 2.4 * scale;
    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1e });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, doorHeight / 2, museumDepth / 2 + 0.05);
    door.name = "door";
    door.castShadow = true;
    door.receiveShadow = true;

    const museumGroup = new THREE.Group();
    museumGroup.add(mainBody, sideLeft, sideRight, roofPanel, glass, door);
    museumGroup.position.y = 0.1;

    // ===================================
    // Decorations
    // ===================================
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
    for (let i = 0; i < 4; i++) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 8), trunkMat);
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), treeMat);
        const angle = i * Math.PI / 2 + 0.4;
        const r = islandRadius * 0.6;
        trunk.position.set(Math.cos(angle) * r, 1, Math.sin(angle) * r);
        leaves.position.set(trunk.position.x, trunk.position.y + 2, trunk.position.z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        islandGroup.add(trunk, leaves);
    }

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    for (let i = 0; i < 10; i++) {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.6),
            rockMat
        );
        const angle = Math.random() * Math.PI * 2;
        const r = islandRadius * 0.7 * Math.random();
        rock.position.set(Math.cos(angle) * r, 0.3, Math.sin(angle) * r);
        rock.rotation.y = Math.random() * Math.PI;
        rock.castShadow = true;
        rock.receiveShadow = true;
        islandGroup.add(rock);
    }

    // ===================================
    // Combine island + museum
    // ===================================
    const worldGroup = new THREE.Group();
    worldGroup.add(islandGroup);
    worldGroup.add(museumGroup);
    worldGroup.position.set(0, 0, -15);
    scene.add(worldGroup);

    return { scene, pintu: door };
}
