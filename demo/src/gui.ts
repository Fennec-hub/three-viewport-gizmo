import { updateViewportGizmo } from "./configuration";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GizmoAxisOptions, GizmoOptions } from "@lib/types";
import { GIZMO_AXES } from "@lib/utils/constants";

export const initGUI = () => {
  const gui = new GUI();
  setGuiPosition(true);

  const options: Omit<Required<GizmoOptions>, "container"> = {
    placement: "center-center",
    size: parseInt(`${Math.min(window.innerWidth, window.innerHeight) * 0.8}`),
    lineWidth: 3,
    offset: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    x: {
      text: "X",
      drawLine: true,
      border: false,
      colors: {
        main: "#ff7f9b",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    y: {
      text: "Y",
      drawLine: true,
      border: false,
      colors: {
        main: "#c2ee00",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    z: {
      text: "Z",
      drawLine: true,
      border: false,
      colors: {
        main: "#73c5ff",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    nx: {
      text: "",
      drawLine: false,
      border: false,
      colors: {
        main: "#ff7f9b",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    ny: {
      text: "",
      drawLine: false,
      border: false,
      colors: {
        main: "#c2ee00",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    nz: {
      text: "",
      drawLine: false,
      border: false,
      colors: {
        main: "#73c5ff",
        hover: "#ffffff",
        text: "#000000",
        hoverText: "#000000",
      },
    },
    backgroundSphere: {
      enabled: true,
      color: 0xffffff,
      opacity: 0.2,
    },
  };

  const additionalOptions = {
    background: "#333333",
    grid: true,
  };

  const scene = gui.addFolder("Scene");
  scene.addColor(additionalOptions, "background");
  scene.add(additionalOptions, "grid");

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
  gui.add(options, "lineWidth", 1, 10);

  const offset = gui.addFolder("offset").close();
  offset.add(options.offset, "top", 0, 50, 1);
  offset.add(options.offset, "left", 0, 50, 1);
  offset.add(options.offset, "right", 0, 50, 1);
  offset.add(options.offset, "bottom", 0, 50, 1);

  const backgroundSphere = gui.addFolder("backgroundSphere").close();
  const bgSphere = options.backgroundSphere as Required<
    Required<GizmoOptions>["backgroundSphere"]
  >;
  backgroundSphere.add(bgSphere, "enabled");
  backgroundSphere.addColor(bgSphere, "color");
  backgroundSphere.add(bgSphere, "opacity");

  GIZMO_AXES.forEach((key) => {
    const axisFolder = gui.addFolder(key).close();
    const axis = options[key] as Required<GizmoAxisOptions>;
    axisFolder.add(axis, "text");
    axisFolder.add(axis, "drawLine");
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
    setGuiPosition(options.placement !== "top-left");
    updateViewportGizmo(options, additionalOptions);
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

function setGuiPosition(left: boolean) {
  const guiElement = document.querySelector<HTMLElement>(".lil-gui")!;
  guiElement.style.position = "absolute";
  guiElement.style.top = "0";

  guiElement.style.left = left ? "0" : "";
  guiElement.style.right = left ? "" : "0";
}
