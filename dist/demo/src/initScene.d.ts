import { Object3D, PerspectiveCamera } from "three";
import { ViewportGizmo } from '../../lib/ViewportGizmo';
export declare function initScene(initControlsCallback?: (camera: PerspectiveCamera, viewportGizmo: ViewportGizmo) => void, animateControlsCallBack?: () => void, resizeControlsCallback?: () => void, modelLoadedControlsCallback?: (model: Object3D) => void): void;
