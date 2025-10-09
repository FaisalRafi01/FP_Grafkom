import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export function createRoom() {

    // ================================
    // Variables
    // ================================
    
    //Scaler
    const scale = 2;
    // Ukuran lantai
    const groundWidth = 200;
    const groundDepth = 200;
    const groundColor = 0x228B22;

    // Control Variables
    const repeatX = 128, repeatY = 128;

    // Ukuran rumah (persegi panjang)
    const rumahPanjang = 6*scale;
    const rumahLebar = 4*scale;
    const rumahTinggi = 3*scale;
    const warnaDinding = 0xffcc99;

    // Ukuran atap (prisma segitiga)
    const atapLebar = rumahLebar + 0.2*scale;
    const atapPanjang = rumahPanjang + 0.2*scale;
    const atapTinggi = 2*scale;
    const warnaAtap = 0xaa3333;

    // Posisi rumah
    const rumahPosX = 0;
    const rumahPosY = rumahTinggi / 2;
    const rumahPosZ = -5;

    // Variabel Pintu 
    const pintuLebar = 1*scale;
    const pintuTinggi = 2*scale;
    const pintuWarna = 0x8b4513;
    const pintuPosX = rumahPosX; 
    const pintuPosY = pintuTinggi / 2;
    const pintuPosZ = rumahPosZ + rumahLebar / 2 + 0.01; // sedikit keluar dari dinding depan

    // Variabel Kaca (jendela) 
    const kacaLebar = 1.2*scale;
    const kacaTinggi = 1*scale;
    const kacaWarna = 0x87ceeb;
    const kacaPosX = rumahPosX - rumahPanjang / 3;
    const kacaPosY = rumahTinggi / 1.5;
    const kacaPosZ = rumahPosZ + rumahLebar / 2 + 0.01;


    // ================================
    // Scene setup
    // ================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // Directional light
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(50, 50, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(4096, 4096);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 100;
    dir.shadow.camera.left = -50;
    dir.shadow.camera.right = 50;
    dir.shadow.camera.top = 50;
    dir.shadow.camera.bottom = -50;

    scene.add(dir);
    
    const lightHelper = new THREE.DirectionalLightHelper(dir, 5);
    scene.add(lightHelper);

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Texture
    const loaderTexture = new THREE.TextureLoader();

    const groundTexture = loaderTexture.load('assets/texture/Stone-tile.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(repeatX, repeatY);

    // Environment map
    const loaderEnv = new THREE.CubeTextureLoader();
    const cubeMap = loaderEnv.load([
        './assets/skybox/Sky/Cubemap_Sky_bk.png',
        './assets/skybox/Sky/Cubemap_Sky_ft.png',
        './assets/skybox/Sky/Cubemap_Sky_up.png',
        './assets/skybox/Sky/Cubemap_Sky_dn.png',
        './assets/skybox/Sky/Cubemap_Sky_rt.png',
        './assets/skybox/Sky/Cubemap_Sky_lf.png'
    ]);
    scene.background = cubeMap;

    // Ground plane
    const ground = new THREE.Mesh (
        new THREE.PlaneGeometry(groundWidth, groundDepth),
        new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = 0;
    scene.add(ground);

    // ================================
    // Membuat Rumah
    // ================================

    // ========== Dinding (persegi panjang) ==========
    const bodyGeo = new THREE.BoxGeometry(rumahPanjang, rumahTinggi, rumahLebar);
    const bodyMat = new THREE.MeshStandardMaterial({color: warnaDinding,
                                                    side: THREE.DoubleSide});     
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(rumahPosX, rumahPosY, rumahPosZ);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);

    // Outline dinding
    const bodyEdges = new THREE.EdgesGeometry(bodyGeo);
    const bodyOutline = new THREE.LineSegments(
        bodyEdges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    bodyOutline.position.copy(body.position);
    scene.add(bodyOutline);

    // ========== Atap (prisma segitiga) ==========
    const atapShape = new THREE.Shape();
    atapShape.moveTo(-atapPanjang / 2, 0);
    atapShape.lineTo(0, atapTinggi);
    atapShape.lineTo(atapPanjang / 2, 0);
    atapShape.lineTo(-atapPanjang / 2, 0);

    const extrudeSettings = {
        steps: 1,
        depth: atapLebar,
        bevelEnabled: false
    };

    const atapGeo = new THREE.ExtrudeGeometry(atapShape, extrudeSettings);
    const atapMat = new THREE.MeshStandardMaterial({ color: warnaAtap });
    const atap = new THREE.Mesh(atapGeo, atapMat);
    atap.position.set(rumahPosX, rumahPosY + rumahTinggi / 2, rumahPosZ - atapLebar / 2);
    atap.castShadow = true;
    atap.receiveShadow = true;
    scene.add(atap);

    // Outline atap
    const atapEdges = new THREE.EdgesGeometry(atapGeo);
    const atapOutline = new THREE.LineSegments(
        atapEdges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    atapOutline.position.copy(atap.position);
    scene.add(atapOutline);

    // ========== Pintu ==========
    const pintuGeo = new THREE.BoxGeometry(pintuLebar, pintuTinggi, 0.1);
    const pintuMat = new THREE.MeshStandardMaterial({ color: pintuWarna });
    const pintu = new THREE.Mesh(pintuGeo, pintuMat);
    pintu.position.set(pintuPosX, pintuPosY, pintuPosZ);
    pintu.name = "door";
    pintu.castShadow = true;
    scene.add(pintu);

    // Outline pintu
    const pintuEdges = new THREE.EdgesGeometry(pintuGeo);
    const pintuOutline = new THREE.LineSegments(
        pintuEdges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    pintuOutline.position.copy(pintu.position);
    scene.add(pintuOutline);

    // ========== Kaca ==========
    const kacaGeo = new THREE.BoxGeometry(kacaLebar, kacaTinggi, 0.05);
    const kacaMat = new THREE.MeshStandardMaterial({ color: kacaWarna, transparent: true, opacity: 0.7 });
    const kaca = new THREE.Mesh(kacaGeo, kacaMat);
    kaca.position.set(kacaPosX, kacaPosY, kacaPosZ);
    kaca.castShadow = true;
    scene.add(kaca);

    // Outline kaca
    const kacaEdges = new THREE.EdgesGeometry(kacaGeo);
    const kacaOutline = new THREE.LineSegments(
        kacaEdges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    kacaOutline.position.copy(kaca.position);
    scene.add(kacaOutline);

    return {scene,pintu};
}
