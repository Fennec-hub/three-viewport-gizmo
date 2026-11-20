/**
 * The reader's own app, as the samples assume it: declared, never run. Samples import these with a `// @hide` line,
 * so the page shows only the code that is about the gizmo.
 */
import type { OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export declare const camera: PerspectiveCamera;
export declare const orthographicCamera: OrthographicCamera;
export declare const renderer: WebGLRenderer;
export declare const scene: Scene;
export declare const controls: OrbitControls;
/** The element that holds the canvas. */
export declare const viewport: HTMLElement;
/** Resizes the camera and renderer to `viewport`. */
export declare function resize(): void;
