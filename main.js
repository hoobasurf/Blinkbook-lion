const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#scene'), antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);

// Charger le lion
const loader = new THREE.GLTFLoader();
let mixer;

loader.load('assets/lion.glb', (gltf) => {
    const lion = gltf.scene;
    scene.add(lion);

    // Appliquer la texture de l'enfant si tu veux
    // lion.traverse((child) => {
    //   if(child.isMesh){
    //       child.material.map = new THREE.TextureLoader().load('textures/child-drawing.png');
    //       child.material.needsUpdate = true;
    //   }
    // });

    mixer = new THREE.AnimationMixer(lion);
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });
}, undefined, console.error);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    if(mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
