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

    // ================================
    // Texture Loader
    // ================================
    const textureLoader = new THREE.TextureLoader();
    const leavesTex = textureLoader.load('../public/assets/texture/Leaves.jpeg');
    const grassTex = textureLoader.load('../public/assets/texture/Grass.jpg');
    const logTex = textureLoader.load('../public/assets/texture/Log.jpg');
    const rockTex = textureLoader.load('../public/assets/texture/Stone.jpg');

    // Grass texture wrapping
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(4, 4);
    grassTex.anisotropy = 8;

    leavesTex.wrapS = leavesTex.wrapT = THREE.RepeatWrapping;
    leavesTex.repeat.set(2, 2);
    leavesTex.anisotropy = 8;
    
    logTex.wrapS = logTex.wrapT = THREE.RepeatWrapping;
    logTex.repeat.set(2, 2);
    logTex.anisotropy = 8;

    rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
    rockTex.repeat.set(2, 2);
    rockTex.anisotropy = 8;

    // ===================================
    // Floating Island
    // ===================================
    const islandRadius = 30;
    const islandHeight = 8;

    const islandBase = new THREE.Mesh(
        new THREE.ConeGeometry(islandRadius, islandHeight * 2, 64),
        new THREE.MeshStandardMaterial({
            color: 0x6b4f36,
            roughness: 0.9,
            metalness: 0.05
        })
    );
    islandBase.rotation.x = Math.PI;
    islandBase.position.y = -islandHeight;
    islandBase.castShadow = true;
    islandBase.receiveShadow = true;

    const grass = new THREE.Mesh(
        new THREE.CircleGeometry(islandRadius * 0.9, 64),
        new THREE.MeshStandardMaterial({
            map: grassTex,
            roughness: 1.0
        })
    );
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

    const sideRight = sideLeft.clone();
    sideRight.position.x *= -1;

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

    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(museumWidth * 0.8, museumHeight * 0.8),
        new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            envMap: envMap,
            metalness: 1.0,
            roughness: 0.05,
            transparent: true,
            opacity: 0.7
        })
    );
    glass.position.set(0, museumHeight / 2, museumDepth / 2 + 0.01);
    glass.castShadow = true;
    glass.receiveShadow = true;

    const doorGeo = new THREE.BoxGeometry(1.2 * scale, 2.4 * scale, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1e });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, doorGeo.parameters.height / 2, museumDepth / 2 + 0.05);
    door.castShadow = true;
    door.receiveShadow = true;
    door.name = "door";

    const museumGroup = new THREE.Group();
    museumGroup.add(mainBody, sideLeft, sideRight, roofPanel, glass, door);
    museumGroup.position.y = 0.1;

    // ===================================
    // Decorations
    // ===================================
    const trunkMat = new THREE.MeshStandardMaterial({ map: logTex });
    const leafMat = new THREE.MeshStandardMaterial({ map: leavesTex });
    const logMat = new THREE.MeshStandardMaterial({ map: logTex });
    const shrubMat = new THREE.MeshStandardMaterial({ map: leavesTex });
    const rockMat = new THREE.MeshStandardMaterial({ map: rockTex });
    const smallGrassMat = new THREE.MeshStandardMaterial({ map: grassTex });

    // Trees
    const treeCount = 8;
    for (let i = 0; i < treeCount; i++) {
        const treeGroup = new THREE.Group();
        const type = Math.floor(Math.random() * 2);

        // Outskirts placement
        const minRadius = islandRadius * 0.6;
        const maxRadius = islandRadius * 0.9;
        const r = minRadius + Math.random() * (maxRadius - minRadius);
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        switch (type) {
            case 0: // Pine / layered cone
                const trunkHeight = 3.0 + Math.random() * 1.0;
                const trunkRadiusTop = 0.4 + Math.random() * 0.2;
                const trunkRadiusBottom = 0.5 + Math.random() * 0.2;
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 10),
                    trunkMat
                );
                trunk.position.y = trunkHeight / 2;
                treeGroup.add(trunk);

                const layers = 3 + Math.floor(Math.random() * 2);
                let currentY = trunkHeight * 0.6;
                for (let j = 0; j < layers; j++) {
                    const coneRadius = 1.8 - j * 0.4 + Math.random() * 0.3;
                    const coneHeight = 1.8 + Math.random() * 0.5;
                    const foliage = new THREE.Mesh(
                        new THREE.ConeGeometry(coneRadius, coneHeight, 10),
                        leafMat
                    );
                    foliage.position.y = currentY + coneHeight / 2;
                    currentY += coneHeight * 0.7;
                    treeGroup.add(foliage);
                }
                break;

            case 1: // Bushy / round
                const bushTrunkHeight = 1.5 + Math.random() * 0.5;
                const bushTrunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.3, bushTrunkHeight, 8),
                    trunkMat
                );
                bushTrunk.position.y = bushTrunkHeight / 2;
                treeGroup.add(bushTrunk);

                const bushRadius = 1.5 + Math.random() * 0.7;
                const bushFoliage = new THREE.Mesh(
                    new THREE.SphereGeometry(bushRadius, 16, 16),
                    leafMat
                );
                bushFoliage.position.y = bushTrunkHeight + bushRadius * 0.8;
                treeGroup.add(bushFoliage);
                break;
        }

        // Random rotation and scale
        treeGroup.position.set(x, 0, z);
        treeGroup.rotation.y = Math.random() * Math.PI;
        const scaleRand = 1.1 + Math.random() * 0.6;
        treeGroup.scale.set(scaleRand, scaleRand, scaleRand);

        // Random cluster offset
        if (Math.random() < 0.3) {
            treeGroup.position.x += (Math.random() - 0.5) * 3;
            treeGroup.position.z += (Math.random() - 0.5) * 3;
        }

        // Enable shadows
        treeGroup.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        islandGroup.add(treeGroup);
    }

    // Rocks
    for (let i = 0; i < 10; i++) {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.6),
            rockMat
        );
        const angle = Math.random() * Math.PI * 2;
        const minRadius = islandRadius * 0.6;
        const maxRadius = islandRadius * 0.85;
        const r = minRadius + Math.random() * (maxRadius - minRadius);
        rock.position.set(Math.cos(angle) * r, 0.3, Math.sin(angle) * r);
        rock.rotation.y = Math.random() * Math.PI;
        rock.castShadow = true;
        rock.receiveShadow = true;
        islandGroup.add(rock);
    }

    // Fallen logs
    const logCount = 3;
    for (let i = 0; i < logCount; i++) {
        const logLength = 1.5 + Math.random() * 2.0;
        const logRadius = 0.2 + Math.random() * 0.2;
        const log = new THREE.Mesh(
            new THREE.CylinderGeometry(logRadius, logRadius, logLength, 8),
            logMat
        );
        const angle = Math.random() * Math.PI * 2;
        const r = islandRadius * 0.5 + Math.random() * 5;
        log.position.set(Math.cos(angle) * r, 0.1, Math.sin(angle) * r);
        log.rotation.z = Math.random() * Math.PI;
        log.rotation.x = Math.random() * Math.PI * 0.3;
        log.castShadow = true;
        log.receiveShadow = true;
        islandGroup.add(log);
    }

    // Shrubs
    const shrubCount = 8;
    for (let i = 0; i < shrubCount; i++) {
        const shrubRadius = 0.8 + Math.random() * 0.5;
        const shrubHeight = 0.5 + Math.random() * 0.3;
        const shrub = new THREE.Mesh(
            new THREE.SphereGeometry(shrubRadius, 12, 12),
            shrubMat
        );
        const angle = Math.random() * Math.PI * 2;
        const r = islandRadius * 0.3 + Math.random() * 10;
        shrub.position.set(Math.cos(angle) * r, shrubHeight / 2, Math.sin(angle) * r);
        shrub.castShadow = true;
        shrub.receiveShadow = true;
        islandGroup.add(shrub);
    }

    // Grass patches
    const grassCount = 20;
    for (let i = 0; i < grassCount; i++) {
        const grassPatch = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5),
            smallGrassMat
        );
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * islandRadius * 0.9;
        grassPatch.position.set(Math.cos(angle) * r, 0.05, Math.sin(angle) * r);
        grassPatch.rotation.x = -Math.PI / 2;
        grassPatch.rotation.z = Math.random() * Math.PI;
        grassPatch.castShadow = true;
        grassPatch.receiveShadow = true;
        islandGroup.add(grassPatch);
    }

    // ===================================
    // Water Body (below island)
    // ===================================
    const waterGeo = new THREE.CircleGeometry(100, 128);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x3377ff,
        metalness: 0.8,
        roughness: 0.05,
        envMap: envMap,
        envMapIntensity: 1.2,
        transparent: true,
        opacity: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -islandHeight * 0.01;
    water.receiveShadow = true;
    scene.add(water);

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
