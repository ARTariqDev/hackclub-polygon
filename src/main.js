import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const ren = new THREE.WebGLRenderer();



ren.setSize(window.innerWidth, window.innerHeight);
ren.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(ren.domElement);


scene.background = new THREE.Color(0x000000);

const amb = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(amb);

const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(10, 10, 10);
scene.add(dir);


const cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
cam.position.set(0, 0, 100);
cam.lookAt(0, 0, 0);
const ctrl = new OrbitControls(cam, ren.domElement);
ctrl.enableDamping = true;
ctrl.dampingFactor = 0.1;
ctrl.target.set(0, 0, 0);
ctrl.update();

const clock = new THREE.Clock();
const modelSpinSpeed = 0.6; // radians per second, rotates model around its Y axis




const ldr = new GLTFLoader();

const models = ['/models/freddy.glb','/models/bonnie.glb','/models/chica.glb','/models/foxy.glb'];
const names = ['Freddy','Bonnie','Chica','Foxy'];
const desc = [
  "Freddy Fazbear is the titular antagonist of the Five Nights at Freddy's series and the main of the four original animatronics of Freddy Fazbear's Pizza. Freddy is an animatronic bear and the star attraction of the original Freddy Fazbear's Pizza opened in 1983,[4] as well as the face and namesake of the company that owns it– Fazbear Entertainment. Freddy takes the role of lead singer and overall performer of the band, standing in the center of the stage. Undisclosed to Fazbear Entertainment and the public, Freddy is heavily implied to be possessed by the restless spirit of Gabriel – a little boy murdered by William Afton. Due to this, Freddy and his likewise possessed bandmates are now seeking revenge against their common killer by attacking any similar-looking adults in the pizzeria after hours in a blind rage, not knowing that they, the children, are being manipulated by William Afton. However, Freddy is evidently friendly towards children and seeks to save his and his friends own souls as well as any other children targeted by William Afton.", 
  "Bonnie the Rabbit is one of the four original animatronics of Freddy Fazbear's Pizza and a major antagonist in the Five Nights at Freddy's series. Bonnie is an animatronic rabbit and the guitarist in Freddy's band, positioned at the left side of the stage. Undisclosed to Fazbear Entertainment, Inc. and the public, Bonnie is heavily implied to be possessed by the restless spirit of Jeremy – a little boy murdered by William Afton. Due to this, he and the others are now seeking revenge against their killer by attacking any adults in the pizzeria after-hours in a blind rage. He was the guitarist when the first Freddy Fazbear's Pizza was opened in 1983,[1] though, just like Freddy, it is heavily implied that he had already existed as a character for many years, if not decades, prior to Freddy Fazbear's Pizza. In 1987, he and the original animatronics had all fallen into severe disrepair and were put under attempted retrofit before being replaced by his newer counterpart for the 'improved' Freddy Fazbear's Pizza, Toy Bonnie.[2] After the pizzeria's closing, he and the original animatronics were refurbished for the new pizzeria, as of the events of the first game. However, after the closure of the new pizzeria, he and the other animatronics got dismantled by their killer. His soul, along with the others, was presumably set free, as evidenced by the good ending.",
  'Description for Chica',
  'Description for Foxy'
];


let current = 0; // will use same pointer for both arrays cuz same length and order
let activeModel = null;

function loadModel() {
  const idx = current;
  if (activeModel) {
    scene.remove(activeModel);
    activeModel.traverse((c) => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose && m.dispose());
        else if (c.material) c.material.dispose && c.material.dispose();
      }
    });
    activeModel = null;
  }

  let modelPath = models[current];
  let displayName = names[current];

  //10% chance for funni easter egg hehehehe
  if (current === 0 && Math.random() < 0.1) {
    displayName = 'Piss Freddy';
    modelPath = '/models/golden_freddy.glb';
  }

  ldr.load(modelPath, function (gltf) {
    gltf.scene.updateMatrixWorld();

    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const ctr = bbox.getCenter(new THREE.Vector3());
    const sz = bbox.getSize(new THREE.Vector3());
    const maxD = Math.max(sz.x, sz.y, sz.z);

    gltf.scene.position.sub(ctr);

    if (maxD > 0) {
      const scale = 100 / maxD;
      gltf.scene.scale.setScalar(scale);
    }

    const bbox2 = new THREE.Box3().setFromObject(gltf.scene);
    const sph = bbox2.getBoundingSphere(new THREE.Sphere());

    //basically keeps model above description text (by using an offset)
    const verticalOffset = sph.radius * 0.5;
    gltf.scene.position.y += verticalOffset;

    scene.add(gltf.scene);
    activeModel = gltf.scene;

    const infoEl = document.getElementById('info');
    if (infoEl) {
      infoEl.textContent = 'Animatronic: ' + displayName;
    }
    const descEl = document.getElementById('description');
    if (descEl) {
      // :p
      if (displayName === 'Piss Freddy') {
        descEl.textContent = '( ͡° ͜ʖ ͡°) ';
      } else {
        descEl.textContent = desc[current] || '';
      }
    }

    cam.position.set(0, verticalOffset, Math.max(10, sph.radius * 3));
    cam.lookAt(0, verticalOffset, 0);
    ctrl.target.set(0, verticalOffset, 0);
    ctrl.update();

  }, undefined, function (error) {
    console.error(error);
  });
}

const nextBtn = document.getElementById('next');
if (nextBtn) nextBtn.addEventListener('click', () => {
  current = (current + 1) % models.length;
  loadModel();
  console.log("click")
});

const prevBtn = document.getElementById('prev');
if (prevBtn) prevBtn.addEventListener('click', () => {
  current = (current - 1 + models.length) % models.length;
  loadModel();
});


document.addEventListener('keydown', function(event) {
    console.log('Key pressed: ' + event.key);
    // You can also check for specific keys, e.g., the "Enter" key
    if (event.key === 'ArrowRight') {
        current = (current + 1) % models.length;
        loadModel();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      current = (current -1 + models.length) % models.length;
      loadModel();
    }
})

loadModel();


function animate() {
  const dt = clock.getDelta();
  ctrl.update();

  if (activeModel) activeModel.rotation.y += modelSpinSpeed * dt; // spins it (cuz stationary models are boring)

  ren.render(scene, cam);

}
ren.setAnimationLoop(animate);

// window resize go brrrrrr :p
window.addEventListener('resize', () => {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(window.innerWidth, window.innerHeight);
  ren.setPixelRatio(window.devicePixelRatio);
});

window.getIds = () => ({});


