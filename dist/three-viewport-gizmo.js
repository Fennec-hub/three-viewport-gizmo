var Kt = Object.defineProperty;
var te = (s, e, t) => e in s ? Kt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var m = (s, e, t) => te(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as z, Vector2 as J, Raycaster as ee, Color as Ft, CanvasTexture as ne, RepeatWrapping as Et, SRGBColorSpace as ie, BufferGeometry as Ht, BufferAttribute as nt, Sprite as mt, SpriteMaterial as gt, Mesh as V, MeshBasicMaterial as ot, BackSide as se, SphereGeometry as oe, InstancedBufferGeometry as re, Float32BufferAttribute as At, InstancedInterleavedBuffer as ht, InterleavedBufferAttribute as N, WireframeGeometry as ae, Box3 as yt, Sphere as It, ShaderMaterial as ce, ShaderLib as it, UniformsUtils as jt, UniformsLib as st, Vector4 as $, Line3 as le, Matrix4 as Wt, MathUtils as de, Object3D as rt, Clock as ue, Quaternion as at, Scene as he, OrthographicCamera as fe, PerspectiveCamera as pe, Spherical as qt } from "three";
const Nt = (s, e) => {
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
  const o = document.createElement("div"), { top: a, left: c, right: l, bottom: u } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${a}px ${l}px ${u}px ${c}px`,
    borderRadius: "100%"
  }), Nt(o, s), n && (o.id = n), i && (o.className = i), o;
}, ge = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function ft(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const ye = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], Mt = /* @__PURE__ */ new z();
function Tt({ isSphere: s }, e, t) {
  s && (Mt.set(0, 0, 1).applyQuaternion(t.quaternion), ye.forEach(([n, i, o]) => {
    const a = Mt[n];
    let c = e[i], l = c.userData.opacity;
    c.material.opacity = ft(a >= 0 ? l : l / 2, 0, 1), c = e[o], l = c.userData.opacity, c.material.opacity = ft(a >= 0 ? l / 2 : l, 0, 1);
  }));
}
const ve = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, zt = /* @__PURE__ */ new ee(), Ut = /* @__PURE__ */ new J(), Lt = (s, e, t, n) => {
  Ut.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), zt.setFromCamera(Ut, t);
  const i = zt.intersectObjects(
    n,
    !1
  ), o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, ct = 1e-6, _e = 2 * Math.PI, Vt = ["x", "y", "z"], Q = [...Vt, "nx", "ny", "nz"], be = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], $t = 1.3, Bt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, H = (s) => JSON.parse(JSON.stringify(s)), we = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = s.resolution || t ? 64 : 128, { container: i } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = i, be.forEach((l, u) => {
    s[l] && (s[Q[u]] = s[l]);
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
  }, a = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, c = {
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
      ...H(a),
      label: t ? "" : "Left"
    },
    ny: {
      ...H(a),
      label: t ? "" : "Bottom"
    },
    nz: {
      ...H(a),
      label: t ? "" : "Back"
    }
  };
  return pt(s, c), Vt.forEach(
    (l) => pt(
      s[`n${l}`],
      H(s[l])
    )
  ), { ...s, isSphere: t };
};
function pt(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = pt(
        s[n] || {},
        t[n]
      )));
  return s;
}
const Se = (s, e = 2) => {
  const t = new Ft(), n = e * 2, { isSphere: i, resolution: o, radius: a, font: c, corners: l, edges: u } = s, r = Q.map((p) => ({ ...s[p], radius: a }));
  i && l.enabled && r.push(l), i && u.enabled && r.push(u);
  const h = document.createElement("canvas"), d = h.getContext("2d");
  h.width = o * 2 + n * 2, h.height = o * r.length + n * r.length;
  const [f, y] = X(r, o, c);
  r.forEach(
    ({
      radius: p,
      label: x,
      color: k,
      labelColor: w,
      border: S,
      hover: {
        color: F,
        labelColor: B,
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
        S,
        k,
        w
      ), U(
        o + e * 3,
        G,
        e,
        o,
        p,
        x,
        C ?? S,
        F ?? k,
        B ?? w
      );
    }
  );
  const _ = r.length, g = e / (o * 2), b = e / (o * 6), v = 1 / _, E = new ne(h);
  return E.repeat.set(0.5 - 2 * g, v - 2 * b), E.offset.set(g, 1 - b), Object.assign(E, {
    colorSpace: ie,
    wrapS: Et,
    wrapT: Et,
    userData: {
      offsetX: g,
      offsetY: b,
      cellHeight: v
    }
  }), E;
  function U(p, x, k, w, S, F, B, C, R) {
    if (S = S * (w / 2), C != null && C !== "" && (G(), d.fillStyle = t.set(C).getStyle(), d.fill()), B && B.size) {
      const W = B.size * w / 2;
      p += W, x += W, w -= B.size * w, S = Math.max(0, S - W), G(), d.strokeStyle = t.set(B.color).getStyle(), d.lineWidth = B.size * w, d.stroke();
    }
    F && L(
      d,
      p + w / 2,
      x + (w + k) / 2,
      F,
      t.set(R).getStyle()
    );
    function G() {
      d.beginPath(), d.moveTo(p + S, x), d.lineTo(p + w - S, x), d.arcTo(p + w, x, p + w, x + S, S), d.lineTo(p + w, x + w - S), d.arcTo(p + w, x + w, p + w - S, x + w, S), d.lineTo(p + S, x + w), d.arcTo(p, x + w, p, x + w - S, S), d.lineTo(p, x + S), d.arcTo(p, x, p + S, x, S), d.closePath();
    }
  }
  function X(p, x, k) {
    const S = [...p].sort((Z, Zt) => {
      var St, xt;
      return (((St = Z.label) == null ? void 0 : St.length) || 0) - (((xt = Zt.label) == null ? void 0 : xt.length) || 0);
    }).pop().label, { family: F, weight: B } = k, C = i ? Math.sqrt(Math.pow(x * 0.7, 2) / 2) : x;
    let R = C, G = 0, W = 0;
    do {
      d.font = `${B} ${R}px ${F}`;
      const Z = d.measureText(S);
      G = Z.width, W = Z.fontBoundingBoxDescent, R--;
    } while (G > C && R > 0);
    const wt = C / W, Qt = Math.min(C / G, wt), Jt = Math.floor(R * Qt);
    return [`${B} ${Jt}px ${F}`, wt];
  }
  function L(p, x, k, w, S) {
    p.font = f, p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = S, p.fillText(w, x, k + (i ? y : 0));
  }
}, xe = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, vt = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function _t(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, a = s / t, c = (t - s) / t, l = s / n, u = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], h = [c, u, a, u, a, l, c, l], d = [
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
    (L) => d[L]
  );
  let y, _, g, b, v, E, U, X;
  for (let L = 0; L < 4; L++) {
    b = L < 1 || L > 2 ? i : -i, v = L < 2 ? o : -o, E = L < 1 || L > 2 ? c : a, U = L < 2 ? u : l;
    for (let p = 0; p <= e; p++)
      y = Math.PI / 2 * (L + p / e), _ = Math.cos(y), g = Math.sin(y), r.push(b + s * _, v + s * g, 0), h.push(E + a * _, U + l * g), p < e && (X = (e + 1) * L + p + 4, f.push(L, X, X + 1));
  }
  return new Ht().setIndex(new nt(new Uint32Array(f), 1)).setAttribute(
    "position",
    new nt(new Float32Array(r), 3)
  ).setAttribute("uv", new nt(new Float32Array(h), 2));
}
const Ee = (s, e) => {
  const t = new z(), { isSphere: n, radius: i, smoothness: o } = s, a = _t(i, o);
  return Q.map((c, l) => {
    const u = l < 3, r = Q[l], h = l ? e.clone() : e;
    vt(h, l);
    const { enabled: d, scale: f, opacity: y, hover: _ } = s[r], g = {
      map: h,
      opacity: y,
      transparent: !0
    }, b = n ? new mt(new gt(g)) : new V(a, new ot(g)), v = u ? r : r[1];
    return b.position[v] = (u ? 1 : -1) * (n ? $t : 1), n || b.lookAt(t.copy(b.position).multiplyScalar(1.7)), b.scale.setScalar(f), b.renderOrder = 1, b.visible = d, b.userData = {
      scale: f,
      opacity: y,
      hover: _
    }, b;
  });
}, Ae = (s, e) => {
  const { isSphere: t, corners: n } = s;
  if (!n.enabled) return [];
  const { color: i, opacity: o, scale: a, radius: c, smoothness: l, hover: u } = n, r = t ? null : _t(c, l), h = {
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
  ].map((y) => y * 0.85), f = new z();
  return Array(d.length / 3).fill(0).map((y, _) => {
    if (t) {
      const v = e.clone();
      vt(v, 6), h.map = v;
    } else
      h.color = i;
    const g = t ? new mt(new gt(h)) : new V(r, new ot(h)), b = _ * 3;
    return g.position.set(d[b], d[b + 1], d[b + 2]), t && g.position.normalize().multiplyScalar(1.7), g.scale.setScalar(a), g.lookAt(f.copy(g.position).multiplyScalar(2)), g.renderOrder = 1, g.userData = {
      color: i,
      opacity: o,
      scale: a,
      hover: u
    }, g;
  });
}, Me = (s, e, t) => {
  const { isSphere: n, edges: i } = s;
  if (!i.enabled) return [];
  const { color: o, opacity: a, scale: c, hover: l, radius: u, smoothness: r } = i, h = n ? null : _t(u, r, 1.2, 0.25), d = {
    transparent: !0,
    opacity: a
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
  ].map((g) => g * 0.925), y = new z(), _ = new z(0, 1, 0);
  return Array(f.length / 3).fill(0).map((g, b) => {
    if (n) {
      const U = e.clone();
      vt(U, t), d.map = U;
    } else
      d.color = o;
    const v = n ? new mt(new gt(d)) : new V(h, new ot(d)), E = b * 3;
    return v.position.set(f[E], f[E + 1], f[E + 2]), n && v.position.normalize().multiplyScalar(1.7), v.scale.setScalar(c), v.up.copy(_), v.lookAt(y.copy(v.position).multiplyScalar(2)), !n && !v.position.y && (v.rotation.z = Math.PI / 2), v.renderOrder = 1, v.userData = {
      color: o,
      opacity: a,
      scale: c,
      hover: l
    }, v;
  });
};
function Te(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, a = {}, c = s[0].morphTargetsRelative, l = new Ht();
  let u = 0;
  for (let r = 0; r < s.length; ++r) {
    const h = s[r];
    let d = 0;
    if (t !== (h.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const f in h.attributes) {
      if (!n.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + f + '" attribute exists among all geometries, or in none of them.'), null;
      o[f] === void 0 && (o[f] = []), o[f].push(h.attributes[f]), d++;
    }
    if (d !== n.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". Make sure all geometries have the same number of attributes."), null;
    if (c !== h.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const f in h.morphAttributes) {
      if (!i.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ".  .morphAttributes must be consistent throughout all geometries."), null;
      a[f] === void 0 && (a[f] = []), a[f].push(h.morphAttributes[f]);
    }
    if (e) {
      let f;
      if (t)
        f = h.index.count;
      else if (h.attributes.position !== void 0)
        f = h.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". The geometry must have either an index or a position attribute"), null;
      l.addGroup(u, f, r), u += f;
    }
  }
  if (t) {
    let r = 0;
    const h = [];
    for (let d = 0; d < s.length; ++d) {
      const f = s[d].index;
      for (let y = 0; y < f.count; ++y)
        h.push(f.getX(y) + r);
      r += s[d].attributes.position.count;
    }
    l.setIndex(h);
  }
  for (const r in o) {
    const h = Ct(o[r]);
    if (!h)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    l.setAttribute(r, h);
  }
  for (const r in a) {
    const h = a[r][0].length;
    if (h === 0) break;
    l.morphAttributes = l.morphAttributes || {}, l.morphAttributes[r] = [];
    for (let d = 0; d < h; ++d) {
      const f = [];
      for (let _ = 0; _ < a[r].length; ++_)
        f.push(a[r][_][d]);
      const y = Ct(f);
      if (!y)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      l.morphAttributes[r].push(y);
    }
  }
  return l;
}
function Ct(s) {
  let e, t, n, i = -1, o = 0;
  for (let u = 0; u < s.length; ++u) {
    const r = s[u];
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
  const a = new e(o), c = new nt(a, t, n);
  let l = 0;
  for (let u = 0; u < s.length; ++u) {
    const r = s[u];
    if (r.isInterleavedBufferAttribute) {
      const h = l / t;
      for (let d = 0, f = r.count; d < f; d++)
        for (let y = 0; y < t; y++) {
          const _ = r.getComponent(d, y);
          c.setComponent(d + h, y, _);
        }
    } else
      a.set(r.array, l);
    l += r.count * t;
  }
  return i !== void 0 && (c.gpuType = i), c;
}
const ze = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: a }
  } = e;
  let c;
  const l = new ot({
    color: i,
    side: se,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    c = new V(
      new oe(1.8, 64, 64),
      l
    );
  else {
    let u;
    s.forEach((r) => {
      const h = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const d = r.geometry.clone();
      d.applyMatrix4(r.matrix), u = u ? Te([u, d]) : d, r.scale.setScalar(h);
    }), c = new V(u, l);
  }
  return c.userData = {
    color: i,
    opacity: o,
    hover: a
  }, c;
}, Dt = new yt(), K = new z();
class Xt extends re {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new At(e, 3)), this.setAttribute("uv", new At(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new ht(t, 6, 1);
    return this.setAttribute("instanceStart", new N(n, 3, 0)), this.setAttribute("instanceEnd", new N(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new ht(t, 6, 1);
    return this.setAttribute("instanceColorStart", new N(n, 3, 0)), this.setAttribute("instanceColorEnd", new N(n, 3, 3)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new ae(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new yt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Dt.setFromBufferAttribute(t), this.boundingBox.union(Dt));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new It()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, a = e.count; o < a; o++)
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
  uniforms: jt.merge([
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
class bt extends ce {
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
    this.defines && (e === !0 !== this.alphaToCoverage && (this.needsUpdate = !0), e === !0 ? this.defines.USE_ALPHA_TO_COVERAGE = "" : delete this.defines.USE_ALPHA_TO_COVERAGE);
  }
}
const lt = new $(), Ot = new z(), Pt = new z(), A = new $(), M = new $(), D = new $(), dt = new z(), ut = new Wt(), T = new le(), Rt = new z(), tt = new yt(), et = new It(), O = new $();
let P, j;
function Gt(s, e, t) {
  return O.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), O.multiplyScalar(1 / O.w), O.x = j / t.width, O.y = j / t.height, O.applyMatrix4(s.projectionMatrixInverse), O.multiplyScalar(1 / O.w), Math.abs(Math.max(O.x, O.y));
}
function Ue(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, a = Math.min(n.instanceCount, i.count);
  for (let c = 0, l = a; c < l; c++) {
    T.start.fromBufferAttribute(i, c), T.end.fromBufferAttribute(o, c), T.applyMatrix4(t);
    const u = new z(), r = new z();
    P.distanceSqToSegment(T.start, T.end, r, u), r.distanceTo(u) < j * 0.5 && e.push({
      point: r,
      pointOnLine: u,
      distance: P.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: c,
      uv: null,
      uv1: null
    });
  }
}
function Le(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, a = s.matrixWorld, c = s.geometry, l = c.attributes.instanceStart, u = c.attributes.instanceEnd, r = Math.min(c.instanceCount, l.count), h = -e.near;
  P.at(1, D), D.w = 1, D.applyMatrix4(e.matrixWorldInverse), D.applyMatrix4(n), D.multiplyScalar(1 / D.w), D.x *= o.x / 2, D.y *= o.y / 2, D.z = 0, dt.copy(D), ut.multiplyMatrices(e.matrixWorldInverse, a);
  for (let d = 0, f = r; d < f; d++) {
    if (A.fromBufferAttribute(l, d), M.fromBufferAttribute(u, d), A.w = 1, M.w = 1, A.applyMatrix4(ut), M.applyMatrix4(ut), A.z > h && M.z > h)
      continue;
    if (A.z > h) {
      const E = A.z - M.z, U = (A.z - h) / E;
      A.lerp(M, U);
    } else if (M.z > h) {
      const E = M.z - A.z, U = (M.z - h) / E;
      M.lerp(A, U);
    }
    A.applyMatrix4(n), M.applyMatrix4(n), A.multiplyScalar(1 / A.w), M.multiplyScalar(1 / M.w), A.x *= o.x / 2, A.y *= o.y / 2, M.x *= o.x / 2, M.y *= o.y / 2, T.start.copy(A), T.start.z = 0, T.end.copy(M), T.end.z = 0;
    const _ = T.closestPointToPointParameter(dt, !0);
    T.at(_, Rt);
    const g = de.lerp(A.z, M.z, _), b = g >= -1 && g <= 1, v = dt.distanceTo(Rt) < j * 0.5;
    if (b && v) {
      T.start.fromBufferAttribute(l, d), T.end.fromBufferAttribute(u, d), T.start.applyMatrix4(a), T.end.applyMatrix4(a);
      const E = new z(), U = new z();
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
class Be extends V {
  constructor(e = new Xt(), t = new bt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let a = 0, c = 0, l = t.count; a < l; a++, c += 2)
      Ot.fromBufferAttribute(t, a), Pt.fromBufferAttribute(n, a), i[c] = c === 0 ? 0 : i[c - 1], i[c + 1] = i[c] + Ot.distanceTo(Pt);
    const o = new ht(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new N(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new N(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    P = e.ray;
    const a = this.matrixWorld, c = this.geometry, l = this.material;
    j = l.linewidth + o, c.boundingSphere === null && c.computeBoundingSphere(), et.copy(c.boundingSphere).applyMatrix4(a);
    let u;
    if (n)
      u = j * 0.5;
    else {
      const h = Math.max(i.near, et.distanceToPoint(P.origin));
      u = Gt(i, h, l.resolution);
    }
    if (et.radius += u, P.intersectsSphere(et) === !1)
      return;
    c.boundingBox === null && c.computeBoundingBox(), tt.copy(c.boundingBox).applyMatrix4(a);
    let r;
    if (n)
      r = j * 0.5;
    else {
      const h = Math.max(i.near, tt.distanceToPoint(P.origin));
      r = Gt(i, h, l.resolution);
    }
    tt.expandByScalar(r), P.intersectsBox(tt) !== !1 && (n ? Ue(this, t) : Le(this, i, t));
  }
  onBeforeRender(e) {
    const t = this.material.uniforms;
    t && t.resolution && (e.getViewport(lt), this.material.uniforms.resolution.value.set(lt.z, lt.w));
  }
}
class Yt extends Xt {
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
class Ce extends Be {
  constructor(e = new Yt(), t = new bt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const De = (s) => {
  const e = new Ft(), t = [], n = [], { isSphere: i } = s;
  if (Q.forEach((c, l) => {
    const { enabled: u, line: r, scale: h, color: d } = s[c];
    if (!u || !r) return;
    const f = l < 3 ? 1 : -1, _ = (i ? $t - h / 2 : 0.975) * f;
    t.push(
      c.includes("x") ? _ : 0,
      c.includes("y") ? _ : 0,
      c.includes("z") ? _ : 0,
      0,
      0,
      0
    );
    const g = e.set(d).toArray();
    n.push(...g, ...g);
  }), !t.length) return null;
  const o = new Yt().setPositions(t).setColors(n), a = new bt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new J(window.innerWidth, window.innerHeight)
  });
  return new Ce(o, a).computeLineDistances();
}, Oe = (s) => {
  const { corners: e, edges: t } = s, n = [], i = Se(s), o = Ee(s, i);
  n.push(...o), e.enabled && n.push(...Ae(s, i)), t.enabled && n.push(...Me(s, i, e.enabled ? 7 : 6));
  const a = ze(o, s), c = De(s);
  return [n, a, c];
}, Y = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: a } = e ? n.hover : n;
  s.scale.setScalar(a), t.opacity = i, t.map ? xe(t.map, e) : t.color.set(o);
}, q = /* @__PURE__ */ new Wt(), Pe = /* @__PURE__ */ new qt(), Re = /* @__PURE__ */ new J(), I = /* @__PURE__ */ new z(), kt = /* @__PURE__ */ new $();
class Fe extends rt {
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
    m(this, "target", new z());
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
    m(this, "_targetQuaternion", new at());
    m(this, "_quaternionStart", new at());
    m(this, "_quaternionEnd", new at());
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
    this._placement = Nt(this._domElement, t), this.domUpdate();
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
    const [n, i, o] = Oe(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: a, animated: c, speed: l } = this._options;
    return this.animated = c, this.speed = l, this._container = a ? ge(a) : document.body, this._domElement = me(this._options), this._domElement.onpointerdown = (u) => this._onPointerDown(u), this._domElement.onpointermove = (u) => this._onPointerMove(u), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    ), t.getViewport(kt).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(kt).toArray(this._originalScissor), this;
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
      return this.target = new z().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((n) => {
      var o, a, c, l;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (c = (a = i.material) == null ? void 0 : a.map) == null || c.dispose(), (l = i.geometry) == null || l.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Tt(this._options, this._intersections, this.camera);
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
    this._quaternionStart.rotateTowards(this._quaternionEnd, o), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) < ct && (this._controls && (this._controls.enabled = !0), this.animating = !1, this.dispatchEvent({ type: "end" }));
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
    const n = (d) => {
      if (!this._dragging) {
        if (ve(d, this._pointerStart)) return;
        this._dragging = !0;
      }
      const f = Re.set(d.clientX, d.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), y = I.subVectors(this.camera.position, this.target), { x: _, y: g, z: b } = this.coordinateConversion(y), v = Pe.setFromCartesianCoords(_, g, b);
      v.theta = r - f.x, v.phi = ft(
        h - f.y,
        ct,
        Math.PI - ct
      );
      const E = this.setFromSpherical(v);
      this.camera.position.set(E.x, E.y, E.z).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Y(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = I.subVectors(this.camera.position, this.target), { x: a, y: c, z: l } = this.coordinateConversion(o), u = new qt().setFromCartesianCoords(a, c, l), r = u.theta, h = u.phi;
    this._distance = u.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", i, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to what is set in Object3D.DEFAULT_UP.
   * 
   * @private
   * @param input - The coordinates to be converted
   * @param spherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, n = !1) {
    const { x: i, y: o, z: a } = t;
    return rt.DEFAULT_UP.x === 1 ? n ? { x: o, y: a, z: i } : { x: a, y: i, z: o } : rt.DEFAULT_UP.z === 1 ? n ? { x: a, y: i, z: o } : { x: o, y: a, z: i } : { x: i, y: o, z: a };
  }
  /**
   * Based on the Three.js-function setFromSphericalCoords, with coordinate conversion applied.
   * 
   * @private
   * @param s - The spherical coordinates
   * @returns - Vector x, y, z
   */
  setFromSpherical(t) {
    const n = t.radius, i = t.phi, o = t.theta, a = Math.sin(i) * n, c = a * Math.sin(o), l = n * Math.cos(i), u = a * Math.cos(o);
    return this.coordinateConversion({ x: c, y: l, z: u }, !0);
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
    const n = Lt(
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
    const n = Lt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && Y(this._focus, !1), (this._focus = i) ? Y(i, !0) : Tt(this._options, this._intersections, this.camera));
  }
}
export {
  Fe as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
