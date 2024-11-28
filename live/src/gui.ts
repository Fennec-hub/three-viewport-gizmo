import { updateViewportGizmo } from "./configuration";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GizmoOptions, GizmoOptionsFallback } from "@lib/types";
import { GIZMO_AXES } from "@lib/utils/constants";
import { ViewportGizmo } from "@lib/ViewportGizmo";

export const initGUI = (gizmo: ViewportGizmo) => {
  const gui = new GUI();

  const options = JSON.parse(
    JSON.stringify((gizmo as any)["_options"])
  ) as unknown as GizmoOptionsFallback;

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
  const optionsOffset = options.offset;
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

  ["background", "corners", "edges"].forEach((param) => {
    const isBackground = param === "background";
    const folder = gui.addFolder(param).close();
    const config = (options as any)[param];

    folder.add(config, "enabled");
    folder.addColor(config, "color");
    folder.add(config, "opacity", 0, 1, 0.01);

    if (!isBackground) {
      folder.add(config, "scale", 0, 1, 0.1);
      folder.add(config, "radius", 0, 1, 0.01);
      folder.add(config, "smoothness", 0, 32, 0.01);
    }

    const hoverFolder = folder.addFolder("hover").close();
    hoverFolder.addColor(config.hover, "color");
    hoverFolder.add(config.hover, "opacity", 0, 1, 0.01);

    if (!isBackground) hoverFolder.add(config.hover, "scale", 0, 1, 0.01);
  });

  GIZMO_AXES.forEach((key) => {
    const axisFolder = gui.addFolder(key).close();
    const axis = options[key];

    axisFolder.add(axis, "enabled");
    axisFolder.add(axis, "label");
    axisFolder.add(axis, "opacity", 0, 1, 0.01);
    axisFolder.add(axis, "scale", 0, 1, 0.01);
    axisFolder.add(axis, "line");
    axisFolder.addColor(axis, "color");
    axisFolder.addColor(axis, "labelColor");

    const border = axisFolder.addFolder("border").close();
    const borderConfig = axis.border;
    border.add(borderConfig, "size", 0, 1, 0.1);
    border.addColor(borderConfig, "color");

    const axisHover = axisFolder.addFolder("hover").close();
    const hoverConfig = axis.hover;
    axisHover.add(hoverConfig, "opacity", 0, 1, 0.01);
    axisHover.add(hoverConfig, "scale", 0, 1, 0.01);
    axisHover.addColor(hoverConfig, "color");
    axisHover.addColor(hoverConfig, "labelColor");

    const hoverBorder = axisHover.addFolder("hoverBorder").close();
    const hoverBorderConfig = hoverConfig.border;
    hoverBorder.add(hoverBorderConfig, "size", 0, 1, 0.01);
    hoverBorder.addColor(hoverBorderConfig, "color");
  });

  gui.add({ copyOptions }, "copyOptions").name("Copy Options");

  gui.onChange(() => {
    options.container = "body";
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
