import * as THREE from "three"; 
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; 
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
controls.enableDamping = true; 
controls.dampingFactor = 0.05; 
// Valores temporales - se actualizarán cuando cargue el modelo
controls.minDistance = 1;     
controls.maxDistance = 20;    

// --- Función para calcular límites de zoom --- 
function calculateZoomLimits(object) {
  // Crear bounding box del objeto
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  // Obtener la dimensión más grande del objeto
  const maxDimension = Math.max(size.x, size.y, size.z);
  
  // SOLUCIÓN 1: Aumentar significativamente la distancia mínima
  const minDistance = maxDimension * 0.8; // 80% del tamaño (más conservador)
  
  // Para objetos muy pequeños, establecer un mínimo absoluto
  const absoluteMinimum = 2.0;
  const finalMinDistance = Math.max(minDistance, absoluteMinimum);
  
  const maxDistance = maxDimension * 6; // Un poco más lejos también
  
  return { 
    minDistance: finalMinDistance, 
    maxDistance, 
    center,
    boundingSphere: box.getBoundingSphere(new THREE.Sphere()) // Para debug
  };
}

// --- Loader de GLTF --- 
let model; 
const loader = new GLTFLoader(); 
loader.load( 
  '/Interactive3D/models/scene.gltf',
  function (gltf) { 
    model = gltf.scene; 
    scene.add(model); 

    // Escala y posición inicial 
    model.scale.set(1, 1, 1); 
    model.position.set(0, 0, 0); 
    
    // Calcular y aplicar límites de zoom dinámicos
    const limits = calculateZoomLimits(model);
    
    // SOLUCIÓN 2: Configurar controles más restrictivos
    controls.minDistance = limits.minDistance;
    controls.maxDistance = limits.maxDistance;
    
    // SOLUCIÓN 3: Activar detección de colisiones
    controls.enablePan = true; // Permitir paneo
    controls.screenSpacePanning = false; // Paneo en espacio mundial
    
    // SOLUCIÓN 4: Limitar zoom con eventos personalizados
    controls.addEventListener('change', function() {
      // Verificar que la cámara no esté demasiado cerca
      const distance = camera.position.distanceTo(controls.target);
      if (distance < limits.minDistance) {
        // Si está demasiado cerca, empujar la cámara hacia atrás
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(limits.minDistance));
      }
    });
    
    // Opcional: centrar la cámara en el objeto
    controls.target.copy(limits.center);
    
    // Opcional: posicionar la cámara a una distancia óptima inicial
    const optimalDistance = limits.minDistance * 1.5; // Más conservador
    camera.position.set(optimalDistance, optimalDistance * 0.5, optimalDistance);
    
    controls.update(); // Actualizar controles
    
    console.log(`Límites de zoom calculados:
    - Distancia mínima: ${limits.minDistance.toFixed(2)}
    - Distancia máxima: ${limits.maxDistance.toFixed(2)}
    - Centro del objeto: (${limits.center.x.toFixed(2)}, ${limits.center.y.toFixed(2)}, ${limits.center.z.toFixed(2)})
    - Radio de bounding sphere: ${limits.boundingSphere.radius.toFixed(2)}`);
  }, 
  undefined, 
  function (error) { 
    console.error('Error cargando el modelo:', error); 
  } 
); 

// --- Animación --- 
function animate() { 
  requestAnimationFrame(animate); 
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