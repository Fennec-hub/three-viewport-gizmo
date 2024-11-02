import { Scene, ToneMapping, WebGLRenderer } from "three";
export declare const loadEnvMap: ({ renderer, scene, path, background, toneMapping, exposure, }: {
    renderer: WebGLRenderer;
    scene: Scene;
    path: string;
    background?: boolean | undefined;
    toneMapping?: ToneMapping | undefined;
    exposure?: number | undefined;
}) => void;
