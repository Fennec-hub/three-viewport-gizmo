import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "../../lib/ViewportGizmo";

// init

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 8);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// grid helper
const gridHelper = new THREE.GridHelper(10, 10, 0x111111, 0x111111);
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);

// Cube mesh
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
cube.position.z = 0.5;
scene.add(cube);

const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// Init Gizmo with OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

// animation
function animation() {
  renderer.render(scene, camera);
  gizmo.render();
}

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
};
