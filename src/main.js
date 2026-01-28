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




const ldr = new GLTFLoader();

const models = ['/models/freddy.glb','/models/bonnie.glb','/models/chica.glb', '/models/foxy.glb','/models/golden_freddy.glb'];
const names = ['Freddy','Bonnie','Chica', 'Foxy', 'Golden Freddy']
const current = 0; //will use same pointer for both arrays cuz same length

ldr.load(models[current], function (gltf) {
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

  // recompute bbox after transforms so camera frames model correctly
  const bbox2 = new THREE.Box3().setFromObject(gltf.scene);
  const sph = bbox2.getBoundingSphere(new THREE.Sphere());

  scene.add(gltf.scene);

  cam.position.set(0, sph.radius * 3, sph.radius * 3);
  cam.lookAt(0, 0, 0);

}, undefined, function (error) {
  console.error(error);
});


function animate() {
  ctrl.update();

  ren.render(scene, cam);

  console.log(cam.position.x, cam.position.y, cam.position.z);
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


