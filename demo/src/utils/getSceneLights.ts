import { AmbientLight, Group, PointLight, Scene } from "three";

export const getSceneLights = (scene: Scene) => {
  const lightGroup = new Group();

  const color = 0x999999;
  const pointLight1 = new PointLight(color, 100);
  const pointLight2 = new PointLight(color, 100);
  const pointLight3 = new PointLight(color, 100);

  pointLight1.position.set(-4, 3, 0);
  pointLight2.position.set(4, 3, 0);
  pointLight3.position.set(0, 3, 4);

  lightGroup.add(pointLight1, pointLight2, pointLight3);

  const ambientLight = new AmbientLight(0x000000, 100);
  scene.add(ambientLight, lightGroup);

  return lightGroup;
};
