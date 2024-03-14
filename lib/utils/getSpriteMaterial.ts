import { CanvasTexture, Color, RepeatWrapping, SpriteMaterial } from "three";

export function getSpriteMaterial(
  color: Color,
  text: "x" | "y" | "z" | null = null
) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.beginPath();
  context.arc(32, 32, 32, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color.getStyle();
  context.fill();

  context.beginPath();
  context.arc(96, 32, 32, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = "#FFF";
  context.fill();

  if (text !== null) {
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.fillStyle = "#000";
    context.fillText(text.toUpperCase(), 32, 48);
    context.fillText(text.toUpperCase(), 96, 48);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.x = 0.5;

  return new SpriteMaterial({
    map: texture,
    toneMapped: false,
    transparent: true,
  });
}
