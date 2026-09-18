var Rt = Object.defineProperty;
var It = (n, s, t) => s in n ? Rt(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[s] = t;
var g = (n, s, t) => It(n, typeof s != "symbol" ? s + "" : s, t);
import { MathUtils as Et, Vector3 as k, Vector2 as H, Raycaster as Ft, Object3D as nt, Color as xt, CanvasTexture as Ut, RepeatWrapping as ht, SRGBColorSpace as Gt, BufferGeometry as qt, BufferAttribute as X, SpriteMaterial as q, MeshBasicMaterial as U, Sprite as it, Mesh as $, SphereGeometry as Ct, CylinderGeometry as Bt, BackSide as Zt, Quaternion as pt, Scene as jt, OrthographicCamera as $t, PerspectiveCamera as Vt, Vector4 as Ht, Matrix4 as Xt, Spherical as Wt } from "three";
import { mergeGeometries as Nt } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2NodeMaterial as Yt } from "three/webgpu";
import { Line2 as Jt } from "three/addons/lines/Line2.js";
import { Line2 as Qt } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry as Kt } from "three/addons/lines/LineGeometry.js";
import { LineMaterial as te } from "three/addons/lines/LineMaterial.js";
const At = (n, s) => {
  const [t, e] = s.split("-");
  return Object.assign(n.style, {
    left: e === "left" ? "0" : e === "center" ? "50%" : "",
    right: e === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${e === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), s;
}, ee = ({
  placement: n,
  size: s,
  offset: t,
  id: e,
  className: o
}) => {
  const i = document.createElement("div"), { top: r, left: c, right: p, bottom: l } = t;
  return Object.assign(i.style, {
    id: e,
    position: "absolute",
    zIndex: "1000",
    height: `${s}px`,
    width: `${s}px`,
    margin: `${r}px ${p}px ${l}px ${c}px`,
    borderRadius: "100%"
  }), At(i, n), e && (i.id = e), o && (i.className = o), i;
}, ne = (n) => {
  const s = typeof n == "string" ? document.querySelector(n) : n;
  if (!s) throw Error("Invalid DOM element");
  return s;
}, { clamp: ot } = Et, oe = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], ut = /* @__PURE__ */ new k();
function dt(n, s) {
  const { idleMaterial: t, hoverMaterial: e, hover: o, opacity: i } = n.userData;
  if (!t || !e) {
    n.material.opacity = s;
    return;
  }
  t.opacity = s;
  const r = i > 0 ? i : 1, c = ot(
    s * (o.opacity / r),
    0,
    1
  );
  e.opacity = c;
}
function ft({ isSphere: n }, s, t) {
  n && (ut.set(0, 0, 1).applyQuaternion(t.quaternion), oe.forEach(([e, o, i]) => {
    const r = ut[e];
    let c = s[o], p = c.userData.opacity;
    dt(
      c,
      ot(r >= 0 ? p : p / 2, 0, 1)
    ), c = s[i], p = c.userData.opacity, dt(
      c,
      ot(r >= 0 ? p / 2 : p, 0, 1)
    );
  }));
}
const se = (n, s, t = 10) => Math.abs(n.clientX - s.x) < t && Math.abs(n.clientY - s.y) < t, mt = /* @__PURE__ */ new Ft(), _t = /* @__PURE__ */ new H(), yt = (n, s, t, e) => {
  _t.set(
    (n.clientX - s.left) / s.width * 2 - 1,
    -((n.clientY - s.top) / s.height) * 2 + 1
  ), mt.setFromCamera(_t, t);
  const o = mt.intersectObjects(
    e,
    !1
  );
  if (o.length > 0) {
    o.sort((l, u) => l.distance - u.distance);
    const r = 0.2, c = o[0].distance, p = o.filter(
      (l) => l.distance <= c + r
    );
    p.length > 1 && (p.sort((l, u) => {
      const m = l.object.userData.intersectionOrder ?? 0;
      return (u.object.userData.intersectionOrder ?? 0) - m;
    }), o.splice(0, p.length, ...p));
  }
  const i = o.length ? o[0] : null;
  return !i || !i.object.visible ? null : i;
}, W = 1e-6, gt = 1e-4, ie = 2 * Math.PI, Ot = ["x", "y", "z"], R = [...Ot, "nx", "ny", "nz"], re = ["x", "z", "y", "nx", "nz", "ny"], ae = ["z", "x", "y", "nz", "nx", "ny"], N = "Right", Y = "Top", J = "Front", Q = "Left", K = "Bottom", tt = "Back", Lt = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Tt = 1.3, vt = (n, s = !0) => {
  const { material: t, userData: e } = n, { color: o, opacity: i } = s ? e.hover : e;
  t.color.set(o), t.opacity = i;
}, I = (n) => JSON.parse(JSON.stringify(n)), ce = {
  yUp: {
    x: N,
    y: Y,
    z: J,
    nx: Q,
    ny: K,
    nz: tt
  },
  zUp: {
    x: N,
    y: tt,
    z: Y,
    nx: Q,
    ny: J,
    nz: K
  },
  xUp: {
    x: Y,
    y: J,
    z: N,
    nx: K,
    ny: tt,
    nz: Q
  }
}, le = (n) => {
  const s = n.type || "sphere", t = s === "sphere", e = s === "rounded-cube", o = n.resolution || t ? 64 : 128, i = n.up ?? Dt(nt.DEFAULT_UP), r = i === "z", c = i === "x", l = ce[r ? "zUp" : c ? "xUp" : "yUp"], { container: u, ...m } = n;
  n = JSON.parse(JSON.stringify(m)), n.container = u;
  const h = r ? re : c ? ae : R;
  Lt.forEach((d, w) => {
    n[d] && (n[h[w]] = n[d]);
  });
  const v = {
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
  }, S = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, A = {
    type: s,
    up: i,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: o,
    lineWidth: 4,
    radius: t ? 1 : e ? 0.3 : 0.2,
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
      color: t ? 15915362 : e ? 15658734 : 16777215,
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
      ...I(v),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: l.x }
    },
    y: {
      ...I(v),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: l.y }
    },
    z: {
      ...I(v),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: l.z }
    },
    nx: {
      ...I(S),
      label: t ? "" : l.nx
    },
    ny: {
      ...I(S),
      label: t ? "" : l.ny
    },
    nz: {
      ...I(S),
      label: t ? "" : l.nz
    }
  };
  if (st(n, A), e) {
    const d = n;
    d.edges.radius = d.radius, d.edges.scale = 1, d.edges.opacity = 1, d.edges.hover.scale = 1, d.edges.hover.opacity = 1, d.corners.radius = d.radius, d.corners.scale = 1, d.corners.opacity = 1, d.corners.hover.scale = 1, d.corners.hover.opacity = 1, d.radius = 0, R.forEach((w) => {
      d[w].scale = 1, d[w].opacity = 1, d[w].hover.scale = 1, d[w].hover.opacity = 1;
    });
  }
  return Ot.forEach(
    (d) => st(
      n[`n${d}`],
      I(n[d])
    )
  ), { ...n, isSphere: t };
}, Dt = (n) => n.z === 1 ? "z" : n.x === 1 ? "x" : "y";
function st(n, ...s) {
  if (n instanceof HTMLElement || typeof n != "object" || n === null)
    return n;
  for (const t of s)
    for (const e in t)
      e !== "container" && e in t && (n[e] === void 0 ? n[e] = t[e] : typeof t[e] == "object" && !Array.isArray(t[e]) && (n[e] = st(
        n[e] || {},
        t[e]
      )));
  return n;
}
const he = (n, s = 2) => {
  const t = new xt(), e = s * 2, { isSphere: o, resolution: i, radius: r, font: c, corners: p, edges: l } = n, u = R.map((a) => ({ ...n[a], radius: r }));
  o && p.enabled && u.push(p), o && l.enabled && u.push(l);
  const m = document.createElement("canvas"), h = m.getContext("2d");
  m.width = i * 2 + e * 2, m.height = i * u.length + e * u.length;
  const [v, S] = x(u, i, c);
  u.forEach(
    ({
      radius: a,
      label: f,
      color: L,
      labelColor: _,
      border: y,
      hover: {
        color: P,
        labelColor: O,
        border: T
      }
    }, D) => {
      const z = i * D + D * e + s;
      M(
        s,
        z,
        s,
        i,
        a,
        f,
        y,
        L,
        _
      ), M(
        i + s * 3,
        z,
        s,
        i,
        a,
        f,
        T ?? y,
        P ?? L,
        O ?? _
      );
    }
  );
  const A = u.length, d = s / (i * 2), w = s / (i * 6), E = 1 / A, C = new Ut(m);
  return C.repeat.set(0.5 - 2 * d, E - 2 * w), C.offset.set(d, 1 - w), Object.assign(C, {
    colorSpace: Gt,
    wrapS: ht,
    wrapT: ht,
    userData: {
      offsetX: d,
      offsetY: w,
      cellHeight: E
    }
  }), C;
  function M(a, f, L, _, y, P, O, T, D) {
    if (y = y * (_ / 2), T != null && T !== "" && (z(), h.fillStyle = t.set(T).getStyle(), h.fill()), O && O.size) {
      const G = O.size * _ / 2;
      a += G, f += G, _ -= O.size * _, y = Math.max(0, y - G), z(), h.strokeStyle = t.set(O.color).getStyle(), h.lineWidth = O.size * _, h.stroke();
    }
    P && b(
      h,
      a + _ / 2,
      f + (_ + L) / 2,
      P,
      t.set(D).getStyle()
    );
    function z() {
      h.beginPath(), h.moveTo(a + y, f), h.lineTo(a + _ - y, f), h.arcTo(a + _, f, a + _, f + y, y), h.lineTo(a + _, f + _ - y), h.arcTo(a + _, f + _, a + _ - y, f + _, y), h.lineTo(a + y, f + _), h.arcTo(a, f + _, a, f + _ - y, y), h.lineTo(a, f + y), h.arcTo(a, f, a + y, f, y), h.closePath();
    }
  }
  function x(a, f, L) {
    const y = [...a].sort((V, kt) => {
      var ct, lt;
      return (((ct = V.label) == null ? void 0 : ct.length) || 0) - (((lt = kt.label) == null ? void 0 : lt.length) || 0);
    }).pop().label, { family: P, weight: O } = L, T = o ? Math.sqrt(Math.pow(f * 0.7, 2) / 2) : f;
    let D = T;
    n.font.size > 0 && (D = n.font.size);
    let z = 0, G = 0;
    do {
      h.font = `${O} ${D}px ${P}`;
      const V = h.measureText(y);
      z = V.width, G = V.fontBoundingBoxDescent, D--;
    } while (z > T && D > 0);
    const at = T / G, zt = Math.min(T / z, at), Pt = Math.floor(D * zt);
    return [`${O} ${Pt}px ${P}`, at];
  }
  function b(a, f, L, _, y) {
    a.font = v, a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = y, a.fillText(_, f, L + (o ? S : 0));
  }
}, B = (n, s, t) => {
  const e = n.clone();
  pe(e, s);
  const { offsetX: o } = e.userData;
  return e.offset.setX((t ? 0.5 : 0) + o), e;
}, pe = (n, s) => {
  const {
    offset: t,
    userData: { offsetY: e, cellHeight: o }
  } = n;
  t.y = 1 - (s + 1) * o + e;
};
function rt(n, s, t = 2, e = 2) {
  const o = t / 2 - n, i = e / 2 - n, r = n / t, c = (t - n) / t, p = n / e, l = (e - n) / e, u = [o, i, 0, -o, i, 0, -o, -i, 0, o, -i, 0], m = [c, l, r, l, r, p, c, p], h = [
    3 * (s + 1) + 3,
    3 * (s + 1) + 4,
    s + 4,
    s + 5,
    2 * (s + 1) + 4,
    2,
    1,
    2 * (s + 1) + 3,
    3,
    4 * (s + 1) + 3,
    4,
    0
  ], v = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (b) => h[b]
  );
  let S, A, d, w, E, C, M, x;
  for (let b = 0; b < 4; b++) {
    w = b < 1 || b > 2 ? o : -o, E = b < 2 ? i : -i, C = b < 1 || b > 2 ? c : r, M = b < 2 ? l : p;
    for (let a = 0; a <= s; a++)
      S = Math.PI / 2 * (b + a / s), A = Math.cos(S), d = Math.sin(S), u.push(w + n * A, E + n * d, 0), m.push(C + r * A, M + p * d), a < s && (x = (s + 1) * b + a + 4, v.push(b, x, x + 1));
  }
  return new qt().setIndex(new X(new Uint32Array(v), 1)).setAttribute(
    "position",
    new X(new Float32Array(u), 3)
  ).setAttribute("uv", new X(new Float32Array(m), 2));
}
const ue = (n, s) => {
  const t = new k(), { isSphere: e, radius: o, smoothness: i, type: r } = n, p = r === "rounded-cube" ? 2 - n.edges.radius * 2 : 2, l = rt(o, i, p, p);
  return R.map((u, m) => {
    const h = m < 3, v = R[m], S = B(s, m, !1), A = B(s, m, !0), { enabled: d, scale: w, opacity: E, hover: C } = n[v], M = {
      map: S,
      opacity: E,
      transparent: !0
    }, x = {
      map: A,
      opacity: C.opacity,
      transparent: !0
    }, b = e ? new q(M) : new U(M), a = e ? new q(x) : new U(x), f = e ? new it(b) : new $(l, b), L = h ? v : v[1];
    if (f.position[L] = (h ? 1 : -1) * (e ? Tt : 1), !e) {
      f.up.set(0, 0, 0)[n.up] = 1, f.lookAt(t.copy(f.position).multiplyScalar(1.7));
      const _ = n.up === "z", y = n.up === "x";
      (_ || y) && (v === "z" && _ || v === "x" && y ? f.rotateZ(-Math.PI / 2) : (v === "nz" && _ || v === "nx" && y) && f.rotateZ(Math.PI / 2));
    }
    return f.scale.setScalar(w), f.renderOrder = 1, f.visible = d, f.userData = {
      scale: w,
      opacity: E,
      hover: C,
      kind: "face",
      axes: [R[m]],
      face: Lt[m],
      idleMaterial: b,
      hoverMaterial: a
    }, f;
  });
}, bt = R.length, de = (n, s) => {
  const { isSphere: t, corners: e, type: o } = n, i = o === "rounded-cube";
  if (!e.enabled) return [];
  const { color: r, opacity: c, scale: p, radius: l, smoothness: u, hover: m } = e, h = t ? null : i ? new Ct(l, u * 2, u) : rt(l, u), v = i ? 1 - l : 0.85, S = [
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
  ].map((d) => d * v), A = new k();
  return Array(S.length / 3).fill(0).map((d, w) => {
    let E, C;
    if (t) {
      const a = B(s, bt, !1), f = B(s, bt, !0), L = {
        map: a,
        opacity: c,
        transparent: !0
      }, _ = {
        map: f,
        opacity: m.opacity,
        transparent: !0
      };
      E = new q(L), C = new q(_);
    } else
      E = new U({
        transparent: !0,
        opacity: c,
        color: r
      }), C = new U({
        transparent: !0,
        opacity: m.opacity,
        color: m.color ?? r
      });
    const M = t ? new it(E) : new $(h, E), x = w * 3;
    M.position.set(S[x], S[x + 1], S[x + 2]), t && M.position.normalize().multiplyScalar(1.7), M.scale.setScalar(p), M.up.set(0, 0, 0)[n.up] = 1, M.lookAt(A.copy(M.position).multiplyScalar(2)), M.renderOrder = 1;
    const b = [
      M.position.x > 0 ? "x" : "nx",
      M.position.y > 0 ? "y" : "ny",
      M.position.z > 0 ? "z" : "nz"
    ];
    return M.userData = {
      color: r,
      opacity: c,
      scale: p,
      hover: m,
      intersectionOrder: 1,
      kind: "corner",
      axes: b,
      idleMaterial: E,
      hoverMaterial: C
    }, M;
  });
}, et = (n, s, t) => n === 0 ? null : n > 0 ? s : t, fe = (n, s, t) => {
  const { isSphere: e, edges: o, type: i } = n, r = i === "rounded-cube";
  if (!o.enabled) return [];
  const { color: c, opacity: p, scale: l, hover: u, radius: m, smoothness: h } = o, v = r ? 2 - m * 2 : 1.2, S = e ? null : r ? new Bt(m, m, v, h * 4) : rt(m, h, v, 0.25), A = r ? 1 - m : 0.925, d = [
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
  ].map((C) => C * A), w = new k(), E = new k(0, 1, 0);
  return Array(d.length / 3).fill(0).map((C, M) => {
    let x, b;
    if (e) {
      const O = B(s, t, !1), T = B(s, t, !0), D = {
        map: O,
        opacity: p,
        transparent: !0
      }, z = {
        map: T,
        opacity: u.opacity,
        transparent: !0
      };
      x = new q(D), b = new q(z);
    } else
      x = new U({
        transparent: !0,
        opacity: p,
        color: c
      }), b = new U({
        transparent: !0,
        opacity: u.opacity,
        color: u.color ?? c
      });
    const a = e ? new it(x) : new $(S, x), f = M * 3;
    a.position.set(d[f], d[f + 1], d[f + 2]), e && a.position.normalize().multiplyScalar(1.7), a.scale.setScalar(l), a.up.copy(E), a.lookAt(w.copy(a.position).multiplyScalar(2)), r ? (!e && !a.position.z && (a.rotation.z = Math.PI), !e && !a.position.x && (a.rotation.x = 0), !e && !a.position.x && (a.rotation.z = Math.PI / 2)) : !e && !a.position.y && (a.rotation.z = Math.PI / 2), a.renderOrder = 1;
    const L = et(a.position.x, "x", "nx"), _ = et(a.position.y, "y", "ny"), y = et(a.position.z, "z", "nz"), P = [L, _, y].filter((O) => O !== null);
    return a.userData = {
      color: c,
      opacity: p,
      scale: l,
      hover: u,
      kind: "edge",
      axes: P,
      idleMaterial: x,
      hoverMaterial: b
    }, a;
  });
}, me = (n, s) => {
  const {
    isSphere: t,
    background: { enabled: e, color: o, opacity: i, hover: r }
  } = s;
  let c;
  const p = new U({
    color: o,
    side: Zt,
    opacity: i,
    transparent: !0,
    depthWrite: !1
  });
  if (!e) return null;
  if (t)
    c = new $(
      new Ct(1.8, 64, 64),
      p
    );
  else {
    let l;
    n.forEach((u) => {
      const m = u.scale.x;
      u.scale.setScalar(0.9), u.updateMatrix();
      const h = u.geometry.clone();
      h.applyMatrix4(u.matrix), l = l ? Nt([l, h]) : h, u.scale.setScalar(m);
    }), c = new $(l, p);
  }
  return c.userData = {
    color: o,
    opacity: i,
    hover: r
  }, c;
}, _e = (n, s) => {
  const t = new xt(), e = [], o = [], { isSphere: i } = n;
  if (R.forEach((l, u) => {
    const { enabled: m, line: h, scale: v, color: S } = n[l];
    if (!m || !h) return;
    const A = u < 3 ? 1 : -1, w = (i ? Tt - v / 2 : 0.975) * A;
    e.push(
      l.includes("x") ? w : 0,
      l.includes("y") ? w : 0,
      l.includes("z") ? w : 0,
      0,
      0,
      0
    );
    const E = t.set(S).toArray();
    o.push(...E, ...E);
  }), !e.length) return null;
  const r = new Kt().setPositions(e).setColors(o);
  if (s.isWebGPURenderer === !0) {
    const l = new Yt({
      linewidth: n.lineWidth,
      vertexColors: !0,
      worldUnits: !1
    });
    return new Qt(r, l).computeLineDistances();
  }
  const p = new te({
    linewidth: n.lineWidth,
    vertexColors: !0,
    resolution: new H(window.innerWidth, window.innerHeight)
  });
  return new Jt(r, p).computeLineDistances();
}, ye = (n, s) => {
  const { corners: t, edges: e } = n, o = [], i = he(n), r = ue(n, i);
  o.push(...r), t.enabled && o.push(...de(n, i)), e.enabled && o.push(...fe(n, i, t.enabled ? 7 : 6));
  const c = me(r, n), p = _e(n, s);
  return [o, c, p];
}, Z = (n, s = !0) => {
  const { userData: t } = n, { idleMaterial: e, hoverMaterial: o } = t;
  n.scale.setScalar((s ? t.hover : t).scale), n.material = s ? o : e;
}, { clamp: ge } = Et, ve = /* @__PURE__ */ new k();
function j(n) {
  if (!n) return { kind: null, axes: null, face: null, direction: null };
  const s = n.userData;
  return {
    kind: s.kind ?? null,
    axes: s.axes ?? null,
    face: s.face ?? null,
    direction: ve.copy(n.position).normalize().clone()
  };
}
const wt = /* @__PURE__ */ new Xt(), St = /* @__PURE__ */ new Wt(), be = /* @__PURE__ */ new H(), F = /* @__PURE__ */ new k(), Mt = /* @__PURE__ */ new Ht();
class Le extends nt {
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
  constructor(t, e, o = {}) {
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
    g(this, "target", new k());
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
    /** Seconds; `null` until first `_animate` tick after `_setOrientation` (first frame uses delta 0). */
    g(this, "_lastAnimateTimeSeconds", null);
    g(this, "_quaternionStart", new pt());
    g(this, "_quaternionEnd", new pt());
    g(this, "_pointerStart", new H());
    g(this, "_focus", null);
    g(this, "_placement");
    g(this, "_controls");
    g(this, "_controlsListeners");
    this.camera = t, this.renderer = e, this._scene = new jt().add(this), this.set(o);
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
    this._placement = At(this._domElement, t), this.domUpdate();
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
    const e = this._controls;
    this.dispose(), this.options = t, this._options = le(t), this.up.set(0, 0, 0)[this._options.up] = 1, this._camera = this._options.isSphere ? new $t(-1.8, 1.8, 1.8, -1.8, 5, 10) : new Vt(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [o, i, r] = ye(this._options, this.renderer);
    i && this.add(i), r && this.add(r), this.add(...o), this._background = i, this._intersections = o;
    const { container: c, animated: p, speed: l } = this._options;
    return this.animated = p, this.speed = l, this._container = c ? ne(c) : document.body, this._domElement = ee(this._options), this._domElement.onpointerdown = (u) => this._onPointerDown(u), this._domElement.onpointermove = (u) => this._onPointerMove(u), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), e && this.attachControls(e), this.update(), this;
  }
  /**
   * Keeps a gizmo built without an explicit `up` option on the process-wide
   * `Object3D.DEFAULT_UP`: when that global moves to another axis, the gizmo
   * regenerates through {@link set} so faces, drags and clicks follow it.
   *
   * @private
   * @returns Whether the gizmo was regenerated
   */
  _syncDefaultUp() {
    return this.options.up !== void 0 || Dt(nt.DEFAULT_UP) === this._options.up ? !1 : (this.set(this.options), !0);
  }
  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    this._syncDefaultUp(), this.animating && this._animate();
    const { renderer: t, _viewport: e } = this, o = t.getScissorTest(), i = t.autoClear, r = t.autoClearColor, c = t.autoClearDepth, p = t.autoClearStencil;
    return t.autoClear = !0, t.autoClearColor = !1, t.autoClearDepth = !0, t.autoClearStencil = !1, t.setViewport(...e), o && t.setScissor(...e), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), o && t.setScissor(...this._originalScissor), t.autoClear = i, t.autoClearColor = r, t.autoClearDepth = c, t.autoClearStencil = p, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, e = this._domRect, o = t.domElement.getBoundingClientRect(), i = t.isWebGPURenderer === !0, r = e.top - o.top, c = i ? r : t.domElement.clientHeight - (r + e.height);
    return this._viewport.splice(
      0,
      4,
      e.left - o.left,
      c,
      e.width,
      e.height
    ), t.getViewport(Mt).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(Mt).toArray(this._originalScissor), this;
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
    return this._syncDefaultUp() ? this : (t && this._controls && this._controls.update(), this.domUpdate().cameraUpdate());
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
      return this.target = new k().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((e) => {
      var r, c, p, l, u;
      this.remove(e);
      const o = e.userData;
      if (o.idleMaterial && o.hoverMaterial)
        (r = o.idleMaterial.map) == null || r.dispose(), o.idleMaterial.dispose(), o.hoverMaterial !== o.idleMaterial && ((c = o.hoverMaterial.map) == null || c.dispose(), o.hoverMaterial.dispose());
      else {
        const m = e, { material: h } = m;
        if (Array.isArray(h))
          for (const v of h) {
            const S = v;
            (p = S.map) == null || p.dispose(), S.dispose();
          }
        else if (h && typeof h == "object" && "dispose" in h) {
          const v = h;
          (l = v.map) == null || l.dispose(), v.dispose();
        }
      }
      (u = e.geometry) == null || u.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), ft(this._options, this._intersections, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    var e;
    let t = !this.animated;
    if (this.animated) {
      this._controls && (this._controls.enabled = !1);
      const o = performance.now() / 1e3, i = this._lastAnimateTimeSeconds === null ? 0 : o - this._lastAnimateTimeSeconds;
      this._lastAnimateTimeSeconds = o;
      const r = i * ie * this.speed;
      this._quaternionStart.rotateTowards(this._quaternionEnd, r), t = this._quaternionStart.angleTo(this._quaternionEnd) < W;
    }
    t && this._quaternionStart.copy(this._quaternionEnd), this.camera.position.set(0, 0, 1).applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), this.camera.quaternion.copy(this._quaternionStart), this._updateOrientation(), this.dispatchEvent({ type: "change", ...j(null) }), t && ((e = this._controls) == null || e.update(), this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const e = this.camera, o = this.target;
    F.copy(t);
    const { up: i } = this._options;
    i === "z" && Math.abs(t.z) > 0.99 ? F.y = -gt : i === "x" && Math.abs(t.x) > 0.99 && (F.y = gt), F.normalize().multiplyScalar(this._distance).add(o), wt.lookAt(F, o, this.up), this._quaternionEnd.setFromRotationMatrix(wt), this._quaternionStart.copy(e.quaternion), this.animating = !0, this._lastAnimateTimeSeconds = null;
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const e = (l) => {
      if (!this._dragging) {
        if (se(l, this._pointerStart)) return;
        this._dragging = !0;
      }
      const u = be.set(l.clientX, l.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), m = this.coordinateConversion(
        F.subVectors(this.camera.position, this.target)
      ), h = St.setFromVector3(m);
      h.theta = c - u.x, h.phi = ge(
        p - u.y,
        W,
        Math.PI - W
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(h),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...j(null) });
    }, o = () => {
      if (document.removeEventListener("pointermove", e, !1), document.removeEventListener("pointerup", o, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Z(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const i = this.coordinateConversion(
      F.subVectors(this.camera.position, this.target)
    ), r = St.setFromVector3(i), c = r.theta, p = r.phi;
    this._distance = r.radius, document.addEventListener("pointermove", e, !1), document.addEventListener("pointerup", o, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to this gizmo's `up` axis.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, e = !1) {
    const { x: o, y: i, z: r } = t, { up: c } = this._options;
    return c === "x" ? e ? t.set(i, r, o) : t.set(r, o, i) : c === "z" ? e ? t.set(r, o, i) : t.set(i, r, o) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && vt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    if (!this.enabled || this._dragging) return;
    this._background && vt(this._background, !1);
    const t = this._focus !== null;
    this._focus && (Z(this._focus, !1), this._focus = null), this._domElement.style.cursor = "", t && this.dispatchEvent({
      type: "hoverchange",
      object: null,
      ...j(null)
    });
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const e = yt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    if (this._focus && (Z(this._focus, !1), this._focus = null), !e) {
      this.dispatchEvent({ type: "end" });
      return;
    }
    this._setOrientation(e.object.position), this.dispatchEvent({
      type: "change",
      ...j(e.object)
    });
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const e = yt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), o = (e == null ? void 0 : e.object) || null;
    this._focus !== o && (this._domElement.style.cursor = o ? "pointer" : "", this._focus && Z(this._focus, !1), (this._focus = o) ? Z(o, !0) : ft(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: o, ...j(o) }));
  }
}
export {
  Le as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
