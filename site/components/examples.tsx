"use client";

/**
 * Live examples that need per-example wiring. Each one is a thin `setup` over the
 * shared `Stage`; plain configurations use `Stage` directly from the page.
 */
import { useState } from "react";
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  DodecahedronGeometry,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  TorusKnotGeometry,
  type WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ViewportGizmo } from "@lib/ViewportGizmo";
import { Stage } from "./Stage";
import type { UpAxis } from "./frames";

export function OrbitControlsEventsExample() {
  return (
    <Stage
      label="OrbitControls wired to the gizmo through events"
      config={{ controller: "none", gizmo: { type: "cube" } }}
      setup={({ camera, renderer, gizmo, target }) => {
        if (!gizmo) return;
        const controls = new OrbitControls(camera, renderer.domElement);
        // The gizmo and the controls share one target.
        gizmo.target = controls.target.copy(target);
        controls.update();
        gizmo.addEventListener("start", () => (controls.enabled = false));
        gizmo.addEventListener("end", () => (controls.enabled = true));
        controls.addEventListener("change", () => gizmo.update(false));
        return { dispose: () => controls.dispose() };
      }}
    />
  );
}

type Payload = Record<string, unknown>;

export function HoverEventsExample() {
  const [hover, setHover] = useState<Payload | null>(null);
  const [change, setChange] = useState<Payload | null>(null);
  return (
    <>
      <Stage
        label="Rounded-cube gizmo reporting hover and change events"
        config={{ controller: "orbit", gizmo: { type: "rounded-cube" } }}
        setup={({ gizmo }) => {
          gizmo?.addEventListener("hoverchange", ({ kind, axes, face, direction }) =>
            setHover({ kind, axes, face, direction: direction?.toArray().map(round) ?? null })
          );
          gizmo?.addEventListener("change", ({ kind, axes, face, direction }) => {
            // Drag and animation frames carry no identity; keep the last click.
            if (kind) setChange({ kind, axes, face, direction: direction?.toArray().map(round) ?? null });
          });
        }}
      />
      <div className="event-log" aria-live="polite">
        {`hoverchange ${JSON.stringify(hover)}\nchange      ${JSON.stringify(change)}`}
      </div>
    </>
  );
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function MultipleViewportsExample() {
  return (
    <Stage
      label="Four scissored views sharing one renderer, each with its own gizmo"
      config={{ gizmo: null, controller: "none" }}
      setup={({ renderer, container }) => {
        const grid = document.createElement("div");
        grid.className = "multi-grid";
        container.appendChild(grid);

        const shapes = [
          new BoxGeometry(),
          new TorusKnotGeometry(0.4, 0.13, 96, 12),
          new ConeGeometry(0.5, 1.2, 24),
          new DodecahedronGeometry(0.6),
        ];
        const placements = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

        const views = shapes.map((geometry, index) => {
          const element = document.createElement("div");
          grid.appendChild(element);
          const scene = new Scene();
          scene.background = new Color(index % 3 ? 0x2b2f36 : 0x323741);
          const mesh = new Mesh(geometry, new MeshNormalMaterial());
          scene.add(mesh);
          const camera = new PerspectiveCamera(50, 1, 0.1, 20);
          camera.position.set(0, 0, 3);
          const gizmo = new ViewportGizmo(camera, renderer, {
            container: element,
            placement: placements[index],
            size: 80,
          });
          const controls = new OrbitControls(camera, element);
          controls.enablePan = false;
          controls.enableZoom = false;
          gizmo.attachControls(controls);
          return { element, scene, camera, mesh, gizmo, controls };
        });

        return {
          resize() {
            for (const { element, camera, gizmo } of views) {
              camera.aspect = element.clientWidth / element.clientHeight;
              camera.updateProjectionMatrix();
              gizmo.update();
            }
          },
          frame() {
            const canvas = renderer.domElement;
            const canvasRect = canvas.getBoundingClientRect();
            renderer.setScissorTest(true);
            for (const { element, scene, camera, mesh, gizmo } of views) {
              mesh.rotation.y += 0.005;
              const rect = element.getBoundingClientRect();
              // WebGL viewports start at the bottom-left of the canvas.
              const left = rect.left - canvasRect.left;
              const bottom = canvas.clientHeight - (rect.bottom - canvasRect.top);
              renderer.setViewport(left, bottom, rect.width, rect.height);
              renderer.setScissor(left, bottom, rect.width, rect.height);
              renderer.render(scene, camera);
              gizmo.render();
            }
            renderer.setScissorTest(false);
          },
          dispose() {
            for (const { controls, gizmo, mesh } of views) {
              controls.dispose();
              gizmo.dispose();
              mesh.geometry.dispose();
              mesh.material.dispose();
            }
            grid.remove();
          },
        };
      }}
    />
  );
}

export function PostProcessingExample() {
  return (
    <Stage
      label="Pixelated post-processing with the gizmo drawn on top"
      config={{ controller: "orbit", gizmo: {} }}
      setup={({ renderer, scene, camera }) => {
        // EffectComposer is the WebGL post-processing pipeline.
        const gl = renderer as WebGLRenderer;
        const composer = new EffectComposer(gl);
        composer.addPass(new RenderPixelatedPass(5, scene, camera));
        composer.addPass(new OutputPass());
        return {
          frame: () => composer.render(),
          resize(width, height) {
            composer.setPixelRatio(gl.getPixelRatio());
            composer.setSize(width, height);
          },
          dispose: () => composer.dispose(),
        };
      }}
    />
  );
}

export function UpAxisExample() {
  const [up, setUp] = useState<UpAxis>("z");
  return (
    <>
      <fieldset style={{ marginBottom: "0.75rem" }}>
        <legend>Up axis</legend>
        <div className="segmented">
          {(["x", "y", "z"] as const).map((axis) => (
            <label key={axis}>
              <input type="radio" name="up-axis" checked={up === axis} onChange={() => setUp(axis)} />
              <span>{axis.toUpperCase()}-up</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Stage label={`${up.toUpperCase()}-up scene with a cube gizmo`} config={{ up, controller: "orbit", gizmo: { type: "cube" } }} />
    </>
  );
}
