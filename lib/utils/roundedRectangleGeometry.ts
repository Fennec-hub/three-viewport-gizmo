import { BufferGeometry, BufferAttribute } from "three";

/**
 * Generate a Rounded Rectangle geometry
 *
 * @param radius      - The edges radius
 * @param smoothness  - The edges smoothness
 *
 * @ThanksTo `@hofk` for the {@link https://discourse.threejs.org/t/roundedrectangle-squircle/28645 RoundedRectangle + Squircle } Geometry
 *
 * @returns A round rectangle geometry
 */
export function roundedRectangleGeometry(
  radius: number,
  smoothness: number,
  width: number = 2,
  height: number = 2
) {
  // helper const's
  const wi = width / 2 - radius; // inner width
  const hi = height / 2 - radius; // inner height
  const ul = radius / width; // u left
  const ur = (width - radius) / width; // u right
  const vl = radius / height; // v low
  const vh = (height - radius) / height; // v high

  const positions = [wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0];
  const uvs = [ur, vh, ul, vh, ul, vl, ur, vl];
  const n = [
    3 * (smoothness + 1) + 3,
    3 * (smoothness + 1) + 4,
    smoothness + 4,
    smoothness + 5,
    2 * (smoothness + 1) + 4,
    2,
    1,
    2 * (smoothness + 1) + 3,
    3,
    4 * (smoothness + 1) + 3,
    4,
    0,
  ];
  const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (i) => n[i]
  );

  let phi, cos, sin, xc, yc, uc, vc, idx;

  for (let i = 0; i < 4; i++) {
    xc = i < 1 || i > 2 ? wi : -wi;
    yc = i < 2 ? hi : -hi;

    uc = i < 1 || i > 2 ? ur : ul;
    vc = i < 2 ? vh : vl;

    for (let j = 0; j <= smoothness; j++) {
      phi = (Math.PI / 2) * (i + j / smoothness);
      cos = Math.cos(phi);
      sin = Math.sin(phi);

      positions.push(xc + radius * cos, yc + radius * sin, 0);

      uvs.push(uc + ul * cos, vc + vl * sin);

      if (j < smoothness) {
        idx = (smoothness + 1) * i + j + 4;
        indices.push(i, idx, idx + 1);
      }
    }
  }

  return new BufferGeometry()
    .setIndex(new BufferAttribute(new Uint32Array(indices), 1))
    .setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3)
    )
    .setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
}
