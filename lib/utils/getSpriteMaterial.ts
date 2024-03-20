import { GizmoOptions } from "@lib/types";
import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  SpriteMaterial,
} from "three";

export function getSpriteMaterial(
  font: Required<GizmoOptions>["font"],
  resolution: number,
  color: string,
  text: string | undefined,
  textColor: string | null,
  hover: string | null,
  hoverText: string | null,
  border?: boolean
) {
  const canvas = document.createElement("canvas");
  resolution = resolution ?? 64;

  const offset = 0.02;

  canvas.width = resolution * 2 + resolution * (offset * 4);
  canvas.height = resolution + resolution * (offset * 2);

  const radius = resolution / 2;
  const centerY = resolution / 2 + resolution * offset;
  const circle2X = centerY * 3;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  drawCircle(context, radius, centerY, centerY, color, border);
  drawCircle(context, radius, circle2X, centerY, hover || "#FFF", border);

  if (text != null) {
    const family = font.family || "sans-serif";
    const weight = font.weight || 500;

    const fixY = fitTextInBox(context, text, family, weight, resolution);

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = textColor || "#000";
    context.fillText(text, centerY, centerY + fixY);
    context.fillStyle = hoverText || textColor || "#000";
    context.fillText(text, circle2X, centerY + fixY);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.x = 0.5;

  return new SpriteMaterial({
    map: texture,
    toneMapped: false,
    transparent: true,
  });
}

function drawCircle(
  context: CanvasRenderingContext2D,
  radius: number,
  x: number,
  y: number,
  color: string,
  border: boolean = false
) {
  const borderSize = y * 0.1;
  radius = border ? radius - borderSize : radius;

  if (border) context.globalAlpha = 0.2;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color;
  context.fill();

  if (border) {
    context.globalAlpha = 1;
    context.strokeStyle = color;
    context.lineWidth = borderSize;
    context.stroke();
  }
}

function fitTextInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  weight: string | number,
  size: number
) {
  const square = Math.sqrt(Math.pow(size * 0.7, 2) / 2);
  let fontSize = square;
  let textWidth = 0;
  let textHeight = 0;

  do {
    ctx.font = `${weight} ${fontSize}px ${font}`;
    const measure = ctx.measureText(text);
    textWidth = measure.width;
    textHeight = measure.fontBoundingBoxDescent;
    fontSize--;
  } while (textWidth > square && fontSize > 0);

  const scaleFactor = Math.min(square / textWidth, square / textHeight);

  const finalFontSize = Math.floor(fontSize * scaleFactor);

  ctx.font = `${weight} ${finalFontSize}px ${font}`;

  return square / textHeight;
}
