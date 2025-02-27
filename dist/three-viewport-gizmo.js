var Zt = Object.defineProperty;
var Kt = (s, e, t) => e in s ? Zt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var m = (s, e, t) => Kt(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as L, Vector2 as J, Raycaster as te, Color as kt, CanvasTexture as ee, RepeatWrapping as xt, SRGBColorSpace as ne, BufferGeometry as Ft, BufferAttribute as nt, Sprite as pt, SpriteMaterial as mt, Mesh as N, MeshBasicMaterial as ot, BackSide as ie, SphereGeometry as se, InstancedBufferGeometry as oe, Float32BufferAttribute as Et, InstancedInterleavedBuffer as ut, InterleavedBufferAttribute as V, WireframeGeometry as re, Box3 as gt, Sphere as Ht, ShaderMaterial as ae, ShaderLib as it, UniformsUtils as It, UniformsLib as st, Vector4 as $, Line3 as ce, Matrix4 as jt, MathUtils as le, Object3D as de, Clock as ue, Quaternion as rt, Scene as he, OrthographicCamera as fe, PerspectiveCamera as pe, Spherical as Wt } from "three";
const qt = (s, e) => {
  const [t, n] = e.split("-");
  return Object.assign(s.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), e;
}, me = ({
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
  }), qt(o, s), n && (o.id = n), i && (o.className = i), o;
}, ge = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function ht(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const ye = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], At = /* @__PURE__ */ new L();
function Mt({ isSphere: s }, e, t) {
  s && (At.set(0, 0, 1).applyQuaternion(t.quaternion), ye.forEach(([n, i, o]) => {
    const l = At[n];
    let a = e[i], c = a.userData.opacity;
    a.material.opacity = ht(l >= 0 ? c : c / 2, 0, 1), a = e[o], c = a.userData.opacity, a.material.opacity = ht(l >= 0 ? c / 2 : c, 0, 1);
  }));
}
const ve = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, Tt = /* @__PURE__ */ new te(), Lt = /* @__PURE__ */ new J(), Ut = (s, e, t, n) => {
  Lt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), Tt.setFromCamera(Lt, t);
  const i = Tt.intersectObjects(
    n,
    !1
  ), o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, at = 1e-6, _e = 2 * Math.PI, Vt = ["x", "y", "z"], Q = [...Vt, "nx", "ny", "nz"], be = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Nt = 1.3, Bt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, H = (s) => JSON.parse(JSON.stringify(s)), we = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = s.resolution || t ? 64 : 128, { container: i } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = i, be.forEach((c, h) => {
    s[c] && (s[Q[h]] = s[c]);
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
      ...H(o),
      ...t ? {
        label: "X",
        color: 16725587,
        line: !0
      } : {
        label: "Right"
      }
    },
    y: {
      ...H(o),
      ...t ? {
        label: "Y",
        color: 9100032,
        line: !0
      } : {
        label: "Top"
      }
    },
    z: {
      ...H(o),
      ...t ? {
        label: "Z",
        color: 2920447,
        line: !0
      } : {
        label: "Front"
      }
    },
    nx: {
      ...H(l),
      label: t ? "" : "Left"
    },
    ny: {
      ...H(l),
      label: t ? "" : "Bottom"
    },
    nz: {
      ...H(l),
      label: t ? "" : "Back"
    }
  };
  return ft(s, a), Vt.forEach(
    (c) => ft(
      s[`n${c}`],
      H(s[c])
    )
  ), { ...s, isSphere: t };
};
function ft(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = ft(
        s[n] || {},
        t[n]
      )));
  return s;
}
const Se = (s, e = 2) => {
  const t = new kt(), n = e * 2, { isSphere: i, resolution: o, radius: l, font: a, corners: c, edges: h } = s, r = Q.map((p) => ({ ...s[p], radius: l }));
  i && c.enabled && r.push(c), i && h.enabled && r.push(h);
  const u = document.createElement("canvas"), d = u.getContext("2d");
  u.width = o * 2 + n * 2, u.height = o * r.length + n * r.length;
  const [f, y] = X(r, o, a);
  r.forEach(
    ({
      radius: p,
      label: x,
      color: k,
      labelColor: v,
      border: w,
      hover: {
        color: F,
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
        x,
        w,
        k,
        v
      ), U(
        o + e * 3,
        G,
        e,
        o,
        p,
        x,
        C ?? w,
        F ?? k,
        z ?? v
      );
    }
  );
  const _ = r.length, g = e / (o * 2), S = e / (o * 6), b = 1 / _, E = new ee(u);
  return E.repeat.set(0.5 - 2 * g, b - 2 * S), E.offset.set(g, 1 - S), Object.assign(E, {
    colorSpace: ne,
    wrapS: xt,
    wrapT: xt,
    userData: {
      offsetX: g,
      offsetY: S,
      cellHeight: b
    }
  }), E;
  function U(p, x, k, v, w, F, z, C, R) {
    if (w = w * (v / 2), C != null && C !== "" && (G(), d.fillStyle = t.set(C).getStyle(), d.fill()), z && z.size) {
      const W = z.size * v / 2;
      p += W, x += W, v -= z.size * v, w = Math.max(0, w - W), G(), d.strokeStyle = t.set(z.color).getStyle(), d.lineWidth = z.size * v, d.stroke();
    }
    F && B(
      d,
      p + v / 2,
      x + (v + k) / 2,
      F,
      t.set(R).getStyle()
    );
    function G() {
      d.beginPath(), d.moveTo(p + w, x), d.lineTo(p + v - w, x), d.arcTo(p + v, x, p + v, x + w, w), d.lineTo(p + v, x + v - w), d.arcTo(p + v, x + v, p + v - w, x + v, w), d.lineTo(p + w, x + v), d.arcTo(p, x + v, p, x + v - w, w), d.lineTo(p, x + w), d.arcTo(p, x, p + w, x, w), d.closePath();
    }
  }
  function X(p, x, k) {
    const w = [...p].sort((Z, Jt) => {
      var wt, St;
      return (((wt = Z.label) == null ? void 0 : wt.length) || 0) - (((St = Jt.label) == null ? void 0 : St.length) || 0);
    }).pop().label, { family: F, weight: z } = k, C = i ? Math.sqrt(Math.pow(x * 0.7, 2) / 2) : x;
    let R = C, G = 0, W = 0;
    do {
      d.font = `${z} ${R}px ${F}`;
      const Z = d.measureText(w);
      G = Z.width, W = Z.fontBoundingBoxDescent, R--;
    } while (G > C && R > 0);
    const bt = C / W, Yt = Math.min(C / G, bt), Qt = Math.floor(R * Yt);
    return [`${z} ${Qt}px ${F}`, bt];
  }
  function B(p, x, k, v, w) {
    p.font = f, p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = w, p.fillText(v, x, k + (i ? y : 0));
  }
}, xe = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, yt = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function vt(s, e, t = 2, n = 2) {
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
    (B) => d[B]
  );
  let y, _, g, S, b, E, U, X;
  for (let B = 0; B < 4; B++) {
    S = B < 1 || B > 2 ? i : -i, b = B < 2 ? o : -o, E = B < 1 || B > 2 ? a : l, U = B < 2 ? h : c;
    for (let p = 0; p <= e; p++)
      y = Math.PI / 2 * (B + p / e), _ = Math.cos(y), g = Math.sin(y), r.push(S + s * _, b + s * g, 0), u.push(E + l * _, U + c * g), p < e && (X = (e + 1) * B + p + 4, f.push(B, X, X + 1));
  }
  return new Ft().setIndex(new nt(new Uint32Array(f), 1)).setAttribute(
    "position",
    new nt(new Float32Array(r), 3)
  ).setAttribute("uv", new nt(new Float32Array(u), 2));
}
const Ee = (s, e) => {
  const t = new L(), { isSphere: n, radius: i, smoothness: o } = s, l = vt(i, o);
  return Q.map((a, c) => {
    const h = c < 3, r = Q[c], u = c ? e.clone() : e;
    yt(u, c);
    const { enabled: d, scale: f, opacity: y, hover: _ } = s[r], g = {
      map: u,
      opacity: y,
      transparent: !0
    }, S = n ? new pt(new mt(g)) : new N(l, new ot(g)), b = h ? r : r[1];
    return S.position[b] = (h ? 1 : -1) * (n ? Nt : 1), n || S.lookAt(t.copy(S.position).multiplyScalar(1.7)), S.scale.setScalar(f), S.renderOrder = 1, S.visible = d, S.userData = {
      scale: f,
      opacity: y,
      hover: _
    }, S;
  });
}, Ae = (s, e) => {
  const { isSphere: t, corners: n } = s;
  if (!n.enabled) return [];
  const { color: i, opacity: o, scale: l, radius: a, smoothness: c, hover: h } = n, r = t ? null : vt(a, c), u = {
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
  ].map((y) => y * 0.85), f = new L();
  return Array(d.length / 3).fill(0).map((y, _) => {
    if (t) {
      const b = e.clone();
      yt(b, 6), u.map = b;
    } else
      u.color = i;
    const g = t ? new pt(new mt(u)) : new N(r, new ot(u)), S = _ * 3;
    return g.position.set(d[S], d[S + 1], d[S + 2]), t && g.position.normalize().multiplyScalar(1.7), g.scale.setScalar(l), g.lookAt(f.copy(g.position).multiplyScalar(2)), g.renderOrder = 1, g.userData = {
      color: i,
      opacity: o,
      scale: l,
      hover: h
    }, g;
  });
}, Me = (s, e, t) => {
  const { isSphere: n, edges: i } = s;
  if (!i.enabled) return [];
  const { color: o, opacity: l, scale: a, hover: c, radius: h, smoothness: r } = i, u = n ? null : vt(h, r, 1.2, 0.25), d = {
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
  ].map((g) => g * 0.925), y = new L(), _ = new L(0, 1, 0);
  return Array(f.length / 3).fill(0).map((g, S) => {
    if (n) {
      const U = e.clone();
      yt(U, t), d.map = U;
    } else
      d.color = o;
    const b = n ? new pt(new mt(d)) : new N(u, new ot(d)), E = S * 3;
    return b.position.set(f[E], f[E + 1], f[E + 2]), n && b.position.normalize().multiplyScalar(1.7), b.scale.setScalar(a), b.up.copy(_), b.lookAt(y.copy(b.position).multiplyScalar(2)), !n && !b.position.y && (b.rotation.z = Math.PI / 2), b.renderOrder = 1, b.userData = {
      color: o,
      opacity: l,
      scale: a,
      hover: c
    }, b;
  });
};
function Te(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, l = {}, a = s[0].morphTargetsRelative, c = new Ft();
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
    const u = zt(o[r]);
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
      const y = zt(f);
      if (!y)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      c.morphAttributes[r].push(y);
    }
  }
  return c;
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
  const l = new e(o), a = new nt(l, t, n);
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
const Le = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: l }
  } = e;
  let a;
  const c = new ot({
    color: i,
    side: ie,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    a = new N(
      new se(1.8, 64, 64),
      c
    );
  else {
    let h;
    s.forEach((r) => {
      const u = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const d = r.geometry.clone();
      d.applyMatrix4(r.matrix), h = h ? Te([h, d]) : d, r.scale.setScalar(u);
    }), a = new N(h, c);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: l
  }, a;
}, Ct = new gt(), K = new L();
class $t extends oe {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Et(e, 3)), this.setAttribute("uv", new Et(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new ut(t, 6, 1);
    return this.setAttribute("instanceStart", new V(n, 3, 0)), this.setAttribute("instanceEnd", new V(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new ut(t, 6, 1);
    return this.setAttribute("instanceColorStart", new V(n, 3, 0)), this.setAttribute("instanceColorEnd", new V(n, 3, 3)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new re(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new gt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Ct.setFromBufferAttribute(t), this.boundingBox.union(Ct));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Ht()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, l = e.count; o < l; o++)
        K.fromBufferAttribute(e, o), i = Math.max(i, n.distanceToSquared(K)), K.fromBufferAttribute(t, o), i = Math.max(i, n.distanceToSquared(K));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(e) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(e);
  }
}
st.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new J(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
it.line = {
  uniforms: It.merge([
    st.common,
    st.fog,
    st.line
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
class _t extends ae {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: It.clone(it.line.uniforms),
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
    this.defines && (e === !0 !== this.alphaToCoverage && (this.needsUpdate = !0), e === !0 ? this.defines.USE_ALPHA_TO_COVERAGE = "" : delete this.defines.USE_ALPHA_TO_COVERAGE);
  }
}
const ct = new $(), Ot = new L(), Dt = new L(), A = new $(), M = new $(), O = new $(), lt = new L(), dt = new jt(), T = new ce(), Pt = new L(), tt = new gt(), et = new Ht(), D = new $();
let P, j;
function Rt(s, e, t) {
  return D.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), D.multiplyScalar(1 / D.w), D.x = j / t.width, D.y = j / t.height, D.applyMatrix4(s.projectionMatrixInverse), D.multiplyScalar(1 / D.w), Math.abs(Math.max(D.x, D.y));
}
function Ue(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, l = Math.min(n.instanceCount, i.count);
  for (let a = 0, c = l; a < c; a++) {
    T.start.fromBufferAttribute(i, a), T.end.fromBufferAttribute(o, a), T.applyMatrix4(t);
    const h = new L(), r = new L();
    P.distanceSqToSegment(T.start, T.end, r, h), r.distanceTo(h) < j * 0.5 && e.push({
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
function Be(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, l = s.matrixWorld, a = s.geometry, c = a.attributes.instanceStart, h = a.attributes.instanceEnd, r = Math.min(a.instanceCount, c.count), u = -e.near;
  P.at(1, O), O.w = 1, O.applyMatrix4(e.matrixWorldInverse), O.applyMatrix4(n), O.multiplyScalar(1 / O.w), O.x *= o.x / 2, O.y *= o.y / 2, O.z = 0, lt.copy(O), dt.multiplyMatrices(e.matrixWorldInverse, l);
  for (let d = 0, f = r; d < f; d++) {
    if (A.fromBufferAttribute(c, d), M.fromBufferAttribute(h, d), A.w = 1, M.w = 1, A.applyMatrix4(dt), M.applyMatrix4(dt), A.z > u && M.z > u)
      continue;
    if (A.z > u) {
      const E = A.z - M.z, U = (A.z - u) / E;
      A.lerp(M, U);
    } else if (M.z > u) {
      const E = M.z - A.z, U = (M.z - u) / E;
      M.lerp(A, U);
    }
    A.applyMatrix4(n), M.applyMatrix4(n), A.multiplyScalar(1 / A.w), M.multiplyScalar(1 / M.w), A.x *= o.x / 2, A.y *= o.y / 2, M.x *= o.x / 2, M.y *= o.y / 2, T.start.copy(A), T.start.z = 0, T.end.copy(M), T.end.z = 0;
    const _ = T.closestPointToPointParameter(lt, !0);
    T.at(_, Pt);
    const g = le.lerp(A.z, M.z, _), S = g >= -1 && g <= 1, b = lt.distanceTo(Pt) < j * 0.5;
    if (S && b) {
      T.start.fromBufferAttribute(c, d), T.end.fromBufferAttribute(h, d), T.start.applyMatrix4(l), T.end.applyMatrix4(l);
      const E = new L(), U = new L();
      P.distanceSqToSegment(T.start, T.end, U, E), t.push({
        point: U,
        pointOnLine: E,
        distance: P.origin.distanceTo(U),
        object: s,
        face: null,
        faceIndex: d,
        uv: null,
        uv1: null
      });
    }
  }
}
class ze extends N {
  constructor(e = new $t(), t = new _t({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let l = 0, a = 0, c = t.count; l < c; l++, a += 2)
      Ot.fromBufferAttribute(t, l), Dt.fromBufferAttribute(n, l), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + Ot.distanceTo(Dt);
    const o = new ut(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new V(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new V(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    P = e.ray;
    const l = this.matrixWorld, a = this.geometry, c = this.material;
    j = c.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), et.copy(a.boundingSphere).applyMatrix4(l);
    let h;
    if (n)
      h = j * 0.5;
    else {
      const u = Math.max(i.near, et.distanceToPoint(P.origin));
      h = Rt(i, u, c.resolution);
    }
    if (et.radius += h, P.intersectsSphere(et) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), tt.copy(a.boundingBox).applyMatrix4(l);
    let r;
    if (n)
      r = j * 0.5;
    else {
      const u = Math.max(i.near, tt.distanceToPoint(P.origin));
      r = Rt(i, u, c.resolution);
    }
    tt.expandByScalar(r), P.intersectsBox(tt) !== !1 && (n ? Ue(this, t) : Be(this, i, t));
  }
  onBeforeRender(e) {
    const t = this.material.uniforms;
    t && t.resolution && (e.getViewport(ct), this.material.uniforms.resolution.value.set(ct.z, ct.w));
  }
}
class Xt extends $t {
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
  setFromPoints(e) {
    const t = e.length - 1, n = new Float32Array(6 * t);
    for (let i = 0; i < t; i++)
      n[6 * i] = e[i].x, n[6 * i + 1] = e[i].y, n[6 * i + 2] = e[i].z || 0, n[6 * i + 3] = e[i + 1].x, n[6 * i + 4] = e[i + 1].y, n[6 * i + 5] = e[i + 1].z || 0;
    return super.setPositions(n), this;
  }
  fromLine(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
}
class Ce extends ze {
  constructor(e = new Xt(), t = new _t({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const Oe = (s) => {
  const e = new kt(), t = [], n = [], { isSphere: i } = s;
  if (Q.forEach((a, c) => {
    const { enabled: h, line: r, scale: u, color: d } = s[a];
    if (!h || !r) return;
    const f = c < 3 ? 1 : -1, _ = (i ? Nt - u / 2 : 0.975) * f;
    t.push(
      a.includes("x") ? _ : 0,
      a.includes("y") ? _ : 0,
      a.includes("z") ? _ : 0,
      0,
      0,
      0
    );
    const g = e.set(d).toArray();
    n.push(...g, ...g);
  }), !t.length) return null;
  const o = new Xt().setPositions(t).setColors(n), l = new _t({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new J(window.innerWidth, window.innerHeight)
  });
  return new Ce(o, l).computeLineDistances();
}, De = (s) => {
  const { corners: e, edges: t } = s, n = [], i = Se(s), o = Ee(s, i);
  n.push(...o), e.enabled && n.push(...Ae(s, i)), t.enabled && n.push(...Me(s, i, e.enabled ? 7 : 6));
  const l = Le(o, s), a = Oe(s);
  return [n, l, a];
}, Y = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: l } = e ? n.hover : n;
  s.scale.setScalar(l), t.opacity = i, t.map ? xe(t.map, e) : t.color.set(o);
}, q = /* @__PURE__ */ new jt(), Pe = /* @__PURE__ */ new Wt(), Re = /* @__PURE__ */ new J(), I = /* @__PURE__ */ new L(), Gt = /* @__PURE__ */ new $();
class Fe extends de {
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
    /** Whether the gizmo is currently active and responding to user input */
    m(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    m(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    m(this, "renderer");
    /** The configuration options */
    m(this, "options");
    /** The point around which the camera rotates */
    m(this, "target", new L());
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
    m(this, "_viewport", [0, 0, 0, 0]);
    m(this, "_originalViewport", [0, 0, 0, 0]);
    m(this, "_originalScissor", [0, 0, 0, 0]);
    m(this, "_scene");
    m(this, "_camera");
    m(this, "_container");
    m(this, "_domElement");
    m(this, "_domRect");
    m(this, "_dragging", !1);
    m(this, "_distance", 0);
    m(this, "_clock", new ue());
    m(this, "_targetQuaternion", new rt());
    m(this, "_quaternionStart", new rt());
    m(this, "_quaternionEnd", new rt());
    m(this, "_pointerStart", new J());
    m(this, "_focus", null);
    m(this, "_placement");
    m(this, "_controls");
    m(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this._scene = new he().add(this), this.set(i);
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
    this._placement = qt(this._domElement, t), this.domUpdate();
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
    this.dispose(), this.options = t, this._options = we(t), this._camera = this._options.isSphere ? new fe(-1.8, 1.8, 1.8, -1.8, 5, 10) : new pe(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = De(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: l, animated: a, speed: c } = this._options;
    return this.animated = a, this.speed = c, this._container = l ? ge(l) : document.body, this._domElement = me(this._options), this._domElement.onpointerdown = (h) => this._onPointerDown(h), this._domElement.onpointermove = (h) => this._onPointerMove(h), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    return t.autoClear = !1, t.setViewport(...n), i && t.setScissor(...n), t.clear(!1, !0, !1), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), i && t.setScissor(...this._originalScissor), t.autoClear = o, this;
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
    return this._viewport.splice(
      0,
      4,
      n.left - i.left,
      t.domElement.clientHeight - (n.top - i.top + n.height),
      n.width,
      n.height
    ), t.getViewport(Gt).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(Gt).toArray(this._originalScissor), this;
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
      return this.target = new L().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
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
    this._controls && (this._controls.enabled = !1);
    const o = this._clock.getDelta() * _e * this.speed;
    this._quaternionStart.rotateTowards(this._quaternionEnd, o), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) < at && (this._controls && (this._controls.enabled = !0), this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const n = this.camera, i = this.target;
    I.copy(t).multiplyScalar(this._distance), q.setPosition(I).lookAt(I, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(q), I.add(i), q.lookAt(I, i, this.up), this._quaternionEnd.setFromRotationMatrix(q), q.setPosition(n.position).lookAt(n.position, i, this.up), this._quaternionStart.setFromRotationMatrix(q), this.animating = !0, this._clock.start(), this.dispatchEvent({ type: "start" });
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
        if (ve(c, this._pointerStart)) return;
        this._dragging = !0;
      }
      const h = Re.set(c.clientX, c.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), r = Pe.setFromVector3(
        I.subVectors(this.camera.position, this.target)
      );
      r.theta = l - h.x, r.phi = ht(
        a - h.y,
        at,
        Math.PI - at
      ), this.camera.position.setFromSpherical(r).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Y(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = new Wt().setFromVector3(
      I.subVectors(this.camera.position, this.target)
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
    !this.enabled || this._dragging || (this._background && Bt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._background && Bt(this._background, !1), this._focus && Y(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Ut(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    this._focus && (Y(this._focus, !1), this._focus = null), n && (this._setOrientation(n.object.position), this.dispatchEvent({ type: "change" }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const n = Ut(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && Y(this._focus, !1), (this._focus = i) ? Y(i, !0) : Mt(this._options, this._intersections, this.camera));
  }
}
export {
  Fe as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
