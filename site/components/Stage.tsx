"use client";

import { useEffect, useRef, useState } from "react";
import type { StageConfig, StageHandle, StageSetup } from "./stage-runtime";

type Props = {
  config: StageConfig;
  /** Live options: applied to the running gizmo without rebuilding the stage. */
  animated?: boolean;
  speed?: number;
  /** Per-example hooks; read once per build of the stage. */
  setup?: StageSetup;
  /** Called with the running stage, and with `null` when it is torn down. */
  onStage?: (stage: StageHandle | null) => void;
  label: string;
  className?: string;
};

type Status =
  | { state: "loading" }
  | { state: "ready"; stage: StageHandle }
  | { state: "error"; message: string };

/**
 * One live viewport. Rebuilds the whole stage (renderer, scene, controls, gizmo)
 * whenever `config` changes, and disposes it on unmount, including the unmount
 * React Strict Mode performs in development.
 */
export function Stage({ config, animated = true, speed = 1, setup, onStage, label, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const hooks = useRef({ setup, onStage });
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const key = JSON.stringify(config);

  useEffect(() => {
    hooks.current = { setup, onStage };
  });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const abort = new AbortController();
    let stage: StageHandle | null = null;
    setStatus({ state: "loading" });

    import("./stage-runtime")
      .then(({ createStage }) =>
        createStage(container, JSON.parse(key) as StageConfig, hooks.current.setup, abort.signal)
      )
      .then((created) => {
        if (!created) return;
        // Torn down between creation and this callback: dispose here, nobody else will.
        if (abort.signal.aborted) return created.dispose();
        stage = created;
        setStatus({ state: "ready", stage });
        hooks.current.onStage?.(stage);
      })
      .catch((error: unknown) => {
        if (abort.signal.aborted) return;
        console.warn("Stage failed to start", error);
        setStatus({ state: "error", message: error instanceof Error ? error.message : String(error) });
      });

    return () => {
      abort.abort();
      if (stage) {
        hooks.current.onStage?.(null);
        stage.dispose();
      }
    };
  }, [key]);

  const gizmo = status.state === "ready" ? status.stage.gizmo : null;
  useEffect(() => {
    if (!gizmo) return;
    gizmo.animated = animated;
    gizmo.speed = speed;
  }, [gizmo, animated, speed]);

  const fallback =
    status.state === "ready" && status.stage.backend === "webgpu-fallback";

  return (
    <div className={`stage ${className ?? ""}`}>
      <div ref={ref} className="stage-canvas" role="group" aria-label={label} />
      {status.state === "loading" && <p className="stage-note">Starting renderer…</p>}
      {status.state === "error" && (
        <p className="stage-note stage-error" role="alert">
          This viewport could not start: {status.message}
        </p>
      )}
      {fallback && (
        <p className="stage-note stage-warn" role="status">
          WebGPU is unavailable in this browser. <code>WebGPURenderer</code> is drawing through its
          WebGL 2 fallback.
        </p>
      )}
    </div>
  );
}
