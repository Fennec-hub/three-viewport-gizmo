var Qt = Object.defineProperty;
var Jt = (s, e, t) => e in s ? Qt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => Jt(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as T, Raycaster as Zt, Vector2 as Q, Color as Rt, CanvasTexture as Kt, SRGBColorSpace as te, RepeatWrapping as wt, BufferGeometry as Gt, BufferAttribute as et, Sprite as ht, SpriteMaterial as ft, Mesh as N, MeshBasicMaterial as st, BackSide as ee, SphereGeometry as ne, Box3 as pt, InstancedBufferGeometry as ie, Float32BufferAttribute as St, InstancedInterleavedBuffer as lt, InterleavedBufferAttribute as V, WireframeGeometry as se, Sphere as kt, UniformsLib as nt, ShaderLib as it, UniformsUtils as Ht, ShaderMaterial as oe, Vector4 as j, Matrix4 as It, Line3 as re, MathUtils as ae, Object3D as ce, Clock as le, Quaternion as ot, OrthographicCamera as de, PerspectiveCamera as ue, Spherical as jt } from "three";
const Ft = (s, e) => {
  const [t, n] = e.split("-");
  return Object.assign(s.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), e;
}, he = ({
  placement: s,
  size: e,
  offset: t,
  id: n,
  className: i
}) => {
  const o = document.createElement("div"), { top: l, left: a, right: c, bottom: h } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${l}px ${c}px ${h}px ${a}px`,
    borderRadius: "100%"
  }), Ft(o, s), n && (o.id = n), i && (o.className = i), o;
}, fe = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function dt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const pe = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], xt = /* @__PURE__ */ new T();
function Et({ isSphere: s }, e, t) {
  s && (xt.set(0, 0, 1).applyQuaternion(t.quaternion), pe.forEach(([n, i, o]) => {
    const l = xt[n];
    let a = e[i], c = a.userData.opacity;
    a.material.opacity = dt(l >= 0 ? c : c / 2, 0, 1), a = e[o], c = a.userData.opacity, a.material.opacity = dt(l >= 0 ? c / 2 : c, 0, 1);
  }));
}
const me = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, At = /* @__PURE__ */ new Zt(), Mt = /* @__PURE__ */ new Q(), Tt = (s, e, t, n) => {
  Mt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), At.setFromCamera(Mt, t);
  const i = At.intersectObjects(
    n,
    !1
  ), o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, rt = 1e-6, ge = 2 * Math.PI, Wt = ["x", "y", "z"], Y = [...Wt, "nx", "ny", "nz"], ye = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], qt = 1.3, Lt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, I = (s) => JSON.parse(JSON.stringify(s)), ve = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = s.resolution || t ? 64 : 128, { container: i } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = i, ye.forEach((c, h) => {
    s[c] && (s[Y[h]] = s[c]);
  });
  const o = {
    enabled: !0,
    color: 16777215,
    opacity: 1,
    scale: 0.7,
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
      scale: 0.7,
      border: {
        size: 0,
        color: 14540253
      }
    }
  }, l = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, a = {
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
      color: t ? 15915362 : 16777215,
      opacity: 1,
      scale: t ? 0.15 : 0.2,
      radius: 1,
      smoothness: 18,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.2 : 0.225
      }
    },
    edges: {
      enabled: !t,
      color: t ? 15915362 : 16777215,
      opacity: t ? 1 : 0,
      radius: t ? 1 : 0.125,
      smoothness: 18,
      scale: t ? 0.15 : 1,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.2 : 1
      }
    },
    x: {
      ...I(o),
      ...t ? {
        label: "X",
        color: 16725587,
        line: !0
      } : {
        label: "Right"
      }
    },
    y: {
      ...I(o),
      ...t ? {
        label: "Y",
        color: 9100032,
        line: !0
      } : {
        label: "Top"
      }
    },
    z: {
      ...I(o),
      ...t ? {
        label: "Z",
        color: 2920447,
        line: !0
      } : {
        label: "Front"
      }
    },
    nx: {
      ...I(l),
      label: t ? "" : "Left"
    },
    ny: {
      ...I(l),
      label: t ? "" : "Bottom"
    },
    nz: {
      ...I(l),
      label: t ? "" : "Back"
    }
  };
  return ut(s, a), Wt.forEach(
    (c) => ut(
      s[`n${c}`],
      I(s[c])
    )
  ), { ...s, isSphere: t };
};
function ut(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = ut(
        s[n] || {},
        t[n]
      )));
  return s;
}
const _e = (s, e = 2) => {
  const t = new Rt(), n = e * 2, { isSphere: i, resolution: o, radius: l, font: a, corners: c, edges: h } = s, r = Y.map((p) => ({ ...s[p], radius: l }));
  i && c.enabled && r.push(c), i && h.enabled && r.push(h);
  const u = document.createElement("canvas"), d = u.getContext("2d");
  u.width = o * 2 + n * 2, u.height = o * r.length + n * r.length;
  const [f, y] = $(r, o, a);
  r.forEach(
    ({
      radius: p,
      label: S,
      color: k,
      labelColor: b,
      border: w,
      hover: {
        color: H,
        labelColor: z,
        border: C
      }
    }, R) => {
      const G = o * R + R * n + e;
      B(
        e,
        G,
        e,
        o,
        p,
        S,
        w,
        k,
        b
      ), B(
        o + e * 3,
        G,
        e,
        o,
        p,
        S,
        C ?? w,
        H ?? k,
        z ?? b
      );
    }
  );
  const _ = r.length, v = e / (o * 2), m = e / (o * 6), L = 1 / _, x = new Kt(u);
  return x.repeat.set(0.5 - 2 * v, L - 2 * m), x.offset.set(v, 1 - m), Object.assign(x, {
    colorSpace: te,
    wrapS: wt,
    wrapT: wt,
    userData: {
      offsetX: v,
      offsetY: m,
      cellHeight: L
    }
  }), x;
  function B(p, S, k, b, w, H, z, C, R) {
    if (w = w * (b / 2), C != null && C !== "" && (G(), d.fillStyle = t.set(C).getStyle(), d.fill()), z && z.size) {
      const W = z.size * b / 2;
      p += W, S += W, b -= z.size * b, w = Math.max(0, w - W), G(), d.strokeStyle = t.set(z.color).getStyle(), d.lineWidth = z.size * b, d.stroke();
    }
    H && U(
      d,
      p + b / 2,
      S + (b + k) / 2,
      H,
      t.set(R).getStyle()
    );
    function G() {
      d.beginPath(), d.moveTo(p + w, S), d.lineTo(p + b - w, S), d.arcTo(p + b, S, p + b, S + w, w), d.lineTo(p + b, S + b - w), d.arcTo(p + b, S + b, p + b - w, S + b, w), d.lineTo(p + w, S + b), d.arcTo(p, S + b, p, S + b - w, w), d.lineTo(p, S + w), d.arcTo(p, S, p + w, S, w), d.closePath();
    }
  }
  function $(p, S, k) {
    const w = [...p].sort((J, Yt) => {
      var _t, bt;
      return (((_t = J.label) == null ? void 0 : _t.length) || 0) - (((bt = Yt.label) == null ? void 0 : bt.length) || 0);
    }).pop().label, { family: H, weight: z } = k, C = i ? Math.sqrt(Math.pow(S * 0.7, 2) / 2) : S;
    let R = C, G = 0, W = 0;
    do {
      d.font = `${z} ${R}px ${H}`;
      const J = d.measureText(w);
      G = J.width, W = J.fontBoundingBoxDescent, R--;
    } while (G > C && R > 0);
    const vt = C / W, $t = Math.min(C / G, vt), Xt = Math.floor(R * $t);
    return [`${z} ${Xt}px ${H}`, vt];
  }
  function U(p, S, k, b, w) {
    p.font = f, p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = w, p.fillText(b, S, k + (i ? y : 0));
  }
}, be = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, mt = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function gt(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, l = s / t, a = (t - s) / t, c = s / n, h = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], u = [a, h, l, h, l, c, a, c], d = [
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
    (U) => d[U]
  );
  let y, _, v, m, L, x, B, $;
  for (let U = 0; U < 4; U++) {
    m = U < 1 || U > 2 ? i : -i, L = U < 2 ? o : -o, x = U < 1 || U > 2 ? a : l, B = U < 2 ? h : c;
    for (let p = 0; p <= e; p++)
      y = Math.PI / 2 * (U + p / e), _ = Math.cos(y), v = Math.sin(y), r.push(m + s * _, L + s * v, 0), u.push(x + l * _, B + c * v), p < e && ($ = (e + 1) * U + p + 4, f.push(U, $, $ + 1));
  }
  return new Gt().setIndex(new et(new Uint32Array(f), 1)).setAttribute(
    "position",
    new et(new Float32Array(r), 3)
  ).setAttribute("uv", new et(new Float32Array(u), 2));
}
const we = (s, e) => {
  const t = new T(), { isSphere: n, radius: i, smoothness: o } = s, l = gt(i, o);
  return Y.map((a, c) => {
    const h = c < 3, r = Y[c], u = c ? e.clone() : e;
    mt(u, c);
    const { enabled: d, scale: f, opacity: y, hover: _ } = s[r], v = {
      map: u,
      opacity: y,
      transparent: !0
    }, m = n ? new ht(new ft(v)) : new N(l, new st(v)), L = h ? r : r[1];
    return m.position[L] = (h ? 1 : -1) * (n ? qt : 1), n || m.lookAt(t.copy(m.position).multiplyScalar(1.7)), m.scale.setScalar(f), m.renderOrder = 1, m.visible = d, m.userData = {
      scale: f,
      opacity: y,
      hover: _
    }, m;
  });
}, Se = (s, e) => {
  const { isSphere: t, corners: n } = s;
  if (!n.enabled) return [];
  const { color: i, opacity: o, scale: l, radius: a, smoothness: c, hover: h } = n, r = t ? null : gt(a, c), u = {
    transparent: !0,
    opacity: o
  }, d = [
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
  ].map((y) => y * 0.85), f = new T();
  return Array(d.length / 3).fill(0).map((y, _) => {
    if (t) {
      const L = e.clone();
      mt(L, 6), u.map = L;
    } else
      u.color = i;
    const v = t ? new ht(new ft(u)) : new N(r, new st(u)), m = _ * 3;
    return v.position.set(d[m], d[m + 1], d[m + 2]), t && v.position.normalize().multiplyScalar(1.7), v.scale.setScalar(l), v.lookAt(f.copy(v.position).multiplyScalar(2)), v.renderOrder = 1, v.userData = {
      color: i,
      opacity: o,
      scale: l,
      hover: h
    }, v;
  });
}, xe = (s, e, t) => {
  const { isSphere: n, edges: i } = s;
  if (!i.enabled) return [];
  const { color: o, opacity: l, scale: a, hover: c, radius: h, smoothness: r } = i, u = n ? null : gt(h, r, 1.2, 0.25), d = {
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
  ].map((_) => _ * 0.925), y = new T();
  return Array(f.length / 3).fill(0).map((_, v) => {
    if (n) {
      const x = e.clone();
      mt(x, t), d.map = x;
    } else
      d.color = o;
    const m = n ? new ht(new ft(d)) : new N(u, new st(d)), L = v * 3;
    return m.position.set(f[L], f[L + 1], f[L + 2]), n && m.position.normalize().multiplyScalar(1.7), m.scale.setScalar(a), m.lookAt(y.copy(m.position).multiplyScalar(2)), !n && !m.position.y && (m.rotation.z = Math.PI / 2), m.renderOrder = 1, m.userData = {
      color: o,
      opacity: l,
      scale: a,
      hover: c
    }, m;
  });
};
function Ee(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, l = {}, a = s[0].morphTargetsRelative, c = new Gt();
  let h = 0;
  for (let r = 0; r < s.length; ++r) {
    const u = s[r];
    let d = 0;
    if (t !== (u.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const f in u.attributes) {
      if (!n.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + f + '" attribute exists among all geometries, or in none of them.'), null;
      o[f] === void 0 && (o[f] = []), o[f].push(u.attributes[f]), d++;
    }
    if (d !== n.size)
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
      c.addGroup(h, f, r), h += f;
    }
  }
  if (t) {
    let r = 0;
    const u = [];
    for (let d = 0; d < s.length; ++d) {
      const f = s[d].index;
      for (let y = 0; y < f.count; ++y)
        u.push(f.getX(y) + r);
      r += s[d].attributes.position.count;
    }
    c.setIndex(u);
  }
  for (const r in o) {
    const u = Ut(o[r]);
    if (!u)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    c.setAttribute(r, u);
  }
  for (const r in l) {
    const u = l[r][0].length;
    if (u === 0) break;
    c.morphAttributes = c.morphAttributes || {}, c.morphAttributes[r] = [];
    for (let d = 0; d < u; ++d) {
      const f = [];
      for (let _ = 0; _ < l[r].length; ++_)
        f.push(l[r][_][d]);
      const y = Ut(f);
      if (!y)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      c.morphAttributes[r].push(y);
    }
  }
  return c;
}
function Ut(s) {
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
  let c = 0;
  for (let h = 0; h < s.length; ++h) {
    const r = s[h];
    if (r.isInterleavedBufferAttribute) {
      const u = c / t;
      for (let d = 0, f = r.count; d < f; d++)
        for (let y = 0; y < t; y++) {
          const _ = r.getComponent(d, y);
          a.setComponent(d + u, y, _);
        }
    } else
      l.set(r.array, c);
    c += r.count * t;
  }
  return i !== void 0 && (a.gpuType = i), a;
}
const Ae = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: l }
  } = e;
  let a;
  const c = new st({
    color: i,
    side: ee,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    a = new N(
      new ne(1.8, 64, 64),
      c
    );
  else {
    let h;
    s.forEach((r) => {
      const u = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const d = r.geometry.clone();
      d.applyMatrix4(r.matrix), h = h ? Ee([h, d]) : d, r.scale.setScalar(u);
    }), a = new N(h, c);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: l
  }, a;
}, Bt = new pt(), Z = new T();
class Vt extends ie {
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
    return this.fromWireframeGeometry(new se(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new pt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Bt.setFromBufferAttribute(t), this.boundingBox.union(Bt));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new kt()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, l = e.count; o < l; o++)
        Z.fromBufferAttribute(e, o), i = Math.max(i, n.distanceToSquared(Z)), Z.fromBufferAttribute(t, o), i = Math.max(i, n.distanceToSquared(Z));
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
  uniforms: Ht.merge([
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
class yt extends oe {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: Ht.clone(it.line.uniforms),
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
const zt = new T(), Ct = new T(), E = new j(), A = new j(), O = new j(), at = new T(), ct = new It(), M = new re(), Ot = new T(), K = new pt(), tt = new kt(), D = new j();
let P, F;
function Dt(s, e, t) {
  return D.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), D.multiplyScalar(1 / D.w), D.x = F / t.width, D.y = F / t.height, D.applyMatrix4(s.projectionMatrixInverse), D.multiplyScalar(1 / D.w), Math.abs(Math.max(D.x, D.y));
}
function Me(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, l = Math.min(n.instanceCount, i.count);
  for (let a = 0, c = l; a < c; a++) {
    M.start.fromBufferAttribute(i, a), M.end.fromBufferAttribute(o, a), M.applyMatrix4(t);
    const h = new T(), r = new T();
    P.distanceSqToSegment(M.start, M.end, r, h), r.distanceTo(h) < F * 0.5 && e.push({
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
function Te(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, l = s.matrixWorld, a = s.geometry, c = a.attributes.instanceStart, h = a.attributes.instanceEnd, r = Math.min(a.instanceCount, c.count), u = -e.near;
  P.at(1, O), O.w = 1, O.applyMatrix4(e.matrixWorldInverse), O.applyMatrix4(n), O.multiplyScalar(1 / O.w), O.x *= o.x / 2, O.y *= o.y / 2, O.z = 0, at.copy(O), ct.multiplyMatrices(e.matrixWorldInverse, l);
  for (let d = 0, f = r; d < f; d++) {
    if (E.fromBufferAttribute(c, d), A.fromBufferAttribute(h, d), E.w = 1, A.w = 1, E.applyMatrix4(ct), A.applyMatrix4(ct), E.z > u && A.z > u)
      continue;
    if (E.z > u) {
      const x = E.z - A.z, B = (E.z - u) / x;
      E.lerp(A, B);
    } else if (A.z > u) {
      const x = A.z - E.z, B = (A.z - u) / x;
      A.lerp(E, B);
    }
    E.applyMatrix4(n), A.applyMatrix4(n), E.multiplyScalar(1 / E.w), A.multiplyScalar(1 / A.w), E.x *= o.x / 2, E.y *= o.y / 2, A.x *= o.x / 2, A.y *= o.y / 2, M.start.copy(E), M.start.z = 0, M.end.copy(A), M.end.z = 0;
    const _ = M.closestPointToPointParameter(at, !0);
    M.at(_, Ot);
    const v = ae.lerp(E.z, A.z, _), m = v >= -1 && v <= 1, L = at.distanceTo(Ot) < F * 0.5;
    if (m && L) {
      M.start.fromBufferAttribute(c, d), M.end.fromBufferAttribute(h, d), M.start.applyMatrix4(l), M.end.applyMatrix4(l);
      const x = new T(), B = new T();
      P.distanceSqToSegment(M.start, M.end, B, x), t.push({
        point: B,
        pointOnLine: x,
        distance: P.origin.distanceTo(B),
        object: s,
        face: null,
        faceIndex: d,
        uv: null,
        uv1: null
      });
    }
  }
}
class Le extends N {
  constructor(e = new Vt(), t = new yt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let l = 0, a = 0, c = t.count; l < c; l++, a += 2)
      zt.fromBufferAttribute(t, l), Ct.fromBufferAttribute(n, l), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + zt.distanceTo(Ct);
    const o = new lt(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new V(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new V(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    P = e.ray;
    const l = this.matrixWorld, a = this.geometry, c = this.material;
    F = c.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), tt.copy(a.boundingSphere).applyMatrix4(l);
    let h;
    if (n)
      h = F * 0.5;
    else {
      const u = Math.max(i.near, tt.distanceToPoint(P.origin));
      h = Dt(i, u, c.resolution);
    }
    if (tt.radius += h, P.intersectsSphere(tt) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), K.copy(a.boundingBox).applyMatrix4(l);
    let r;
    if (n)
      r = F * 0.5;
    else {
      const u = Math.max(i.near, K.distanceToPoint(P.origin));
      r = Dt(i, u, c.resolution);
    }
    K.expandByScalar(r), P.intersectsBox(K) !== !1 && (n ? Me(this, t) : Te(this, i, t));
  }
}
class Nt extends Vt {
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
class Ue extends Le {
  constructor(e = new Nt(), t = new yt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const Be = (s) => {
  const e = new Rt(), t = [], n = [], { isSphere: i } = s;
  if (Y.forEach((a, c) => {
    const { enabled: h, line: r, scale: u, color: d } = s[a];
    if (!h || !r) return;
    const f = c < 3 ? 1 : -1, _ = (i ? qt - u / 2 : 0.975) * f;
    t.push(
      a.includes("x") ? _ : 0,
      a.includes("y") ? _ : 0,
      a.includes("z") ? _ : 0,
      0,
      0,
      0
    );
    const v = e.set(d).toArray();
    n.push(...v, ...v);
  }), !t.length) return null;
  const o = new Nt().setPositions(t).setColors(n), l = new yt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new Q(window.innerWidth, window.innerHeight)
  });
  return new Ue(o, l).computeLineDistances();
}, ze = (s) => {
  const { corners: e, edges: t } = s, n = [], i = _e(s), o = we(s, i);
  n.push(...o), e.enabled && n.push(...Se(s, i)), t.enabled && n.push(...xe(s, i, e.enabled ? 7 : 6));
  const l = Ae(o, s), a = Be(s);
  return [n, l, a];
}, X = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: l } = e ? n.hover : n;
  s.scale.setScalar(l), t.opacity = i, t.map ? be(t.map, e) : t.color.set(o);
}, q = /* @__PURE__ */ new It(), Ce = /* @__PURE__ */ new jt(), Pt = /* @__PURE__ */ new T(), Oe = /* @__PURE__ */ new Q();
class Re extends ce {
  /**
   * Creates a new ViewportGizmo instance.
   *
   * @param camera - The camera to be controlled by this gizmo
   * @param renderer - The WebGL renderer used to render the scene
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo.
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.type - The gizmo configuration type. Either 'sphere' or 'cube', defaults to 'sphere'
   * @param options.size - Size of the gizmo widget in pixels. Defaults to 128
   * @param options.placement - Position of the gizmo in the viewport
   *    Options include:
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   * @param options.offset - Offset of the gizmo from container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.animated - Whether view changes should be animated. Defaults to true
   * @param options.speed - Animation speed multiplier. Defaults to 1
   * @param options.resolution - Texture resolution. Defaults to 64 for sphere, 128 for cube
   * @param options.lineWidth - Width of the axes lines in pixels
   * @param options.id - HTML `id` attribute for the gizmo container
   * @param options.className - HTML `class` attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.background - Configuration for the background sphere/cube
   * @param options.background.enabled - Whether to display the background
   * @param options.background.color - Color of the background in normal state
   * @param options.background.opacity - Opacity of the background in normal state
   * @param options.background.hover.color - Color of the background when hovered
   * @param options.background.hover.opacity - Opacity of the background when hovered
   * @param options.corners - Configuration for corner indicators
   * @param options.corners.enabled - Whether to display corner indicators
   * @param options.corners.color - Base color of corner indicators
   * @param options.corners.opacity - Opacity of corner indicators
   * @param options.corners.scale - Scale multiplier for corner indicators
   * @param options.corners.radius - Radius of corner indicators
   * @param options.corners.smoothness - Smoothness of corner indicators
   * @param options.corners.hover.color - Color of corner indicators when hovered
   * @param options.corners.hover.opacity - Opacity of corner indicators when hovered
   * @param options.corners.hover.scale - Scale of corner indicators when hovered
   * @param options.edges - Configuration for edge indicators
   * @param options.edges.enabled - Whether to display edge indicators
   * @param options.edges.color - Base color of edge indicators
   * @param options.edges.opacity - Opacity of edge indicators
   * @param options.edges.scale - Scale multiplier for edge indicators
   * @param options.edges.radius - Radius of edge indicators
   * @param options.edges.smoothness - Smoothness of edge indicators
   * @param options.edges.hover.color - Color of edge indicators when hovered
   * @param options.edges.hover.opacity - Opacity of edge indicators when hovered
   * @param options.edges.hover.scale - Scale of edge indicators when hovered
   * @param options.x - Configuration for positive X axis/face
   * @param options.y - Configuration for positive Y axis/face
   * @param options.z - Configuration for positive Z axis/face
   * @param options.nx - Configuration for negative X axis/face
   * @param options.ny - Configuration for negative Y axis/face
   * @param options.nz - Configuration for negative Z axis/face
   *
   * @remarks Axis-specific configuration can also use alias names for cube mode:
   * - `right` (same as `x`)
   * - `left` (same as `nx`)
   * - `top` (same as `y`)
   * - `bottom` (same as `ny`)
   * - `front` (same as `z`)
   * - `back` (same as `nz`)
   *
   * For each axis/face configuration, the following options are available:
   * @param options.AXIS.enabled - Whether to draw the axis
   * @param options.AXIS.label - Custom text label for the axis
   * @param options.AXIS.opacity - Axis opacity
   * @param options.AXIS.scale - Scale multiplier for indicator size
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.color - Axis indicator background color
   * @param options.AXIS.labelColor - Axis label color
   * @param options.AXIS.border.size - Border size around the axis indicator
   * @param options.AXIS.border.color - Border color around the axis indicator
   * @param options.AXIS.hover.color - Fill color on hover
   * @param options.AXIS.hover.labelColor - Label text color on hover
   * @param options.AXIS.hover.opacity - Opacity when hovered
   * @param options.AXIS.hover.scale - Indicator scale when hovered
   * @param options.AXIS.hover.border.size - Hover border size
   * @param options.AXIS.hover.border.color - Hover border color
   */
  constructor(t, n, i = {}) {
    super();
    g(this, "type", "ViewportGizmo");
    /** Whether the gizmo is currently active and responding to user input */
    g(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    g(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    g(this, "renderer");
    /** The configuration options */
    g(this, "options");
    /** The point around which the camera rotates */
    g(this, "target", new T());
    /** Whether view changes should be animated */
    g(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    g(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    g(this, "animating", !1);
    g(this, "_options");
    g(this, "_intersections");
    g(this, "_background", null);
    g(this, "_viewport", new j());
    g(this, "_originalViewport", new j());
    g(this, "_originalScissor", new j());
    g(this, "_camera");
    g(this, "_container");
    g(this, "_domElement");
    g(this, "_domRect");
    g(this, "_dragging", !1);
    g(this, "_distance", 0);
    g(this, "_clock", new le());
    g(this, "_targetPosition", new T());
    g(this, "_targetQuaternion", new ot());
    g(this, "_quaternionStart", new ot());
    g(this, "_quaternionEnd", new ot());
    g(this, "_pointerStart", new Q());
    g(this, "_focus", null);
    g(this, "_placement");
    g(this, "_controls");
    g(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this.set(i);
  }
  /** Gets the current placement of the gizmo relative to its container. */
  get placement() {
    return this._placement;
  }
  /**
   * Sets and update the placement of the gizmo relative to its container.
   *
   * @param placement - The new placement position
   */
  set placement(t) {
    this._placement = Ft(this._domElement, t), this.domUpdate();
  }
  /**
   * Regenerates the gizmo with the new options.
   *
   * @remarks
   * - Not recommended for use in real-time rendering or animation loops
   * - Provides a way to completely rebuild the gizmo with new options
   * - Can be computationally expensive, so use sparingly
   */
  set(t = {}) {
    this.dispose(), this.options = t, this._options = ve(t), this._camera = this._options.isSphere ? new de(-1.8, 1.8, 1.8, -1.8, 5, 10) : new ue(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = ze(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: l, animated: a, speed: c } = this._options;
    return this.animated = a, this.speed = c, this._container = l ? fe(l) : document.body, this._domElement = he(this._options), this._domElement.onpointerdown = (h) => this._onPointerDown(h), this._domElement.onpointermove = (h) => this._onPointerMove(h), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
      var o, l, a, c;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (a = (l = i.material) == null ? void 0 : l.map) == null || a.dispose(), (c = i.geometry) == null || c.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Et(this._options, this._intersections, this.camera);
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
    const o = this._clock.getDelta() * ge * this.speed;
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
    const n = (c) => {
      if (!this._dragging) {
        if (me(c, this._pointerStart)) return;
        this._dragging = !0;
      }
      const h = Oe.set(c.clientX, c.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), r = Ce.setFromVector3(
        Pt.subVectors(this.camera.position, this.target)
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
    const o = new jt().setFromVector3(
      Pt.subVectors(this.camera.position, this.target)
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
    !this.enabled || this._dragging || (this._background && Lt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._background && Lt(this._background, !1), this._focus && X(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Tt(
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
    const n = Tt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && X(this._focus, !1), (this._focus = i) ? X(i, !0) : Et(this._options, this._intersections, this.camera));
  }
}
export {
  Re as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
