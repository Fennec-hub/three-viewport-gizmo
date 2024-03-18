import { Camera, Object3D } from "three";
import { ViewportGizmo } from '../../lib/ViewportGizmo';
export declare function initScene(initControlsCallback?: (camera: Camera, viewportGizmo: ViewportGizmo) => void, animateControlsCallBack?: () => void, resizeControlsCallback?: () => void, modelLoadedControlsCallback?: (model: Object3D) => void): void;
