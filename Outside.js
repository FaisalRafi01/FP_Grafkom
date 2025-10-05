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

    // Pencahayaan
    const dirLightIntensity = 1;
    const ambientLightIntensity = 0.4;

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
    const dir = new THREE.DirectionalLight(0xffffff, dirLightIntensity);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambient);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(groundWidth, groundDepth);
    const groundMat = new THREE.MeshStandardMaterial({ color: groundColor });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.1;
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
