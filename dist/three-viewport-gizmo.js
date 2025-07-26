var re = Object.defineProperty;
var ae = (s, e, t) => e in s ? re(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var _ = (s, e, t) => ae(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as T, Vector2 as J, Raycaster as ce, Object3D as W, Color as Vt, CanvasTexture as le, RepeatWrapping as Lt, SRGBColorSpace as de, BufferGeometry as Zt, BufferAttribute as it, Sprite as wt, SpriteMaterial as St, Mesh as X, MeshBasicMaterial as ht, SphereGeometry as Xt, CylinderGeometry as ue, BackSide as he, InstancedBufferGeometry as fe, Float32BufferAttribute as Ct, InstancedInterleavedBuffer as _t, InterleavedBufferAttribute as Z, WireframeGeometry as pe, Box3 as xt, Sphere as $t, ShaderMaterial as me, ShaderLib as st, UniformsUtils as Yt, UniformsLib as ot, Vector4 as Y, Line3 as ge, Matrix4 as Qt, MathUtils as ye, Clock as _e, Quaternion as ft, Scene as ve, OrthographicCamera as be, PerspectiveCamera as we, Spherical as Se } from "three";
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
  const o = document.createElement("div"), { top: a, left: c, right: d, bottom: u } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${a}px ${d}px ${u}px ${c}px`,
    borderRadius: "100%"
  }), Jt(o, s), n && (o.id = n), i && (o.className = i), o;
}, Ee = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function vt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const Ae = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], Ot = /* @__PURE__ */ new T();
function Bt({ isSphere: s }, e, t) {
  s && (Ot.set(0, 0, 1).applyQuaternion(t.quaternion), Ae.forEach(([n, i, o]) => {
    const a = Ot[n];
    let c = e[i], d = c.userData.opacity;
    c.material.opacity = vt(a >= 0 ? d : d / 2, 0, 1), c = e[o], d = c.userData.opacity, c.material.opacity = vt(a >= 0 ? d / 2 : d, 0, 1);
  }));
}
const Me = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, Dt = /* @__PURE__ */ new ce(), Pt = /* @__PURE__ */ new J(), Rt = (s, e, t, n) => {
  Pt.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), Dt.setFromCamera(Pt, t);
  const i = Dt.intersectObjects(
    n,
    !1
  );
  if (i.length > 0) {
    i.sort((u, r) => u.distance - r.distance);
    const a = 0.2, c = i[0].distance, d = i.filter(
      (u) => u.distance <= c + a
    );
    d.length > 1 && (d.sort((u, r) => (r.object.userData.intersectionOrder || 0) - (u.object.userData.intersectionOrder || 0)), i.splice(0, d.length, ...d));
  }
  const o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, pt = 1e-6, Ue = 2 * Math.PI, Kt = ["x", "y", "z"], $ = [...Kt, "nx", "ny", "nz"], ze = ["x", "z", "y", "nx", "nz", "ny"], Te = ["z", "x", "y", "nz", "nx", "ny"], rt = "Right", at = "Top", ct = "Front", lt = "Left", dt = "Bottom", ut = "Back", Le = [
  rt,
  at,
  ct,
  lt,
  dt,
  ut
].map((s) => s.toLocaleLowerCase()), te = 1.3, Gt = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, k = (s) => JSON.parse(JSON.stringify(s)), Ce = {
  yUp: {
    x: rt,
    y: at,
    z: ct,
    nx: lt,
    ny: dt,
    nz: ut
  },
  zUp: {
    x: rt,
    y: ut,
    z: at,
    nx: lt,
    ny: ct,
    nz: dt
  },
  xUp: {
    x: at,
    y: ct,
    z: rt,
    nx: dt,
    ny: ut,
    nz: lt
  }
}, Oe = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = e === "rounded-cube", i = s.resolution || t ? 64 : 128, o = W.DEFAULT_UP, a = o.z === 1, c = o.x === 1, u = Ce[a ? "zUp" : c ? "xUp" : "yUp"], { container: r } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = r;
  const h = a ? ze : c ? Te : $;
  Le.forEach((p, w) => {
    s[p] && (s[h[w]] = s[p]);
  });
  const l = {
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
  }, v = {
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
      ...k(l),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: u.x }
    },
    y: {
      ...k(l),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: u.y }
    },
    z: {
      ...k(l),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: u.z }
    },
    nx: {
      ...k(f),
      label: t ? "" : u.nx
    },
    ny: {
      ...k(f),
      label: t ? "" : u.ny
    },
    nz: {
      ...k(f),
      label: t ? "" : u.nz
    }
  };
  if (bt(s, v), n) {
    const p = s;
    p.edges.radius = p.radius, p.edges.scale = 1, p.edges.opacity = 1, p.edges.hover.scale = 1, p.edges.hover.opacity = 1, p.corners.radius = p.radius, p.corners.scale = 1, p.corners.opacity = 1, p.corners.hover.scale = 1, p.corners.hover.opacity = 1, p.radius = 0, $.forEach((w) => {
      p[w].scale = 1, p[w].opacity = 1, p[w].hover.scale = 1, p[w].hover.opacity = 1;
    });
  }
  return Kt.forEach(
    (p) => bt(
      s[`n${p}`],
      k(s[p])
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
const Be = (s, e = 2) => {
  const t = new Vt(), n = e * 2, { isSphere: i, resolution: o, radius: a, font: c, corners: d, edges: u } = s, r = $.map((m) => ({ ...s[m], radius: a }));
  i && d.enabled && r.push(d), i && u.enabled && r.push(u);
  const h = document.createElement("canvas"), l = h.getContext("2d");
  h.width = o * 2 + n * 2, h.height = o * r.length + n * r.length;
  const [f, v] = C(r, o, c);
  r.forEach(
    ({
      radius: m,
      label: S,
      color: F,
      labelColor: x,
      border: E,
      hover: {
        color: H,
        labelColor: O,
        border: B
      }
    }, D) => {
      const I = o * D + D * n + e;
      y(
        e,
        I,
        e,
        o,
        m,
        S,
        E,
        F,
        x
      ), y(
        o + e * 3,
        I,
        e,
        o,
        m,
        S,
        B ?? E,
        H ?? F,
        O ?? x
      );
    }
  );
  const p = r.length, w = e / (o * 2), A = e / (o * 6), L = 1 / p, b = new le(h);
  return b.repeat.set(0.5 - 2 * w, L - 2 * A), b.offset.set(w, 1 - A), Object.assign(b, {
    colorSpace: de,
    wrapS: Lt,
    wrapT: Lt,
    userData: {
      offsetX: w,
      offsetY: A,
      cellHeight: L
    }
  }), b;
  function y(m, S, F, x, E, H, O, B, D) {
    if (E = E * (x / 2), B != null && B !== "" && (I(), l.fillStyle = t.set(B).getStyle(), l.fill()), O && O.size) {
      const N = O.size * x / 2;
      m += N, S += N, x -= O.size * x, E = Math.max(0, E - N), I(), l.strokeStyle = t.set(O.color).getStyle(), l.lineWidth = O.size * x, l.stroke();
    }
    H && g(
      l,
      m + x / 2,
      S + (x + F) / 2,
      H,
      t.set(D).getStyle()
    );
    function I() {
      l.beginPath(), l.moveTo(m + E, S), l.lineTo(m + x - E, S), l.arcTo(m + x, S, m + x, S + E, E), l.lineTo(m + x, S + x - E), l.arcTo(m + x, S + x, m + x - E, S + x, E), l.lineTo(m + E, S + x), l.arcTo(m, S + x, m, S + x - E, E), l.lineTo(m, S + E), l.arcTo(m, S, m + E, S, E), l.closePath();
    }
  }
  function C(m, S, F) {
    const E = [...m].sort((K, oe) => {
      var zt, Tt;
      return (((zt = K.label) == null ? void 0 : zt.length) || 0) - (((Tt = oe.label) == null ? void 0 : Tt.length) || 0);
    }).pop().label, { family: H, weight: O } = F, B = i ? Math.sqrt(Math.pow(S * 0.7, 2) / 2) : S;
    let D = B;
    s.font.size > 0 && (D = s.font.size);
    let I = 0, N = 0;
    do {
      l.font = `${O} ${D}px ${H}`;
      const K = l.measureText(E);
      I = K.width, N = K.fontBoundingBoxDescent, D--;
    } while (I > B && D > 0);
    const Ut = B / N, ie = Math.min(B / I, Ut), se = Math.floor(D * ie);
    return [`${O} ${se}px ${H}`, Ut];
  }
  function g(m, S, F, x, E) {
    m.font = f, m.textAlign = "center", m.textBaseline = "middle", m.fillStyle = E, m.fillText(x, S, F + (i ? v : 0));
  }
}, De = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, Et = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function At(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, a = s / t, c = (t - s) / t, d = s / n, u = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], h = [c, u, a, u, a, d, c, d], l = [
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
    (g) => l[g]
  );
  let v, p, w, A, L, b, y, C;
  for (let g = 0; g < 4; g++) {
    A = g < 1 || g > 2 ? i : -i, L = g < 2 ? o : -o, b = g < 1 || g > 2 ? c : a, y = g < 2 ? u : d;
    for (let m = 0; m <= e; m++)
      v = Math.PI / 2 * (g + m / e), p = Math.cos(v), w = Math.sin(v), r.push(A + s * p, L + s * w, 0), h.push(b + a * p, y + d * w), m < e && (C = (e + 1) * g + m + 4, f.push(g, C, C + 1));
  }
  return new Zt().setIndex(new it(new Uint32Array(f), 1)).setAttribute(
    "position",
    new it(new Float32Array(r), 3)
  ).setAttribute("uv", new it(new Float32Array(h), 2));
}
const Pe = (s, e) => {
  const t = new T(), { isSphere: n, radius: i, smoothness: o, type: a } = s, d = a === "rounded-cube" ? 2 - s.edges.radius * 2 : 2, u = At(i, o, d, d);
  return $.map((r, h) => {
    const l = h < 3, f = $[h], v = h ? e.clone() : e;
    Et(v, h);
    const { enabled: p, scale: w, opacity: A, hover: L } = s[f], b = {
      map: v,
      opacity: A,
      transparent: !0
    }, y = n ? new wt(new St(b)) : new X(u, new ht(b)), C = l ? f : f[1];
    if (y.position[C] = (l ? 1 : -1) * (n ? te : 1), !n) {
      y.lookAt(t.copy(y.position).multiplyScalar(1.7));
      const g = W.DEFAULT_UP.z === 1, m = W.DEFAULT_UP.x === 1;
      (g || m) && (f === "z" && g || f === "x" && m || f === "nz" && g || f === "nx" && m) && y.rotateZ(-Math.PI / 2);
    }
    return y.scale.setScalar(w), y.renderOrder = 1, y.visible = p, y.userData = {
      scale: w,
      opacity: A,
      hover: L
    }, y;
  });
}, Re = (s, e) => {
  const { isSphere: t, corners: n, type: i } = s, o = i === "rounded-cube";
  if (!n.enabled) return [];
  const { color: a, opacity: c, scale: d, radius: u, smoothness: r, hover: h } = n, l = t ? null : o ? new Xt(u, r * 2, r) : At(u, r), f = {
    transparent: !0,
    opacity: c
  }, v = o ? 1 - u : 0.85, p = [
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
  ].map((A) => A * v), w = new T();
  return Array(p.length / 3).fill(0).map((A, L) => {
    if (t) {
      const C = e.clone();
      Et(C, 6), f.map = C;
    } else
      f.color = a;
    const b = t ? new wt(new St(f)) : new X(l, new ht(f)), y = L * 3;
    return b.position.set(p[y], p[y + 1], p[y + 2]), t && b.position.normalize().multiplyScalar(1.7), b.scale.setScalar(d), b.lookAt(w.copy(b.position).multiplyScalar(2)), b.renderOrder = 1, b.userData = {
      color: a,
      opacity: c,
      scale: d,
      hover: h,
      intersectionOrder: 1
    }, b;
  });
}, Ge = (s, e, t) => {
  const { isSphere: n, edges: i, type: o } = s, a = o === "rounded-cube";
  if (!i.enabled) return [];
  const { color: c, opacity: d, scale: u, hover: r, radius: h, smoothness: l } = i, f = a ? 2 - h * 2 : 1.2, v = n ? null : a ? new ue(h, h, f, l * 4) : At(h, l, f, 0.25), p = {
    transparent: !0,
    opacity: d
  }, w = a ? 1 - h : 0.925, A = [
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
  ].map((y) => y * w), L = new T(), b = new T(0, 1, 0);
  return Array(A.length / 3).fill(0).map((y, C) => {
    if (n) {
      const S = e.clone();
      Et(S, t), p.map = S;
    } else
      p.color = c;
    const g = n ? new wt(new St(p)) : new X(v, new ht(p)), m = C * 3;
    return g.position.set(A[m], A[m + 1], A[m + 2]), n && g.position.normalize().multiplyScalar(1.7), g.scale.setScalar(u), g.up.copy(b), g.lookAt(L.copy(g.position).multiplyScalar(2)), a ? (!n && !g.position.z && (g.rotation.z = Math.PI), !n && !g.position.x && (g.rotation.x = 0), !n && !g.position.x && (g.rotation.z = Math.PI / 2)) : !n && !g.position.y && (g.rotation.z = Math.PI / 2), g.renderOrder = 1, g.userData = {
      color: c,
      opacity: d,
      scale: u,
      hover: r
    }, g;
  });
};
function Ie(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, a = {}, c = s[0].morphTargetsRelative, d = new Zt();
  let u = 0;
  for (let r = 0; r < s.length; ++r) {
    const h = s[r];
    let l = 0;
    if (t !== (h.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const f in h.attributes) {
      if (!n.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + f + '" attribute exists among all geometries, or in none of them.'), null;
      o[f] === void 0 && (o[f] = []), o[f].push(h.attributes[f]), l++;
    }
    if (l !== n.size)
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
      d.addGroup(u, f, r), u += f;
    }
  }
  if (t) {
    let r = 0;
    const h = [];
    for (let l = 0; l < s.length; ++l) {
      const f = s[l].index;
      for (let v = 0; v < f.count; ++v)
        h.push(f.getX(v) + r);
      r += s[l].attributes.position.count;
    }
    d.setIndex(h);
  }
  for (const r in o) {
    const h = It(o[r]);
    if (!h)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    d.setAttribute(r, h);
  }
  for (const r in a) {
    const h = a[r][0].length;
    if (h === 0) break;
    d.morphAttributes = d.morphAttributes || {}, d.morphAttributes[r] = [];
    for (let l = 0; l < h; ++l) {
      const f = [];
      for (let p = 0; p < a[r].length; ++p)
        f.push(a[r][p][l]);
      const v = It(f);
      if (!v)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      d.morphAttributes[r].push(v);
    }
  }
  return d;
}
function It(s) {
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
  const a = new e(o), c = new it(a, t, n);
  let d = 0;
  for (let u = 0; u < s.length; ++u) {
    const r = s[u];
    if (r.isInterleavedBufferAttribute) {
      const h = d / t;
      for (let l = 0, f = r.count; l < f; l++)
        for (let v = 0; v < t; v++) {
          const p = r.getComponent(l, v);
          c.setComponent(l + h, v, p);
        }
    } else
      a.set(r.array, d);
    d += r.count * t;
  }
  return i !== void 0 && (c.gpuType = i), c;
}
const Fe = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: a }
  } = e;
  let c;
  const d = new ht({
    color: i,
    side: he,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    c = new X(
      new Xt(1.8, 64, 64),
      d
    );
  else {
    let u;
    s.forEach((r) => {
      const h = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const l = r.geometry.clone();
      l.applyMatrix4(r.matrix), u = u ? Ie([u, l]) : l, r.scale.setScalar(h);
    }), c = new X(u, d);
  }
  return c.userData = {
    color: i,
    opacity: o,
    hover: a
  }, c;
}, Ft = new xt(), tt = new T();
class ee extends fe {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Ct(e, 3)), this.setAttribute("uv", new Ct(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new _t(t, 6, 1);
    return this.setAttribute("instanceStart", new Z(n, 3, 0)), this.setAttribute("instanceEnd", new Z(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new _t(t, 6, 1);
    return this.setAttribute("instanceColorStart", new Z(n, 3, 0)), this.setAttribute("instanceColorEnd", new Z(n, 3, 3)), this;
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
      for (let o = 0, a = e.count; o < a; o++)
        tt.fromBufferAttribute(e, o), i = Math.max(i, n.distanceToSquared(tt)), tt.fromBufferAttribute(t, o), i = Math.max(i, n.distanceToSquared(tt));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(e) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(e);
  }
}
ot.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new J(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
st.line = {
  uniforms: Yt.merge([
    ot.common,
    ot.fog,
    ot.line
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
      uniforms: Yt.clone(st.line.uniforms),
      vertexShader: st.line.vertexShader,
      fragmentShader: st.line.fragmentShader,
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
const mt = new Y(), Ht = new T(), kt = new T(), M = new Y(), U = new Y(), P = new Y(), gt = new T(), yt = new Qt(), z = new ge(), jt = new T(), et = new xt(), nt = new $t(), R = new Y();
let G, q;
function Wt(s, e, t) {
  return R.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), R.multiplyScalar(1 / R.w), R.x = q / t.width, R.y = q / t.height, R.applyMatrix4(s.projectionMatrixInverse), R.multiplyScalar(1 / R.w), Math.abs(Math.max(R.x, R.y));
}
function He(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, a = Math.min(n.instanceCount, i.count);
  for (let c = 0, d = a; c < d; c++) {
    z.start.fromBufferAttribute(i, c), z.end.fromBufferAttribute(o, c), z.applyMatrix4(t);
    const u = new T(), r = new T();
    G.distanceSqToSegment(z.start, z.end, r, u), r.distanceTo(u) < q * 0.5 && e.push({
      point: r,
      pointOnLine: u,
      distance: G.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: c,
      uv: null,
      uv1: null
    });
  }
}
function ke(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, a = s.matrixWorld, c = s.geometry, d = c.attributes.instanceStart, u = c.attributes.instanceEnd, r = Math.min(c.instanceCount, d.count), h = -e.near;
  G.at(1, P), P.w = 1, P.applyMatrix4(e.matrixWorldInverse), P.applyMatrix4(n), P.multiplyScalar(1 / P.w), P.x *= o.x / 2, P.y *= o.y / 2, P.z = 0, gt.copy(P), yt.multiplyMatrices(e.matrixWorldInverse, a);
  for (let l = 0, f = r; l < f; l++) {
    if (M.fromBufferAttribute(d, l), U.fromBufferAttribute(u, l), M.w = 1, U.w = 1, M.applyMatrix4(yt), U.applyMatrix4(yt), M.z > h && U.z > h)
      continue;
    if (M.z > h) {
      const b = M.z - U.z, y = (M.z - h) / b;
      M.lerp(U, y);
    } else if (U.z > h) {
      const b = U.z - M.z, y = (U.z - h) / b;
      U.lerp(M, y);
    }
    M.applyMatrix4(n), U.applyMatrix4(n), M.multiplyScalar(1 / M.w), U.multiplyScalar(1 / U.w), M.x *= o.x / 2, M.y *= o.y / 2, U.x *= o.x / 2, U.y *= o.y / 2, z.start.copy(M), z.start.z = 0, z.end.copy(U), z.end.z = 0;
    const p = z.closestPointToPointParameter(gt, !0);
    z.at(p, jt);
    const w = ye.lerp(M.z, U.z, p), A = w >= -1 && w <= 1, L = gt.distanceTo(jt) < q * 0.5;
    if (A && L) {
      z.start.fromBufferAttribute(d, l), z.end.fromBufferAttribute(u, l), z.start.applyMatrix4(a), z.end.applyMatrix4(a);
      const b = new T(), y = new T();
      G.distanceSqToSegment(z.start, z.end, y, b), t.push({
        point: y,
        pointOnLine: b,
        distance: G.origin.distanceTo(y),
        object: s,
        face: null,
        faceIndex: l,
        uv: null,
        uv1: null
      });
    }
  }
}
class je extends X {
  constructor(e = new ee(), t = new Mt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let a = 0, c = 0, d = t.count; a < d; a++, c += 2)
      Ht.fromBufferAttribute(t, a), kt.fromBufferAttribute(n, a), i[c] = c === 0 ? 0 : i[c - 1], i[c + 1] = i[c] + Ht.distanceTo(kt);
    const o = new _t(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new Z(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new Z(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    G = e.ray;
    const a = this.matrixWorld, c = this.geometry, d = this.material;
    q = d.linewidth + o, c.boundingSphere === null && c.computeBoundingSphere(), nt.copy(c.boundingSphere).applyMatrix4(a);
    let u;
    if (n)
      u = q * 0.5;
    else {
      const h = Math.max(i.near, nt.distanceToPoint(G.origin));
      u = Wt(i, h, d.resolution);
    }
    if (nt.radius += u, G.intersectsSphere(nt) === !1)
      return;
    c.boundingBox === null && c.computeBoundingBox(), et.copy(c.boundingBox).applyMatrix4(a);
    let r;
    if (n)
      r = q * 0.5;
    else {
      const h = Math.max(i.near, et.distanceToPoint(G.origin));
      r = Wt(i, h, d.resolution);
    }
    et.expandByScalar(r), G.intersectsBox(et) !== !1 && (n ? He(this, t) : ke(this, i, t));
  }
  onBeforeRender(e) {
    const t = this.material.uniforms;
    t && t.resolution && (e.getViewport(mt), this.material.uniforms.resolution.value.set(mt.z, mt.w));
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
class We extends je {
  constructor(e = new ne(), t = new Mt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const qe = (s) => {
  const e = new Vt(), t = [], n = [], { isSphere: i } = s;
  if ($.forEach((c, d) => {
    const { enabled: u, line: r, scale: h, color: l } = s[c];
    if (!u || !r) return;
    const f = d < 3 ? 1 : -1, p = (i ? te - h / 2 : 0.975) * f;
    t.push(
      c.includes("x") ? p : 0,
      c.includes("y") ? p : 0,
      c.includes("z") ? p : 0,
      0,
      0,
      0
    );
    const w = e.set(l).toArray();
    n.push(...w, ...w);
  }), !t.length) return null;
  const o = new ne().setPositions(t).setColors(n), a = new Mt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new J(window.innerWidth, window.innerHeight)
  });
  return new We(o, a).computeLineDistances();
}, Ne = (s) => {
  const { corners: e, edges: t } = s, n = [], i = Be(s), o = Pe(s, i);
  n.push(...o), e.enabled && n.push(...Re(s, i)), t.enabled && n.push(...Ge(s, i, e.enabled ? 7 : 6));
  const a = Fe(o, s), c = qe(s);
  return [n, a, c];
}, Q = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: a } = e ? n.hover : n;
  s.scale.setScalar(a), t.opacity = i, t.map ? De(t.map, e) : t.color.set(o);
}, V = /* @__PURE__ */ new Qt(), qt = /* @__PURE__ */ new Se(), Ve = /* @__PURE__ */ new J(), j = /* @__PURE__ */ new T(), Nt = /* @__PURE__ */ new Y();
class $e extends W {
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
    _(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    _(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    _(this, "renderer");
    /** The configuration options */
    _(this, "options");
    /** The point around which the camera rotates */
    _(this, "target", new T());
    /** Whether view changes should be animated */
    _(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    _(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    _(this, "animating", !1);
    _(this, "_options");
    _(this, "_intersections");
    _(this, "_background", null);
    _(this, "_viewport", [0, 0, 0, 0]);
    _(this, "_originalViewport", [0, 0, 0, 0]);
    _(this, "_originalScissor", [0, 0, 0, 0]);
    _(this, "_scene");
    _(this, "_camera");
    _(this, "_container");
    _(this, "_domElement");
    _(this, "_domRect");
    _(this, "_dragging", !1);
    _(this, "_distance", 0);
    _(this, "_clock", new _e());
    _(this, "_targetQuaternion", new ft());
    _(this, "_quaternionStart", new ft());
    _(this, "_quaternionEnd", new ft());
    _(this, "_pointerStart", new J());
    _(this, "_focus", null);
    _(this, "_placement");
    _(this, "_controls");
    _(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this._scene = new ve().add(this), this.set(i);
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
    const [n, i, o] = Ne(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: a, animated: c, speed: d } = this._options;
    return this.animated = c, this.speed = d, this._container = a ? Ee(a) : document.body, this._domElement = xe(this._options), this._domElement.onpointerdown = (u) => this._onPointerDown(u), this._domElement.onpointermove = (u) => this._onPointerMove(u), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
      return this.target = new T().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((n) => {
      var o, a, c, d;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (c = (a = i.material) == null ? void 0 : a.map) == null || c.dispose(), (d = i.geometry) == null || d.dispose();
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
    const o = this._clock.getDelta() * Ue * this.speed;
    this._quaternionStart.rotateTowards(this._quaternionEnd, o), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) < pt && (this._controls && (this._controls.enabled = !0), this.animating = !1, this.up.copy(W.DEFAULT_UP), this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const n = this.camera, i = this.target, o = W.DEFAULT_UP;
    let a = this.up;
    Math.abs(t.z) >= 1 && o.z === 1 ? a.set(0, 1, 0) : Math.abs(t.x) >= 1 && o.x, j.copy(t).multiplyScalar(this._distance), V.setPosition(j).lookAt(j, this.position, a), this._targetQuaternion.setFromRotationMatrix(V), j.add(i), V.lookAt(j, i, a), this._quaternionEnd.setFromRotationMatrix(V), V.setPosition(n.position).lookAt(n.position, i, a), this._quaternionStart.setFromRotationMatrix(V), this.animating = !0, this._clock.start(), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const n = (u) => {
      if (!this._dragging) {
        if (Me(u, this._pointerStart)) return;
        this._dragging = !0;
      }
      const r = Ve.set(u.clientX, u.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), h = this.coordinateConversion(
        j.subVectors(this.camera.position, this.target)
      ), l = qt.setFromVector3(h);
      l.theta = c - r.x, l.phi = vt(
        d - r.y,
        pt,
        Math.PI - pt
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(l),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Q(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = this.coordinateConversion(
      j.subVectors(this.camera.position, this.target)
    ), a = qt.setFromVector3(o), c = a.theta, d = a.phi;
    this._distance = a.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", i, !1), this.dispatchEvent({ type: "start" });
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
    const { x: i, y: o, z: a } = t, c = W.DEFAULT_UP;
    return c.x === 1 ? n ? t.set(o, a, i) : t.set(a, i, o) : c.z === 1 ? n ? t.set(a, i, o) : t.set(o, a, i) : t;
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
    !this.enabled || this._dragging || (this._background && Gt(this._background, !1), this._focus && Q(this._focus, !1), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = Rt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    this._focus && (Q(this._focus, !1), this._focus = null), n && (this._setOrientation(n.object.position), this.dispatchEvent({ type: "change" }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const n = Rt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && Q(this._focus, !1), (this._focus = i) ? Q(i, !0) : Bt(this._options, this._intersections, this.camera));
  }
}
export {
  $e as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
