import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
let car;
let speed = 0.35;
let score = 0;

let moveForward = false;
let moveLeft = false;
let moveRight = false;

let engineSound;
let engineStarted = false;

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(0, 4, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.add(sun);

  createGround();
  loadCar();
  setupControls();
  setupSound();

  window.addEventListener("resize", onWindowResize);
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
        }
      });

      scene.add(car);
    },
    undefined,
    (err) => console.error("Car load error:", err)
  );
}

function setupControls() {
  window.addEventListener("keydown", e => {
    if (e.key === "w" || e.key === "ArrowUp") moveForward = true;
    if (e.key === "a" || e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "d" || e.key === "ArrowRight") moveRight = true;
  });

  window.addEventListener("keyup", e => {
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
      engineSound.play();
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
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(car.position);

    if (engineStarted) {
      engineSound.playbackRate = 1 + speed * 2;
    }
  }

  document.getElementById("score").innerText = score;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
