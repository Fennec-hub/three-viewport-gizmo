import { GizmoOptionsFallback } from "../types";

export const setDomPlacement = (
  domElement: HTMLElement,
  placement: GizmoOptionsFallback["placement"]
) => {
  const [y, x] = placement.split("-");
  Object.assign(domElement.style, {
    left: x === "left" ? "0" : x === "center" ? `50%` : "",
    right: x === "right" ? "0" : "",
    top: y === "top" ? "0" : y === "bottom" ? "" : "50%",
    bottom: y === "bottom" ? "0" : "",
    transform: `${x === "center" ? "translateX(-50%)" : ""} ${
      y === "center" ? "translateY(-50%)" : ""
    }`,
  });
};

export const gizmoDomElement = ({
  placement,
  size,
  offset,
  id,
  className,
}: GizmoOptionsFallback) => {
  const div = document.createElement("div");

  const { top, left, right, bottom } = offset;
  Object.assign(div.style, {
    id,
    position: "absolute",
    zIndex: "1000",
    height: `${size}px`,
    width: `${size}px`,
    margin: `${top}px ${right}px ${bottom}px ${left}px`,
    borderRadius: "100%",
  });

  setDomPlacement(div, placement);

  Object.assign(div, { id, className });

  return div;
};
