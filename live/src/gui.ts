import { updateViewportGizmo } from "./configuration";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GizmoAxisOptions, GizmoOptions } from "@lib/types";
import { GIZMO_AXES } from "@lib/utils/constants";

export const initGUI = () => {
  const gui = new GUI();

  const options: Omit<
    Required<GizmoOptions>,
    "container" | "id" | "className"
  > = {
    placement: "center-center",
    size: parseInt(`${Math.min(window.innerWidth, window.innerHeight) * 0.8}`),
    animated: true,
    speed: 1,
    lineWidth: 20,
    offset: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    font: {
      family: "helvetica",
      weight: 900,
    },
    resolution: 64,
    sphere: {
      enabled: true,
      color: 0xffffff,
      opacity: 0,
      hoverColor: 0xffffff,
      hoverOpacity: 0.2,
    },
    x: {
      text: "X",
      line: true,
      border: false,
      circle: true,
      colors: {
        main: "#ff3653",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    y: {
      text: "Y",
      line: true,
      border: false,
      circle: false,
      colors: {
        main: "#8adb00",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    z: {
      text: "Z",
      line: true,
      border: false,
      circle: true,
      colors: {
        main: "#2c8fff",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    nx: {
      text: "",
      line: false,
      border: false,
      circle: true,
      colors: {
        main: "#ff3653",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    ny: {
      text: "",
      line: false,
      border: false,
      circle: true,
      colors: {
        main: "#8adb00",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    nz: {
      text: "",
      line: false,
      border: false,
      circle: true,
      colors: {
        main: "#2c8fff",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
  };

  const sceneOptions = {
    background: "#333333",
    grid: true,
  };

  const scene = gui.addFolder("Scene");
  scene.addColor(sceneOptions, "background");
  scene.add(sceneOptions, "grid");

  gui.add(options, "placement", [
    "top-left",
    "top-right",
    "top-center",
    "center-right",
    "center-left",
    "center-center",
    "bottom-left",
    "bottom-right",
    "bottom-center",
  ]);
  gui.add(options, "size", 64, 2048, 1);
  gui.add(options, "animated");
  gui.add(options, "speed", 0.1, 6, 0.1);
  gui.add(options, "lineWidth", 1, 100);
  gui.add(options, "resolution", 64, 256, 1);

  const offset = gui.addFolder("offset").close();
  const optionsOffset = options.offset as Required<
    Required<GizmoOptions>["offset"]
  >;
  offset.add(optionsOffset, "top", 0, 50, 1);
  offset.add(optionsOffset, "left", 0, 50, 1);
  offset.add(optionsOffset, "right", 0, 50, 1);
  offset.add(optionsOffset, "bottom", 0, 50, 1);

  const font = gui.addFolder("font").close();
  const fontOptions = options.font as Required<Required<GizmoOptions>["font"]>;
  font.add(fontOptions, "family");
  font.add(
    fontOptions,
    "weight",
    [100, 200, 300, 400, 500, 600, 700, 800, 900]
  );

  const sphere = gui.addFolder("sphere").close();
  const sphereConfig = options.sphere as Required<
    Required<GizmoOptions>["sphere"]
  >;
  sphere.add(sphereConfig, "enabled");
  sphere.addColor(sphereConfig, "color");
  sphere.add(sphereConfig, "opacity");
  sphere.addColor(sphereConfig, "hoverColor");
  sphere.add(sphereConfig, "hoverOpacity");

  GIZMO_AXES.forEach((key) => {
    const axisFolder = gui.addFolder(key).close();
    const axis = options[key] as Required<GizmoAxisOptions>;
    axisFolder.add(axis, "text");
    axisFolder.add(axis, "line");
    axisFolder.add(axis, "circle");
    axisFolder.add(axis, "border");

    const colorsFolder = axisFolder.addFolder("Colors");
    const colors = axis.colors as Required<
      Required<GizmoAxisOptions>["colors"]
    >;
    colorsFolder.addColor(colors, "main");
    colorsFolder.addColor(colors, "text");
    colorsFolder.addColor(colors, "hover");
    colorsFolder.addColor(colors, "hoverText");
  });

  gui.add({ copyOptions }, "copyOptions").name("Copy Options");

  gui.onChange(() => {
    updateViewportGizmo(options, sceneOptions);
  });

  function copyOptions() {
    const jsonText = JSON.stringify(options, null, 2);

    navigator.clipboard
      .writeText(jsonText)
      .then(function () {
        console.log("Options copied to clipboard:");
        console.log(jsonText);
      })
      .catch(function (error) {
        console.error("Error copying Options to clipboard:", error);
      });
  }
};
