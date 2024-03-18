import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  SpriteMaterial,
} from "three";

export function getSpriteMaterial(
  color: string,
  text: string | undefined,
  textColor: string | null,
  hover: string | null,
  hoverText: string | null,
  border?: boolean
) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  drawCircle(context, 32, color, border);
  drawCircle(context, 96, hover || "#FFF", border);

  if (text != null) {
    const long = text.length > 1;
    const y = long ? 46 : 50;
    context.font = `bold ${long ? 40 : 48}px helvetica`;
    context.textAlign = "center";
    context.fillStyle = textColor || "#000";
    context.fillText(text.toUpperCase(), 32, y);
    context.fillStyle = hoverText || textColor || "#000";
    context.fillText(text.toUpperCase(), 96, y);
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
  x: number,
  color: string,
  border?: boolean
) {
  const radius = border ? 28 : 32;

  if (border) context.globalAlpha = 0.2;
  context.beginPath();
  context.arc(x, 32, radius, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color;
  context.fill();

  if (border) {
    context.globalAlpha = 1;
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.stroke();
  }
}
