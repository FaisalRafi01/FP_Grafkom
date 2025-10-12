import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// Create geometry based on shape name
export function createShape(shapeName) {
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
}

// Rotate all pedestal items
export function rotatePedestalItems(itemsArray, delta) {
    itemsArray.forEach(item => {
        item.rotation.y += delta;      // rotate around Y axis
        item.rotation.x += delta * 0.2; // slight X rotation
    });
}
