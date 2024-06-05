var j = Object.defineProperty;
var G = (t, e, i) => e in t ? j(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var p = (t, e, i) => (G(t, typeof e != "symbol" ? e + "" : e, i), i);
import { Color as Q, BufferGeometry as W, BufferAttribute as B, LineSegments as H, LineBasicMaterial as Z, SphereGeometry as N, Mesh as U, MeshBasicMaterial as J, BackSide as K, CanvasTexture as tt, SRGBColorSpace as et, RepeatWrapping as it, SpriteMaterial as nt, Sprite as at, Object3D as V, Euler as y, Vector3 as z, Vector2 as I, Quaternion as L, Raycaster as rt, Clock as st, Vector4 as ot, OrthographicCamera as ct } from "three";
const lt = (t, e, i) => {
  const n = document.createElement("div"), a = n.style, { top: r, left: s, right: o, bottom: l } = i;
  a.height = `${e}px`, a.width = `${e}px`, a.borderRadius = "100%", a.position = "absolute", a.background = "#fff3", a.opacity = "0", a.zIndex = "10000";
  const [c, d] = t.split("-");
  return a.transform = "", a.margin = `${r}px ${o}px ${l}px ${s}px`, a.left = d === "left" ? "0" : d === "center" ? "50%" : "", a.right = d === "right" ? "0" : "", a.transform += d === "center" ? "translateX(-50%)" : "", a.top = c === "top" ? "0" : c === "bottom" ? "" : "50%", a.bottom = c === "bottom" ? "0" : "", a.transform += c === "center" ? "translateY(-50%)" : "", n;
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
    const s = t[a];
    if (s.drawLine === !1)
      return;
    const o = r < 3 ? 1 : -1, l = r < 3 ? 0.9 : 1.025;
    e.push(
      a.includes("x") ? l * o : 0,
      a.includes("y") ? l * o : 0,
      a.includes("z") ? l * o : 0,
      0,
      0,
      0
    );
    const c = s.colors.main, [d, h] = Array.isArray(c) ? c : [c, c];
    i.push(
      ...S.set(h).toArray(),
      ...S.set(d).toArray()
    );
  });
  const n = new W();
  return n.setAttribute(
    "position",
    new B(new Float32Array(e), 3)
  ), n.setAttribute(
    "color",
    new B(new Float32Array(i), 3)
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
function ut(t, e, i, n, a, r, s, o) {
  const l = document.createElement("canvas");
  e = e ?? 64;
  const c = 0.02;
  l.width = e * 2 + e * (c * 4), l.height = e + e * (c * 2);
  const d = e / 2, h = e / 2 + e * c, b = h * 3, m = l.getContext("2d");
  if (D(m, d, h, h, i, o), D(m, d, b, h, r || "#FFF", o), n != null) {
    const M = t.family || "sans-serif", u = t.weight || 500, F = ft(m, n, M, u, e);
    m.textAlign = "center", m.textBaseline = "middle", m.fillStyle = a || "#000", m.fillText(n, h, h + F), m.fillStyle = s || a || "#000", m.fillText(n, b, h + F);
  }
  const _ = new tt(l);
  return _.colorSpace = et, _.wrapS = _.wrapT = it, _.repeat.x = 0.5, new nt({
    map: _,
    toneMapped: !1,
    transparent: !0
  });
}
function D(t, e, i, n, a, r = !1) {
  const s = n * 0.1;
  e = r ? e - s : e, r && (t.globalAlpha = 0.2), t.beginPath(), t.arc(i, n, e, 0, 2 * Math.PI), t.closePath(), t.fillStyle = a, t.fill(), r && (t.globalAlpha = 1, t.strokeStyle = a, t.lineWidth = s, t.stroke());
}
function ft(t, e, i, n, a) {
  const r = Math.sqrt(Math.pow(a * 0.7, 2) / 2);
  let s = r, o = 0, l = 0;
  do {
    t.font = `${n} ${s}px ${i}`;
    const h = t.measureText(e);
    o = h.width, l = h.fontBoundingBoxDescent, s--;
  } while (o > r && s > 0);
  const c = Math.min(r / o, r / l), d = Math.floor(s * c);
  return t.font = `${n} ${d}px ${i}`, r / l;
}
function gt(t) {
  const { font: e, resolution: i } = t;
  return X.map((n, a) => {
    const { text: r, colors: s, border: o } = t[n], l = a < 3, c = l ? n : n[1], { text: d, main: h, hover: b, hoverText: m } = s, _ = Array.isArray(h) ? h[1] : h, M = o && r, u = new at(
      ut(
        e,
        i,
        S.set(_).getStyle(),
        r,
        d && S.set(d).getStyle() || null,
        b && S.set(b).getStyle() || null,
        m && S.set(m).getStyle() || null,
        o
      )
    );
    return u.userData.type = n, u.userData.forceScale = M, u.scale.setScalar(M || l ? 0.6 : 0.4), u.position[c] = l ? 1.2 : -1.2, u.renderOrder = 1, u;
  });
}
const v = new V();
function _t(t, e, i) {
  f.multiplyScalar(e.value).add(i), v.position.copy(i), v.lookAt(t.position), w.copy(v.quaternion), v.lookAt(f), k.copy(v.quaternion);
}
function O(t, e, i) {
  e.value = t.position.distanceTo(i);
}
function yt(t, e, i, n) {
  switch (i) {
    case "x":
      f.set(1, 0, 0), g.setFromEuler(new y(0, Math.PI * 0.5, 0));
      break;
    case "y":
      f.set(0, 1, 0), g.setFromEuler(new y(-Math.PI * 0.5, 0, 0));
      break;
    case "z":
      f.set(0, 0, 1), g.setFromEuler(new y());
      break;
    case "nx":
      f.set(-1, 0, 0), g.setFromEuler(new y(0, -Math.PI * 0.5, 0));
      break;
    case "ny":
      f.set(0, -1, 0), g.setFromEuler(new y(Math.PI * 0.5, 0, 0));
      break;
    case "nz":
      f.set(0, 0, -1), g.setFromEuler(new y(0, Math.PI, 0));
      break;
    default:
      console.error("ViewHelper: Invalid axis.");
  }
  O(t, n, e), _t(t, n, e);
}
const x = new z();
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
const C = new I();
function bt(t, e, i) {
  C.x = (t.clientX - e.left) / e.width * 2 - 1, C.y = -((t.clientY - e.top) / e.height) * 2 + 1, Y.setFromCamera(C, i);
}
function q(t, e, i, n) {
  bt(t, e, i);
  const a = Y.intersectObjects(n);
  return a.length ? a[0].object : null;
}
function vt(t, e, i) {
  return Math.min(Math.max(t, e), i);
}
const f = new z(), g = new L(), w = new L(), k = new L(), Y = new rt(), T = new st(), xt = new y(), Et = 2 * Math.PI, R = new I(), A = new I(), E = { value: 0 };
let $ = 0;
class Ct extends V {
  constructor(i, n, a) {
    var h;
    super();
    p(this, "_backgroundSphere");
    p(this, "_bgSphereOpacity", 0.2);
    p(this, "_spritePoints");
    p(this, "_container");
    p(this, "_domRect");
    p(this, "_viewport", new ot());
    p(this, "_renderer");
    p(this, "_orthoCamera", new ct(-1.8, 1.8, 1.8, -1.8, 0, 4));
    p(this, "_domElement");
    p(this, "_parentRect");
    p(this, "enabled", !0);
    p(this, "camera");
    p(this, "animated", !0);
    p(this, "animating", !1);
    p(this, "target", new z());
    p(this, "dragging", !1);
    p(this, "size");
    p(this, "speed", 1);
    this._renderer = n, this._container = n.domElement, this.camera = i, this._orthoCamera.position.set(0, 0, 2), a = Object.assign(ht, a || {});
    const { container: r, placement: s, size: o, offset: l, backgroundSphere: c } = a;
    this.size = o;
    const d = pt(a);
    this._spritePoints = gt(a), this.add(d, ...this._spritePoints), c.enabled && (this._backgroundSphere = mt(c.color), this._bgSphereOpacity = c.opacity ?? 0.2, this.add(this._backgroundSphere)), this._domElement = lt(s, o, l), dt(r).appendChild(this._domElement), this._domRect = this._domElement.getBoundingClientRect(), this._parentRect = (h = this._domElement.parentElement) == null ? void 0 : h.getBoundingClientRect(), this._startListening(), this.update();
  }
  render() {
    var r;
    this._domRect = this._domElement.getBoundingClientRect(), this._parentRect = (r = this._domElement.parentElement) == null ? void 0 : r.getBoundingClientRect(), this.animating && this._animate();
    let i = this._domRect.left, n = $ - this._domRect.bottom;
    this._parentRect && (i -= this._parentRect.left, n += this._parentRect.top);
    const a = this._renderer.autoClear;
    this._renderer.autoClear = !1, this._renderer.getViewport(this._viewport), this._renderer.setViewport(i, n, this.size, this.size), this._renderer.clear(!1, !0, !1), this._renderer.render(this, this._orthoCamera), this._renderer.setViewport(this._viewport), this._renderer.autoClear = a;
  }
  update() {
    this._domRect = this._domElement.getBoundingClientRect(), $ = this._container.offsetHeight, O(this.camera, E, this.target), this._renderer.getViewport(this._viewport), this._updateOrientation();
  }
  dispose() {
    this.children.forEach((i) => {
      var a, r, s, o;
      const n = i;
      (a = n.material) == null || a.dispose(), (s = (r = n.material) == null ? void 0 : r.map) == null || s.dispose(), (o = n.geometry) == null || o.dispose();
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
    const n = T.getDelta() * Et * this.speed;
    w.rotateTowards(k, n), this.camera.position.set(0, 0, 1).applyQuaternion(w).multiplyScalar(E.value).add(this.target), this.camera.quaternion.rotateTowards(g, n), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), w.angleTo(k) === 0 && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  _setOrientation(i) {
    yt(this.camera, this.target, i, E), this.animating = !0, T.start(), this.dispatchEvent({ type: "start" });
  }
  _startListening() {
    this._domElement.onpointerdown = (i) => this._onPointerDown(i), this._domElement.onpointermove = (i) => this._onPointerMove(i), this._domElement.onpointerleave = () => this._onPointerLeave();
  }
  _onPointerDown(i) {
    if (!this.enabled)
      return;
    const n = (s) => {
      !this.dragging && St(s, R) || (this.dragging || (P(this._spritePoints), this.dragging = !0), A.set(s.clientX, s.clientY).sub(R).multiplyScalar(1 / this._domRect.width * Math.PI), this.rotation.x = vt(
        r.x + A.y,
        Math.PI / -2 + 1e-3,
        Math.PI / 2 - 1e-3
      ), this.rotation.y = r.y + A.x, this.updateMatrixWorld(), w.copy(this.quaternion).invert(), this.camera.position.set(0, 0, 1).applyQuaternion(w).multiplyScalar(E.value).add(this.target), this.camera.rotation.setFromQuaternion(w), this._updateOrientation(!1), this.dispatchEvent({ type: "change" }));
    }, a = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", a, !1), !this.dragging)
        return this._handleClick(i);
      this.dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating === !0)
      return;
    i.preventDefault(), R.set(i.clientX, i.clientY);
    const r = xt.copy(this.rotation);
    O(this.camera, E, this.target), document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", a, !1), this.dispatchEvent({ type: "start" });
  }
  _onPointerMove(i) {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = this._bgSphereOpacity), this._handleHover(i));
  }
  _onPointerLeave() {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = 0), P(this._spritePoints), this._domElement.style.cursor = "");
  }
  _handleClick(i) {
    const n = q(
      i,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    n && (this._setOrientation(n.userData.type), this.dispatchEvent({ type: "change" }));
  }
  _handleHover(i) {
    const n = q(
      i,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    P(this._spritePoints), n ? (n.material.map.offset.x = 0.5, n.scale.multiplyScalar(1.2), this._domElement.style.cursor = "pointer") : this._domElement.style.cursor = "";
  }
}
export {
  Ct as ViewportGizmo,
  w as q1,
  k as q2,
  Y as raycaster,
  f as targetPosition,
  g as targetQuaternion
};
//# sourceMappingURL=three-viewport-gizmo.js.map
