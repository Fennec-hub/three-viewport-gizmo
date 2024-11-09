var vt = Object.defineProperty;
var _t = (s, t, e) => t in s ? vt(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var p = (s, t, e) => _t(s, typeof t != "symbol" ? t + "" : t, e);
import { Box3 as k, Vector3 as _, InstancedBufferGeometry as yt, Float32BufferAttribute as X, InstancedInterleavedBuffer as $, InterleavedBufferAttribute as O, WireframeGeometry as wt, Sphere as lt, UniformsLib as R, Vector2 as B, ShaderLib as W, UniformsUtils as dt, ShaderMaterial as St, Vector4 as A, Matrix4 as ht, Line3 as xt, Mesh as pt, MathUtils as bt, Color as ut, SphereGeometry as Et, MeshBasicMaterial as Mt, BackSide as At, CanvasTexture as Lt, SRGBColorSpace as zt, RepeatWrapping as Pt, SpriteMaterial as Ut, Sprite as Ct, Raycaster as Ot, Object3D as Bt, OrthographicCamera as Dt, Clock as Tt, Quaternion as F, Euler as It } from "three";
const Rt = (s, t, e, i, n) => {
  const r = document.createElement("div"), o = e.top ?? 0, a = e.left ?? 0, d = e.right ?? 0, h = e.bottom ?? 0, [l, c] = s.split("-");
  return Object.assign(r.style, {
    height: `${t}px`,
    width: `${t}px`,
    borderRadius: "100%",
    position: "absolute",
    background: "#fff3",
    opacity: "0",
    zIndex: "10000",
    transform: `${c === "center" ? "translateX(-50%)" : ""} ${l === "center" ? "translateY(-50%)" : ""}`,
    margin: `${o}px ${d}px ${h}px ${a}px`,
    left: c === "left" ? "0" : c === "center" ? "50%" : "",
    right: c === "right" ? "0" : "",
    top: l === "top" ? "0" : l === "bottom" ? "" : "50%",
    bottom: l === "bottom" ? "0" : ""
  }), i && (r.id = i), n && (r.className = n), r;
}, Y = new k(), D = new _();
class ft extends yt {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const t = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], e = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], i = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(i), this.setAttribute("position", new X(t, 3)), this.setAttribute("uv", new X(e, 2));
  }
  applyMatrix4(t) {
    const e = this.attributes.instanceStart, i = this.attributes.instanceEnd;
    return e !== void 0 && (e.applyMatrix4(t), i.applyMatrix4(t), e.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const i = new $(e, 6, 1);
    return this.setAttribute("instanceStart", new O(i, 3, 0)), this.setAttribute("instanceEnd", new O(i, 3, 3)), this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const i = new $(e, 6, 1);
    return this.setAttribute("instanceColorStart", new O(i, 3, 0)), this.setAttribute("instanceColorEnd", new O(i, 3, 3)), this;
  }
  fromWireframeGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromEdgesGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromMesh(t) {
    return this.fromWireframeGeometry(new wt(t.geometry)), this;
  }
  fromLineSegments(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new k());
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    t !== void 0 && e !== void 0 && (this.boundingBox.setFromBufferAttribute(t), Y.setFromBufferAttribute(e), this.boundingBox.union(Y));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new lt()), this.boundingBox === null && this.computeBoundingBox();
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    if (t !== void 0 && e !== void 0) {
      const i = this.boundingSphere.center;
      this.boundingBox.getCenter(i);
      let n = 0;
      for (let r = 0, o = t.count; r < o; r++)
        D.fromBufferAttribute(t, r), n = Math.max(n, i.distanceToSquared(D)), D.fromBufferAttribute(e, r), n = Math.max(n, i.distanceToSquared(D));
      this.boundingSphere.radius = Math.sqrt(n), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(t) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(t);
  }
}
R.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new B(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
W.line = {
  uniforms: dt.merge([
    R.common,
    R.fog,
    R.line
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
class Q extends St {
  constructor(t) {
    super({
      type: "LineMaterial",
      uniforms: dt.clone(W.line.uniforms),
      vertexShader: W.line.vertexShader,
      fragmentShader: W.line.fragmentShader,
      clipping: !0
      // required for clipping support
    }), this.isLineMaterial = !0, this.setValues(t);
  }
  get color() {
    return this.uniforms.diffuse.value;
  }
  set color(t) {
    this.uniforms.diffuse.value = t;
  }
  get worldUnits() {
    return "WORLD_UNITS" in this.defines;
  }
  set worldUnits(t) {
    t === !0 ? this.defines.WORLD_UNITS = "" : delete this.defines.WORLD_UNITS;
  }
  get linewidth() {
    return this.uniforms.linewidth.value;
  }
  set linewidth(t) {
    this.uniforms.linewidth && (this.uniforms.linewidth.value = t);
  }
  get dashed() {
    return "USE_DASH" in this.defines;
  }
  set dashed(t) {
    t === !0 !== this.dashed && (this.needsUpdate = !0), t === !0 ? this.defines.USE_DASH = "" : delete this.defines.USE_DASH;
  }
  get dashScale() {
    return this.uniforms.dashScale.value;
  }
  set dashScale(t) {
    this.uniforms.dashScale.value = t;
  }
  get dashSize() {
    return this.uniforms.dashSize.value;
  }
  set dashSize(t) {
    this.uniforms.dashSize.value = t;
  }
  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }
  set dashOffset(t) {
    this.uniforms.dashOffset.value = t;
  }
  get gapSize() {
    return this.uniforms.gapSize.value;
  }
  set gapSize(t) {
    this.uniforms.gapSize.value = t;
  }
  get opacity() {
    return this.uniforms.opacity.value;
  }
  set opacity(t) {
    this.uniforms && (this.uniforms.opacity.value = t);
  }
  get resolution() {
    return this.uniforms.resolution.value;
  }
  set resolution(t) {
    this.uniforms.resolution.value.copy(t);
  }
  get alphaToCoverage() {
    return "USE_ALPHA_TO_COVERAGE" in this.defines;
  }
  set alphaToCoverage(t) {
    this.defines && (t === !0 !== this.alphaToCoverage && (this.needsUpdate = !0), t === !0 ? (this.defines.USE_ALPHA_TO_COVERAGE = "", this.extensions.derivatives = !0) : (delete this.defines.USE_ALPHA_TO_COVERAGE, this.extensions.derivatives = !1));
  }
}
const Z = new _(), J = new _(), m = new A(), g = new A(), x = new A(), q = new _(), j = new ht(), v = new xt(), K = new _(), T = new k(), I = new lt(), b = new A();
let E, L;
function tt(s, t, e) {
  return b.set(0, 0, -t, 1).applyMatrix4(s.projectionMatrix), b.multiplyScalar(1 / b.w), b.x = L / e.width, b.y = L / e.height, b.applyMatrix4(s.projectionMatrixInverse), b.multiplyScalar(1 / b.w), Math.abs(Math.max(b.x, b.y));
}
function Wt(s, t) {
  const e = s.matrixWorld, i = s.geometry, n = i.attributes.instanceStart, r = i.attributes.instanceEnd, o = Math.min(i.instanceCount, n.count);
  for (let a = 0, d = o; a < d; a++) {
    v.start.fromBufferAttribute(n, a), v.end.fromBufferAttribute(r, a), v.applyMatrix4(e);
    const h = new _(), l = new _();
    E.distanceSqToSegment(v.start, v.end, l, h), l.distanceTo(h) < L * 0.5 && t.push({
      point: l,
      pointOnLine: h,
      distance: E.origin.distanceTo(l),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function Ft(s, t, e) {
  const i = t.projectionMatrix, r = s.material.resolution, o = s.matrixWorld, a = s.geometry, d = a.attributes.instanceStart, h = a.attributes.instanceEnd, l = Math.min(a.instanceCount, d.count), c = -t.near;
  E.at(1, x), x.w = 1, x.applyMatrix4(t.matrixWorldInverse), x.applyMatrix4(i), x.multiplyScalar(1 / x.w), x.x *= r.x / 2, x.y *= r.y / 2, x.z = 0, q.copy(x), j.multiplyMatrices(t.matrixWorldInverse, o);
  for (let u = 0, y = l; u < y; u++) {
    if (m.fromBufferAttribute(d, u), g.fromBufferAttribute(h, u), m.w = 1, g.w = 1, m.applyMatrix4(j), g.applyMatrix4(j), m.z > c && g.z > c)
      continue;
    if (m.z > c) {
      const U = m.z - g.z, M = (m.z - c) / U;
      m.lerp(g, M);
    } else if (g.z > c) {
      const U = g.z - m.z, M = (g.z - c) / U;
      g.lerp(m, M);
    }
    m.applyMatrix4(i), g.applyMatrix4(i), m.multiplyScalar(1 / m.w), g.multiplyScalar(1 / g.w), m.x *= r.x / 2, m.y *= r.y / 2, g.x *= r.x / 2, g.y *= r.y / 2, v.start.copy(m), v.start.z = 0, v.end.copy(g), v.end.z = 0;
    const w = v.closestPointToPointParameter(q, !0);
    v.at(w, K);
    const z = bt.lerp(m.z, g.z, w), P = z >= -1 && z <= 1, S = q.distanceTo(K) < L * 0.5;
    if (P && S) {
      v.start.fromBufferAttribute(d, u), v.end.fromBufferAttribute(h, u), v.start.applyMatrix4(o), v.end.applyMatrix4(o);
      const U = new _(), M = new _();
      E.distanceSqToSegment(v.start, v.end, M, U), e.push({
        point: M,
        pointOnLine: U,
        distance: E.origin.distanceTo(M),
        object: s,
        face: null,
        faceIndex: u,
        uv: null,
        uv1: null
      });
    }
  }
}
class qt extends pt {
  constructor(t = new ft(), e = new Q({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const t = this.geometry, e = t.attributes.instanceStart, i = t.attributes.instanceEnd, n = new Float32Array(2 * e.count);
    for (let o = 0, a = 0, d = e.count; o < d; o++, a += 2)
      Z.fromBufferAttribute(e, o), J.fromBufferAttribute(i, o), n[a] = a === 0 ? 0 : n[a - 1], n[a + 1] = n[a] + Z.distanceTo(J);
    const r = new $(n, 2, 1);
    return t.setAttribute("instanceDistanceStart", new O(r, 1, 0)), t.setAttribute("instanceDistanceEnd", new O(r, 1, 1)), this;
  }
  raycast(t, e) {
    const i = this.material.worldUnits, n = t.camera;
    n === null && !i && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const r = t.params.Line2 !== void 0 && t.params.Line2.threshold || 0;
    E = t.ray;
    const o = this.matrixWorld, a = this.geometry, d = this.material;
    L = d.linewidth + r, a.boundingSphere === null && a.computeBoundingSphere(), I.copy(a.boundingSphere).applyMatrix4(o);
    let h;
    if (i)
      h = L * 0.5;
    else {
      const c = Math.max(n.near, I.distanceToPoint(E.origin));
      h = tt(n, c, d.resolution);
    }
    if (I.radius += h, E.intersectsSphere(I) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), T.copy(a.boundingBox).applyMatrix4(o);
    let l;
    if (i)
      l = L * 0.5;
    else {
      const c = Math.max(n.near, T.distanceToPoint(E.origin));
      l = tt(n, c, d.resolution);
    }
    T.expandByScalar(l), E.intersectsBox(T) !== !1 && (i ? Wt(this, e) : Ft(this, n, e));
  }
}
class mt extends ft {
  constructor() {
    super(), this.isLineGeometry = !0, this.type = "LineGeometry";
  }
  setPositions(t) {
    const e = t.length - 3, i = new Float32Array(2 * e);
    for (let n = 0; n < e; n += 3)
      i[2 * n] = t[n], i[2 * n + 1] = t[n + 1], i[2 * n + 2] = t[n + 2], i[2 * n + 3] = t[n + 3], i[2 * n + 4] = t[n + 4], i[2 * n + 5] = t[n + 5];
    return super.setPositions(i), this;
  }
  setColors(t) {
    const e = t.length - 3, i = new Float32Array(2 * e);
    for (let n = 0; n < e; n += 3)
      i[2 * n] = t[n], i[2 * n + 1] = t[n + 1], i[2 * n + 2] = t[n + 2], i[2 * n + 3] = t[n + 3], i[2 * n + 4] = t[n + 4], i[2 * n + 5] = t[n + 5];
    return super.setColors(i), this;
  }
  fromLine(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
}
class jt extends qt {
  constructor(t = new mt(), e = new Q({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLine2 = !0, this.type = "Line2";
  }
}
const Gt = 2 * Math.PI, Ht = {
  container: document.body,
  placement: "top-right",
  size: 128,
  lineWidth: 20,
  animated: !0,
  speed: 1,
  offset: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  },
  font: {
    family: "helvetica",
    weight: 900
  },
  resolution: 64,
  sphere: {
    enabled: !0,
    color: 16777215,
    opacity: 0,
    hoverColor: 16777215,
    hoverOpacity: 0.2
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
    line: !1,
    colors: {
      main: "#ff3653"
    }
  },
  ny: {
    line: !1,
    colors: {
      main: "#8adb00"
    }
  },
  nz: {
    line: !1,
    colors: {
      main: "#2c8fff"
    }
  }
}, gt = ["x", "y", "z", "nx", "ny", "nz"], Nt = {
  x: [
    [1, 0, 0],
    [0, Math.PI * 0.5, 0]
  ],
  y: [
    [0, 1, 0],
    [-Math.PI * 0.5, 0, 0]
  ],
  z: [
    [0, 0, 1],
    [0, 0, 0]
  ],
  nx: [
    [-1, 0, 0],
    [0, -Math.PI * 0.5, 0]
  ],
  ny: [
    [0, -1, 0],
    [Math.PI * 0.5, 0, 0]
  ],
  nz: [
    [0, 0, -1],
    [0, Math.PI, 0]
  ]
}, Vt = (s) => {
  const t = new ut(), e = [], i = [];
  if (gt.forEach((a, d) => {
    const h = s[a];
    if (h.line === !1) return;
    const l = d < 3 ? 1.1 : -1.1, c = d < 3 ? 1 : 1.125;
    e.push(
      a.includes("x") ? c * l : 0,
      a.includes("y") ? c * l : 0,
      a.includes("z") ? c * l : 0,
      0,
      0,
      0
    );
    const u = h.colors.main, [y, f] = Array.isArray(u) ? u : [u, u];
    i.push(
      ...t.set(f).toArray(),
      ...t.set(y).toArray()
    );
  }), !e.length) return null;
  const n = new mt();
  n.setPositions(e), n.setColors(i);
  const r = new Q({
    linewidth: s.lineWidth ?? 20,
    vertexColors: !0,
    resolution: new B(window.innerWidth, window.innerHeight)
  }), o = new jt(n, r);
  return o.computeLineDistances(), o.scale.set(1, 1, 1), o.renderOrder = 1, o;
}, $t = (s) => {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (!t) throw Error("Invalid DOM element");
  return t;
};
function kt({
  color: s,
  opacity: t
} = {}) {
  const e = new Et(1.8, 64, 64), i = new pt(
    e,
    new Mt({
      color: s,
      side: At,
      transparent: !0,
      opacity: t ?? 0.2
    })
  );
  return i.renderOrder = 0, i;
}
function Qt(s, t, e, i, n, r, o, a = !0, d = !1) {
  const h = document.createElement("canvas");
  t = t ?? 64;
  const l = 0.02;
  h.width = t * 2 + t * (l * 4), h.height = t + t * (l * 2);
  const c = t / 2, u = t / 2 + t * l, y = u * 3, f = h.getContext("2d");
  if (et(f, c, u, u, e, a, d), et(
    f,
    c,
    y,
    u,
    r || "#FFF",
    a,
    d
  ), i != null) {
    const z = s.family || "sans-serif", P = s.weight || 500, S = Xt(f, i, z, P, t);
    f.textAlign = "center", f.textBaseline = "middle", f.fillStyle = n || "#000", f.fillText(i, u, u + S), f.fillStyle = o || n || "#000", f.fillText(i, y, u + S);
  }
  const w = new Lt(h);
  return w.colorSpace = zt, w.wrapS = w.wrapT = Pt, w.repeat.x = 0.5, new Ut({
    map: w,
    toneMapped: !1,
    transparent: !0
  });
}
function et(s, t, e, i, n, r, o = !1) {
  const a = i * 0.1;
  t = o ? t - a : t, o && (s.globalAlpha = 0.2), r && (s.beginPath(), s.arc(e, i, t, 0, 2 * Math.PI), s.closePath(), s.fillStyle = n, s.fill()), o && (s.globalAlpha = 1, s.strokeStyle = n, s.lineWidth = a, s.stroke());
}
function Xt(s, t, e, i, n) {
  const r = Math.sqrt(Math.pow(n * 0.7, 2) / 2);
  let o = r, a = 0, d = 0;
  do {
    s.font = `${i} ${o}px ${e}`;
    const c = s.measureText(t);
    a = c.width, d = c.fontBoundingBoxDescent, o--;
  } while (a > r && o > 0);
  const h = Math.min(r / a, r / d), l = Math.floor(o * h);
  return s.font = `${i} ${l}px ${e}`, r / d;
}
function Yt(s) {
  const t = new ut(), { font: e, resolution: i } = s;
  return gt.map((n, r) => {
    const { text: o, colors: a, circle: d, border: h } = s[n], l = r < 3, c = l ? n : n[1], { text: u, main: y, hover: f, hoverText: w } = a, z = Array.isArray(y) ? y[1] : y, P = h && o, S = new Ct(
      Qt(
        e,
        i,
        t.set(z).getStyle(),
        o,
        u != null ? t.set(u).getStyle() : null,
        f != null ? t.set(f).getStyle() : null,
        w != null ? t.set(w).getStyle() : null,
        d ?? !0,
        h
      )
    );
    return S.userData.axis = n, S.userData.forceScale = P, S.scale.setScalar(P || l ? 0.6 : 0.4), S.position[c] = l ? 1.4 : -1.4, S.renderOrder = 100, S;
  });
}
const Zt = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], it = 1, nt = 0.5, st = /* @__PURE__ */ new _();
function Jt(s, t) {
  st.set(0, 0, 1).applyQuaternion(t.quaternion), Zt.forEach(([e, i, n]) => {
    const r = st[e];
    s[i].material.opacity = r >= 0 ? it : nt, s[n].material.opacity = r >= 0 ? nt : it;
  });
}
const Kt = (s, t, e = 10) => Math.abs(s.clientX - t.x) < e && Math.abs(s.clientY - t.y) < e;
function G(s) {
  for (let t = 0, e = s.length; t < e; t++)
    s[t].scale.setScalar(
      t < 3 || s[t].userData.forceScale ? 0.6 : 0.4
    ), s[t].material.map.offset.x = 1;
}
const rt = /* @__PURE__ */ new Ot(), H = /* @__PURE__ */ new B();
function ot(s, t, e, i) {
  H.x = (s.clientX - t.left) / t.width * 2 - 1, H.y = -((s.clientY - t.top) / t.height) * 2 + 1, rt.setFromCamera(H, e);
  const n = rt.intersectObjects(i);
  return n.length ? n[0].object : null;
}
const te = (s, t, e) => Math.min(Math.max(s, t), e), at = (s, { color: t, opacity: e, hoverColor: i, hoverOpacity: n } = {}, r = !0) => {
  const o = s.material;
  o.color.set(r && i || t || 16777215), o.opacity = r ? n ?? 0.2 : e ?? 0;
}, C = /* @__PURE__ */ new ht(), ct = /* @__PURE__ */ new It(), N = /* @__PURE__ */ new B(), V = /* @__PURE__ */ new B();
class ne extends Bt {
  /**
   * Creates a new ViewportGizmo instance.
   *
   * @param camera - The camera to be controlled by this gizmo
   * @param renderer - The WebGL renderer used to render the scene
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.size - Size of the gizmo widget in pixels
   * @param options.placement - Position of the gizmo in the viewport. One of:
   *
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   *
   * @param options.animated - Whether view changes should be animated
   * @param options.speed - Animation speed multiplier
   * @param options.lineWidth - Width of the axis lines
   * @param options.offset - Offset from the container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.sphere - Configuration for the background sphere
   * @param options.sphere.enabled - Whether to show the background sphere
   * @param options.sphere.color - Color of the background sphere
   * @param options.sphere.opacity - Opacity of the background sphere
   * @param options.sphere.hoverColor - Hover color of the background sphere
   * @param options.sphere.hoverOpacity - Hover opacity of the background sphere
   * @param options.id - HTML id attribute for the gizmo container
   * @param options.className - HTML class attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.resolution - Resolution of the gizmo rendering
   * @param options.x - Configuration for positive X axis
   * @param options.y - Configuration for positive Y axis
   * @param options.z - Configuration for positive Z axis
   * @param options.nx - Configuration for negative X axis
   * @param options.ny - Configuration for negative Y axis
   * @param options.nz - Configuration for negative Z axis
   *
   * @AXIS The following is the configuration for each AXIS `options.[x | y | z | nx | ny | nz]`:
   *
   * @param options.AXIS.text - Custom text label for the axis
   * @param options.AXIS.circle - Whether to draw a circle indicator
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.border - Whether to draw a border around the axis indicator
   * @param options.AXIS.colors - Color configuration for the axis
   * @param options.AXIS.colors.main - Main color(s) for the axis. Can be a single color or [normal, hover] colors
   * @param options.AXIS.colors.hover - Hover color for the axis
   * @param options.AXIS.colors.text - Color for the axis label
   * @param options.AXIS.colors.hoverText - Color for the axis label on hover
   */
  constructor(e, i, n) {
    super();
    /** Whether the gizmo is currently active and responding to user input */
    p(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    p(this, "camera");
    /** The point around which the camera rotates */
    p(this, "target", new _());
    /** Whether view changes should be animated */
    p(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    p(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    p(this, "animating", !1);
    p(this, "_sphere");
    p(this, "_sphereConfig");
    p(this, "_spritePoints");
    p(this, "_viewport", new A());
    p(this, "_originalViewport", new A());
    p(this, "_originalScissor", new A());
    p(this, "_renderer");
    p(this, "_orthoCamera", new Dt(-1.8, 1.8, 1.8, -1.8, 0, 4));
    p(this, "_container");
    p(this, "_domElement");
    p(this, "_domRect");
    p(this, "_dragging", !1);
    p(this, "_distance", 0);
    p(this, "_clock", new Tt());
    p(this, "_targetPosition", new _());
    p(this, "_targetQuaternion", new F());
    p(this, "_quaternionStart", new F());
    p(this, "_quaternionEnd", new F());
    p(this, "_controls");
    p(this, "_controlsListeners");
    this._renderer = i, this.camera = e, this._orthoCamera.position.set(0, 0, 2), n = { ...Ht, ...n || {} };
    const {
      container: r,
      placement: o,
      size: a,
      animated: d,
      speed: h,
      offset: l,
      sphere: c,
      id: u,
      className: y
    } = n;
    this.animated = d, this.speed = h;
    const f = Vt(n);
    f && this.add(f), this._spritePoints = Yt(n), this.add(...this._spritePoints), c.enabled && (this._sphere = kt(c), this._sphereConfig = c, this.add(this._sphere)), this._container = r ? $t(r) : document.body, this._domElement = Rt(o, a, l, u, y), this._container.appendChild(this._domElement), this._startListening(), this.update();
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
    const { _renderer: e, _viewport: i } = this, n = e.getScissorTest(), r = e.autoClear;
    return e.autoClear = !1, e.setViewport(i), n && e.setScissor(i), e.clear(!1, !0, !1), e.render(this, this._orthoCamera), e.setViewport(this._originalViewport), n && e.setScissor(this._originalScissor), e.autoClear = r, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const e = this._renderer, i = this._domRect, n = e.domElement.getBoundingClientRect();
    return this._viewport.set(
      i.left - n.left,
      e.domElement.clientHeight - (i.top - n.top + i.height),
      i.width,
      i.height
    ), e.getViewport(this._originalViewport), e.getScissorTest() && e.getScissor(this._originalScissor), this;
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
  update(e = !0) {
    return e && this._controls && this._controls.update(), this.domUpdate().cameraUpdate();
  }
  /**
   * Connects OrbitControls with the gizmo, handling interaction states and updates.
   * Automatically detaches any previously attached controls.
   *
   * @param controls - The scene's {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
   */
  attachControls(e) {
    this.detachControls(), this.target = e.target, this._controlsListeners = {
      start: () => e.enabled = !1,
      end: () => e.enabled = !0,
      change: () => this.update(!1)
    }, this.addEventListener("start", this._controlsListeners.start), this.addEventListener("end", this._controlsListeners.end), e.addEventListener("change", this._controlsListeners.change), this._controls = e;
  }
  /** Removes all control event listeners and references. Safe to call multiple times. */
  detachControls() {
    !this._controlsListeners || !this._controls || (this.target = new _().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
      "change",
      this._controlsListeners.change
    ), this._controlsListeners = void 0, this._controls = void 0);
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    this.detachControls(), this.children.forEach((e) => {
      var n, r, o, a;
      const i = e;
      (n = i.material) == null || n.dispose(), (o = (r = i.material) == null ? void 0 : r.map) == null || o.dispose(), (a = i.geometry) == null || a.dispose();
    }), this._domElement.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(e = !0) {
    e && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Jt(this._spritePoints, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    const { position: e, quaternion: i } = this.camera;
    if (e.set(0, 0, 1), !this.animated) {
      e.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target), i.copy(this._targetQuaternion), this._updateOrientation(), this.animating = !1, this.dispatchEvent({ type: "change" }), this.dispatchEvent({ type: "end" });
      return;
    }
    const r = this._clock.getDelta() * Gt * this.speed;
    this._quaternionStart.rotateTowards(this._quaternionEnd, r), e.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), i.rotateTowards(this._targetQuaternion, r), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), this._quaternionStart.angleTo(this._quaternionEnd) === 0 && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param axis - The axis to orient the camera along
   */
  _setOrientation(e) {
    const i = this.camera, n = this.target, [r, o] = Nt[e];
    this._targetPosition.fromArray(r), this._targetQuaternion.setFromEuler(ct.fromArray(o)), this._targetPosition.multiplyScalar(this._distance).add(n), C.setPosition(i.position), C.lookAt(i.position, n, this.up), this._quaternionStart.setFromRotationMatrix(C), C.setPosition(this._targetPosition), C.lookAt(this._targetPosition, n, this.up), this._quaternionEnd.setFromRotationMatrix(C), this.animating = !0, this._clock.start(), this.dispatchEvent({ type: "start" });
  }
  /**
   * Initializes event listeners for user interaction.
   *
   * @private
   */
  _startListening() {
    this._domElement.onpointerdown = (e) => this._onPointerDown(e), this._domElement.onpointermove = (e) => this._onPointerMove(e), this._domElement.onpointerleave = () => this._onPointerLeave();
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(e) {
    if (!this.enabled) return;
    const i = (o) => {
      if (!this._dragging) {
        if (Kt(o, N)) return;
        G(this._spritePoints), this._dragging = !0;
      }
      V.set(o.clientX, o.clientY).sub(N).multiplyScalar(1 / this._domRect.width * Math.PI), this.rotation.x = te(
        r.x + V.y,
        Math.PI / -2 + 1e-3,
        Math.PI / 2 - 1e-3
      ), this.rotation.y = r.y + V.x, this.updateMatrixWorld(), this._quaternionStart.copy(this.quaternion).invert(), this.camera.position.set(0, 0, 1).applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), this.camera.rotation.setFromQuaternion(this._quaternionStart), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, n = () => {
      if (document.removeEventListener("pointermove", i, !1), document.removeEventListener("pointerup", n, !1), !this._dragging) return this._handleClick(e);
      this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    e.preventDefault(), N.set(e.clientX, e.clientY);
    const r = ct.copy(this.rotation);
    this._distance = this.camera.position.distanceTo(this.target), document.addEventListener("pointermove", i, !1), document.addEventListener("pointerup", n, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(e) {
    !this.enabled || this._dragging || (this._sphere && at(this._sphere, this._sphereConfig), this._handleHover(e));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._sphere && at(this._sphere, this._sphereConfig, !1), G(this._spritePoints), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(e) {
    const i = ot(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    i && (this._setOrientation(i.userData.axis), this.dispatchEvent({ type: "change" }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(e) {
    const i = ot(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    G(this._spritePoints), i ? (i.material.map.offset.x = 0.5, i.scale.multiplyScalar(1.2), this._domElement.style.cursor = "pointer") : this._domElement.style.cursor = "";
  }
}
export {
  ne as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
