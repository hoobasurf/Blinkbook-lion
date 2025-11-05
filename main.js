// Sélecteurs
const viewer = document.getElementById("viewer");
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

// Création de la scène
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
viewer.appendChild(renderer.domElement);

// Lumière
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// Chargement du modèle
let mixer;
const loader = new THREE.GLTFLoader();
loader.load(
  "assets/lion.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  },
  undefined,
  (error) => console.error("Erreur de chargement :", error)
);

// Animation
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);
  renderer.render(scene, camera);
}
animate();

// 🎨 Gestion des boutons
document.getElementById("photoBtn").addEventListener("click", () => {
  alert("📸 Fonction photo à venir !");
});
document.getElementById("fileBtn").addEventListener("click", () => {
  alert("🖼️ Import d'image à venir !");
});
document.getElementById("drawBtn").addEventListener("click", startDrawing);

// 🖌️ Dessin sur canvas
let drawing = false;

function startDrawing() {
  canvas.classList.remove("hidden");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
}

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
});

canvas.addEventListener("pointerup", () => (drawing = false));
