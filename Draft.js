import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// Geometry creation
export function createShape(shapeName) {
    let mesh;

    switch (shapeName) {
        case 'cube': {
            const geo = new THREE.BoxGeometry(1,1,1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x66ccff, metalness: 0.4, roughness: 0.5 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.rotationSpeed = 0.8;
            break;
        }
        case 'sphere': {
            const geo = new THREE.SphereGeometry(0.55, 48, 48);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xff6688,
                metalness: 0.3,
                roughness: 0.25,
                emissive: 0x220011,
                emissiveIntensity: 0.4
            });
            mesh = new THREE.Mesh(geo, mat);
            mesh.scalePulse = true;
            break;
        }
        case 'cone': {
            const geo = new THREE.ConeGeometry(0.45, 1, 48);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x88ff66,
                metalness: 0.2,
                roughness: 0.5
            });
            mesh = new THREE.Mesh(geo, mat);
            mesh.wobble = true;
            // sedikit angkat biar ga nembus pedestal
            mesh.position.y += 0.3;
            break;
        }
        case 'cylinder': {
            const geo = new THREE.CylinderGeometry(0.35, 0.35, 1, 48, 1, false);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffff66,
                metalness: 0.3,
                roughness: 0.3
            });
            mesh = new THREE.Mesh(geo, mat);
            mesh.verticalBob = true;
            // tambahkan sedikit rotasi biar gak flat
            mesh.rotation.x = Math.PI * 0.05;
            break;
        }
        case 'torus': {
            const geo = new THREE.TorusGeometry(0.4, 0.12, 16, 64);
            const mat = new THREE.MeshStandardMaterial({ color: 0x66ffff, metalness: 0.9, roughness: 0.3 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.spinReverse = true;
            break;
        }
        case 'tetrahedron': {
            const geo = new THREE.TetrahedronGeometry(0.6);
            const mat = new THREE.MeshStandardMaterial({ color: 0xcc99ff, metalness: 0.3, roughness: 0.4 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.rotationSpeed = 1.2;
            break;
        }
        case 'octahedron': {
            const geo = new THREE.OctahedronGeometry(0.6);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffcc66, metalness: 0.4, roughness: 0.3 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.scalePulse = true;
            break;
        }
        case 'dodecahedron': {
            const geo = new THREE.DodecahedronGeometry(0.6);
            const mat = new THREE.MeshStandardMaterial({ color: 0x66ff99, metalness: 0.5, roughness: 0.4 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.rotationSpeed = 0.6;
            break;
        }
        case 'icosahedron': {
            const geo = new THREE.IcosahedronGeometry(0.6);
            const mat = new THREE.MeshStandardMaterial({ color: 0xff99cc, metalness: 0.3, roughness: 0.3 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.verticalBob = true;
            break;
        }
        case 'torusKnot': {
            const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 128, 16);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0x331100, metalness: 0.8, roughness: 0.2 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.colorShift = true;
            break;
        }
        default: {
            const geo = new THREE.BoxGeometry(1,1,1);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            mesh = new THREE.Mesh(geo, mat);
        }
    }

    // Simpan posisi dasar untuk efek bob
    mesh.userData.baseY = mesh.position.y;
    return mesh;
}

// Shape animation
export function updateShapeBehavior(mesh, delta, elapsed) {
    if (mesh.rotationSpeed) mesh.rotation.y += delta * mesh.rotationSpeed;

    if (mesh.scalePulse) {
        const s = 1 + Math.sin(elapsed * 2) * 0.1;
        mesh.scale.set(s, s, s);
    }

    if (mesh.wobble) {
        mesh.rotation.x = Math.sin(elapsed * 3) * 0.4;
        mesh.rotation.z = Math.cos(elapsed * 3) * 0.4;
    }

    if (mesh.verticalBob) {
        // naik-turun halus tanpa hilang
        const baseY = mesh.userData.baseY ?? 0;
        mesh.position.y = baseY + Math.sin(elapsed * 2) * 0.25;
    }

    if (mesh.spinReverse) mesh.rotation.y -= delta * 1.0;

    if (mesh.colorShift && mesh.material) {
        const hue = (Math.sin(elapsed * 1.5) * 0.5 + 0.5) * 0.15 + 0.05;
        mesh.material.color.setHSL(hue, 0.9, 0.55);
    }
}

// Pedestal rotation
export function rotatePedestalItems(itemsArray, delta, elapsed) {
    itemsArray.forEach(item => {
        updateShapeBehavior(item, delta, elapsed);
        item.rotation.y += delta * 0.3;
    });
}

    switch (shapeName) {
        case 'cube': return new THREE.BoxGeometry(1,1,1);
        case 'sphere': return new THREE.SphereGeometry(0.5,32,32);
        case 'cone': return new THREE.ConeGeometry(0.5,1,32);
        case 'cylinder': return new THREE.CylinderGeometry(0.4,0.4,1,32);
        case 'torus': return new THREE.TorusGeometry(0.4,0.15,16,100);
        case 'tetrahedron': return new THREE.TetrahedronGeometry(0.5);
        case 'octahedron': return new THREE.OctahedronGeometry(0.5);
        case 'dodecahedron': return new THREE.DodecahedronGeometry(0.5);
        case 'icosahedron': return new THREE.IcosahedronGeometry(0.5);
        case 'torusKnot': return new THREE.TorusKnotGeometry(0.3,0.1,100,16);
        default: return new THREE.BoxGeometry(1,1,1);
    }
    