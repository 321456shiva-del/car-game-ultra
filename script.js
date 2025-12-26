import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
let car = null;

let moveForward = false;
let moveLeft = false;
let moveRight = false;

let speed = 0.25;
let score = 0;

let engineSound;
let engineStarted = false;

init();
animate();

function init() {
  // SCENE
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // CAMERA
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(0, 4, 10);

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // LIGHTS
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.add(sun);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 5000),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  loadCar();
  setupControls();
  setupSound();

  window.addEventListener("resize", onResize);
}

function loadCar() {
  const loader = new GLTFLoader();

  loader.load(
    "models/supercar.glb",
    (gltf) => {
      car = gltf.scene;
      car.scale.set(0.8, 0.8, 0.8);
      car.position.set(0, 0.3, 0);
      car.rotation.y = Math.PI;

      car.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
        }
      });

      scene.add(car);
      console.log("✅ GLB car loaded");
    },
    undefined,
    (error) => {
      console.warn("❌ GLB failed — using box car", error);
      createBoxCar();
    }
  );
}

function createBoxCar() {
  const geometry = new THREE.BoxGeometry(1.8, 0.6, 3.5);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  car = new THREE.Mesh(geometry, material);
  car.position.set(0, 0.3, 0);
  car.castShadow = true;
  scene.add(car);
}

function setupControls() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") moveForward = true;
    if (e.key === "a" || e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "d" || e.key === "ArrowRight") moveRight = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") moveForward = false;
    if (e.key === "a" || e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "d" || e.key === "ArrowRight") moveRight = false;
  });
}

function setupSound() {
  engineSound = new Audio("sounds/engine.mp3");
  engineSound.loop = true;
  engineSound.volume = 0.5;

  window.addEventListener("click", () => {
    if (!engineStarted) {
      engineSound.play().catch(() => {});
      engineStarted = true;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (car) {
    if (moveForward) {
      car.position.z -= speed;
      score++;
    }
    if (moveLeft) car.position.x -= 0.15;
    if (moveRight) car.position.x += 0.15;

    const camTarget = car.position.clone().add(new THREE.Vector3(0, 4, 10));
    camera.position.lerp(camTarget, 0.1);
    camera.lookAt(car.position);

    if (engineStarted) {
      engineSound.playbackRate = 1 + speed * 2;
    }
  }

  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = score;

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
