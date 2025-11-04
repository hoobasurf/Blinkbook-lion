document.addEventListener('DOMContentLoaded', () => {

  // === THREE.JS SETUP ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 5);

  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  light.position.set(0, 20, 0);
  scene.add(light);

  let mixer, lion;

  // Charger le lion depuis /assets
  const loader = new THREE.GLTFLoader();
  loader.load('assets/lion.glb', (gltf) => {
    lion = gltf.scene;
    scene.add(lion);
    mixer = new THREE.AnimationMixer(lion);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  }, undefined, (err) => console.error(err));

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === BOUTONS ===
  const photoBtn = document.getElementById('photoBtn');
  const fileBtn = document.getElementById('fileBtn');
  const drawBtn = document.getElementById('drawBtn');
  const photoInput = document.getElementById('photoInput');
  const fileInput = document.getElementById('fileInput');
  const drawArea = document.getElementById('drawArea');
  const drawCanvas = document.getElementById('drawCanvas');
  const ctx = drawCanvas.getContext('2d');

  photoBtn.onclick = () => photoInput.click();
  fileBtn.onclick = () => fileInput.click();

  photoInput.onchange = handleImage;
  fileInput.onchange = handleImage;

  drawBtn.onclick = () => {
    drawArea.style.display = 'flex';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  };

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      const texture = new THREE.TextureLoader().load(event.target.result);
      applyTextureToLion(texture);
    };
    reader.readAsDataURL(file);
  }

  function applyTextureToLion(texture) {
    if (!lion) return;
    lion.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  }

  // === DESSIN ===
  let drawing = false;

  function resizeCanvas() {
    drawCanvas.width = drawCanvas.clientWidth;
    drawCanvas.height = drawCanvas.clientHeight;
  }
  resizeCanvas();

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
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff66b3';
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
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

  document.getElementById('validateDraw').onclick = () => {
    const dataURL = drawCanvas.toDataURL();
    const texture = new THREE.TextureLoader().load(dataURL);
    applyTextureToLion(texture);
    drawArea.style.display = 'none';
  };
  document.getElementById('clearDraw').onclick = () => {
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  };
});
