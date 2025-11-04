const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#scene'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 0);
scene.add(light);

let mixer, lion, currentTexture;

// Charger le lion animé
const loader = new THREE.GLTFLoader();
loader.load('lion.glb', (gltf) => {
  lion = gltf.scene;
  scene.add(lion);
  mixer = new THREE.AnimationMixer(lion);
  gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
}, undefined, console.error);

// Animation boucle
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}
animate();

// Adapter la taille à l’écran
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === 🎨 DESSIN SUR L'ÉCRAN ===
const drawCanvas = document.getElementById('drawCanvas');
const ctx = drawCanvas.getContext('2d');
let drawing = false;

function startDraw(e) {
  drawing = true;
  draw(e);
}
function endDraw() {
  drawing = false;
  ctx.beginPath();
}
function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#ff66b3';
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

drawCanvas.addEventListener('mousedown', startDraw);
drawCanvas.addEventListener('mouseup', endDraw);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('touchstart', startDraw);
drawCanvas.addEventListener('touchend', endDraw);
drawCanvas.addEventListener('touchmove', draw);

// === 📸 BOUTONS ===
const photoInput = document.getElementById('photoInput');
const fileInput = document.getElementById('fileInput');

document.getElementById('drawBtn').onclick = () => {
  drawCanvas.style.display = 'block';
};

document.getElementById('photoBtn').onclick = () => photoInput.click();
document.getElementById('fileBtn').onclick = () => fileInput.click();

photoInput.onchange = handleImage;
fileInput.onchange = handleImage;

// === 🧩 FONCTION : appliquer la texture ===
function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const texture = new THREE.TextureLoader().load(event.target.result);
    currentTexture = texture;
    applyTextureToLion(texture);
  };
  reader.readAsDataURL(file);
}

// === 🦁 appliquer une texture sur le lion ===
function applyTextureToLion(texture) {
  if (!lion) return;
  lion.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
}

// === 🖼️ Enregistrer le dessin et appliquer sur le lion ===
function finishDrawing() {
  const dataURL = drawCanvas.toDataURL();
  const texture = new THREE.TextureLoader().load(dataURL);
  applyTextureToLion(texture);
  drawCanvas.style.display = 'none';
}

drawCanvas.addEventListener('dblclick', finishDrawing);
