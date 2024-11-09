import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GizmoOptions, ViewportGizmo } from "@lib/ViewportGizmo";

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

  const gizmoConfigs: GizmoOptions[] = [
    {
      placement: "top-left",
      className: "responsive-gizmo",
      lineWidth: 15,
      sphere: {
        enabled: true,
        color: 0x222222,
        opacity: 0.6,
        hoverOpacity: 0.2,
      },
    },
    {
      placement: "top-right",
      className: "responsive-gizmo",
      lineWidth: 0,
      speed: 1,
      sphere: {
        enabled: true,
        color: 0x472875,
        opacity: 0.6,
        hoverOpacity: 0.2,
      },
      x: {
        text: "X",
        line: false,
        colors: {
          main: 0xd491be,
          text: 0xffffff,
          hoverText: 0xd491be,
        },
      },
      y: {
        text: "Y",
        line: false,
        colors: {
          main: 0xd491be,
          text: 0xffffff,
          hoverText: 0xd491be,
        },
      },
      z: {
        text: "Z",
        line: false,
        colors: {
          main: 0xd491be,
          text: 0xffffff,
          hoverText: 0xd491be,
        },
      },
      nx: {
        line: false,
        border: true,
        colors: {
          main: 0xd491be,
        },
      },
      ny: {
        line: false,
        border: true,
        colors: {
          main: 0xd491be,
        },
      },
      nz: {
        line: false,
        border: true,
        colors: {
          main: 0xd491be,
        },
      },
    },
    {
      placement: "bottom-left",
      className: "responsive-gizmo",
      lineWidth: 15,
      sphere: {
        enabled: true,
        color: 0xdddddd,
        opacity: 0.6,
        hoverOpacity: 0.2,
      },
      x: {
        text: "X",
        colors: {
          main: 0x000000,
          text: 0xffffff,
          hoverText: 0x000000,
        },
      },
      y: {
        text: "Y",
        colors: {
          main: 0x000000,
          text: 0xffffff,
          hoverText: 0x000000,
        },
      },
      z: {
        text: "Z",
        colors: {
          main: 0x000000,
          text: 0xffffff,
          hoverText: 0x000000,
        },
      },
      nx: {
        line: true,
        border: true,
        colors: {
          main: 0x000000,
        },
      },
      ny: {
        line: true,
        border: true,
        colors: {
          main: 0x000000,
        },
      },
      nz: {
        line: true,
        border: true,
        colors: {
          main: 0x000000,
        },
      },
    },
    {
      placement: "bottom-right",
      className: "responsive-gizmo",
      speed: 1,
      sphere: {
        enabled: true,
        color: 0xcc3634,
        opacity: 0.6,
        hoverOpacity: 0.2,
      },
      x: {
        text: "X",
        line: false,
        border: true,
        circle: false,
        colors: {
          main: 0xf6d162,
          text: 0xf6d162,
        },
      },
      y: {
        text: "Y",
        line: false,
        border: true,
        circle: false,
        colors: {
          main: 0xf6d162,
          text: 0xf6d162,
        },
      },
      z: {
        text: "Z",
        line: false,
        border: true,
        circle: false,
        colors: {
          main: 0xf6d162,
          text: 0xf6d162,
        },
      },
      nx: {
        line: false,
        colors: {
          main: 0xf6d162,
        },
      },
      ny: {
        line: false,
        colors: {
          main: 0xf6d162,
        },
      },
      nz: {
        line: false,
        colors: {
          main: 0xf6d162,
        },
      },
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
    return new ViewportGizmo(camera, renderer, { ...config });
  });

  function animation() {
    renderer.render(scene, camera);
    gizmos.forEach((gizmo) => gizmo.render());
  }

  renderer.setAnimationLoop(animation);
  window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    console.log(camera.position);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    gizmos.forEach((gizmo) => gizmo.update());
  };
}
