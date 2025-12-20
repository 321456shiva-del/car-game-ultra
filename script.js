import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
let car;
let score = 0;
let speed = 0.4;

let forward = false;
let left = false;
let right = false;

let engineSound;
let engineStarted = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(0, 4, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.add(sun);

  createGround();
  loadCar();
  createTrees();
  setupControls();
  setupSound();
}

function createGround() {
  const loader = new THREE.TextureLoader();

  const roadTex = loader.load("textures/road.jpg");
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(1, 100);

  const grassTex = loader.load("textures/grass.jpg");
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(50, 50);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 4000),
    new THREE.MeshStandardMaterial({ map: roadTex })
  );
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  scene.add(road);

  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 4000),
    new THREE.MeshStandardMaterial({ map: grassTex })
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.01;
  scene.add(grass);
}

function loadCar() {
  const loader = new GLTFLoader();
  loader.load(
    "models/supercar.glb",
    (gltf) => {
      car = gltf.scene;
      car.scale.set(1.2, 1.2, 1.2);
      car.rotation.y = Math.PI;
      car.position.y = 0.2;

      car.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      scene.add(car);
    },
    undefined,
    (err) => console.error("CAR LOAD ERROR", err)
  );
}

function createTrees() {
  for (let z = -2000; z < 2000; z += 30) {
    makeTree(-9, z);
    makeTree(9, z);
  }
}

function makeTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.set(x, 1, z);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  leaves.position.set(x, 2.5, z);

  scene.add(trunk);
  scene.add(leaves);
}

function setupControls() {
  window.addEventListener("keydown", e => {
    if (e.key === "w" || e.key === "ArrowUp") forward = true;
    if (e.key === "a" || e.key === "ArrowLeft") left = true;
    if (e.key === "d" || e.key === "ArrowRight") right = true;
  });

  window.addEventListener("keyup", e => {
    if (e.key === "w" || e.key === "ArrowUp") forward = false;
    if (e.key === "a" || e.key === "ArrowLeft") left = false;
    if (e.key === "d" || e.key === "ArrowRight") right = false;
  });
}

function setupSound() {
  engineSound = new Audio("sounds/engine.mp3");
  engineSound.loop = true;
  engineSound.volume = 0.5;

  window.addEventListener("click", () => {
    if (!engineStarted) {
      engineSound.play();
      engineStarted = true;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (car) {
    if (forward) {
      car.position.z -= speed;
      score++;
    }
    if (left) car.position.x -= 0.15;
    if (right) car.position.x += 0.15;

    const camOffset = new THREE.Vector3(0, 4, 10);
    const targetCam = car.position.clone().add(camOffset);
    camera.position.lerp(targetCam, 0.08);
    camera.lookAt(car.position);

    if (engineStarted) {
      engineSound.playbackRate = 1 + speed * 2;
    }
  }

  document.getElementById("score").innerText = score;
  renderer.render(scene, camera);
}
