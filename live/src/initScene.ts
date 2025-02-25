import {
  CineonToneMapping,
  Clock,
  Color,
  ConeGeometry,
  DoubleSide,
  GridHelper,
  Mesh,
  MeshPhysicalMaterial,
  NoToneMapping,
  Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { ViewportGizmo } from "@lib/ViewportGizmo";
import { loadModel } from "./utils/loadModel";
import { setSceneLights } from "./utils/getSceneLights";
import { loadEnvMap } from "./utils/loadEnvMap";
import { get3DText } from "./utils/get3DText";
import { cubeDarkTheme } from "./constant";

let viewportGizmo: ViewportGizmo;

//Object3D.DEFAULT_UP = new Vector3(1, 0, 0);

export function initScene(
  initControlsCallback?: (
    camera: PerspectiveCamera,
    viewportGizmo: ViewportGizmo
  ) => void,
  animateControlsCallBack?: () => void,
  resizeControlsCallback?: () => void,
  modelLoadedControlsCallback?: (model: Object3D) => void
) {
  const isSphere = false;
  const container = document.querySelector<HTMLElement>("#app")!;

  const clock = new Clock();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 5, 8);
  const scene = new Scene();
  scene.background = new Color(0x333333);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  container.appendChild(renderer.domElement);

  // GridHelper
  scene.add(new GridHelper(10, 10, 0x111111, 0x111111));

  // Lights and Environment
  const lights = setSceneLights(scene);
  loadEnvMap({
    path: "studio_small_04_1k.hdr",
    renderer,
    scene,
    toneMapping: CineonToneMapping,
  });

  // Viewport Gizmo
  viewportGizmo = new ViewportGizmo(camera, renderer, {
    x: { opacity: 0 },
    ...(isSphere ? { type: "sphere" } : cubeDarkTheme),
  });

  initControlsCallback?.(camera, viewportGizmo);

  const darkGlassMaterial = new MeshPhysicalMaterial({
    color: 0,
    transparent: true,
    side: DoubleSide,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1,
    transmission: 0,
    opacity: 0.5,
    reflectivity: 1,
    ior: 2.33,
    iridescence: 0.2,
    iridescenceIOR: 0.5,
    sheen: 2,
    sheenRoughness: 0.5,
    specularIntensity: 1,
  });

  /**
   * Three.js logo
   * By: [Fyrestar](https://sketchfab.com/mevedia)
   * Link: https://sketchfab.com/3d-models/threejs-60320862bf904b7ab0e032c27daf7c7c
   * License: CC BY 4.0 DEED, http://creativecommons.org/licenses/by/4.0/
   */
  loadModel("three/scene.gltf").then((threeLogo) => {
    if (!threeLogo) return;

    const mesh = threeLogo.getObjectByName("Object_5") as Mesh;
    mesh.geometry.center();

    mesh.scale.set(0.05, 0.05, 0.075);
    mesh.position.set(0, 3, 0);

    mesh.material = darkGlassMaterial;

    scene.add(mesh);

    camera.lookAt(mesh.position);

    viewportGizmo.target.copy(mesh.position);

    modelLoadedControlsCallback?.(mesh);
    viewportGizmo.update();
  });

  get3DText("Three.js", "Roboto_Regular", darkGlassMaterial).then((text) => {
    if (!text) return;

    text.scale.setScalar(0.01);
    text.position.set(1.75, 0.75, 0);

    scene.add(text);
  });

  // Primitives
  const sphere = new Mesh(new SphereGeometry(0.5, 100, 100), darkGlassMaterial);
  sphere.position.set(4, 2.5, 0);

  const octahedron = new Mesh(new OctahedronGeometry(0.5), darkGlassMaterial);
  octahedron.position.set(1, 6, 0);
  octahedron.rotation.z = Math.PI / 4;

  const cone = new Mesh(new ConeGeometry(0.5, 1.5), darkGlassMaterial);
  cone.position.set(-4, 2, 0);
  cone.rotation.z = -Math.PI / 6;

  scene.add(sphere, octahedron, cone);

  function animation() {
    const time = clock.getElapsedTime();

    // Rotation
    lights.rotation.y += 0.01;
    octahedron.rotation.y += 0.01;
    cone.rotation.y += 0.01;

    // Float
    sphere.position.y = 2.5 + Math.cos(time + 2) * 0.25;
    octahedron.position.y = 6 + Math.cos(time + 1) * 0.2;
    cone.position.y = 2 + Math.cos(time) * 0.3;

    renderer.render(scene, camera);

    const toneMapping = renderer.toneMapping;
    renderer.toneMapping = NoToneMapping;
    viewportGizmo.render();

    renderer.toneMapping = toneMapping;

    animateControlsCallBack?.();
  }

  window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    viewportGizmo.update();
    resizeControlsCallback?.();
  };
}
