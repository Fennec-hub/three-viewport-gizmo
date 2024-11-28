import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import {
  GizmoAxisOptions,
  GizmoOptions,
  ViewportGizmo,
} from "@lib/ViewportGizmo";
import { cubeDarkTheme } from "./constant";

export function responsive() {
  const container = document.querySelector<HTMLElement>("#app")!;

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.setScalar(5);

  const scene = new Scene();
  camera.lookAt(scene.position);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x333333, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  const offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  const topRightPositiveAxis: GizmoAxisOptions = {
    color: 0xd491be,
    labelColor: 0xffffff,
    hover: {
      labelColor: 0xd491be,
    },
  };

  const topRightNegativeAxis: GizmoAxisOptions = {
    color: "",
    border: {
      size: 0.15,
      color: 0xe491ce,
    },
    hover: {
      color: "",
      scale: 0.45,
      border: {
        size: 0.15,
        color: 0xffffff,
      },
    },
  };

  const bottomLeftPositiveAxis: GizmoAxisOptions = {
    color: 0x000000,
    labelColor: 0xffffff,
    hover: {
      color: "",
      labelColor: 0x000000,
      border: {
        size: 0.1,
        color: 0x000000,
      },
    },
  };

  const bottomLeftNegativeAxis: GizmoAxisOptions = {
    color: "",
    border: {
      size: 0.15,
      color: 0x000000,
    },
    hover: {
      color: 0x000000,
      scale: 0.4,
      border: {
        size: 0,
        color: "",
      },
    },
  };

  const bottomRightPositiveAxis = {
    line: false,
    color: "",
    labelColor: 0xf6d162,
    border: {
      size: 0.05,
      color: 0xf6d162,
    },
    hover: {
      scale: 0.75,
      color: "",
      labelColor: 0xf6d162,
      border: {
        size: 0.1,
        color: 0xf6d162,
      },
    },
  };

  const bottomRightNegativeAxis = {
    color: 0xf6d162,
    hover: { color: 0xf6d162, border: { size: 0, color: "" } },
  };

  const gizmoConfigs: GizmoOptions[] = [
    {
      placement: "top-left",
      className: "responsive-gizmo",
      lineWidth: 15,
      offset: offset,
      background: {
        opacity: 0.6,
        hover: { opacity: 0.2 },
      },
    },
    {
      placement: "top-center",
      className: "responsive-gizmo",
      offset: offset,
      background: {
        color: 0x472875,
        opacity: 0.6,
        hover: {
          opacity: 0.8,
          color: 0x472875,
        },
      },
      x: topRightPositiveAxis,
      y: topRightPositiveAxis,
      z: topRightPositiveAxis,
      nx: topRightNegativeAxis,
      ny: topRightNegativeAxis,
      nz: topRightNegativeAxis,
    },
    {
      placement: "bottom-left",
      className: "responsive-gizmo",
      lineWidth: 15,
      offset: offset,
      background: {
        color: 0xffffff,
        opacity: 0.6,
        hover: {
          opacity: 0.8,
        },
      },
      x: bottomLeftPositiveAxis,
      y: bottomLeftPositiveAxis,
      z: bottomLeftPositiveAxis,
      nx: bottomLeftNegativeAxis,
      ny: bottomLeftNegativeAxis,
      nz: bottomLeftNegativeAxis,
    },
    {
      placement: "bottom-center",
      className: "responsive-gizmo",
      offset: offset,
      background: {
        color: 0xcc3634,
        opacity: 0.4,
        hover: {
          color: 0xcc3634,
          opacity: 0.6,
        },
      },
      x: bottomRightPositiveAxis,
      y: bottomRightPositiveAxis,
      z: bottomRightPositiveAxis,
      nx: bottomRightNegativeAxis,
      ny: bottomRightNegativeAxis,
      nz: bottomRightNegativeAxis,
    },
    // Cube
    {
      type: "cube",
      placement: "top-right",
      className: "responsive-gizmo",
      offset: offset,
    },
    {
      type: "cube",
      placement: "bottom-right",
      className: "responsive-gizmo",
      offset: offset,
      ...cubeDarkTheme,
    },
  ];

  const gizmos = gizmoConfigs.map((config) => {
    const camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.setScalar(5);
    camera.lookAt(scene.position);
    const gizmo = new ViewportGizmo(camera, renderer, { ...config });

    return gizmo;
  });

  function animation() {
    renderer.render(scene, camera);
    gizmos.forEach((gizmo) => gizmo.render());
  }

  renderer.setAnimationLoop(animation);
  window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    gizmos.forEach((gizmo) => gizmo.update());
  };
}
