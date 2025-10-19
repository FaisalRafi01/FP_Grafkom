import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { createShape, updateShapeBehavior } from './pedestal_item.js';

export class GachaponItemManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.items = [];
        this.releasedItems = [];
        this.prizeAmount = 30;
        this.size = 0.25;
    }

    // Set prize amount untuk semua gachapon
    setPrizeAmount(amount) {
        this.prizeAmount = amount;
        console.log(`Prize amount set to: ${amount}`);
    }

    // Generate items untuk gachapon 
    generateGachaponItems(gachapon, customPrizeAmount = null) {
        const prizeAmount = customPrizeAmount || this.prizeAmount;
        const shapes = ['cube', 'sphere', 'cone', 'cylinder', 'torus', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'torusKnot'];
        const volume = gachapon.getInternalVolume();
        const scale = gachapon.scale;
        
        const gachaponItems = [];

        console.log(`Generating ${prizeAmount} items for gachapon at (${gachapon.position.x}, ${gachapon.position.y}, ${gachapon.position.z})`);

        for (let i = 0; i < prizeAmount; i++) {
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            const item = this.createGachaponItem(shapeType, scale);
            
            const posX = volume.minX + Math.random() * (volume.maxX - volume.minX);
            const posY = volume.minY + Math.random() * (volume.maxY - volume.minY);
            const posZ = volume.minZ + Math.random() * (volume.maxZ - volume.minZ);
            
            item.mesh.position.set(posX, posY, posZ);
            
            const itemBody = this.createItemPhysicsBody(shapeType, scale, posX, posY, posZ);
            
            this.world.addBody(itemBody);
            this.scene.add(item.mesh);
            
            const itemData = {
                mesh: item.mesh,
                body: itemBody,
                type: shapeType,
                scale: scale,
                gachaponId: this.getGachaponId(gachapon),
                itemId: this.generateItemId()
            };
            
            gachaponItems.push(itemData);
            this.items.push(itemData);
        }

        console.log(`Successfully generated ${gachaponItems.length} items with active physics`);
        return gachaponItems;
    }

    // Generate multiple gachapons sekaligus
    generateMultipleGachaponItems(gachapons, prizeAmountPerGachapon = null) {
        gachapons.forEach(gachapon => {
            this.generateGachaponItems(gachapon, prizeAmountPerGachapon);
        });
    }

    // Create visual item untuk gachapon dengan enhancements
    createGachaponItem(shapeType, scale) {
        const mesh = createShape(shapeType);
        const itemScale = this.size * scale;
        mesh.scale.set(itemScale, itemScale, itemScale);
        
        if (mesh.material) {
            const hue = Math.random() * 0.3 + 0.6;
            const saturation = Math.random() * 0.3 + 0.7;
            const lightness = Math.random() * 0.2 + 0.5;
            
            mesh.material.color.setHSL(hue, saturation, lightness);
            mesh.material.metalness = 0.7;
            mesh.material.roughness = 0.2;
            mesh.material.emissive = new THREE.Color().setHSL(hue, saturation * 0.5, lightness * 0.3);
            mesh.material.emissiveIntensity = 0.2;
        }

        mesh.rotationSpeed = (Math.random() * 0.5 + 0.5);
        return { mesh };
    }

    // Create physics body untuk item dengan gravity langsung aktif
    createItemPhysicsBody(shapeType, scale, posX, posY, posZ) {
        let itemShape;
        const itemScale = this.size * scale;

        switch(shapeType) {
            case 'sphere': itemShape = new CANNON.Sphere(0.5 * itemScale); break;
            case 'cube': itemShape = new CANNON.Box(new CANNON.Vec3(0.5 * itemScale, 0.5 * itemScale, 0.5 * itemScale)); break;
            case 'cone': itemShape = new CANNON.Cylinder(0, 0.4 * itemScale, 1.0 * itemScale, 8); break;
            case 'cylinder': itemShape = new CANNON.Cylinder(0.35 * itemScale, 0.35 * itemScale, 1.0 * itemScale, 8); break;
            case 'torus': itemShape = new CANNON.Sphere(0.6 * itemScale); break;
            case 'tetrahedron': case 'octahedron': case 'dodecahedron': case 'icosahedron': itemShape = new CANNON.Sphere(0.5 * itemScale); break;
            case 'torusKnot': itemShape = new CANNON.Sphere(0.4 * itemScale); break;
            default: itemShape = new CANNON.Sphere(0.5 * itemScale);
        }

        const itemMaterial = new CANNON.Material({ friction: 0.5, restitution: 0.2 });

        const itemBody = new CANNON.Body({
            mass: 0.3 + Math.random() * 0.3,
            position: new CANNON.Vec3(posX, posY, posZ),
            shape: itemShape,
            material: itemMaterial,
            linearDamping: 0.3,
            angularDamping: 0.5
        });

        itemBody.angularVelocity.set(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );

        if(shapeType === 'cylinder' || shapeType === 'cone') {
            itemBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        }

        return itemBody;
    }

    // Update items position dan animasi
    update(delta, elapsed) {
        [...this.items, ...this.releasedItems].forEach(item => {
            if (item.mesh && item.body) {
                item.mesh.position.copy(item.body.position);
                item.mesh.quaternion.copy(item.body.quaternion);
                updateShapeBehavior(item.mesh, delta, elapsed);
            }
        });

        this.cleanupDistantItems();
    }

    // Hapus items yang jatuh terlalu jauh
    cleanupDistantItems() {
        const maxDistance = 100;
        const minY = -10;
        const cleanup = (array) => {
            const itemsToRemove = [];
            array.forEach((item, index) => {
                const distance = item.body.position.length();
                const yPos = item.body.position.y;
                if (distance > maxDistance || yPos < minY) {
                    itemsToRemove.push(index);
                }
            });
            for (let i = itemsToRemove.length - 1; i >= 0; i--) {
                const index = itemsToRemove[i];
                this.removeItem(array[index]);
                array.splice(index, 1);
            }
            return itemsToRemove.length;
        };

        const removedFromItems = cleanup(this.items);
        const removedFromReleased = cleanup(this.releasedItems);
        if (removedFromItems + removedFromReleased > 0) {
            console.log(`🧹 Cleaned up ${removedFromItems + removedFromReleased} distant items`);
        }
    }

    // Remove item individual
    removeItem(item) {
        if (item.mesh) this.scene.remove(item.mesh);
        if (item.body) this.world.removeBody(item.body);
    }

    // Cleanup semua items
    cleanupAllItems() {
        [...this.items, ...this.releasedItems].forEach(item => this.removeItem(item));
        this.items = [];
        this.releasedItems = [];
        console.log(`🧹 Cleaned up all items`);
    }

    // Cleanup items dari gachapon tertentu
    cleanupGachaponItems(gachaponId) {
        const removeFromArray = (array) => {
            const filtered = array.filter(item => item.gachaponId === gachaponId);
            filtered.forEach(item => this.removeItem(item));
            return array.filter(item => item.gachaponId !== gachaponId);
        };

        const removedFromItems = this.items.filter(item => item.gachaponId === gachaponId).length;
        const removedFromReleased = this.releasedItems.filter(item => item.gachaponId === gachaponId).length;

        this.items = removeFromArray(this.items);
        this.releasedItems = removeFromArray(this.releasedItems);

        console.log(`🧹 Cleaned up ${removedFromItems + removedFromReleased} items from gachapon ${gachaponId}`);
    }

    // Generate unique ID untuk item
    generateItemId() {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get unique ID untuk gachapon
    getGachaponId(gachapon) {
        return `gachapon_${gachapon.position.x}_${gachapon.position.y}_${gachapon.position.z}`;
    }

    getItemsInGachapon(gachaponId) {
        return this.items.filter(item => item.gachaponId === gachaponId);
    }

    getReleasedItems() {
        return this.releasedItems;
    }

    getItemCountByGachapon(gachaponId) {
        return this.items.filter(item => item.gachaponId === gachaponId).length;
    }

    getTotalItemCount() {
        return this.items.length + this.releasedItems.length;
    }

    getPrizeAmount() {
        return this.prizeAmount;
    }

    getStats() {
        return {
            totalItems: this.getTotalItemCount(),
            prizeAmount: this.getPrizeAmount(),
            gachaponCount: new Set([...this.items, ...this.releasedItems].map(item => item.gachaponId)).size
        };
    }
}

// Utility function untuk membuat item manager
export function createGachaponItemManager(scene, world) {
    return new GachaponItemManager(scene, world);
}
