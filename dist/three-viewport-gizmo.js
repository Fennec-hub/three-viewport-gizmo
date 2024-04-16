var j = Object.defineProperty;
var G = (t, e, i) => e in t ? j(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var h = (t, e, i) => (G(t, typeof e != "symbol" ? e + "" : e, i), i);
import { Color as Q, BufferGeometry as W, BufferAttribute as R, LineSegments as H, LineBasicMaterial as Z, SphereGeometry as N, Mesh as U, MeshBasicMaterial as J, BackSide as K, CanvasTexture as tt, SRGBColorSpace as et, RepeatWrapping as it, SpriteMaterial as nt, Sprite as at, Object3D as V, Euler as _, Vector3 as I, Vector2 as L, Quaternion as F, Raycaster as rt, Clock as ot, Vector4 as st, OrthographicCamera as ct } from "three";
const lt = (t, e, i) => {
  const n = document.createElement("div"), a = n.style, { top: r, left: o, right: s, bottom: l } = i;
  a.height = `${e}px`, a.width = `${e}px`, a.borderRadius = "100%", a.position = "absolute", a.background = "#fff3", a.opacity = "0", a.zIndex = "10000";
  const [c, p] = t.split("-");
  return a.transform = "", a.margin = `${r}px ${s}px ${l}px ${o}px`, a.left = p === "left" ? "0" : p === "center" ? "50%" : "", a.right = p === "right" ? "0" : "", a.transform += p === "center" ? "translateX(-50%)" : "", a.top = c === "top" ? "0" : c === "bottom" ? "" : "50%", a.bottom = c === "bottom" ? "0" : "", a.transform += c === "center" ? "translateY(-50%)" : "", n;
}, X = ["x", "y", "z", "nx", "ny", "nz"], ht = {
  container: document.body,
  placement: "top-right",
  size: 128,
  lineWidth: 3,
  offset: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  font: {
    family: "helvetica",
    weight: 900
  },
  resolution: 64,
  backgroundSphere: {
    enabled: !0,
    color: 16777215,
    opacity: 0.2
  },
  x: {
    text: "X",
    colors: {
      main: "#ff3653"
    }
  },
  y: {
    text: "Y",
    colors: {
      main: "#8adb00"
    }
  },
  z: {
    text: "Z",
    colors: {
      main: "#2c8fff"
    }
  },
  nx: {
    drawLine: !1,
    colors: {
      main: "#ff3653"
    }
  },
  ny: {
    drawLine: !1,
    colors: {
      main: "#8adb00"
    }
  },
  nz: {
    drawLine: !1,
    colors: {
      main: "#2c8fff"
    }
  }
}, S = new Q(), pt = (t) => {
  const e = [], i = [];
  X.forEach((a, r) => {
    const o = t[a];
    if (o.drawLine === !1)
      return;
    const s = r < 3 ? 1 : -1, l = r < 3 ? 0.9 : 1.025;
    e.push(
      a.includes("x") ? l * s : 0,
      a.includes("y") ? l * s : 0,
      a.includes("z") ? l * s : 0,
      0,
      0,
      0
    );
    const c = o.colors.main, [p, d] = Array.isArray(c) ? c : [c, c];
    i.push(
      ...S.set(d).toArray(),
      ...S.set(p).toArray()
    );
  });
  const n = new W();
  return n.setAttribute(
    "position",
    new R(new Float32Array(e), 3)
  ), n.setAttribute(
    "color",
    new R(new Float32Array(i), 3)
  ), new H(
    n,
    new Z({
      linewidth: t.lineWidth ?? 3,
      vertexColors: !0
    })
  );
}, dt = (t) => {
  const e = typeof t == "string" ? document.querySelector(t) : t;
  if (!e)
    throw Error("Invalid DOM element");
  return e;
};
function mt(t) {
  const e = new N(1.6, 64, 64);
  return new U(
    e,
    new J({
      color: t,
      side: K,
      transparent: !0,
      opacity: 0,
      depthTest: !1
    })
  );
}
function ut(t, e, i, n, a, r, o, s) {
  const l = document.createElement("canvas");
  e = e ?? 64;
  const c = 0.02;
  l.width = e * 2 + e * (c * 4), l.height = e + e * (c * 2);
  const p = e / 2, d = e / 2 + e * c, b = d * 3, m = l.getContext("2d");
  if (q(m, p, d, d, i, s), q(m, p, b, d, r || "#FFF", s), n != null) {
    const M = t.family || "sans-serif", u = t.weight || 500, D = ft(m, n, M, u, e);
    m.textAlign = "center", m.textBaseline = "middle", m.fillStyle = a || "#000", m.fillText(n, d, d + D), m.fillStyle = o || a || "#000", m.fillText(n, b, d + D);
  }
  const y = new tt(l);
  return y.colorSpace = et, y.wrapS = y.wrapT = it, y.repeat.x = 0.5, new nt({
    map: y,
    toneMapped: !1,
    transparent: !0
  });
}
function q(t, e, i, n, a, r = !1) {
  const o = n * 0.1;
  e = r ? e - o : e, r && (t.globalAlpha = 0.2), t.beginPath(), t.arc(i, n, e, 0, 2 * Math.PI), t.closePath(), t.fillStyle = a, t.fill(), r && (t.globalAlpha = 1, t.strokeStyle = a, t.lineWidth = o, t.stroke());
}
function ft(t, e, i, n, a) {
  const r = Math.sqrt(Math.pow(a * 0.7, 2) / 2);
  let o = r, s = 0, l = 0;
  do {
    t.font = `${n} ${o}px ${i}`;
    const d = t.measureText(e);
    s = d.width, l = d.fontBoundingBoxDescent, o--;
  } while (s > r && o > 0);
  const c = Math.min(r / s, r / l), p = Math.floor(o * c);
  return t.font = `${n} ${p}px ${i}`, r / l;
}
function gt(t) {
  const { font: e, resolution: i } = t;
  return X.map((n, a) => {
    const { text: r, colors: o, border: s } = t[n], l = a < 3, c = l ? n : n[1], { text: p, main: d, hover: b, hoverText: m } = o, y = Array.isArray(d) ? d[1] : d, M = s && r, u = new at(
      ut(
        e,
        i,
        S.set(y).getStyle(),
        r,
        p && S.set(p).getStyle() || null,
        b && S.set(b).getStyle() || null,
        m && S.set(m).getStyle() || null,
        s
      )
    );
    return u.userData.type = n, u.userData.forceScale = M, u.scale.setScalar(M || l ? 0.6 : 0.4), u.position[c] = l ? 1.2 : -1.2, u.renderOrder = 1, u;
  });
}
const v = new V();
function yt(t, e, i) {
  f.multiplyScalar(e.value).add(i), v.position.copy(i), v.lookAt(t.position), w.copy(v.quaternion), v.lookAt(f), z.copy(v.quaternion);
}
function k(t, e, i) {
  e.value = t.position.distanceTo(i);
}
function _t(t, e, i, n) {
  switch (i) {
    case "x":
      f.set(1, 0, 0), g.setFromEuler(new _(0, Math.PI * 0.5, 0));
      break;
    case "y":
      f.set(0, 1, 0), g.setFromEuler(new _(-Math.PI * 0.5, 0, 0));
      break;
    case "z":
      f.set(0, 0, 1), g.setFromEuler(new _());
      break;
    case "nx":
      f.set(-1, 0, 0), g.setFromEuler(new _(0, -Math.PI * 0.5, 0));
      break;
    case "ny":
      f.set(0, -1, 0), g.setFromEuler(new _(Math.PI * 0.5, 0, 0));
      break;
    case "nz":
      f.set(0, 0, -1), g.setFromEuler(new _(0, Math.PI, 0));
      break;
    default:
      console.error("ViewHelper: Invalid axis.");
  }
  k(t, n, e), yt(t, n, e);
}
const x = new I();
function wt(t, e) {
  x.set(0, 0, 1), x.applyQuaternion(e.quaternion), x.x >= 0 ? (t[
    0
    /* PositiveX */
  ].material.opacity = 1, t[
    3
    /* NegativeX */
  ].material.opacity = 0.5) : (t[
    0
    /* PositiveX */
  ].material.opacity = 0.5, t[
    3
    /* NegativeX */
  ].material.opacity = 1), x.y >= 0 ? (t[
    1
    /* PositiveY */
  ].material.opacity = 1, t[
    4
    /* NegativeY */
  ].material.opacity = 0.5) : (t[
    1
    /* PositiveY */
  ].material.opacity = 0.5, t[
    4
    /* NegativeY */
  ].material.opacity = 1), x.z >= 0 ? (t[
    2
    /* PositiveZ */
  ].material.opacity = 1, t[
    5
    /* NegativeZ */
  ].material.opacity = 0.5) : (t[
    2
    /* PositiveZ */
  ].material.opacity = 0.5, t[
    5
    /* NegativeZ */
  ].material.opacity = 1);
}
function St(t, e, i = 10) {
  return Math.abs(t.clientX - e.x) < i && Math.abs(t.clientY - e.y) < i;
}
function P(t) {
  let e = t.length;
  for (; e--; )
    t[e].scale.setScalar(
      e < 3 || t[e].userData.forceScale ? 0.6 : 0.4
    ), t[e].material.map.offset.x = 1;
}
const A = new L();
function bt(t, e, i) {
  A.x = (t.clientX - e.left) / e.width * 2 - 1, A.y = -((t.clientY - e.top) / e.height) * 2 + 1, Y.setFromCamera(A, i);
}
function T(t, e, i, n) {
  bt(t, e, i);
  const a = Y.intersectObjects(n);
  return a.length ? a[0].object : null;
}
function vt(t, e, i) {
  return Math.min(Math.max(t, e), i);
}
const f = new I(), g = new F(), w = new F(), z = new F(), Y = new rt(), B = new ot(), xt = new _(), Et = 2 * Math.PI, C = new L(), O = new L(), E = { value: 0 };
let $ = 0;
class At extends V {
  constructor(i, n, a) {
    super();
    h(this, "_backgroundSphere");
    h(this, "_bgSphereOpacity", 0.2);
    h(this, "_spritePoints");
    h(this, "_container");
    h(this, "_domRect");
    h(this, "_viewport", new st());
    h(this, "_renderer");
    h(this, "_orthoCamera", new ct(-1.8, 1.8, 1.8, -1.8, 0, 4));
    h(this, "_domElement");
    h(this, "enabled", !0);
    h(this, "camera");
    h(this, "animated", !0);
    h(this, "animating", !1);
    h(this, "target", new I());
    h(this, "dragging", !1);
    h(this, "size");
    h(this, "speed", 1);
    this._renderer = n, this._container = n.domElement, this.camera = i, this._orthoCamera.position.set(0, 0, 2), a = Object.assign(ht, a || {});
    const { container: r, placement: o, size: s, offset: l, backgroundSphere: c } = a;
    this.size = s;
    const p = pt(a);
    this._spritePoints = gt(a), this.add(p, ...this._spritePoints), c.enabled && (this._backgroundSphere = mt(c.color), this._bgSphereOpacity = c.opacity ?? 0.2, this.add(this._backgroundSphere)), this._domElement = lt(o, s, l), dt(r).appendChild(this._domElement), this._domRect = this._domElement.getBoundingClientRect(), this._startListening(), this.update();
  }
  render() {
    this.animating && this._animate();
    const i = this._domRect.left, n = $ - this._domRect.bottom, a = this._renderer.autoClear;
    this._renderer.autoClear = !1, this._renderer.setViewport(i, n, this.size, this.size), this._renderer.clear(!1, !0, !1), this._renderer.render(this, this._orthoCamera), this._renderer.setViewport(this._viewport), this._renderer.autoClear = a;
  }
  update() {
    this._domRect = this._domElement.getBoundingClientRect(), $ = this._container.offsetHeight, k(this.camera, E, this.target), this._renderer.getViewport(this._viewport), this._updateOrientation();
  }
  dispose() {
    this.children.forEach((i) => {
      var a, r, o, s;
      const n = i;
      (a = n.material) == null || a.dispose(), (o = (r = n.material) == null ? void 0 : r.map) == null || o.dispose(), (s = n.geometry) == null || s.dispose();
    }), this._domElement.remove();
  }
  // INTERNALS ↓↓↓
  _updateOrientation(i = !0) {
    i && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), wt(this._spritePoints, this.camera);
  }
  _animate() {
    if (!this.animated) {
      this.camera.quaternion.copy(g), this.animating = !1, this.dispatchEvent({ type: "change" }), this.dispatchEvent({ type: "end" });
      return;
    }
    const n = B.getDelta() * Et * this.speed;
    w.rotateTowards(z, n), this.camera.position.set(0, 0, 1).applyQuaternion(w).multiplyScalar(E.value).add(this.target), this.camera.quaternion.rotateTowards(g, n), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), w.angleTo(z) === 0 && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  _setOrientation(i) {
    _t(this.camera, this.target, i, E), this.animating = !0, B.start(), this.dispatchEvent({ type: "start" });
  }
  _startListening() {
    this._domElement.onpointerdown = (i) => this._onPointerDown(i), this._domElement.onpointermove = (i) => this._onPointerMove(i), this._domElement.onpointerleave = () => this._onPointerLeave();
  }
  _onPointerDown(i) {
    if (!this.enabled)
      return;
    const n = (o) => {
      !this.dragging && St(o, C) || (this.dragging || (P(this._spritePoints), this.dragging = !0), O.set(o.clientX, o.clientY).sub(C).multiplyScalar(1 / this._domRect.width * Math.PI), this.rotation.x = vt(
        r.x + O.y,
        Math.PI / -2 + 1e-3,
        Math.PI / 2 - 1e-3
      ), this.rotation.y = r.y + O.x, this.updateMatrixWorld(), w.copy(this.quaternion).invert(), this.camera.position.set(0, 0, 1).applyQuaternion(w).multiplyScalar(E.value).add(this.target), this.camera.rotation.setFromQuaternion(w), this._updateOrientation(!1), this.dispatchEvent({ type: "change" }));
    }, a = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", a, !1), !this.dragging)
        return this._handleClick(i);
      this.dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating === !0)
      return;
    i.preventDefault(), C.set(i.clientX, i.clientY);
    const r = xt.copy(this.rotation);
    k(this.camera, E, this.target), document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", a, !1), this.dispatchEvent({ type: "start" });
  }
  _onPointerMove(i) {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = this._bgSphereOpacity), this._handleHover(i));
  }
  _onPointerLeave() {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = 0), P(this._spritePoints), this._domElement.style.cursor = "");
  }
  _handleClick(i) {
    const n = T(
      i,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    n && (this._setOrientation(n.userData.type), this.dispatchEvent({ type: "change" }));
  }
  _handleHover(i) {
    const n = T(
      i,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    P(this._spritePoints), n ? (n.material.map.offset.x = 0.5, n.scale.multiplyScalar(1.2), this._domElement.style.cursor = "pointer") : this._domElement.style.cursor = "";
  }
}
export {
  At as ViewportGizmo,
  w as q1,
  z as q2,
  Y as raycaster,
  f as targetPosition,
  g as targetQuaternion
};
//# sourceMappingURL=three-viewport-gizmo.js.map
