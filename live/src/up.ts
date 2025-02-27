import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "../../lib/ViewportGizmo";

// init

THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 5, 8);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// Add grid helper aligned with XY plane (since Z is up)
const gridHelper = new THREE.GridHelper(10, 10, 0x111111, 0x111111);
gridHelper.rotation.x = Math.PI / 2; // Rotate grid to align with XY plane
scene.add(gridHelper);

// Add axes helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// Add cube with MeshNormalMaterial
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
cube.position.z = 0.5; // Position the cube just above the grid
scene.add(cube);

const renderer = new THREE.WebGLRenderer({ antialias: true });
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
