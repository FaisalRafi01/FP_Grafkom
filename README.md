# FP Grafkom

Perkenalkan kami:

1. Azhar Hafic Andanianto (5025231118)
2. Muhammad Faisal Rafi (5025231295)
3. Muhammad Abdul Rafi (5025231093)

Berikut adalah Final Project kami dalam mengimplementasikan konsep Grafika Komputer. Kami mengambil tema luar angkasa, memasukkan berbagai benda 3D dan dan meletakkannya di atas pedestal lalu memberikan rotasi dan lighting berbeda, serta mensimulasikan ruangan dengan gravtiasi dan view yang berbeda. Dengan menggunakan Three.js dan Cannon.js, kami mensimulasikan gravitasi, pencahayaan, dan rotasi objek untuk membuat render yang tekesan 3D.


## How to run:

- Open `index.html` using "Live Server" extension.

OR

1. Use ``python -m http.server 8000`` on this folder
2. Open `http://localhost:8000/` on browser


## Fungsi Tiap script

1. `camera.js` Sebagai pengendali kamera dan "Player" Object
2. `index.html` dan `style.css` UI pada POV player dan pondasi utama
3. `Inside.js` dan `Outsude.js` Create 3D eviroment ruangan didalam/diluar
4. `main.js` Logic handler dari tiap interaksi antar script (e.g Door)
5. `pedestal_item.js` Pembuatan objek untuk inside.js
