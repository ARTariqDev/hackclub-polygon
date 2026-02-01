import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const ren = new THREE.WebGLRenderer();



ren.setSize(window.innerWidth, window.innerHeight);
ren.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(ren.domElement);


const texLoader = new THREE.TextureLoader();
texLoader.load('/bg.jpg', (tex) => {
  tex.encoding = THREE.sRGBEncoding;
  scene.background = tex;
}, undefined, (err) => {
  console.error('Failed to load background image', err);
});

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

const models = ['/models/freddy.glb','/models/bonnie.glb','/models/chica.glb','/models/foxy.glb', null];
const names = ['Freddy','Bonnie','Chica','Foxy', 'FNAF 2'];

const desc = [
  // descriptions are from https://freddy-fazbears-pizza.fandom.com/wiki/
  "Freddy Fazbear is the titular antagonist of the Five Nights at Freddy's series and the main of the four original animatronics of Freddy Fazbear's Pizza. Freddy is an animatronic bear and the star attraction of the original Freddy Fazbear's Pizza opened in 1983,[4] as well as the face and namesake of the company that owns it– Fazbear Entertainment. Freddy takes the role of lead singer and overall performer of the band, standing in the center of the stage. Undisclosed to Fazbear Entertainment and the public, Freddy is heavily implied to be possessed by the restless spirit of Gabriel – a little boy murdered by William Afton. Due to this, Freddy and his likewise possessed bandmates are now seeking revenge against their common killer by attacking any similar-looking adults in the pizzeria after hours in a blind rage, not knowing that they, the children, are being manipulated by William Afton. However, Freddy is evidently friendly towards children and seeks to save his and his friends own souls as well as any other children targeted by William Afton.", 
  "Bonnie the Rabbit is one of the four original animatronics of Freddy Fazbear's Pizza and a major antagonist in the Five Nights at Freddy's series. Bonnie is an animatronic rabbit and the guitarist in Freddy's band, positioned at the left side of the stage. Undisclosed to Fazbear Entertainment, Inc. and the public, Bonnie is heavily implied to be possessed by the restless spirit of Jeremy – a little boy murdered by William Afton. Due to this, he and the others are now seeking revenge against their killer by attacking any adults in the pizzeria after-hours in a blind rage. He was the guitarist when the first Freddy Fazbear's Pizza was opened in 1983,[1] though, just like Freddy, it is heavily implied that he had already existed as a character for many years, if not decades, prior to Freddy Fazbear's Pizza. In 1987, he and the original animatronics had all fallen into severe disrepair and were put under attempted retrofit before being replaced by his newer counterpart for the 'improved' Freddy Fazbear's Pizza, Toy Bonnie.[2] After the pizzeria's closing, he and the original animatronics were refurbished for the new pizzeria, as of the events of the first game. However, after the closure of the new pizzeria, he and the other animatronics got dismantled by their killer. His soul, along with the others, was presumably set free, as evidenced by the good ending.",
  'Chica the Chicken, also known as Chica, is one of the four original animatronics of Freddy Fazbears Pizza and a major antagonist in the Five Nights at Freddys series.Chica is an animatronic chicken and the backup singer in Freddys band, positioned at the right side of the stage. Undisclosed to Fazbear Entertainment, Inc. and the public, Chica is possessed by the restless spirit of Susie – a little girl murdered by William Afton. Due to this, she and the others are now seeking revenge against their killer by attacking any adults in the pizzeria after-hours in blind rage.',
  'Foxy the Pirate, also known as Foxy, is one of the four original animatronics of Freddy Fazbears Pizza and a major antagonist in the Five Nights at Freddys series. Foxy is a discontinued animatronic pirate fox entertainer. He resides at his own separate stage in the pizzeria. Undisclosed to Fazbear Entertainment, Inc. and the public, Foxy is possessed by the restless spirit of Fritz – a little boy murdered by William Afton. Due to this, he and the others are now seeking revenge against their killer by attacking any adults in the pizzeria after-hours in blind rage.',
  'These models (for the fnaf 2 anamatronics) were paid so I couldnt include them individually but thet were just so cool and well made that I HAD to include them (via an embed). Credit goes to VibaPop: https://skfb.ly/oTBJZ'
];

