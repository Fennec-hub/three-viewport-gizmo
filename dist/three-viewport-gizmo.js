var re = Object.defineProperty;
var ae = (s, e, t) => e in s ? re(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => ae(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as O, Vector2 as Q, Raycaster as ce, Object3D as ft, Color as Vt, CanvasTexture as le, RepeatWrapping as Ot, SRGBColorSpace as de, BufferGeometry as Xt, BufferAttribute as nt, Sprite as bt, SpriteMaterial as St, Mesh as X, MeshBasicMaterial as at, SphereGeometry as Zt, CylinderGeometry as ue, BackSide as he, InstancedBufferGeometry as fe, Float32BufferAttribute as zt, InstancedInterleavedBuffer as pt, InterleavedBufferAttribute as V, WireframeGeometry as pe, Box3 as xt, Sphere as $t, ShaderMaterial as me, ShaderLib as it, UniformsUtils as Yt, UniformsLib as st, Vector4 as $, Line3 as ge, Matrix4 as Qt, MathUtils as ye, Clock as ve, Quaternion as ct, Scene as _e, OrthographicCamera as we, PerspectiveCamera as be, Spherical as Se } from "three";
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
  const o = document.createElement("div"), { top: c, left: a, right: d, bottom: h } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${c}px ${d}px ${h}px ${a}px`,
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
], Ct = /* @__PURE__ */ new O();
function Bt({ isSphere: s }, e, t) {
  s && (Ct.set(0, 0, 1).applyQuaternion(t.quaternion), Ae.forEach(([n, i, o]) => {
    const c = Ct[n];
    let a = e[i], d = a.userData.opacity;
    a.material.opacity = mt(c >= 0 ? d : d / 2, 0, 1), a = e[o], d = a.userData.opacity, a.material.opacity = mt(c >= 0 ? d / 2 : d, 0, 1);
  }));
}
const Me = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, Dt = /* @__PURE__ */ new ce(), Pt = /* @__PURE__ */ new Q(), Gt = (s, e, t, n) => {
  Pt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), Dt.setFromCamera(Pt, t);
  const i = Dt.intersectObjects(
    n,
    !1
  );
  if (i.length > 0) {
    i.sort((h, r) => h.distance - r.distance);
    const c = 0.2, a = i[0].distance, d = i.filter(
      (h) => h.distance <= a + c
    );
    d.length > 1 && (d.sort((h, r) => (r.object.userData.intersectionOrder || 0) - (h.object.userData.intersectionOrder || 0)), i.splice(0, d.length, ...d));
  }
  const o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, lt = 1e-6, Te = 2 * Math.PI, Kt = ["x", "y", "z"], Z = [...Kt, "nx", "ny", "nz"], Ue = ["x", "z", "y", "nx", "nz", "ny"], Le = ["z", "x", "y", "nz", "nx", "ny"], gt = "Right", ot = "Top", yt = "Front", vt = "Left", rt = "Bottom", _t = "Back", Oe = [
  gt,
  ot,
  yt,
  vt,
  rt,
  _t
].map((s) => s.toLocaleLowerCase()), te = 1.3, Rt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, k = (s) => JSON.parse(JSON.stringify(s)), ze = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = s.rounded || !1, i = s.resolution || t ? 64 : 128, o = ft.DEFAULT_UP, c = o.z === 1, a = o.x === 1, { container: d } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = d;
  const h = c ? Ue : a ? Le : Z;
  Oe.forEach((u, p) => {
    s[u] && (s[h[p]] = s[u]);
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
  }, f = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, l = {
    type: e,
    rounded: n,
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
      ...k(f),
      label: t ? "" : a ? rt : vt
    },
    ny: {
      ...k(f),
      label: t ? "" : c || a ? _t : rt
    },
    nz: {
      ...k(f),
      label: t ? "" : c ? rt : a ? vt : _t
    }
  };
  if (wt(s, l), n) {
    const u = s;
    u.edges.radius = u.radius, u.edges.scale = 1, u.edges.opacity = 1, u.edges.hover.scale = 1, u.edges.hover.opacity = 1, u.corners.radius = u.radius, u.corners.scale = 1, u.corners.opacity = 1, u.corners.hover.scale = 1, u.corners.hover.opacity = 1, u.radius = 0, Z.forEach((p) => {
      u[p].scale = 1, u[p].opacity = 1, u[p].hover.scale = 1, u[p].hover.opacity = 1;
    });
  }
  return Kt.forEach(
    (u) => wt(
      s[`n${u}`],
      k(s[u])
    )
  ), { ...s, isSphere: t };
};
function wt(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = wt(
        s[n] || {},
        t[n]
      )));
  return s;
}
const Ce = (s, e = 2) => {
  const t = new Vt(), n = e * 2, { isSphere: i, resolution: o, radius: c, font: a, corners: d, edges: h } = s, r = Z.map((m) => ({ ...s[m], radius: c }));
  i && d.enabled && r.push(d), i && h.enabled && r.push(h);
  const f = document.createElement("canvas"), l = f.getContext("2d");
  f.width = o * 2 + n * 2, f.height = o * r.length + n * r.length;
  const [u, p] = S(r, o, a);
  r.forEach(
    ({
      radius: m,
      label: x,
      color: F,
      labelColor: _,
      border: b,
      hover: {
        color: H,
        labelColor: C,
        border: B
      }
    }, R) => {
      const I = o * R + R * n + e;
      A(
        e,
        I,
        e,
        o,
        m,
        x,
        b,
        F,
        _
      ), A(
        o + e * 3,
        I,
        e,
        o,
        m,
        x,
        B ?? b,
        H ?? F,
        C ?? _
      );
    }
  );
  const v = r.length, w = e / (o * 2), z = e / (o * 6), E = 1 / v, y = new le(f);
  return y.repeat.set(0.5 - 2 * w, E - 2 * z), y.offset.set(w, 1 - z), Object.assign(y, {
    colorSpace: de,
    wrapS: Ot,
    wrapT: Ot,
    userData: {
      offsetX: w,
      offsetY: z,
      cellHeight: E
    }
  }), y;
  function A(m, x, F, _, b, H, C, B, R) {
    if (b = b * (_ / 2), B != null && B !== "" && (I(), l.fillStyle = t.set(B).getStyle(), l.fill()), C && C.size) {
      const q = C.size * _ / 2;
      m += q, x += q, _ -= C.size * _, b = Math.max(0, b - q), I(), l.strokeStyle = t.set(C.color).getStyle(), l.lineWidth = C.size * _, l.stroke();
    }
    H && M(
      l,
      m + _ / 2,
      x + (_ + F) / 2,
      H,
      t.set(R).getStyle()
    );
    function I() {
      l.beginPath(), l.moveTo(m + b, x), l.lineTo(m + _ - b, x), l.arcTo(m + _, x, m + _, x + b, b), l.lineTo(m + _, x + _ - b), l.arcTo(m + _, x + _, m + _ - b, x + _, b), l.lineTo(m + b, x + _), l.arcTo(m, x + _, m, x + _ - b, b), l.lineTo(m, x + b), l.arcTo(m, x, m + b, x, b), l.closePath();
    }
  }
  function S(m, x, F) {
    const b = [...m].sort((J, oe) => {
      var Ut, Lt;
      return (((Ut = J.label) == null ? void 0 : Ut.length) || 0) - (((Lt = oe.label) == null ? void 0 : Lt.length) || 0);
    }).pop().label, { family: H, weight: C } = F, B = i ? Math.sqrt(Math.pow(x * 0.7, 2) / 2) : x;
    let R = B, I = 0, q = 0;
    do {
      l.font = `${C} ${R}px ${H}`;
      const J = l.measureText(b);
      I = J.width, q = J.fontBoundingBoxDescent, R--;
    } while (I > B && R > 0);
    const Tt = B / q, ie = Math.min(B / I, Tt), se = Math.floor(R * ie);
    return [`${C} ${se}px ${H}`, Tt];
  }
  function M(m, x, F, _, b) {
    m.font = u, m.textAlign = "center", m.textBaseline = "middle", m.fillStyle = b, m.fillText(_, x, F + (i ? p : 0));
  }
}, Be = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, Et = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function At(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, c = s / t, a = (t - s) / t, d = s / n, h = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], f = [a, h, c, h, c, d, a, d], l = [
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
  ], u = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (M) => l[M]
  );
  let p, v, w, z, E, y, A, S;
  for (let M = 0; M < 4; M++) {
    z = M < 1 || M > 2 ? i : -i, E = M < 2 ? o : -o, y = M < 1 || M > 2 ? a : c, A = M < 2 ? h : d;
    for (let m = 0; m <= e; m++)
      p = Math.PI / 2 * (M + m / e), v = Math.cos(p), w = Math.sin(p), r.push(z + s * v, E + s * w, 0), f.push(y + c * v, A + d * w), m < e && (S = (e + 1) * M + m + 4, u.push(M, S, S + 1));
  }
  return new Xt().setIndex(new nt(new Uint32Array(u), 1)).setAttribute(
    "position",
    new nt(new Float32Array(r), 3)
  ).setAttribute("uv", new nt(new Float32Array(f), 2));
}
const De = (s, e) => {
  const t = new O(), { isSphere: n, radius: i, smoothness: o, rounded: c } = s, a = c ? 2 - s.edges.radius * 2 : 2, d = At(i, o, a, a);
  return Z.map((h, r) => {
    const f = r < 3, l = Z[r], u = r ? e.clone() : e;
    Et(u, r);
    const { enabled: p, scale: v, opacity: w, hover: z } = s[l], E = {
      map: u,
      opacity: w,
      transparent: !0
    }, y = n ? new bt(new St(E)) : new X(d, new at(E)), A = f ? l : l[1];
    return y.position[A] = (f ? 1 : -1) * (n ? te : 1), n || y.lookAt(t.copy(y.position).multiplyScalar(1.7)), y.scale.setScalar(v), y.renderOrder = 1, y.visible = p, y.userData = {
      scale: v,
      opacity: w,
      hover: z
    }, y;
  });
}, Pe = (s, e) => {
  const { isSphere: t, corners: n, rounded: i } = s;
  if (!n.enabled) return [];
  const { color: o, opacity: c, scale: a, radius: d, smoothness: h, hover: r } = n, f = t ? null : i ? new Zt(d, h * 2, h) : At(d, h), l = {
    transparent: !0,
    opacity: c
  }, u = i ? 1 - d : 0.85, p = [
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
  ].map((w) => w * u), v = new O();
  return Array(p.length / 3).fill(0).map((w, z) => {
    if (t) {
      const A = e.clone();
      Et(A, 6), l.map = A;
    } else
      l.color = o;
    const E = t ? new bt(new St(l)) : new X(f, new at(l)), y = z * 3;
    return E.position.set(p[y], p[y + 1], p[y + 2]), t && E.position.normalize().multiplyScalar(1.7), E.scale.setScalar(a), E.lookAt(v.copy(E.position).multiplyScalar(2)), E.renderOrder = 1, E.userData = {
      color: o,
      opacity: c,
      scale: a,
      hover: r,
      intersectionOrder: 1
    }, E;
  });
}, Ge = (s, e, t) => {
  const { isSphere: n, edges: i, rounded: o } = s;
  if (!i.enabled) return [];
  const { color: c, opacity: a, scale: d, hover: h, radius: r, smoothness: f } = i, l = o ? 2 - r * 2 : 1.2, u = n ? null : o ? new ue(r, r, l, f * 4) : At(r, f, l, 0.25), p = {
    transparent: !0,
    opacity: a
  }, v = o ? 1 - r : 0.925, w = [
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
  ].map((y) => y * v), z = new O(), E = new O(0, 1, 0);
  return Array(w.length / 3).fill(0).map((y, A) => {
    if (n) {
      const m = e.clone();
      Et(m, t), p.map = m;
    } else
      p.color = c;
    const S = n ? new bt(new St(p)) : new X(u, new at(p)), M = A * 3;
    return S.position.set(w[M], w[M + 1], w[M + 2]), n && S.position.normalize().multiplyScalar(1.7), S.scale.setScalar(d), S.up.copy(E), S.lookAt(z.copy(S.position).multiplyScalar(2)), o ? (!n && !S.position.z && (S.rotation.z = Math.PI), !n && !S.position.x && (S.rotation.x = 0), !n && !S.position.x && (S.rotation.z = Math.PI / 2)) : !n && !S.position.y && (S.rotation.z = Math.PI / 2), S.renderOrder = 1, S.userData = {
      color: c,
      opacity: a,
      scale: d,
      hover: h
    }, S;
  });
};
function Re(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, c = {}, a = s[0].morphTargetsRelative, d = new Xt();
  let h = 0;
  for (let r = 0; r < s.length; ++r) {
    const f = s[r];
    let l = 0;
    if (t !== (f.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const u in f.attributes) {
      if (!n.has(u))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + u + '" attribute exists among all geometries, or in none of them.'), null;
      o[u] === void 0 && (o[u] = []), o[u].push(f.attributes[u]), l++;
    }
    if (l !== n.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". Make sure all geometries have the same number of attributes."), null;
    if (a !== f.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const u in f.morphAttributes) {
      if (!i.has(u))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ".  .morphAttributes must be consistent throughout all geometries."), null;
      c[u] === void 0 && (c[u] = []), c[u].push(f.morphAttributes[u]);
    }
    if (e) {
      let u;
      if (t)
        u = f.index.count;
      else if (f.attributes.position !== void 0)
        u = f.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". The geometry must have either an index or a position attribute"), null;
      d.addGroup(h, u, r), h += u;
    }
  }
  if (t) {
    let r = 0;
    const f = [];
    for (let l = 0; l < s.length; ++l) {
      const u = s[l].index;
      for (let p = 0; p < u.count; ++p)
        f.push(u.getX(p) + r);
      r += s[l].attributes.position.count;
    }
    d.setIndex(f);
  }
  for (const r in o) {
    const f = It(o[r]);
    if (!f)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    d.setAttribute(r, f);
  }
  for (const r in c) {
    const f = c[r][0].length;
    if (f === 0) break;
    d.morphAttributes = d.morphAttributes || {}, d.morphAttributes[r] = [];
    for (let l = 0; l < f; ++l) {
      const u = [];
      for (let v = 0; v < c[r].length; ++v)
        u.push(c[r][v][l]);
      const p = It(u);
      if (!p)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      d.morphAttributes[r].push(p);
    }
  }
  return d;
}
function It(s) {
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
  const c = new e(o), a = new nt(c, t, n);
  let d = 0;
  for (let h = 0; h < s.length; ++h) {
    const r = s[h];
    if (r.isInterleavedBufferAttribute) {
      const f = d / t;
      for (let l = 0, u = r.count; l < u; l++)
        for (let p = 0; p < t; p++) {
          const v = r.getComponent(l, p);
          a.setComponent(l + f, p, v);
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
    let h;
    s.forEach((r) => {
      const f = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const l = r.geometry.clone();
      l.applyMatrix4(r.matrix), h = h ? Re([h, l]) : l, r.scale.setScalar(f);
    }), a = new X(h, d);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: c
  }, a;
}, Ft = new xt(), K = new O();
class ee extends fe {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new zt(e, 3)), this.setAttribute("uv", new zt(t, 2));
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
const dt = new $(), Ht = new O(), kt = new O(), T = new $(), U = new $(), D = new $(), ut = new O(), ht = new Qt(), L = new ge(), jt = new O(), tt = new xt(), et = new $t(), P = new $();
let G, W;
function Wt(s, e, t) {
  return P.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), P.multiplyScalar(1 / P.w), P.x = W / t.width, P.y = W / t.height, P.applyMatrix4(s.projectionMatrixInverse), P.multiplyScalar(1 / P.w), Math.abs(Math.max(P.x, P.y));
}
function Fe(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, c = Math.min(n.instanceCount, i.count);
  for (let a = 0, d = c; a < d; a++) {
    L.start.fromBufferAttribute(i, a), L.end.fromBufferAttribute(o, a), L.applyMatrix4(t);
    const h = new O(), r = new O();
    G.distanceSqToSegment(L.start, L.end, r, h), r.distanceTo(h) < W * 0.5 && e.push({
      point: r,
      pointOnLine: h,
      distance: G.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function He(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, c = s.matrixWorld, a = s.geometry, d = a.attributes.instanceStart, h = a.attributes.instanceEnd, r = Math.min(a.instanceCount, d.count), f = -e.near;
  G.at(1, D), D.w = 1, D.applyMatrix4(e.matrixWorldInverse), D.applyMatrix4(n), D.multiplyScalar(1 / D.w), D.x *= o.x / 2, D.y *= o.y / 2, D.z = 0, ut.copy(D), ht.multiplyMatrices(e.matrixWorldInverse, c);
  for (let l = 0, u = r; l < u; l++) {
    if (T.fromBufferAttribute(d, l), U.fromBufferAttribute(h, l), T.w = 1, U.w = 1, T.applyMatrix4(ht), U.applyMatrix4(ht), T.z > f && U.z > f)
      continue;
    if (T.z > f) {
      const y = T.z - U.z, A = (T.z - f) / y;
      T.lerp(U, A);
    } else if (U.z > f) {
      const y = U.z - T.z, A = (U.z - f) / y;
      U.lerp(T, A);
    }
    T.applyMatrix4(n), U.applyMatrix4(n), T.multiplyScalar(1 / T.w), U.multiplyScalar(1 / U.w), T.x *= o.x / 2, T.y *= o.y / 2, U.x *= o.x / 2, U.y *= o.y / 2, L.start.copy(T), L.start.z = 0, L.end.copy(U), L.end.z = 0;
    const v = L.closestPointToPointParameter(ut, !0);
    L.at(v, jt);
    const w = ye.lerp(T.z, U.z, v), z = w >= -1 && w <= 1, E = ut.distanceTo(jt) < W * 0.5;
    if (z && E) {
      L.start.fromBufferAttribute(d, l), L.end.fromBufferAttribute(h, l), L.start.applyMatrix4(c), L.end.applyMatrix4(c);
      const y = new O(), A = new O();
      G.distanceSqToSegment(L.start, L.end, A, y), t.push({
        point: A,
        pointOnLine: y,
        distance: G.origin.distanceTo(A),
        object: s,
        face: null,
        faceIndex: l,
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
    G = e.ray;
    const c = this.matrixWorld, a = this.geometry, d = this.material;
    W = d.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), et.copy(a.boundingSphere).applyMatrix4(c);
    let h;
    if (n)
      h = W * 0.5;
    else {
      const f = Math.max(i.near, et.distanceToPoint(G.origin));
      h = Wt(i, f, d.resolution);
    }
    if (et.radius += h, G.intersectsSphere(et) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), tt.copy(a.boundingBox).applyMatrix4(c);
    let r;
    if (n)
      r = W * 0.5;
    else {
      const f = Math.max(i.near, tt.distanceToPoint(G.origin));
      r = Wt(i, f, d.resolution);
    }
    tt.expandByScalar(r), G.intersectsBox(tt) !== !1 && (n ? Fe(this, t) : He(this, i, t));
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
    const { enabled: h, line: r, scale: f, color: l } = s[a];
    if (!h || !r) return;
    const u = d < 3 ? 1 : -1, v = (i ? te - f / 2 : 0.975) * u;
    t.push(
      a.includes("x") ? v : 0,
      a.includes("y") ? v : 0,
      a.includes("z") ? v : 0,
      0,
      0,
      0
    );
    const w = e.set(l).toArray();
    n.push(...w, ...w);
  }), !t.length) return null;
  const o = new ne().setPositions(t).setColors(n), c = new Mt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new Q(window.innerWidth, window.innerHeight)
  });
  return new je(o, c).computeLineDistances();
}, qe = (s) => {
  const { corners: e, edges: t } = s, n = [], i = Ce(s), o = De(s, i);
  n.push(...o), e.enabled && n.push(...Pe(s, i)), t.enabled && n.push(...Ge(s, i, e.enabled ? 7 : 6));
  const c = Ie(o, s), a = We(s);
  return [n, c, a];
}, Y = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: c } = e ? n.hover : n;
  s.scale.setScalar(c), t.opacity = i, t.map ? Be(t.map, e) : t.color.set(o);
}, N = /* @__PURE__ */ new Qt(), qt = /* @__PURE__ */ new Se(), Ne = /* @__PURE__ */ new Q(), j = /* @__PURE__ */ new O(), Nt = /* @__PURE__ */ new $();
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
    g(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    g(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    g(this, "renderer");
    /** The configuration options */
    g(this, "options");
    /** The point around which the camera rotates */
    g(this, "target", new O());
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
    g(this, "_viewport", [0, 0, 0, 0]);
    g(this, "_originalViewport", [0, 0, 0, 0]);
    g(this, "_originalScissor", [0, 0, 0, 0]);
    g(this, "_scene");
    g(this, "_camera");
    g(this, "_container");
    g(this, "_domElement");
    g(this, "_domRect");
    g(this, "_dragging", !1);
    g(this, "_distance", 0);
    g(this, "_clock", new ve());
    g(this, "_targetQuaternion", new ct());
    g(this, "_quaternionStart", new ct());
    g(this, "_quaternionEnd", new ct());
    g(this, "_pointerStart", new Q());
    g(this, "_focus", null);
    g(this, "_placement");
    g(this, "_controls");
    g(this, "_controlsListeners");
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
    this.dispose(), this.options = t, this._options = ze(t), this._camera = this._options.isSphere ? new we(-1.8, 1.8, 1.8, -1.8, 5, 10) : new be(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = qe(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: c, animated: a, speed: d } = this._options;
    return this.animated = a, this.speed = d, this._container = c ? Ee(c) : document.body, this._domElement = xe(this._options), this._domElement.onpointerdown = (h) => this._onPointerDown(h), this._domElement.onpointermove = (h) => this._onPointerMove(h), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
      return this.target = new O().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
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
    const n = (h) => {
      if (!this._dragging) {
        if (Me(h, this._pointerStart)) return;
        this._dragging = !0;
      }
      const r = Ne.set(h.clientX, h.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), f = this.coordinateConversion(
        j.subVectors(this.camera.position, this.target)
      ), l = qt.setFromVector3(f);
      l.theta = a - r.x, l.phi = mt(
        d - r.y,
        lt,
        Math.PI - lt
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(l),
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
    !this.enabled || this._dragging || (this._background && Rt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._background && Rt(this._background, !1), this._focus && Y(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Gt(
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
    const n = Gt(
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
