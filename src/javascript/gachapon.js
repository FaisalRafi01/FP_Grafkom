import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

export class Gachapon {
  constructor(scene, world, position = { x: 0, y: 0, z: 0 }, scale = 1.2) {
    this.scene = scene;
    this.world = world;
    this.position = position;
    this.scale = scale;
    this.prizeamount = 30;

    this.meshes = [];
    this.bodies = [];
    this.interactables = []; 
    this.isOpen = false;
    this.itemManager = null;

    console.log(`--- Gachapon constructor ---`);
    console.log(`Position: (${position.x}, ${position.y}, ${position.z}), Scale: ${scale}`);

    this.init();
  }

  init() {
    console.log(`Initializing Gachapon...`);
    this.createGachaponBase();
    this.createGachaponGlass();
    this.createGachaponLid();
    this.createColliders();
    this.createInteractButton();
    console.log(`Gachapon initialization complete.`);
  }

  createInteractButton() {
    console.log(`Creating interact button...`);
    const buttonGeometry = new THREE.BoxGeometry(
      1 * this.scale,
      0.5 * this.scale,
      0.25 * this.scale
    );
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x005577,
      metalness: 0.3,
      roughness: 0.4,
    });

    this.buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
    this.buttonMesh.position.set(
      this.position.x,
      this.position.y + 0.85 * this.scale,
      this.position.z + 1.05 * this.scale
    );
    this.scene.add(this.buttonMesh);
    this.meshes.push(this.buttonMesh);
    console.log(`Button mesh added at (${this.buttonMesh.position.x}, ${this.buttonMesh.position.y}, ${this.buttonMesh.position.z})`);

    // Teks “Click Me”
    const loader = new THREE.FontLoader();
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textGeo = new THREE.TextGeometry("Click Me", {
          font: font,
          size: 0.15 * this.scale,
          height: 0.05 * this.scale,
        });
        const textMat = new THREE.MeshStandardMaterial({
          color: 0x302D2B,
          emissive: 0x302D2B,
        });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        this.buttonMesh.add(textMesh);
        textMesh.position.set(
          -0.35 * this.scale,
          -0.1,
          0.1 * this.scale
        );
        console.log(`Button text added.`);
      }
    );
  }

  shuffleItems() {
    if (!this.itemManager) return;
    console.log(`Shuffling items in Gachapon...`);
    const gachaponId = this.itemManager.getGachaponId(this);
    const items = this.itemManager.getItemsInGachapon(gachaponId);
    if (!items) return;
    items.forEach((item) => {
      if (item.body) {
        item.body.applyImpulse(
          new CANNON.Vec3(
            (Math.random() - 0.5),
            Math.random(),
            (Math.random() - 0.5)
          ),
          item.body.position
        );
      }
    });
    console.log(`Items shuffled.`);
  }

  releaseRandomItem(itemManager) {
    if (!itemManager) return;
    console.log(`Releasing random item from Gachapon...`);
    const gachaponId = itemManager.getGachaponId(this);
    const items = itemManager.getItemsInGachapon(gachaponId);
    if (!items || items.length === 0) return;
    const randomIndex = Math.floor(Math.random() * items.length);
    const selected = items[randomIndex];

    if (selected.body) {
        selected.body.position.set(
            this.position.x,
            this.position.y + 3 * this.scale,
            this.position.z
        );
        selected.body.velocity.set(
            (Math.random() - 0.5) * 0.5,
            1 + Math.random() * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        selected.body.linearDamping = 0.3;
        selected.body.angularDamping = 0.3;
        console.log(`Item released at (${selected.body.position.x}, ${selected.body.position.y}, ${selected.body.position.z})`);
    }
  }

  createGachaponBase() {
    console.log(`Creating base and body...`);
    // Base
    const baseGeometry = new THREE.BoxGeometry(
      2 * this.scale,
      0.3 * this.scale,
      2 * this.scale
    );
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      metalness: 0.3,
      roughness: 0.7,
    });
    this.baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    this.baseMesh.position.set(
      this.position.x,
      this.position.y + 0.15 * this.scale,
      this.position.z
    );
    this.scene.add(this.baseMesh);
    this.meshes.push(this.baseMesh);
    console.log(`Base mesh added.`);

    // Body
    const bodyGeometry = new THREE.BoxGeometry(
      1.8 * this.scale,
      1.0 * this.scale,
      1.8 * this.scale
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc3333,
      metalness: 0.4,
      roughness: 0.6,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.bodyMesh.position.set(
      this.position.x,
      this.position.y + 0.8 * this.scale,
      this.position.z
    );
    this.scene.add(this.bodyMesh);
    this.meshes.push(this.bodyMesh);
    console.log(`Body mesh added.`);
  }

  createGachaponGlass() {
    console.log(`Creating glass...`);
    const glassGeometry = new THREE.BoxGeometry(
      1.6 * this.scale,
      1.5 * this.scale,
      1.6 * this.scale
    );
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1,
    });

    this.glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    this.glassMesh.position.set(
      this.position.x,
      this.position.y + 1.8 * this.scale,
      this.position.z
    );
    this.scene.add(this.glassMesh);
    this.meshes.push(this.glassMesh);
    console.log(`Glass mesh added.`);
  }

  createGachaponLid() {
    console.log(`Creating lid and knob...`);
    // Lid
    const lidGeometry = new THREE.BoxGeometry(
      1.8 * this.scale,
      0.2 * this.scale,
      1.8 * this.scale
    );
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6666,
      metalness: 0.5,
      roughness: 0.5,
    });
    this.lidMesh = new THREE.Mesh(lidGeometry, lidMaterial);
    this.lidMesh.position.set(
      this.position.x,
      this.position.y + 2.4 * this.scale,
      this.position.z
    );
    this.scene.add(this.lidMesh);
    this.meshes.push(this.lidMesh);
    console.log(`Lid mesh added.`);

    // Knob
    const knobGeometry = new THREE.SphereGeometry(0.15 * this.scale, 16, 16);
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
    });
    this.knobMesh = new THREE.Mesh(knobGeometry, knobMaterial);
    this.knobMesh.position.set(
      this.position.x,
      this.position.y + 2.55 * this.scale,
      this.position.z
    );
    this.scene.add(this.knobMesh);
    this.meshes.push(this.knobMesh);
    console.log(`Knob mesh added.`);
  }

  createGlassColliders() {
    console.log(`Creating glass colliders...`);
    const wallThickness = 0.05 * this.scale;
    const halfSize = 0.8 * this.scale;
    const height = 1.5 * this.scale;

    const walls = [
      { x: 0, y: 0, z: halfSize, size: [halfSize, height / 2, wallThickness] },
      { x: 0, y: 0, z: -halfSize, size: [halfSize, height / 2, wallThickness] },
      { x: -halfSize, y: 0, z: 0, size: [wallThickness, height / 2, halfSize] },
      { x: halfSize, y: 0, z: 0, size: [wallThickness, height / 2, halfSize] },
      { x: 0, y: -height / 2, z: 0, size: [halfSize, wallThickness, halfSize] },
      { x: 0, y: height / 2, z: 0, size: [halfSize, wallThickness, halfSize] },
    ];

    walls.forEach((w, i) => {
      const shape = new CANNON.Box(new CANNON.Vec3(...w.size));
      const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(
          this.position.x + w.x,
          this.position.y + 1.8 * this.scale + w.y,
          this.position.z + w.z
        ),
        shape: shape,
      });
      this.world.addBody(body);
      this.bodies.push(body);
      console.log(`Glass collider ${i} added at (${body.position.x}, ${body.position.y}, ${body.position.z})`);
    });
  }

  createColliders() {
    console.log(`Creating base, body, lid, knob colliders...`);
    // Base collider
    const baseShape = new CANNON.Box(
      new CANNON.Vec3(1 * this.scale, 0.15 * this.scale, 1 * this.scale)
    );
    const baseBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y + 0.15 * this.scale,
        this.position.z
      ),
      shape: baseShape,
    });
    this.world.addBody(baseBody);
    this.bodies.push(baseBody);
    console.log(`Base collider added.`);

    // Body collider
    const bodyShape = new CANNON.Box(
      new CANNON.Vec3(0.9 * this.scale, 0.5 * this.scale, 0.9 * this.scale)
    );
    const bodyBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y + 0.8 * this.scale,
        this.position.z
      ),
      shape: bodyShape,
    });
    this.world.addBody(bodyBody);
    this.bodies.push(bodyBody);
    console.log(`Body collider added.`);

    // Glass colliders
    this.createGlassColliders();

    // Lid collider
    const lidShape = new CANNON.Box(
      new CANNON.Vec3(0.9 * this.scale, 0.1 * this.scale, 0.9 * this.scale)
    );
    this.lidBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y + 2.4 * this.scale,
        this.position.z
      ),
      shape: lidShape,
    });
    this.world.addBody(this.lidBody);
    this.bodies.push(this.lidBody);
    console.log(`Lid collider added.`);

    // Knob collider
    const knobShape = new CANNON.Sphere(0.15 * this.scale);
    const knobBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y + 2.55 * this.scale,
        this.position.z
      ),
      shape: knobShape,
    });
    this.world.addBody(knobBody);
    this.bodies.push(knobBody);
    console.log(`Knob collider added.`);
  }

  update() {
    // Static bodies -> no update needed
  }

  cleanup() {
    console.log(`Cleaning up Gachapon...`);
    this.meshes.forEach((mesh) => this.scene.remove(mesh));
    this.bodies.forEach((body) => this.world.removeBody(body));
    this.meshes = [];
    this.bodies = [];
    console.log(`Gachapon cleaned up.`);
  }

  getGachaponData() {
    return {
      position: this.position,
      isOpen: this.isOpen,
      scale: this.scale,
      prizeAmount: this.prizeamount,
    };
  }

  getInternalVolume() {
    return {
      minX: this.position.x - 0.5 * this.scale,
      maxX: this.position.x + 0.5 * this.scale,
      minY: this.position.y + 1.5 * this.scale,
      maxY: this.position.y + 2 * this.scale,
      minZ: this.position.z - 0.8 * this.scale,
      maxZ: this.position.z + 0.8 * this.scale,
    };
  }
}

// Utility function
export function createGachapon(scene, world, position = { x: 0, y: 0, z: 0 }, scale = 1) {
  console.log(`createGachapon called at (${position.x}, ${position.y}, ${position.z}) with scale ${scale}`);
  const gachapon = new Gachapon(scene, world, position, scale);
  console.log(`Gachapon instance created.`);
  return gachapon;
}