const jumpscares = [
  'https://www.youtube.com/embed/FUaaGInT_R8?autoplay=1',
  'https://www.youtube.com/embed/vVT2MUHRe_k?autoplay=1',
  'https://www.youtube.com/embed/FuxA-t-pIdk?autoplay=1',
  'https://www.youtube.com/embed/m0DQft9j3SY?autoplay=1',
  ''
];

const jumpscareDurations = [8000, 18000, 37000, 37000]; // video durations for each jumpscare, iframe closes automatically after jumpscare duration

const pissFreddyJumpscare = 'https://www.youtube.com/embed/3ez4-CY30fM?autoplay=1';
const pissFreddyDuration = 31000;


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

  const embedDiv = document.getElementById('sketchfab-container');
  if (embedDiv) embedDiv.style.display = 'none';
  if (ren.domElement) ren.domElement.style.display = 'block';

  let modelPath = models[current];
  let displayName = names[current];

  //10% chance for funni easter egg hehehehe
  const roll = Math.random();
  if (current === 0 && roll < 0.1) {
    displayName = 'Piss Freddy';
    modelPath = '/models/golden_freddy.glb';
  }

  if (modelPath === null) {
    if (ren.domElement) ren.domElement.style.display = 'none';
    if (embedDiv) embedDiv.style.display = 'block';
    const infoEl = document.getElementById('info');
    if (infoEl) {
      infoEl.textContent = 'Animatronic: ' + displayName;
    }
    const descEl = document.getElementById('content');
    if (descEl) {
      descEl.textContent = desc[current] || '';
      descEl.style.display = 'none';
    }
    return;
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
    const descEl = document.getElementById('content');
    if (descEl) {
      // :p
      if (displayName === 'Piss Freddy') {
        descEl.textContent = '( ͡° ͜ʖ ͡°) ';
      } else {
        descEl.textContent = desc[current] || '';
      }
      descEl.style.display = 'none';
    }

    cam.position.set(0, verticalOffset, Math.max(10, sph.radius * 3));
    cam.lookAt(0, verticalOffset, 0);
    ctrl.target.set(0, verticalOffset, 0);
    ctrl.update();

  }, undefined, function (error) {
    console.error(error);
  });
}


function showDesc() {
  const descEl = document.getElementById('content');
  const button = document.getElementById('showDesc');
  if (descEl && button) {
    if (descEl.style.display === 'none') {
      descEl.style.display = 'block';
      button.textContent = 'Hide Description';
    } else {
      descEl.style.display = 'none';
      button.textContent = 'Show Description';
    }
  }
}

const showDescBtn = document.getElementById('showDesc');
if (showDescBtn) showDescBtn.addEventListener('click', showDesc);

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

const jumpBtn = document.getElementById('jumpscare');
const jumpFrame = document.getElementById('jumpframe');
if (jumpBtn && jumpFrame) {
  jumpBtn.addEventListener('click', () => {
    const infoEl = document.getElementById('info');
    const isPiss = infoEl && infoEl.textContent.includes('Piss Freddy');
    const url = isPiss ? pissFreddyJumpscare : jumpscares[current];
    const duration = isPiss ? pissFreddyDuration : jumpscareDurations[current];
    
    if (!url || url === '') {
      jumpBtn.textContent = 'No Jumpscare Available'; // added this cuz of the fnaf 2 models
      setTimeout(() => jumpBtn.textContent = '▶', 2000);
      return;
    }
    
    jumpFrame.src = url;
    jumpFrame.style.display = 'block';
    setTimeout(() => {
      jumpFrame.style.display = 'none';
      jumpFrame.src = '';
    }, duration);  });
}

if (jumpFrame) {
  jumpFrame.addEventListener('click', () => {
    jumpFrame.style.display = 'none';
    jumpFrame.src = '';
  });
}


document.addEventListener('keydown', function(event) {
    console.log('Key pressed: ' + event.key);
    if (event.key === 'ArrowRight' || event.key === "d") {
        current = (current + 1) % models.length;
        loadModel();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'a') {
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


