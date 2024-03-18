import { DomPlacement, GizmoOptions } from "../types";

export const getDomContainer = (
  placement: DomPlacement,
  size: number,
  offset: Required<GizmoOptions>["offset"]
) => {
  const div = document.createElement("div");
  const style = div.style;

  const { top, left, right, bottom } = offset;

  style.height = `${size}px`;
  style.width = `${size}px`;
  style.borderRadius = "100%";
  style.position = "absolute";
  style.background = "#fff3";
  style.opacity = "0";
  style.zIndex = "10000";

  const [y, x] = placement.split("-");

  style.transform = "";
  style.margin = `${top}px ${right}px ${bottom}px ${left}px`;
  style.left = x === "left" ? "0" : x === "center" ? `50%` : "";
  style.right = x === "right" ? "0" : "";
  style.transform += x === "center" ? "translateX(-50%)" : "";
  style.top = y === "top" ? "0" : y === "bottom" ? "" : "50%";
  style.bottom = y === "bottom" ? "0" : "";
  style.transform += y === "center" ? "translateY(-50%)" : "";

  return div;
};
