var Zt = Object.defineProperty;
var Jt = (s, e, t) => e in s ? Zt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var m = (s, e, t) => Jt(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as T, Raycaster as Kt, Vector2 as Q, Color as kt, CanvasTexture as te, SRGBColorSpace as ee, RepeatWrapping as bt, BufferGeometry as Ht, BufferAttribute as et, Sprite as ht, SpriteMaterial as ft, Mesh as N, MeshBasicMaterial as st, BackSide as ne, SphereGeometry as ie, Box3 as pt, InstancedBufferGeometry as se, Float32BufferAttribute as St, InstancedInterleavedBuffer as lt, InterleavedBufferAttribute as V, WireframeGeometry as oe, Sphere as Ft, UniformsLib as nt, ShaderLib as it, UniformsUtils as jt, ShaderMaterial as re, Vector4 as F, Matrix4 as It, Line3 as ae, MathUtils as ce, Object3D as le, Clock as de, Quaternion as ot, OrthographicCamera as ue, PerspectiveCamera as he, Spherical as Wt } from "three";
const qt = (s, e) => {
  const [t, n] = e.split("-");
  Object.assign(s.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  });
}, fe = ({
  placement: s,
  size: e,
  offset: t,
  id: n,
  className: i
}) => {
  const o = document.createElement("div"), { top: l, left: a, right: d, bottom: h } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${l}px ${d}px ${h}px ${a}px`,
    borderRadius: "100%"
  }), qt(o, s), Object.assign(o, { id: n, className: i }), o;
}, pe = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function dt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const me = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], xt = 1, Et = 0.5, At = /* @__PURE__ */ new T();
function Mt({ isSphere: s }, e, t) {
  s && (At.set(0, 0, 1).applyQuaternion(t.quaternion), me.forEach(([n, i, o]) => {
    const l = At[n];
    e[i].material.opacity = dt(
      l >= 0 ? xt : Et,
      0,
      1
    ), e[o].material.opacity = dt(
      l >= 0 ? Et : xt,
      0,
      1
    );
  }));
}
const ge = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, Tt = /* @__PURE__ */ new Kt(), Lt = /* @__PURE__ */ new Q(), Bt = (s, e, t, n) => {
  Lt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), Tt.setFromCamera(Lt, t);
  const i = Tt.intersectObjects(
    n,
    !1
  );
  return i.length ? i[0] : null;
}, rt = 1e-6, ye = 2 * Math.PI, Vt = ["x", "y", "z"], Y = [...Vt, "nx", "ny", "nz"], ve = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Ut = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, W = (s) => JSON.parse(JSON.stringify(s)), _e = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = s.resolution || t ? 64 : 128;
  ve.forEach((a, d) => {
    s[a] && (s[Y[d]] = s[a]);
  });
  const i = {
    color: 16777215,
    opacity: 1,
    scale: t ? 0.7 : 0.8,
    labelColor: 2236962,
    line: !1,
    border: {
      size: 0,
      color: 14540253
    },
    hover: {
      color: t ? 16777215 : 9688043,
      labelColor: 2236962,
      opacity: 1,
      scale: t ? 0.7 : 0.8,
      border: {
        size: 0,
        color: 14540253
      }
    }
  }, o = {
    line: !1,
    scale: t ? 0.45 : 0.8,
    hover: {
      scale: t ? 0.5 : 0.8
    }
  }, l = {
    type: e,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: n,
    lineWidth: 20,
    radius: t ? 1 : 0.2,
    smoothness: 18,
    animated: !0,
    speed: 1,
    background: {
      enabled: !0,
      color: t ? 16777215 : 14739180,
      opacity: t ? 0 : 1,
      hover: {
        color: t ? 16777215 : 14739180,
        opacity: t ? 0.2 : 1
      }
    },
    font: {
      family: "sans-serif",
      weight: 900
    },
    offset: {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10
    },
    corners: {
      enabled: !t,
      color: 16777215,
      opacity: 1,
      scale: t ? 0.15 : 0.175,
      radius: 1,
      smoothness: 18,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.4 : 0.2
      }
    },
    edges: {
      enabled: !t,
      color: 16777215,
      opacity: t ? 1 : 0,
      radius: t ? 1 : 0.125,
      smoothness: 18,
      scale: t ? 0.15 : 1,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.4 : 1
      }
    },
    x: {
      ...W(i),
      ...t ? {
        label: "X",
        color: 16725587,
        line: !0
      } : {
        label: "Right"
      }
    },
    y: {
      ...W(i),
      ...t ? {
        label: "Y",
        color: 9100032,
        line: !0
      } : {
        label: "Top"
      }
    },
    z: {
      ...W(i),
      ...t ? {
        label: "Z",
        color: 2920447,
        line: !0
      } : {
        label: "Front"
      }
    },
    nx: {
      ...W(o),
      label: t ? "" : "Left"
    },
    ny: {
      ...W(o),
      label: t ? "" : "Bottom"
    },
    nz: {
      ...W(o),
      label: t ? "" : "Back"
    }
  };
  return ut(s, l), Vt.forEach(
    (a) => ut(s[`n${a}`], s[a])
  ), { ...s, isSphere: t };
};
function ut(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = ut(
        s[n] || {},
        t[n]
      )));
  return s;
}
const we = (s, e = 2) => {
  const t = new kt(), n = e * 2, { isSphere: i, resolution: o, radius: l, font: a, corners: d, edges: h } = s, r = Y.map((p) => ({ ...s[p], radius: l }));
  i && d.enabled && r.push(d), i && h.enabled && r.push(h);
  const u = document.createElement("canvas"), c = u.getContext("2d");
  u.width = o * 2 + n * 2, u.height = o * r.length + n * r.length;
  const [f, g] = $(r, o, a);
  r.forEach(
    ({
      radius: p,
      label: S,
      color: k,
      labelColor: _,
      border: b,
      hover: {
        color: H,
        labelColor: z,
        border: C
      }
    }, R) => {
      const G = o * R + R * n + e;
      U(
        e,
        G,
        e,
        o,
        p,
        S,
        b,
        k,
        _
      ), U(
        o + e * 3,
        G,
        e,
        o,
        p,
        S,
        C ?? b,
        H ?? k,
        z ?? _
      );
    }
  );
  const v = r.length, y = e / (o * 2), w = e / (o * 6), B = 1 / v, x = new te(u);
  return x.repeat.set(0.5 - 2 * y, B - 2 * w), x.offset.set(y, 1 - w), Object.assign(x, {
    colorSpace: ee,
    wrapS: bt,
    wrapT: bt,
    userData: {
      offsetX: y,
      offsetY: w,
      cellHeight: B
    }
  }), x;
  function U(p, S, k, _, b, H, z, C, R) {
    if (b = b * (_ / 2), C != null && C !== "" && (G(), c.fillStyle = t.set(C).getStyle(), c.fill()), z && z.size) {
      const I = z.size * _ / 2;
      p += I, S += I, _ -= z.size * _, b = Math.max(0, b - I), G(), c.strokeStyle = t.set(z.color).getStyle(), c.lineWidth = z.size * _, c.stroke();
    }
    H && L(
      c,
      p + _ / 2,
      S + (_ + k) / 2,
      H,
      t.set(R).getStyle()
    );
    function G() {
      c.beginPath(), c.moveTo(p + b, S), c.lineTo(p + _ - b, S), c.arcTo(p + _, S, p + _, S + b, b), c.lineTo(p + _, S + _ - b), c.arcTo(p + _, S + _, p + _ - b, S + _, b), c.lineTo(p + b, S + _), c.arcTo(p, S + _, p, S + _ - b, b), c.lineTo(p, S + b), c.arcTo(p, S, p + b, S, b), c.closePath();
    }
  }
  function $(p, S, k) {
    const b = [...p].sort((Z, Qt) => {
      var _t, wt;
      return (((_t = Z.label) == null ? void 0 : _t.length) || 0) - (((wt = Qt.label) == null ? void 0 : wt.length) || 0);
    }).pop().label, { family: H, weight: z } = k, C = i ? Math.sqrt(Math.pow(S * 0.7, 2) / 2) : S;
    let R = C, G = 0, I = 0;
    do {
      c.font = `${z} ${R}px ${H}`;
      const Z = c.measureText(b);
      G = Z.width, I = Z.fontBoundingBoxDescent, R--;
    } while (G > C && R > 0);
    const vt = C / I, Xt = Math.min(C / G, vt), Yt = Math.floor(R * Xt);
    return [`${z} ${Yt}px ${H}`, vt];
  }
  function L(p, S, k, _, b) {
    p.font = f, p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = b, p.fillText(_, S, k + (i ? g : 0));
  }
}, be = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, mt = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function gt(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, l = s / t, a = (t - s) / t, d = s / n, h = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], u = [a, h, l, h, l, d, a, d], c = [
    3 * (e + 1) + 3,
    3 * (e + 1) + 4,
    e + 4,
    e + 5,
    2 * (e + 1) + 4,
    2,
    1,
    2 * (e + 1) + 3,
    3,
    4 * (e + 1) + 3,
    4,
    0
  ], f = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (L) => c[L]
  );
  let g, v, y, w, B, x, U, $;
  for (let L = 0; L < 4; L++) {
    w = L < 1 || L > 2 ? i : -i, B = L < 2 ? o : -o, x = L < 1 || L > 2 ? a : l, U = L < 2 ? h : d;
    for (let p = 0; p <= e; p++)
      g = Math.PI / 2 * (L + p / e), v = Math.cos(g), y = Math.sin(g), r.push(w + s * v, B + s * y, 0), u.push(x + l * v, U + d * y), p < e && ($ = (e + 1) * L + p + 4, f.push(L, $, $ + 1));
  }
  return new Ht().setIndex(new et(new Uint32Array(f), 1)).setAttribute(
    "position",
    new et(new Float32Array(r), 3)
  ).setAttribute("uv", new et(new Float32Array(u), 2));
}
const Se = (s, e) => {
  const t = new T(), { isSphere: n, radius: i, smoothness: o } = s, l = gt(i, o);
  return Y.map((a, d) => {
    const h = d < 3, r = Y[d], u = d ? e.clone() : e;
    mt(u, d);
    const { scale: c, opacity: f, hover: g } = s[r], v = {
      map: u,
      opacity: f,
      transparent: !0
    }, y = n ? new ht(new ft(v)) : new N(l, new st(v)), w = h ? r : r[1];
    return y.position[w] = (h ? 1 : -1) * (n ? 1.4 : 1), n || y.lookAt(t.copy(y.position).multiplyScalar(1.7)), y.scale.setScalar(c), y.renderOrder = 1, y.userData = {
      scale: c,
      opacity: f,
      hover: g
    }, y;
  });
}, xe = (s, e) => {
  const { isSphere: t, corners: n } = s;
  if (!n.enabled) return [];
  const { color: i, opacity: o, scale: l, radius: a, smoothness: d, hover: h } = n, r = t ? null : gt(a, d), u = {
    transparent: !0,
    opacity: o
  }, c = [
    1,
    1,
    1,
    -1,
    1,
    1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    -1
  ].map((g) => g * 0.85), f = new T();
  return Array(c.length / 3).fill(0).map((g, v) => {
    if (t) {
      const B = e.clone();
      mt(B, 6), u.map = B;
    } else
      u.color = i;
    const y = t ? new ht(new ft(u)) : new N(r, new st(u)), w = v * 3;
    return y.position.set(c[w], c[w + 1], c[w + 2]), t && y.position.normalize().multiplyScalar(1.7), y.scale.setScalar(l), y.lookAt(f.copy(y.position).multiplyScalar(2)), y.userData = {
      color: i,
      opacity: o,
      scale: l,
      hover: h
    }, y;
  });
}, Ee = (s, e, t) => {
  const { isSphere: n, edges: i } = s;
  if (!i.enabled) return [];
  const { color: o, opacity: l, scale: a, hover: d, radius: h, smoothness: r } = i, u = n ? null : gt(h, r, 1.2, 0.25), c = {
    transparent: !0,
    opacity: l
  }, f = [
    0,
    1,
    1,
    0,
    -1,
    1,
    1,
    0,
    1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    1,
    0,
    -1,
    -1,
    0
  ].map((v) => v * 0.925), g = new T();
  return Array(f.length / 3).fill(0).map((v, y) => {
    if (n) {
      const x = e.clone();
      mt(x, t), c.map = x;
    } else
      c.color = o;
    const w = n ? new ht(new ft(c)) : new N(u, new st(c)), B = y * 3;
    return w.position.set(f[B], f[B + 1], f[B + 2]), n && w.position.normalize().multiplyScalar(1.7), w.scale.setScalar(a), w.lookAt(g.copy(w.position).multiplyScalar(2)), !n && !w.position.y && (w.rotation.z = Math.PI / 2), w.userData = {
      color: o,
      opacity: l,
      scale: a,
      hover: d
    }, w;
  });
};
function Ae(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, l = {}, a = s[0].morphTargetsRelative, d = new Ht();
  let h = 0;
  for (let r = 0; r < s.length; ++r) {
    const u = s[r];
    let c = 0;
    if (t !== (u.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const f in u.attributes) {
      if (!n.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + f + '" attribute exists among all geometries, or in none of them.'), null;
      o[f] === void 0 && (o[f] = []), o[f].push(u.attributes[f]), c++;
    }
    if (c !== n.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". Make sure all geometries have the same number of attributes."), null;
    if (a !== u.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const f in u.morphAttributes) {
      if (!i.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ".  .morphAttributes must be consistent throughout all geometries."), null;
      l[f] === void 0 && (l[f] = []), l[f].push(u.morphAttributes[f]);
    }
    if (e) {
      let f;
      if (t)
        f = u.index.count;
      else if (u.attributes.position !== void 0)
        f = u.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". The geometry must have either an index or a position attribute"), null;
      d.addGroup(h, f, r), h += f;
    }
  }
  if (t) {
    let r = 0;
    const u = [];
    for (let c = 0; c < s.length; ++c) {
      const f = s[c].index;
      for (let g = 0; g < f.count; ++g)
        u.push(f.getX(g) + r);
      r += s[c].attributes.position.count;
    }
    d.setIndex(u);
  }
  for (const r in o) {
    const u = zt(o[r]);
    if (!u)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    d.setAttribute(r, u);
  }
  for (const r in l) {
    const u = l[r][0].length;
    if (u === 0) break;
    d.morphAttributes = d.morphAttributes || {}, d.morphAttributes[r] = [];
    for (let c = 0; c < u; ++c) {
      const f = [];
      for (let v = 0; v < l[r].length; ++v)
        f.push(l[r][v][c]);
      const g = zt(f);
      if (!g)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      d.morphAttributes[r].push(g);
    }
  }
  return d;
}
function zt(s) {
  let e, t, n, i = -1, o = 0;
  for (let h = 0; h < s.length; ++h) {
    const r = s[h];
    if (e === void 0 && (e = r.array.constructor), e !== r.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (t === void 0 && (t = r.itemSize), t !== r.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (n === void 0 && (n = r.normalized), n !== r.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (i === -1 && (i = r.gpuType), i !== r.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    o += r.count * t;
  }
  const l = new e(o), a = new et(l, t, n);
  let d = 0;
  for (let h = 0; h < s.length; ++h) {
    const r = s[h];
    if (r.isInterleavedBufferAttribute) {
      const u = d / t;
      for (let c = 0, f = r.count; c < f; c++)
        for (let g = 0; g < t; g++) {
          const v = r.getComponent(c, g);
          a.setComponent(c + u, g, v);
        }
    } else
      l.set(r.array, d);
    d += r.count * t;
  }
  return i !== void 0 && (a.gpuType = i), a;
}
const Me = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: l }
  } = e;
  let a;
  const d = new st({
    color: i,
    side: ne,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    a = new N(
      new ie(1.8, 64, 64),
      d
    );
  else {
    let h;
    s.forEach((r) => {
      const u = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const c = r.geometry.clone();
      c.applyMatrix4(r.matrix), h = h ? Ae([h, c]) : c, r.scale.setScalar(u);
    }), a = new N(h, d);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: l
  }, a;
}, Ct = new pt(), J = new T();
class Nt extends se {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new St(e, 3)), this.setAttribute("uv", new St(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new lt(t, 6, 1);
    return this.setAttribute("instanceStart", new V(n, 3, 0)), this.setAttribute("instanceEnd", new V(n, 3, 3)), this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new lt(t, 6, 1);
    return this.setAttribute("instanceColorStart", new V(n, 3, 0)), this.setAttribute("instanceColorEnd", new V(n, 3, 3)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new oe(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new pt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Ct.setFromBufferAttribute(t), this.boundingBox.union(Ct));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Ft()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, l = e.count; o < l; o++)
        J.fromBufferAttribute(e, o), i = Math.max(i, n.distanceToSquared(J)), J.fromBufferAttribute(t, o), i = Math.max(i, n.distanceToSquared(J));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(e) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(e);
  }
}
nt.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new Q(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
it.line = {
  uniforms: jt.merge([
    nt.common,
    nt.fog,
    nt.line
  ]),
  vertexShader: (
    /* glsl */
    `
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`
  ),
  fragmentShader: (
    /* glsl */
    `
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
  )
};
class yt extends re {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: jt.clone(it.line.uniforms),
      vertexShader: it.line.vertexShader,
      fragmentShader: it.line.fragmentShader,
      clipping: !0
      // required for clipping support
    }), this.isLineMaterial = !0, this.setValues(e);
  }
  get color() {
    return this.uniforms.diffuse.value;
  }
  set color(e) {
    this.uniforms.diffuse.value = e;
  }
  get worldUnits() {
    return "WORLD_UNITS" in this.defines;
  }
  set worldUnits(e) {
    e === !0 ? this.defines.WORLD_UNITS = "" : delete this.defines.WORLD_UNITS;
  }
  get linewidth() {
    return this.uniforms.linewidth.value;
  }
  set linewidth(e) {
    this.uniforms.linewidth && (this.uniforms.linewidth.value = e);
  }
  get dashed() {
    return "USE_DASH" in this.defines;
  }
  set dashed(e) {
    e === !0 !== this.dashed && (this.needsUpdate = !0), e === !0 ? this.defines.USE_DASH = "" : delete this.defines.USE_DASH;
  }
  get dashScale() {
    return this.uniforms.dashScale.value;
  }
  set dashScale(e) {
    this.uniforms.dashScale.value = e;
  }
  get dashSize() {
    return this.uniforms.dashSize.value;
  }
  set dashSize(e) {
    this.uniforms.dashSize.value = e;
  }
  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }
  set dashOffset(e) {
    this.uniforms.dashOffset.value = e;
  }
  get gapSize() {
    return this.uniforms.gapSize.value;
  }
  set gapSize(e) {
    this.uniforms.gapSize.value = e;
  }
  get opacity() {
    return this.uniforms.opacity.value;
  }
  set opacity(e) {
    this.uniforms && (this.uniforms.opacity.value = e);
  }
  get resolution() {
    return this.uniforms.resolution.value;
  }
  set resolution(e) {
    this.uniforms.resolution.value.copy(e);
  }
  get alphaToCoverage() {
    return "USE_ALPHA_TO_COVERAGE" in this.defines;
  }
  set alphaToCoverage(e) {
    this.defines && (e === !0 !== this.alphaToCoverage && (this.needsUpdate = !0), e === !0 ? (this.defines.USE_ALPHA_TO_COVERAGE = "", this.extensions.derivatives = !0) : (delete this.defines.USE_ALPHA_TO_COVERAGE, this.extensions.derivatives = !1));
  }
}
const Ot = new T(), Dt = new T(), E = new F(), A = new F(), O = new F(), at = new T(), ct = new It(), M = new ae(), Pt = new T(), K = new pt(), tt = new Ft(), D = new F();
let P, j;
function Rt(s, e, t) {
  return D.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), D.multiplyScalar(1 / D.w), D.x = j / t.width, D.y = j / t.height, D.applyMatrix4(s.projectionMatrixInverse), D.multiplyScalar(1 / D.w), Math.abs(Math.max(D.x, D.y));
}
function Te(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, l = Math.min(n.instanceCount, i.count);
  for (let a = 0, d = l; a < d; a++) {
    M.start.fromBufferAttribute(i, a), M.end.fromBufferAttribute(o, a), M.applyMatrix4(t);
    const h = new T(), r = new T();
    P.distanceSqToSegment(M.start, M.end, r, h), r.distanceTo(h) < j * 0.5 && e.push({
      point: r,
      pointOnLine: h,
      distance: P.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function Le(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, l = s.matrixWorld, a = s.geometry, d = a.attributes.instanceStart, h = a.attributes.instanceEnd, r = Math.min(a.instanceCount, d.count), u = -e.near;
  P.at(1, O), O.w = 1, O.applyMatrix4(e.matrixWorldInverse), O.applyMatrix4(n), O.multiplyScalar(1 / O.w), O.x *= o.x / 2, O.y *= o.y / 2, O.z = 0, at.copy(O), ct.multiplyMatrices(e.matrixWorldInverse, l);
  for (let c = 0, f = r; c < f; c++) {
    if (E.fromBufferAttribute(d, c), A.fromBufferAttribute(h, c), E.w = 1, A.w = 1, E.applyMatrix4(ct), A.applyMatrix4(ct), E.z > u && A.z > u)
      continue;
    if (E.z > u) {
      const x = E.z - A.z, U = (E.z - u) / x;
      E.lerp(A, U);
    } else if (A.z > u) {
      const x = A.z - E.z, U = (A.z - u) / x;
      A.lerp(E, U);
    }
    E.applyMatrix4(n), A.applyMatrix4(n), E.multiplyScalar(1 / E.w), A.multiplyScalar(1 / A.w), E.x *= o.x / 2, E.y *= o.y / 2, A.x *= o.x / 2, A.y *= o.y / 2, M.start.copy(E), M.start.z = 0, M.end.copy(A), M.end.z = 0;
    const v = M.closestPointToPointParameter(at, !0);
    M.at(v, Pt);
    const y = ce.lerp(E.z, A.z, v), w = y >= -1 && y <= 1, B = at.distanceTo(Pt) < j * 0.5;
    if (w && B) {
      M.start.fromBufferAttribute(d, c), M.end.fromBufferAttribute(h, c), M.start.applyMatrix4(l), M.end.applyMatrix4(l);
      const x = new T(), U = new T();
      P.distanceSqToSegment(M.start, M.end, U, x), t.push({
        point: U,
        pointOnLine: x,
        distance: P.origin.distanceTo(U),
        object: s,
        face: null,
        faceIndex: c,
        uv: null,
        uv1: null
      });
    }
  }
}
class Be extends N {
  constructor(e = new Nt(), t = new yt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let l = 0, a = 0, d = t.count; l < d; l++, a += 2)
      Ot.fromBufferAttribute(t, l), Dt.fromBufferAttribute(n, l), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + Ot.distanceTo(Dt);
    const o = new lt(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new V(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new V(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    P = e.ray;
    const l = this.matrixWorld, a = this.geometry, d = this.material;
    j = d.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), tt.copy(a.boundingSphere).applyMatrix4(l);
    let h;
    if (n)
      h = j * 0.5;
    else {
      const u = Math.max(i.near, tt.distanceToPoint(P.origin));
      h = Rt(i, u, d.resolution);
    }
    if (tt.radius += h, P.intersectsSphere(tt) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), K.copy(a.boundingBox).applyMatrix4(l);
    let r;
    if (n)
      r = j * 0.5;
    else {
      const u = Math.max(i.near, K.distanceToPoint(P.origin));
      r = Rt(i, u, d.resolution);
    }
    K.expandByScalar(r), P.intersectsBox(K) !== !1 && (n ? Te(this, t) : Le(this, i, t));
  }
}
class $t extends Nt {
  constructor() {
    super(), this.isLineGeometry = !0, this.type = "LineGeometry";
  }
  setPositions(e) {
    const t = e.length - 3, n = new Float32Array(2 * t);
    for (let i = 0; i < t; i += 3)
      n[2 * i] = e[i], n[2 * i + 1] = e[i + 1], n[2 * i + 2] = e[i + 2], n[2 * i + 3] = e[i + 3], n[2 * i + 4] = e[i + 4], n[2 * i + 5] = e[i + 5];
    return super.setPositions(n), this;
  }
  setColors(e) {
    const t = e.length - 3, n = new Float32Array(2 * t);
    for (let i = 0; i < t; i += 3)
      n[2 * i] = e[i], n[2 * i + 1] = e[i + 1], n[2 * i + 2] = e[i + 2], n[2 * i + 3] = e[i + 3], n[2 * i + 4] = e[i + 4], n[2 * i + 5] = e[i + 5];
    return super.setColors(n), this;
  }
  fromLine(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
}
class Ue extends Be {
  constructor(e = new $t(), t = new yt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const ze = (s) => {
  const e = new kt(), t = [], n = [], { isSphere: i } = s;
  if (Y.forEach((a, d) => {
    const { line: h, scale: r, color: u } = s[a];
    if (!h) return;
    const c = d < 3 ? 1 : -1, g = (i ? 1.4 - r / 2 : 0.975) * c;
    t.push(
      a.includes("x") ? g : 0,
      a.includes("y") ? g : 0,
      a.includes("z") ? g : 0,
      0,
      0,
      0
    );
    const v = e.set(u).toArray();
    n.push(...v, ...v);
  }), !t.length) return null;
  const o = new $t().setPositions(t).setColors(n), l = new yt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new Q(window.innerWidth, window.innerHeight)
  });
  return new Ue(o, l).computeLineDistances();
}, Ce = (s) => {
  const { corners: e, edges: t } = s, n = [], i = we(s), o = Se(s, i);
  n.push(...o), e.enabled && n.push(...xe(s, i)), t.enabled && n.push(...Ee(s, i, e.enabled ? 7 : 6));
  const l = Me(o, s), a = ze(s);
  return [n, l, a];
}, X = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: l } = e ? n.hover : n;
  s.scale.setScalar(l), t.opacity = i, t.map ? be(t.map, e) : t.color.set(o);
}, q = /* @__PURE__ */ new It(), Oe = /* @__PURE__ */ new Wt(), Gt = /* @__PURE__ */ new T(), De = /* @__PURE__ */ new Q();
class Ge extends le {
  /**
   * Creates a new ViewportGizmo instance.
   *
   * @param camera - The camera to be controlled by this gizmo
   * @param renderer - The WebGL renderer used to render the scene
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.size - Size of the gizmo widget in pixels
   * @param options.placement - Position of the gizmo in the viewport. One of:
   *
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   *
   * @param options.animated - Whether view changes should be animated
   * @param options.speed - Animation speed multiplier
   * @param options.lineWidth - Width of the axis lines
   * @param options.offset - Offset from the container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.sphere - Configuration for the background sphere
   * @param options.sphere.enabled - Whether to show the background sphere
   * @param options.sphere.color - Color of the background sphere
   * @param options.sphere.opacity - Opacity of the background sphere
   * @param options.sphere.hoverColor - Hover color of the background sphere
   * @param options.sphere.hoverOpacity - Hover opacity of the background sphere
   * @param options.id - HTML id attribute for the gizmo container
   * @param options.className - HTML class attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.resolution - Resolution of the gizmo rendering
   * @param options.x - Configuration for positive X axis
   * @param options.y - Configuration for positive Y axis
   * @param options.z - Configuration for positive Z axis
   * @param options.nx - Configuration for negative X axis
   * @param options.ny - Configuration for negative Y axis
   * @param options.nz - Configuration for negative Z axis
   *
   * @AXIS The following is the configuration for each AXIS `options.[x | y | z | nx | ny | nz]`:
   *
   * @param options.AXIS.text - Custom text label for the axis
   * @param options.AXIS.circle - Whether to draw a circle indicator
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.border - Whether to draw a border around the axis indicator
   * @param options.AXIS.colors - Color configuration for the axis
   * @param options.AXIS.colors.main - Main color(s) for the axis. Can be a single color or [normal, hover] colors
   * @param options.AXIS.colors.hover - Hover color for the axis
   * @param options.AXIS.colors.text - Color for the axis label
   * @param options.AXIS.colors.hoverText - Color for the axis label on hover
   */
  constructor(t, n, i = {}) {
    super();
    m(this, "type", "ViewportGizmo");
    /** Whether the gizmo is currently active and responding to user input */
    m(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    m(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    m(this, "renderer");
    /** The configuration options */
    m(this, "options");
    /** The point around which the camera rotates */
    m(this, "target", new T());
    /** Whether view changes should be animated */
    m(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    m(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    m(this, "animating", !1);
    m(this, "_options");
    m(this, "_intersections");
    m(this, "_background", null);
    m(this, "_viewport", new F());
    m(this, "_originalViewport", new F());
    m(this, "_originalScissor", new F());
    m(this, "_camera");
    m(this, "_container");
    m(this, "_domElement");
    m(this, "_domRect");
    m(this, "_dragging", !1);
    m(this, "_distance", 0);
    m(this, "_clock", new de());
    m(this, "_targetPosition", new T());
    m(this, "_targetQuaternion", new ot());
    m(this, "_quaternionStart", new ot());
    m(this, "_quaternionEnd", new ot());
    m(this, "_pointerStart", new Q());
    m(this, "_focus", null);
    m(this, "_placement");
    m(this, "_controls");
    m(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this.set(i);
  }
  get placement() {
    return this._placement;
  }
  set placement(t) {
    this._placement = t, qt(this._domElement, t);
  }
  set(t = {}) {
    this.dispose(), this.options = t, this._options = _e(t), this._camera = this._options.isSphere ? new ue(-1.8, 1.8, 1.8, -1.8, 5, 10) : new he(25, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = Ce(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: l, animated: a, speed: d } = this._options;
    return this.animated = a, this.speed = d, this._container = l ? pe(l) : document.body, this._domElement = fe(this._options), this._domElement.onpointerdown = (h) => this._onPointerDown(h), this._domElement.onpointermove = (h) => this._onPointerMove(h), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
  }
  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    this.animating && this._animate();
    const { renderer: t, _viewport: n } = this, i = t.getScissorTest(), o = t.autoClear;
    return t.autoClear = !1, t.setViewport(n), i && t.setScissor(n), t.clear(!1, !0, !1), t.render(this, this._camera), t.setViewport(this._originalViewport), i && t.setScissor(this._originalScissor), t.autoClear = o, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, n = this._domRect, i = t.domElement.getBoundingClientRect();
    return this._viewport.set(
      n.left - i.left,
      t.domElement.clientHeight - (n.top - i.top + n.height),
      n.width,
      n.height
    ), t.getViewport(this._originalViewport), t.getScissorTest() && t.getScissor(this._originalScissor), this;
  }
  /**
   * Updates the gizmo's orientation to match the current camera orientation.
   *
   * @returns The gizmo instance for method chaining
   */
  cameraUpdate() {
    return this._updateOrientation(), this;
  }
  /**
   * Performs a complete update of the gizmo, including both DOM and camera-related updates.
   *
   * @param controls - Internal. Set to `false` if the update event comes from the attached controls.
   *
   * @returns The gizmo instance for method chaining
   */
  update(t = !0) {
    return t && this._controls && this._controls.update(), this.domUpdate().cameraUpdate();
  }
  /**
   * Connects OrbitControls with the gizmo, handling interaction states and updates.
   * Automatically detaches any previously attached controls.
   *
   * @param controls - The scene's {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
   */
  attachControls(t) {
    return this.detachControls(), this.target = t.target, this._controlsListeners = {
      start: () => t.enabled = !1,
      end: () => t.enabled = !0,
      change: () => this.update(!1)
    }, this.addEventListener("start", this._controlsListeners.start), this.addEventListener("end", this._controlsListeners.end), t.addEventListener("change", this._controlsListeners.change), this._controls = t, this;
  }
  /** Removes all control event listeners and references. Safe to call multiple times. */
  detachControls() {
    if (!(!this._controlsListeners || !this._controls))
      return this.target = new T().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((n) => {
      var o, l, a, d;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (a = (l = i.material) == null ? void 0 : l.map) == null || a.dispose(), (d = i.geometry) == null || d.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Mt(this._options, this._intersections, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    const { position: t, quaternion: n } = this.camera;
    if (t.set(0, 0, 1), !this.animated) {
      t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target), n.copy(this._targetQuaternion), this._updateOrientation(), this.animating = !1, this.dispatchEvent({ type: "change" }), this.dispatchEvent({ type: "end" });
      return;
    }
    const o = this._clock.getDelta() * ye * this.speed;
    this._quaternionStart.rotateTowards(this._quaternionEnd, o), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) < rt && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const n = this.camera, i = this.target;
    this._targetPosition.copy(t).multiplyScalar(this._distance), q.setPosition(this._targetPosition).lookAt(this._targetPosition, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(q), this._targetPosition.add(i), q.lookAt(this._targetPosition, i, this.up), this._quaternionEnd.setFromRotationMatrix(q), q.setPosition(n.position).lookAt(n.position, i, this.up), this._quaternionStart.setFromRotationMatrix(q), this.animating = !0, this._clock.start(), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const n = (d) => {
      if (!this._dragging) {
        if (ge(d, this._pointerStart)) return;
        this._dragging = !0;
      }
      const h = De.set(d.clientX, d.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), r = Oe.setFromVector3(
        Gt.subVectors(this.camera.position, this.target)
      );
      r.theta = l - h.x, r.phi = dt(
        a - h.y,
        rt,
        Math.PI - rt
      ), this.camera.position.setFromSpherical(r).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (X(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = new Wt().setFromVector3(
      Gt.subVectors(this.camera.position, this.target)
    ), l = o.theta, a = o.phi;
    this._distance = o.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", i, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && Ut(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._background && Ut(this._background, !1), this._focus && X(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Bt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    this._focus && (X(this._focus, !1), this._focus = null), n && (this._setOrientation(n.object.position), this.dispatchEvent({ type: "change" }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const n = Bt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && X(this._focus, !1), (this._focus = i) ? X(i, !0) : Mt(this._options, this._intersections, this.camera));
  }
}
export {
  Ge as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
