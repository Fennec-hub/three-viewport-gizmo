import {
  Group,
  Mesh,
  PMREMGenerator,
  AmbientLight,
  PointLight,
  Clock,
  MeshPhysicalMaterial,
  DoubleSide,
  SphereGeometry,
  OctahedronGeometry,
  ConeGeometry,
  CineonToneMapping,
  Color,
  GridHelper,
} from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const ROOT = "../../assets/three-viewport-gizmo";

export const loadThreeModel = (scene, renderer) => {
  const threeModel = new Group();
  scene.add(threeModel);

  // Material
  const material = new MeshPhysicalMaterial({
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
  new GLTFLoader()
    .loadAsync(`${ROOT}/models/three/scene.gltf`)
    .then((gltf) => {
      const threeLogo = gltf.scene;

      const mesh = threeLogo.getObjectByName("Object_5");
      mesh.geometry.center();

      mesh.scale.set(0.05, 0.05, 0.075);
      mesh.position.set(0, 3, 0);

      mesh.material = material;

      threeModel.add(mesh);
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  // "Three.js" text
  new FontLoader()
    .loadAsync(`${ROOT}/fonts/Roboto_Regular.json`)
    .then((font) => {
      const geometry = new TextGeometry("Three.js", {
        font: font,
        size: 80,
        depth: 30,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).center();

      const textMesh = new Mesh(geometry, material);
      textMesh.scale.setScalar(0.01);
      textMesh.position.set(1.75, 0.75, 0);

      threeModel.add(textMesh);
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  // GridHelper
  threeModel.add(new GridHelper(10, 10, 0x111111, 0x111111));

  // Lights
  const lightGroup = new Group();

  const color = 0x999999;
  const pointLight1 = new PointLight(color, 100);
  const pointLight2 = new PointLight(color, 100);
  const pointLight3 = new PointLight(color, 100);

  pointLight1.position.set(-4, 3, 0);
  pointLight2.position.set(4, 3, 0);
  pointLight3.position.set(0, 3, 4);

  lightGroup.add(pointLight1, pointLight2, pointLight3);
  threeModel.add(lightGroup, new AmbientLight(0x000000, 100));

  // Environment
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const loader = new RGBELoader();
  loader.load(`${ROOT}/HDR/studio_small_04_1k.hdr`, (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = envMap;
    scene.background = new Color(0x333333);
    renderer.toneMapping = CineonToneMapping;

    texture.dispose();
    pmremGenerator.dispose();
  });

  // Primitives
  const sphere = new Mesh(new SphereGeometry(0.5, 100, 100), material);
  sphere.position.set(4, 2.5, 0);

  const octahedron = new Mesh(new OctahedronGeometry(0.5), material);
  octahedron.position.set(1, 6, 0);
  octahedron.rotation.z = Math.PI / 4;

  const cone = new Mesh(new ConeGeometry(0.5, 1.5), material);
  cone.position.set(-4, 2, 0);
  cone.rotation.z = -Math.PI / 6;

  threeModel.add(sphere, octahedron, cone);

  const clock = new Clock();
  function threeModelAnimation() {
    const time = clock.getElapsedTime();

    // Rotation
    lightGroup.rotation.y += 0.01;
    octahedron.rotation.y += 0.01;
    cone.rotation.y += 0.01;

    // Float
    sphere.position.y = 2.5 + Math.cos(time + 2) * 0.25;
    octahedron.position.y = 6 + Math.cos(time + 1) * 0.2;
    cone.position.y = 2 + Math.cos(time) * 0.3;
  }

  // Dom Credit
  document.body.appendChild(
    Object.assign(document.createElement("div"), {
      style:
        "position:absolute;bottom:1em;left:1em;z-index:1000;font:13px sans-serif;color:#111;",
      innerHTML:
        'Thanks to <a href="https://sketchfab.com/mevedia" style="color:#fff;text-decoration:none;">Fyrestar</a>, for the <a href="https://sketchfab.com/3d-models/threejs-60320862bf904b7ab0e032c27daf7c7c" style="color:#fff;text-decoration:none;">Three.js 3D logo</a>',
    })
  );

  return [threeModel, threeModelAnimation];
};
