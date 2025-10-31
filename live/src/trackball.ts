import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { ViewportGizmo } from "../../lib/ViewportGizmo";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

// init

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// Add grid helper aligned with XY plane (since Z is up)
const gridHelper = new THREE.GridHelper(10, 10, 0x111111, 0x111111);
gridHelper.rotation.x = Math.PI / 2; // Rotate grid to align with XY plane
scene.add(gridHelper);

// Add an AxesHelper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

scene.add(new THREE.AmbientLight());
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(-3, 5, 5);
const directionalLight2 = new THREE.DirectionalLight();
directionalLight2.position.set(3, -5, 5);
scene.add(directionalLight, directionalLight2);

new GLTFLoader().loadAsync(`./models/cad/support_plate.gltf`).then((gltf) => {
  const model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 3 / maxDim;

  model.scale.set(scale, scale, scale);
  model.rotation.x = Math.PI / 2;
  model.rotation.y = Math.PI;

  scene.add(model);
});
//scene.add(cube);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// Init Gizmo with TrackballControls (verwende die erweiterte ViewportGizmo)
const controls = new TrackballControls(camera, renderer.domElement);

// Optional: Konfiguriere Trackball-Properties, basierend auf deinen früheren Einstellungen
controls.rotateSpeed = 1.0; // Beispielwerte – passe an deine TRACKBALL_*-Konstanten an
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;
controls.minDistance = 0.1; // Oder basierend auf deinem Code
controls.maxDistance = Infinity;

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

// animation
function animation() {
  controls.update(); // Für Trackball notwendig in jedem Frame
  renderer.render(scene, camera);
  gizmo.render();
}

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
};
