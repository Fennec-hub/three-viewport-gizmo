var V = Object.defineProperty;
var j = (t, i, e) => i in t ? V(t, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[i] = e;
var l = (t, i, e) => (j(t, typeof i != "symbol" ? i + "" : i, e), e);
import { Color as G, BufferGeometry as Q, BufferAttribute as I, LineSegments as X, LineBasicMaterial as $, SphereGeometry as W, Mesh as Y, MeshBasicMaterial as H, BackSide as U, CanvasTexture as Z, SRGBColorSpace as N, RepeatWrapping as J, SpriteMaterial as K, Sprite as tt, Object3D as F, Euler as u, Vector3 as A, Vector2 as O, Quaternion as k, Raycaster as et, Clock as it, Vector4 as nt, OrthographicCamera as at } from "three";
const rt = (t, i, e) => {
  const n = document.createElement("div"), a = n.style, { top: c, left: s, right: o, bottom: h } = e;
  a.height = `${i}px`, a.width = `${i}px`, a.borderRadius = "100%", a.position = "absolute", a.background = "#fff3", a.opacity = "0", a.zIndex = "10000";
  const [r, p] = t.split("-");
  return a.transform = "", a.margin = `${c}px ${o}px ${h}px ${s}px`, a.left = p === "left" ? "0" : p === "center" ? "50%" : "", a.right = p === "right" ? "0" : "", a.transform += p === "center" ? "translateX(-50%)" : "", a.top = r === "top" ? "0" : r === "bottom" ? "" : "50%", a.bottom = r === "bottom" ? "0" : "", a.transform += r === "center" ? "translateY(-50%)" : "", n;
}, T = ["x", "y", "z", "nx", "ny", "nz"], st = {
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
  },
  backgroundSphere: {
    enabled: !0,
    color: 16777215,
    opacity: 0.2
  }
}, y = new G(), ot = (t) => {
  const i = [], e = [];
  T.forEach((a, c) => {
    const s = t[a];
    if (s.drawLine === !1)
      return;
    const o = c < 3 ? 1 : -1, h = c < 3 ? 0.9 : 1.025;
    i.push(
      a.includes("x") ? h * o : 0,
      a.includes("y") ? h * o : 0,
      a.includes("z") ? h * o : 0,
      0,
      0,
      0
    );
    const r = s.colors.main, [p, b] = Array.isArray(r) ? r : [r, r];
    e.push(
      ...y.set(b).toArray(),
      ...y.set(p).toArray()
    );
  });
  const n = new Q();
  return n.setAttribute(
    "position",
    new I(new Float32Array(i), 3)
  ), n.setAttribute(
    "color",
    new I(new Float32Array(e), 3)
  ), new X(
    n,
    new $({
      linewidth: t.lineWidth ?? 3,
      vertexColors: !0
    })
  );
}, ct = (t) => {
  const i = typeof t == "string" ? document.querySelector(t) : t;
  if (!i)
    throw Error("Invalid DOM element");
  return i;
};
function lt(t) {
  const i = new W(1.6, 64, 64);
  return new Y(
    i,
    new H({
      color: t,
      side: U,
      transparent: !0,
      opacity: 0,
      depthTest: !1
    })
  );
}
function ht(t, i, e, n, a, c) {
  const s = document.createElement("canvas");
  s.width = 128, s.height = 64;
  const o = s.getContext("2d");
  if (z(o, 32, t, c), z(o, 96, n || "#FFF", c), i != null) {
    const r = i.length > 1, p = r ? 46 : 50;
    o.font = `bold ${r ? 40 : 48}px helvetica`, o.textAlign = "center", o.fillStyle = e || "#000", o.fillText(i.toUpperCase(), 32, p), o.fillStyle = a || e || "#000", o.fillText(i.toUpperCase(), 96, p);
  }
  const h = new Z(s);
  return h.colorSpace = N, h.wrapS = h.wrapT = J, h.repeat.x = 0.5, new K({
    map: h,
    toneMapped: !1,
    transparent: !0
  });
}
function z(t, i, e, n) {
  const a = n ? 28 : 32;
  n && (t.globalAlpha = 0.2), t.beginPath(), t.arc(i, 32, a, 0, 2 * Math.PI), t.closePath(), t.fillStyle = e, t.fill(), n && (t.globalAlpha = 1, t.strokeStyle = e, t.lineWidth = 4, t.stroke());
}
function pt(t) {
  return T.map((i, e) => {
    const { text: n, colors: a, border: c } = t[i], s = e < 3, o = s ? i : i[1], { text: h, main: r, hover: p, hoverText: b } = a, B = Array.isArray(r) ? r[1] : r, L = c && n, f = new tt(
      ht(
        y.set(B).getStyle(),
        n,
        h && y.set(h).getStyle() || null,
        p && y.set(p).getStyle() || null,
        b && y.set(b).getStyle() || null,
        c
      )
    );
    return f.userData.type = i, f.userData.forceScale = L, f.scale.setScalar(L || s ? 0.6 : 0.4), f.position[o] = s ? 1.2 : -1.2, f.renderOrder = 1, f;
  });
}
const _ = new F();
function dt(t, i, e) {
  d.multiplyScalar(i.value).add(e), _.position.copy(e), _.lookAt(t.position), g.copy(_.quaternion), _.lookAt(d), C.copy(_.quaternion);
}
function P(t, i, e) {
  i.value = t.position.distanceTo(e);
}
function mt(t, i, e, n) {
  switch (e) {
    case "x":
      d.set(1, 0, 0), m.setFromEuler(new u(0, Math.PI * 0.5, 0));
      break;
    case "y":
      d.set(0, 1, 0), m.setFromEuler(new u(-Math.PI * 0.5, 0, 0));
      break;
    case "z":
      d.set(0, 0, 1), m.setFromEuler(new u());
      break;
    case "nx":
      d.set(-1, 0, 0), m.setFromEuler(new u(0, -Math.PI * 0.5, 0));
      break;
    case "ny":
      d.set(0, -1, 0), m.setFromEuler(new u(Math.PI * 0.5, 0, 0));
      break;
    case "nz":
      d.set(0, 0, -1), m.setFromEuler(new u(0, Math.PI, 0));
      break;
    default:
      console.error("ViewHelper: Invalid axis.");
  }
  P(t, n, i), dt(t, n, i);
}
const w = new A();
function ut(t, i) {
  w.set(0, 0, 1), w.applyQuaternion(i.quaternion), w.x >= 0 ? (t[
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
  ].material.opacity = 1), w.y >= 0 ? (t[
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
  ].material.opacity = 1), w.z >= 0 ? (t[
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
function gt(t, i, e = 10) {
  return Math.abs(t.clientX - i.x) < e && Math.abs(t.clientY - i.y) < e;
}
function S(t) {
  let i = t.length;
  for (; i--; )
    t[i].scale.setScalar(
      i < 3 || t[i].userData.forceScale ? 0.6 : 0.4
    ), t[i].material.map.offset.x = 1;
}
const E = new O();
function ft(t, i, e) {
  E.x = (t.clientX - i.left) / i.width * 2 - 1, E.y = -((t.clientY - i.top) / i.height) * 2 + 1, q.setFromCamera(E, e);
}
function D(t, i, e, n) {
  ft(t, i, e);
  const a = q.intersectObjects(n);
  return a.length ? a[0].object : null;
}
function yt(t, i, e) {
  return Math.min(Math.max(t, i), e);
}
const d = new A(), m = new k(), g = new k(), C = new k(), q = new et(), _t = new it(), wt = new u(), vt = 2 * Math.PI, x = new O(), M = new O(), v = { value: 0 };
let R = 0;
class Et extends F {
  constructor(e, n, a) {
    super();
    l(this, "_backgroundSphere");
    l(this, "_bgSphereOpacity", 0.2);
    l(this, "_spritePoints");
    l(this, "_canvas");
    l(this, "_domRect");
    l(this, "_viewport", new nt());
    l(this, "_renderer");
    l(this, "_orthoCamera", new at(-1.8, 1.8, 1.8, -1.8, 0, 4));
    l(this, "_domElement");
    l(this, "enabled", !0);
    l(this, "camera");
    l(this, "animated", !0);
    l(this, "animating", !1);
    l(this, "target", new A());
    l(this, "dragging", !1);
    l(this, "size");
    l(this, "speed", 1);
    this._renderer = n, this._canvas = n.domElement, this.camera = e, this._orthoCamera.position.set(0, 0, 2), a = Object.assign(st, a || {});
    const { container: c, placement: s, size: o, offset: h, backgroundSphere: r } = a;
    this.size = o;
    const p = ot(a);
    this._spritePoints = pt(a), this.add(p, ...this._spritePoints), r.enabled && (this._backgroundSphere = lt(r.color), this._bgSphereOpacity = r.opacity ?? 0.2, this.add(this._backgroundSphere)), this._domElement = rt(s, o, h), ct(c).appendChild(this._domElement), this._domRect = this._domElement.getBoundingClientRect(), this._startListening(), this.update();
  }
  render() {
    const e = _t.getDelta();
    this.animating && this._animate(e);
    const n = this._domRect.left, a = R - this._domRect.bottom, c = this._renderer.autoClear;
    this._renderer.autoClear = !1, this._renderer.setViewport(n, a, this.size, this.size), this._renderer.render(this, this._orthoCamera), this._renderer.setViewport(this._viewport), this._renderer.autoClear = c;
  }
  update() {
    this._domRect = this._domElement.getBoundingClientRect(), R = this._canvas.offsetHeight, P(this.camera, v, this.target), this._renderer.getViewport(this._viewport), this._updateOrientation();
  }
  dispose() {
    this.children.forEach((e) => {
      var n;
      e.material.dispose(), e.isMesh || e.isLineSegments ? e.geometry.dispose() : (n = e.material.map) == null || n.dispose();
    }), this._domElement.remove();
  }
  // INTERNALS ↓↓↓
  _updateOrientation(e = !0) {
    e && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), ut(this._spritePoints, this.camera);
  }
  _animate(e) {
    if (!this.animated) {
      this.camera.quaternion.copy(m), this.animating = !1, this.dispatchEvent({ type: "change" }), this.dispatchEvent({ type: "end" });
      return;
    }
    const n = e * vt * this.speed;
    g.rotateTowards(C, n), this.camera.position.set(0, 0, 1).applyQuaternion(g).multiplyScalar(v.value).add(this.target), this.camera.quaternion.rotateTowards(m, n), this._updateOrientation(), this.dispatchEvent({ type: "change" }), g.angleTo(C) === 0 && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  _setOrientation(e) {
    mt(this.camera, this.target, e, v), this.animating = !0, this.dispatchEvent({ type: "start" });
  }
  _startListening() {
    this._domElement.onpointerdown = (e) => this._onPointerDown(e), this._domElement.onpointermove = (e) => this._onPointerMove(e), this._domElement.onpointerleave = () => this._onPointerLeave();
  }
  _onPointerDown(e) {
    if (!this.enabled)
      return;
    const n = (s) => {
      !this.dragging && gt(s, x) || (this.dragging || (S(this._spritePoints), this.dragging = !0), M.set(s.clientX, s.clientY).sub(x).multiplyScalar(1 / this._domRect.width * Math.PI), this.rotation.x = yt(
        c.x + M.y,
        Math.PI / -2 + 1e-3,
        Math.PI / 2 - 1e-3
      ), this.rotation.y = c.y + M.x, this.updateMatrixWorld(), g.copy(this.quaternion).invert(), this.camera.position.set(0, 0, 1).applyQuaternion(g).multiplyScalar(v.value).add(this.target), this.camera.rotation.setFromQuaternion(g), this._updateOrientation(!1), this.dispatchEvent({ type: "change" }));
    }, a = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", a, !1), !this.dragging)
        return this._handleClick(e);
      this.dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating === !0)
      return;
    e.preventDefault(), x.set(e.clientX, e.clientY);
    const c = wt.copy(this.rotation);
    P(this.camera, v, this.target), document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", a, !1), this.dispatchEvent({ type: "start" });
  }
  _onPointerMove(e) {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = this._bgSphereOpacity), this._handleHover(e));
  }
  _onPointerLeave() {
    !this.enabled || this.dragging || (this._backgroundSphere && (this._backgroundSphere.material.opacity = 0), S(this._spritePoints), this._domElement.style.cursor = "");
  }
  _handleClick(e) {
    const n = D(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    n && (this._setOrientation(n.userData.type), this.dispatchEvent({ type: "change" }));
  }
  _handleHover(e) {
    const n = D(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    S(this._spritePoints), n ? (n.material.map.offset.x = 0.5, n.scale.multiplyScalar(1.2), this._domElement.style.cursor = "pointer") : this._domElement.style.cursor = "";
  }
}
export {
  Et as ViewportGizmo,
  g as q1,
  C as q2,
  q as raycaster,
  d as targetPosition,
  m as targetQuaternion
};
//# sourceMappingURL=three-viewport-gizmo.js.map
