import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // <--- importamos controles

// --- Escena ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// --- Cámara ---
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Luz ---
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// --- Controles de usuario ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // suaviza la interacción
controls.dampingFactor = 0.05;
controls.minDistance = 1;     // zoom mínimo
controls.maxDistance = 20;    // zoom máximo

// --- Loader de GLTF ---
let model; // hacemos la variable global para poder manipularlo
const loader = new GLTFLoader();
loader.load(
  '/src/assets/models/scene.gltf', // ruta de tu modelo
  function (gltf) {
    model = gltf.scene;
    scene.add(model);

    // Escala y posición inicial
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
  },
  undefined,
  function (error) {
    console.error('Error cargando el modelo:', error);
  }
);

// --- Animación ---
function animate() {
  requestAnimationFrame(animate);

  // Actualiza controles
  controls.update();

  renderer.render(scene, camera);
}

animate();

// --- Ajuste al redimensionar ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
