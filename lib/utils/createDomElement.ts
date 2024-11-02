import { GizmoDomPlacement, GizmoOptions } from "../types";

export const createDomElement = (
  placement: GizmoDomPlacement,
  size: number,
  offset: Required<GizmoOptions>["offset"],
  id?: string,
  className?: string
) => {
  const div = document.createElement("div");

  const top = offset.top ?? 0;
  const left = offset.left ?? 0;
  const right = offset.right ?? 0;
  const bottom = offset.bottom ?? 0;
  const [y, x] = placement.split("-");

  Object.assign(div.style, {
    height: `${size}px`,
    width: `${size}px`,
    borderRadius: "100%",
    position: "absolute",
    background: "#fff3",
    opacity: "0",
    zIndex: "10000",
    transform: `${x === "center" ? "translateX(-50%)" : ""} ${
      y === "center" ? "translateY(-50%)" : ""
    }`,
    margin: `${top}px ${right}px ${bottom}px ${left}px`,
    left: x === "left" ? "0" : x === "center" ? `50%` : "",
    right: x === "right" ? "0" : "",
    top: y === "top" ? "0" : y === "bottom" ? "" : "50%",
    bottom: y === "bottom" ? "0" : "",
  });

  if (id) div.id = id;
  if (className) div.className = className;

  return div;
};
