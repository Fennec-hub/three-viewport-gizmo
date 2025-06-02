var re = Object.defineProperty;
var ae = (s, e, t) => e in s ? re(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var y = (s, e, t) => ae(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as L, Vector2 as Q, Raycaster as ce, Object3D as ft, Color as Vt, CanvasTexture as le, RepeatWrapping as Ct, SRGBColorSpace as de, BufferGeometry as Xt, BufferAttribute as nt, Sprite as wt, SpriteMaterial as St, Mesh as X, MeshBasicMaterial as at, SphereGeometry as Zt, CylinderGeometry as ue, BackSide as he, InstancedBufferGeometry as fe, Float32BufferAttribute as Ot, InstancedInterleavedBuffer as pt, InterleavedBufferAttribute as V, WireframeGeometry as pe, Box3 as xt, Sphere as $t, ShaderMaterial as me, ShaderLib as it, UniformsUtils as Yt, UniformsLib as st, Vector4 as $, Line3 as ge, Matrix4 as Qt, MathUtils as ye, Clock as ve, Quaternion as ct, Scene as _e, OrthographicCamera as be, PerspectiveCamera as we, Spherical as Se } from "three";
const Jt = (s, e) => {
  const [t, n] = e.split("-");
  return Object.assign(s.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), e;
}, xe = ({
  placement: s,
  size: e,
  offset: t,
  id: n,
  className: i
}) => {
  const o = document.createElement("div"), { top: c, left: a, right: d, bottom: f } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${c}px ${d}px ${f}px ${a}px`,
    borderRadius: "100%"
  }), Jt(o, s), n && (o.id = n), i && (o.className = i), o;
}, Ee = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function mt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const Ae = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], zt = /* @__PURE__ */ new L();
function Bt({ isSphere: s }, e, t) {
  s && (zt.set(0, 0, 1).applyQuaternion(t.quaternion), Ae.forEach(([n, i, o]) => {
    const c = zt[n];
    let a = e[i], d = a.userData.opacity;
    a.material.opacity = mt(c >= 0 ? d : d / 2, 0, 1), a = e[o], d = a.userData.opacity, a.material.opacity = mt(c >= 0 ? d / 2 : d, 0, 1);
  }));
}
const Me = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, Dt = /* @__PURE__ */ new ce(), Rt = /* @__PURE__ */ new Q(), Pt = (s, e, t, n) => {
  Rt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), Dt.setFromCamera(Rt, t);
  const i = Dt.intersectObjects(
    n,
    !1
  );
  if (i.length > 0) {
    i.sort((f, r) => f.distance - r.distance);
    const c = 0.2, a = i[0].distance, d = i.filter(
      (f) => f.distance <= a + c
    );
    d.length > 1 && (d.sort((f, r) => (r.object.userData.intersectionOrder || 0) - (f.object.userData.intersectionOrder || 0)), i.splice(0, d.length, ...d));
  }
  const o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, lt = 1e-6, Te = 2 * Math.PI, Kt = ["x", "y", "z"], Z = [...Kt, "nx", "ny", "nz"], Ue = ["x", "z", "y", "nx", "nz", "ny"], Le = ["z", "x", "y", "nz", "nx", "ny"], gt = "Right", ot = "Top", yt = "Front", vt = "Left", rt = "Bottom", _t = "Back", Ce = [
  gt,
  ot,
  yt,
  vt,
  rt,
  _t
].map((s) => s.toLocaleLowerCase()), te = 1.3, Gt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, k = (s) => JSON.parse(JSON.stringify(s)), Oe = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = e === "rounded-cube", i = s.resolution || t ? 64 : 128, o = ft.DEFAULT_UP, c = o.z === 1, a = o.x === 1, { container: d } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = d;
  const f = c ? Ue : a ? Le : Z;
  Ce.forEach((l, m) => {
    s[l] && (s[f[m]] = s[l]);
  });
  const r = {
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
  }, h = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, u = {
    type: e,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: i,
    lineWidth: 4,
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
      color: t ? 15915362 : n ? 15658734 : 16777215,
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
      ...k(r),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: a ? ot : gt }
    },
    y: {
      ...k(r),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: c || a ? yt : ot }
    },
    z: {
      ...k(r),
      ...t ? { label: "Z", color: 2920447, line: !0 } : {
        label: c ? ot : a ? gt : yt
      }
    },
    nx: {
      ...k(h),
      label: t ? "" : a ? rt : vt
    },
    ny: {
      ...k(h),
      label: t ? "" : c || a ? _t : rt
    },
    nz: {
      ...k(h),
      label: t ? "" : c ? rt : a ? vt : _t
    }
  };
  if (bt(s, u), n) {
    const l = s;
    l.edges.radius = l.radius, l.edges.scale = 1, l.edges.opacity = 1, l.edges.hover.scale = 1, l.edges.hover.opacity = 1, l.corners.radius = l.radius, l.corners.scale = 1, l.corners.opacity = 1, l.corners.hover.scale = 1, l.corners.hover.opacity = 1, l.radius = 0, Z.forEach((m) => {
      l[m].scale = 1, l[m].opacity = 1, l[m].hover.scale = 1, l[m].hover.opacity = 1;
    });
  }
  return Kt.forEach(
    (l) => bt(
      s[`n${l}`],
      k(s[l])
    )
  ), { ...s, isSphere: t };
};
function bt(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = bt(
        s[n] || {},
        t[n]
      )));
  return s;
}
const ze = (s, e = 2) => {
  const t = new Vt(), n = e * 2, { isSphere: i, resolution: o, radius: c, font: a, corners: d, edges: f } = s, r = Z.map((p) => ({ ...s[p], radius: c }));
  i && d.enabled && r.push(d), i && f.enabled && r.push(f);
  const h = document.createElement("canvas"), u = h.getContext("2d");
  h.width = o * 2 + n * 2, h.height = o * r.length + n * r.length;
  const [l, m] = O(r, o, a);
  r.forEach(
    ({
      radius: p,
      label: w,
      color: F,
      labelColor: S,
      border: x,
      hover: {
        color: H,
        labelColor: z,
        border: B
      }
    }, G) => {
      const I = o * G + G * n + e;
      _(
        e,
        I,
        e,
        o,
        p,
        w,
        x,
        F,
        S
      ), _(
        o + e * 3,
        I,
        e,
        o,
        p,
        w,
        B ?? x,
        H ?? F,
        z ?? S
      );
    }
  );
  const v = r.length, E = e / (o * 2), A = e / (o * 6), C = 1 / v, b = new le(h);
  return b.repeat.set(0.5 - 2 * E, C - 2 * A), b.offset.set(E, 1 - A), Object.assign(b, {
    colorSpace: de,
    wrapS: Ct,
    wrapT: Ct,
    userData: {
      offsetX: E,
      offsetY: A,
      cellHeight: C
    }
  }), b;
  function _(p, w, F, S, x, H, z, B, G) {
    if (x = x * (S / 2), B != null && B !== "" && (I(), u.fillStyle = t.set(B).getStyle(), u.fill()), z && z.size) {
      const q = z.size * S / 2;
      p += q, w += q, S -= z.size * S, x = Math.max(0, x - q), I(), u.strokeStyle = t.set(z.color).getStyle(), u.lineWidth = z.size * S, u.stroke();
    }
    H && g(
      u,
      p + S / 2,
      w + (S + F) / 2,
      H,
      t.set(G).getStyle()
    );
    function I() {
      u.beginPath(), u.moveTo(p + x, w), u.lineTo(p + S - x, w), u.arcTo(p + S, w, p + S, w + x, x), u.lineTo(p + S, w + S - x), u.arcTo(p + S, w + S, p + S - x, w + S, x), u.lineTo(p + x, w + S), u.arcTo(p, w + S, p, w + S - x, x), u.lineTo(p, w + x), u.arcTo(p, w, p + x, w, x), u.closePath();
    }
  }
  function O(p, w, F) {
    const x = [...p].sort((J, oe) => {
      var Ut, Lt;
      return (((Ut = J.label) == null ? void 0 : Ut.length) || 0) - (((Lt = oe.label) == null ? void 0 : Lt.length) || 0);
    }).pop().label, { family: H, weight: z } = F, B = i ? Math.sqrt(Math.pow(w * 0.7, 2) / 2) : w;
    let G = B, I = 0, q = 0;
    do {
      u.font = `${z} ${G}px ${H}`;
      const J = u.measureText(x);
      I = J.width, q = J.fontBoundingBoxDescent, G--;
    } while (I > B && G > 0);
    const Tt = B / q, ie = Math.min(B / I, Tt), se = Math.floor(G * ie);
    return [`${z} ${se}px ${H}`, Tt];
  }
  function g(p, w, F, S, x) {
    p.font = l, p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = x, p.fillText(S, w, F + (i ? m : 0));
  }
}, Be = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, Et = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function At(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, c = s / t, a = (t - s) / t, d = s / n, f = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], h = [a, f, c, f, c, d, a, d], u = [
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
  ], l = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (g) => u[g]
  );
  let m, v, E, A, C, b, _, O;
  for (let g = 0; g < 4; g++) {
    A = g < 1 || g > 2 ? i : -i, C = g < 2 ? o : -o, b = g < 1 || g > 2 ? a : c, _ = g < 2 ? f : d;
    for (let p = 0; p <= e; p++)
      m = Math.PI / 2 * (g + p / e), v = Math.cos(m), E = Math.sin(m), r.push(A + s * v, C + s * E, 0), h.push(b + c * v, _ + d * E), p < e && (O = (e + 1) * g + p + 4, l.push(g, O, O + 1));
  }
  return new Xt().setIndex(new nt(new Uint32Array(l), 1)).setAttribute(
    "position",
    new nt(new Float32Array(r), 3)
  ).setAttribute("uv", new nt(new Float32Array(h), 2));
}
const De = (s, e) => {
  const t = new L(), { isSphere: n, radius: i, smoothness: o, type: c } = s, d = c === "rounded-cube" ? 2 - s.edges.radius * 2 : 2, f = At(i, o, d, d);
  return Z.map((r, h) => {
    const u = h < 3, l = Z[h], m = h ? e.clone() : e;
    Et(m, h);
    const { enabled: v, scale: E, opacity: A, hover: C } = s[l], b = {
      map: m,
      opacity: A,
      transparent: !0
    }, _ = n ? new wt(new St(b)) : new X(f, new at(b)), O = u ? l : l[1];
    return _.position[O] = (u ? 1 : -1) * (n ? te : 1), n || _.lookAt(t.copy(_.position).multiplyScalar(1.7)), _.scale.setScalar(E), _.renderOrder = 1, _.visible = v, _.userData = {
      scale: E,
      opacity: A,
      hover: C
    }, _;
  });
}, Re = (s, e) => {
  const { isSphere: t, corners: n, type: i } = s, o = i === "rounded-cube";
  if (!n.enabled) return [];
  const { color: c, opacity: a, scale: d, radius: f, smoothness: r, hover: h } = n, u = t ? null : o ? new Zt(f, r * 2, r) : At(f, r), l = {
    transparent: !0,
    opacity: a
  }, m = o ? 1 - f : 0.85, v = [
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
  ].map((A) => A * m), E = new L();
  return Array(v.length / 3).fill(0).map((A, C) => {
    if (t) {
      const O = e.clone();
      Et(O, 6), l.map = O;
    } else
      l.color = c;
    const b = t ? new wt(new St(l)) : new X(u, new at(l)), _ = C * 3;
    return b.position.set(v[_], v[_ + 1], v[_ + 2]), t && b.position.normalize().multiplyScalar(1.7), b.scale.setScalar(d), b.lookAt(E.copy(b.position).multiplyScalar(2)), b.renderOrder = 1, b.userData = {
      color: c,
      opacity: a,
      scale: d,
      hover: h,
      intersectionOrder: 1
    }, b;
  });
}, Pe = (s, e, t) => {
  const { isSphere: n, edges: i, type: o } = s, c = o === "rounded-cube";
  if (!i.enabled) return [];
  const { color: a, opacity: d, scale: f, hover: r, radius: h, smoothness: u } = i, l = c ? 2 - h * 2 : 1.2, m = n ? null : c ? new ue(h, h, l, u * 4) : At(h, u, l, 0.25), v = {
    transparent: !0,
    opacity: d
  }, E = c ? 1 - h : 0.925, A = [
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
  ].map((_) => _ * E), C = new L(), b = new L(0, 1, 0);
  return Array(A.length / 3).fill(0).map((_, O) => {
    if (n) {
      const w = e.clone();
      Et(w, t), v.map = w;
    } else
      v.color = a;
    const g = n ? new wt(new St(v)) : new X(m, new at(v)), p = O * 3;
    return g.position.set(A[p], A[p + 1], A[p + 2]), n && g.position.normalize().multiplyScalar(1.7), g.scale.setScalar(f), g.up.copy(b), g.lookAt(C.copy(g.position).multiplyScalar(2)), c ? (!n && !g.position.z && (g.rotation.z = Math.PI), !n && !g.position.x && (g.rotation.x = 0), !n && !g.position.x && (g.rotation.z = Math.PI / 2)) : !n && !g.position.y && (g.rotation.z = Math.PI / 2), g.renderOrder = 1, g.userData = {
      color: a,
      opacity: d,
      scale: f,
      hover: r
    }, g;
  });
};
function Ge(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, c = {}, a = s[0].morphTargetsRelative, d = new Xt();
  let f = 0;
  for (let r = 0; r < s.length; ++r) {
    const h = s[r];
    let u = 0;
    if (t !== (h.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const l in h.attributes) {
      if (!n.has(l))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + l + '" attribute exists among all geometries, or in none of them.'), null;
      o[l] === void 0 && (o[l] = []), o[l].push(h.attributes[l]), u++;
    }
    if (u !== n.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". Make sure all geometries have the same number of attributes."), null;
    if (a !== h.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const l in h.morphAttributes) {
      if (!i.has(l))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ".  .morphAttributes must be consistent throughout all geometries."), null;
      c[l] === void 0 && (c[l] = []), c[l].push(h.morphAttributes[l]);
    }
    if (e) {
      let l;
      if (t)
        l = h.index.count;
      else if (h.attributes.position !== void 0)
        l = h.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". The geometry must have either an index or a position attribute"), null;
      d.addGroup(f, l, r), f += l;
    }
  }
  if (t) {
    let r = 0;
    const h = [];
    for (let u = 0; u < s.length; ++u) {
      const l = s[u].index;
      for (let m = 0; m < l.count; ++m)
        h.push(l.getX(m) + r);
      r += s[u].attributes.position.count;
    }
    d.setIndex(h);
  }
  for (const r in o) {
    const h = It(o[r]);
    if (!h)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    d.setAttribute(r, h);
  }
  for (const r in c) {
    const h = c[r][0].length;
    if (h === 0) break;
    d.morphAttributes = d.morphAttributes || {}, d.morphAttributes[r] = [];
    for (let u = 0; u < h; ++u) {
      const l = [];
      for (let v = 0; v < c[r].length; ++v)
        l.push(c[r][v][u]);
      const m = It(l);
      if (!m)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      d.morphAttributes[r].push(m);
    }
  }
  return d;
}
function It(s) {
  let e, t, n, i = -1, o = 0;
  for (let f = 0; f < s.length; ++f) {
    const r = s[f];
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
  const c = new e(o), a = new nt(c, t, n);
  let d = 0;
  for (let f = 0; f < s.length; ++f) {
    const r = s[f];
    if (r.isInterleavedBufferAttribute) {
      const h = d / t;
      for (let u = 0, l = r.count; u < l; u++)
        for (let m = 0; m < t; m++) {
          const v = r.getComponent(u, m);
          a.setComponent(u + h, m, v);
        }
    } else
      c.set(r.array, d);
    d += r.count * t;
  }
  return i !== void 0 && (a.gpuType = i), a;
}
const Ie = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: c }
  } = e;
  let a;
  const d = new at({
    color: i,
    side: he,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    a = new X(
      new Zt(1.8, 64, 64),
      d
    );
  else {
    let f;
    s.forEach((r) => {
      const h = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const u = r.geometry.clone();
      u.applyMatrix4(r.matrix), f = f ? Ge([f, u]) : u, r.scale.setScalar(h);
    }), a = new X(f, d);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: c
  }, a;
}, Ft = new xt(), K = new L();
class ee extends fe {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Ot(e, 3)), this.setAttribute("uv", new Ot(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new pt(t, 6, 1);
    return this.setAttribute("instanceStart", new V(n, 3, 0)), this.setAttribute("instanceEnd", new V(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new pt(t, 6, 1);
    return this.setAttribute("instanceColorStart", new V(n, 3, 0)), this.setAttribute("instanceColorEnd", new V(n, 3, 3)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new pe(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new xt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Ft.setFromBufferAttribute(t), this.boundingBox.union(Ft));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new $t()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, c = e.count; o < c; o++)
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
  resolution: { value: new Q(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
it.line = {
  uniforms: Yt.merge([
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
class Mt extends me {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: Yt.clone(it.line.uniforms),
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
const dt = new $(), Ht = new L(), kt = new L(), M = new $(), T = new $(), D = new $(), ut = new L(), ht = new Qt(), U = new ge(), jt = new L(), tt = new xt(), et = new $t(), R = new $();
let P, W;
function Wt(s, e, t) {
  return R.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), R.multiplyScalar(1 / R.w), R.x = W / t.width, R.y = W / t.height, R.applyMatrix4(s.projectionMatrixInverse), R.multiplyScalar(1 / R.w), Math.abs(Math.max(R.x, R.y));
}
function Fe(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, c = Math.min(n.instanceCount, i.count);
  for (let a = 0, d = c; a < d; a++) {
    U.start.fromBufferAttribute(i, a), U.end.fromBufferAttribute(o, a), U.applyMatrix4(t);
    const f = new L(), r = new L();
    P.distanceSqToSegment(U.start, U.end, r, f), r.distanceTo(f) < W * 0.5 && e.push({
      point: r,
      pointOnLine: f,
      distance: P.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function He(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, c = s.matrixWorld, a = s.geometry, d = a.attributes.instanceStart, f = a.attributes.instanceEnd, r = Math.min(a.instanceCount, d.count), h = -e.near;
  P.at(1, D), D.w = 1, D.applyMatrix4(e.matrixWorldInverse), D.applyMatrix4(n), D.multiplyScalar(1 / D.w), D.x *= o.x / 2, D.y *= o.y / 2, D.z = 0, ut.copy(D), ht.multiplyMatrices(e.matrixWorldInverse, c);
  for (let u = 0, l = r; u < l; u++) {
    if (M.fromBufferAttribute(d, u), T.fromBufferAttribute(f, u), M.w = 1, T.w = 1, M.applyMatrix4(ht), T.applyMatrix4(ht), M.z > h && T.z > h)
      continue;
    if (M.z > h) {
      const b = M.z - T.z, _ = (M.z - h) / b;
      M.lerp(T, _);
    } else if (T.z > h) {
      const b = T.z - M.z, _ = (T.z - h) / b;
      T.lerp(M, _);
    }
    M.applyMatrix4(n), T.applyMatrix4(n), M.multiplyScalar(1 / M.w), T.multiplyScalar(1 / T.w), M.x *= o.x / 2, M.y *= o.y / 2, T.x *= o.x / 2, T.y *= o.y / 2, U.start.copy(M), U.start.z = 0, U.end.copy(T), U.end.z = 0;
    const v = U.closestPointToPointParameter(ut, !0);
    U.at(v, jt);
    const E = ye.lerp(M.z, T.z, v), A = E >= -1 && E <= 1, C = ut.distanceTo(jt) < W * 0.5;
    if (A && C) {
      U.start.fromBufferAttribute(d, u), U.end.fromBufferAttribute(f, u), U.start.applyMatrix4(c), U.end.applyMatrix4(c);
      const b = new L(), _ = new L();
      P.distanceSqToSegment(U.start, U.end, _, b), t.push({
        point: _,
        pointOnLine: b,
        distance: P.origin.distanceTo(_),
        object: s,
        face: null,
        faceIndex: u,
        uv: null,
        uv1: null
      });
    }
  }
}
class ke extends X {
  constructor(e = new ee(), t = new Mt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let c = 0, a = 0, d = t.count; c < d; c++, a += 2)
      Ht.fromBufferAttribute(t, c), kt.fromBufferAttribute(n, c), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + Ht.distanceTo(kt);
    const o = new pt(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new V(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new V(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    P = e.ray;
    const c = this.matrixWorld, a = this.geometry, d = this.material;
    W = d.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), et.copy(a.boundingSphere).applyMatrix4(c);
    let f;
    if (n)
      f = W * 0.5;
    else {
      const h = Math.max(i.near, et.distanceToPoint(P.origin));
      f = Wt(i, h, d.resolution);
    }
    if (et.radius += f, P.intersectsSphere(et) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), tt.copy(a.boundingBox).applyMatrix4(c);
    let r;
    if (n)
      r = W * 0.5;
    else {
      const h = Math.max(i.near, tt.distanceToPoint(P.origin));
      r = Wt(i, h, d.resolution);
    }
    tt.expandByScalar(r), P.intersectsBox(tt) !== !1 && (n ? Fe(this, t) : He(this, i, t));
  }
  onBeforeRender(e) {
    const t = this.material.uniforms;
    t && t.resolution && (e.getViewport(dt), this.material.uniforms.resolution.value.set(dt.z, dt.w));
  }
}
class ne extends ee {
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
class je extends ke {
  constructor(e = new ne(), t = new Mt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const We = (s) => {
  const e = new Vt(), t = [], n = [], { isSphere: i } = s;
  if (Z.forEach((a, d) => {
    const { enabled: f, line: r, scale: h, color: u } = s[a];
    if (!f || !r) return;
    const l = d < 3 ? 1 : -1, v = (i ? te - h / 2 : 0.975) * l;
    t.push(
      a.includes("x") ? v : 0,
      a.includes("y") ? v : 0,
      a.includes("z") ? v : 0,
      0,
      0,
      0
    );
    const E = e.set(u).toArray();
    n.push(...E, ...E);
  }), !t.length) return null;
  const o = new ne().setPositions(t).setColors(n), c = new Mt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new Q(window.innerWidth, window.innerHeight)
  });
  return new je(o, c).computeLineDistances();
}, qe = (s) => {
  const { corners: e, edges: t } = s, n = [], i = ze(s), o = De(s, i);
  n.push(...o), e.enabled && n.push(...Re(s, i)), t.enabled && n.push(...Pe(s, i, e.enabled ? 7 : 6));
  const c = Ie(o, s), a = We(s);
  return [n, c, a];
}, Y = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: c } = e ? n.hover : n;
  s.scale.setScalar(c), t.opacity = i, t.map ? Be(t.map, e) : t.color.set(o);
}, N = /* @__PURE__ */ new Qt(), qt = /* @__PURE__ */ new Se(), Ne = /* @__PURE__ */ new Q(), j = /* @__PURE__ */ new L(), Nt = /* @__PURE__ */ new $();
class Ze extends ft {
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
    y(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    y(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    y(this, "renderer");
    /** The configuration options */
    y(this, "options");
    /** The point around which the camera rotates */
    y(this, "target", new L());
    /** Whether view changes should be animated */
    y(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    y(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    y(this, "animating", !1);
    y(this, "_options");
    y(this, "_intersections");
    y(this, "_background", null);
    y(this, "_viewport", [0, 0, 0, 0]);
    y(this, "_originalViewport", [0, 0, 0, 0]);
    y(this, "_originalScissor", [0, 0, 0, 0]);
    y(this, "_scene");
    y(this, "_camera");
    y(this, "_container");
    y(this, "_domElement");
    y(this, "_domRect");
    y(this, "_dragging", !1);
    y(this, "_distance", 0);
    y(this, "_clock", new ve());
    y(this, "_targetQuaternion", new ct());
    y(this, "_quaternionStart", new ct());
    y(this, "_quaternionEnd", new ct());
    y(this, "_pointerStart", new Q());
    y(this, "_focus", null);
    y(this, "_placement");
    y(this, "_controls");
    y(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this._scene = new _e().add(this), this.set(i);
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
    this._placement = Jt(this._domElement, t), this.domUpdate();
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
    this.dispose(), this.options = t, this._options = Oe(t), this._camera = this._options.isSphere ? new be(-1.8, 1.8, 1.8, -1.8, 5, 10) : new we(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = qe(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: c, animated: a, speed: d } = this._options;
    return this.animated = a, this.speed = d, this._container = c ? Ee(c) : document.body, this._domElement = xe(this._options), this._domElement.onpointerdown = (f) => this._onPointerDown(f), this._domElement.onpointermove = (f) => this._onPointerMove(f), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    ), t.getViewport(Nt).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(Nt).toArray(this._originalScissor), this;
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
      var o, c, a, d;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (a = (c = i.material) == null ? void 0 : c.map) == null || a.dispose(), (d = i.geometry) == null || d.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Bt(this._options, this._intersections, this.camera);
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
    const o = this._clock.getDelta() * Te * this.speed;
    this._quaternionStart.rotateTowards(this._quaternionEnd, o), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) < lt && (this._controls && (this._controls.enabled = !0), this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const n = this.camera, i = this.target;
    j.copy(t).multiplyScalar(this._distance), N.setPosition(j).lookAt(j, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(N), j.add(i), N.lookAt(j, i, this.up), this._quaternionEnd.setFromRotationMatrix(N), N.setPosition(n.position).lookAt(n.position, i, this.up), this._quaternionStart.setFromRotationMatrix(N), this.animating = !0, this._clock.start(), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const n = (f) => {
      if (!this._dragging) {
        if (Me(f, this._pointerStart)) return;
        this._dragging = !0;
      }
      const r = Ne.set(f.clientX, f.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), h = this.coordinateConversion(
        j.subVectors(this.camera.position, this.target)
      ), u = qt.setFromVector3(h);
      u.theta = a - r.x, u.phi = mt(
        d - r.y,
        lt,
        Math.PI - lt
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(u),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Y(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = this.coordinateConversion(
      j.subVectors(this.camera.position, this.target)
    ), c = qt.setFromVector3(o), a = c.theta, d = c.phi;
    this._distance = c.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", i, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to what is set in Object3D.DEFAULT_UP.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, n = !1) {
    const { x: i, y: o, z: c } = t, a = ft.DEFAULT_UP;
    return a.x === 1 ? n ? t.set(o, c, i) : t.set(c, i, o) : a.z === 1 ? n ? t.set(c, i, o) : t.set(o, c, i) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && Gt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._background && Gt(this._background, !1), this._focus && Y(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Pt(
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
    const n = Pt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && Y(this._focus, !1), (this._focus = i) ? Y(i, !0) : Bt(this._options, this._intersections, this.camera));
  }
}
export {
  Ze as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
