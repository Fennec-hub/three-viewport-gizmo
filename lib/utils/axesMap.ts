import {
  CanvasTexture,
  Color,
  ColorRepresentation,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
} from "three";
import { GizmoAxisOptions, GizmoOptionsFallback } from "@lib/types";
import { GIZMO_AXES } from "./constants";

export const axesMap = (options: GizmoOptionsFallback, offset: number = 2) => {
  const colorManager = new Color();
  const doubleOffset = offset * 2;
  const { isSphere, resolution, radius, font, corners, edges } = options;

  const axes: (Required<GizmoAxisOptions> & { radius: number })[] =
    GIZMO_AXES.map((axis) => ({ ...options[axis], radius }));

  if (isSphere && corners.enabled) axes.push(corners as any);
  if (isSphere && edges.enabled) axes.push(edges as any);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.width = resolution * 2 + doubleOffset * 2;
  canvas.height = resolution * axes.length + doubleOffset * axes.length;

  const [fontStyle, fontYFix] = getFontStyle(axes, resolution, font);

  axes.forEach(
    (
      {
        radius,
        label,
        color,
        labelColor,
        border,
        hover: {
          color: hoverColor,
          labelColor: hoverLabel,
          border: hoverBorder,
        },
      },
      index
    ) => {
      const y = resolution * index + index * doubleOffset + offset;
      drawAxis(
        offset,
        y,
        offset,
        resolution,
        radius,
        label,
        border,
        color,
        labelColor
      );
      drawAxis(
        resolution + offset * 3,
        y,
        offset,
        resolution,
        radius,
        label,
        hoverBorder ?? border,
        hoverColor ?? color,
        hoverLabel ?? labelColor
      );
    }
  );

  /* // Debug
  document.body.appendChild(canvas);
  Object.assign(canvas.style, {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100000,
  }); */

  const colsCount = axes.length;
  const offsetX = offset / (resolution * 2);
  const offsetY = offset / (resolution * 6);
  const cellHeight = 1 / colsCount;

  const map = new CanvasTexture(canvas);
  map.repeat.set(0.5 - 2 * offsetX, cellHeight - 2 * offsetY);
  map.offset.set(offsetX, 1 - offsetY);

  Object.assign(map, {
    colorSpace: SRGBColorSpace,
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    userData: {
      offsetX,
      offsetY,
      cellHeight,
    },
  });

  return map;

  function drawAxis(
    x: number,
    y: number,
    offset: number,
    size: number,
    radius: number,
    label: string,
    border: GizmoAxisOptions["border"],
    color: ColorRepresentation,
    labelColor: ColorRepresentation
  ) {
    radius = radius * (size / 2);

    if (color != null && color !== "") {
      drawRoundRectPath();
      ctx.fillStyle = colorManager.set(color!).getStyle();
      ctx.fill();
    }

    if (border && border.size) {
      const halfBorderWidth = (border.size * size) / 2;
      x += halfBorderWidth;
      y += halfBorderWidth;
      size -= border.size * size;
      radius = Math.max(0, radius - halfBorderWidth);

      drawRoundRectPath();
      ctx.strokeStyle = colorManager.set(border.color).getStyle();
      ctx.lineWidth = border.size * size;
      ctx.stroke();
    }

    if (label)
      drawText(
        ctx,
        x + size / 2,
        y + (size + offset) / 2,
        label,
        colorManager.set(labelColor!).getStyle()
      );

    function drawRoundRectPath() {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.arcTo(x + size, y, x + size, y + radius, radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.arcTo(x + size, y + size, x + size - radius, y + size, radius);
      ctx.lineTo(x + radius, y + size);
      ctx.arcTo(x, y + size, x, y + size - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    }
  }

  function getFontStyle(
    axis: GizmoAxisOptions[],
    resolution: number,
    font: GizmoOptionsFallback["font"]
  ) {
    const longestLabel = [...axis]
      .sort((a, b) => (a.label?.length || 0) - (b.label?.length || 0))
      .pop()!;
    const text = longestLabel.label!;

    const { family, weight } = font;

    const square = isSphere
      ? Math.sqrt(Math.pow(resolution * 0.7, 2) / 2)
      : resolution;
    let fontSize = square;
    let textWidth = 0;
    let textHeight = 0;

    do {
      ctx.font = `${weight} ${fontSize}px ${family}`;
      const measure = ctx.measureText(text);
      textWidth = measure.width;
      textHeight = measure.fontBoundingBoxDescent;
      fontSize--;
    } while (textWidth > square && fontSize > 0);

    const yFix = square / textHeight;
    const scaleFactor = Math.min(square / textWidth, yFix);
    const finalFontSize = Math.floor(fontSize * scaleFactor);

    return [`${weight} ${finalFontSize}px ${family}`, yFix] as const;
  }

  function drawText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) {
    ctx.font = fontStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + (isSphere ? fontYFix : 0));
  }
};

export const setMapHoverOffset = (map: Texture, hover: boolean) =>
  (map.offset.x = (hover ? 0.5 : 0) + map.userData.offsetX);

export const setMapColumnOffset = (map: Texture, col: number) => {
  const {
    offset,
    userData: { offsetY, cellHeight },
  } = map;
  offset.y = 1 - (col + 1) * cellHeight + offsetY;
};
