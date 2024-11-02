var xt = Object.defineProperty;
var bt = (s, t, e) => t in s ? xt(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var p = (s, t, e) => bt(s, typeof t != "symbol" ? t + "" : t, e);
import { Box3 as Y, Vector3 as _, InstancedBufferGeometry as Et, Float32BufferAttribute as J, InstancedInterleavedBuffer as k, InterleavedBufferAttribute as O, WireframeGeometry as Mt, Sphere as ut, UniformsLib as F, Vector2 as B, ShaderLib as j, UniformsUtils as ft, ShaderMaterial as At, Vector4 as L, Matrix4 as mt, Line3 as Lt, Mesh as gt, MathUtils as zt, Color as vt, SphereGeometry as Pt, MeshBasicMaterial as Ut, BackSide as Ct, CanvasTexture as Ot, SRGBColorSpace as Bt, RepeatWrapping as Dt, SpriteMaterial as Tt, Sprite as It, Raycaster as Rt, Object3D as Wt, OrthographicCamera as Ft, Quaternion as Q, Clock as jt, Euler as Gt } from "three";
const Ht = (s, t, e, i, n) => {
  const o = document.createElement("div"), r = e.top ?? 0, a = e.left ?? 0, l = e.right ?? 0, h = e.bottom ?? 0, [d, c] = s.split("-");
  return Object.assign(o.style, {
    height: `${t}px`,
    width: `${t}px`,
    borderRadius: "100%",
    position: "absolute",
    background: "#fff3",
    opacity: "0",
    zIndex: "10000",
    transform: `${c === "center" ? "translateX(-50%)" : ""} ${d === "center" ? "translateY(-50%)" : ""}`,
    margin: `${r}px ${l}px ${h}px ${a}px`,
    left: c === "left" ? "0" : c === "center" ? "50%" : "",
    right: c === "right" ? "0" : "",
    top: d === "top" ? "0" : d === "bottom" ? "" : "50%",
    bottom: d === "bottom" ? "0" : ""
  }), i && (o.id = i), n && (o.className = n), o;
}, K = new Y(), D = new _();
class yt extends Et {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const t = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], e = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], i = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(i), this.setAttribute("position", new J(t, 3)), this.setAttribute("uv", new J(e, 2));
  }
  applyMatrix4(t) {
    const e = this.attributes.instanceStart, i = this.attributes.instanceEnd;
    return e !== void 0 && (e.applyMatrix4(t), i.applyMatrix4(t), e.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const i = new k(e, 6, 1);
    return this.setAttribute("instanceStart", new O(i, 3, 0)), this.setAttribute("instanceEnd", new O(i, 3, 3)), this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const i = new k(e, 6, 1);
    return this.setAttribute("instanceColorStart", new O(i, 3, 0)), this.setAttribute("instanceColorEnd", new O(i, 3, 3)), this;
  }
  fromWireframeGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromEdgesGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromMesh(t) {
    return this.fromWireframeGeometry(new Mt(t.geometry)), this;
  }
  fromLineSegments(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Y());
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    t !== void 0 && e !== void 0 && (this.boundingBox.setFromBufferAttribute(t), K.setFromBufferAttribute(e), this.boundingBox.union(K));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new ut()), this.boundingBox === null && this.computeBoundingBox();
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    if (t !== void 0 && e !== void 0) {
      const i = this.boundingSphere.center;
      this.boundingBox.getCenter(i);
      let n = 0;
      for (let o = 0, r = t.count; o < r; o++)
        D.fromBufferAttribute(t, o), n = Math.max(n, i.distanceToSquared(D)), D.fromBufferAttribute(e, o), n = Math.max(n, i.distanceToSquared(D));
      this.boundingSphere.radius = Math.sqrt(n), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(t) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(t);
  }
}
F.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new B(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
j.line = {
  uniforms: ft.merge([
    F.common,
    F.fog,
    F.line
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
class Z extends At {
  constructor(t) {
    super({
      type: "LineMaterial",
      uniforms: ft.clone(j.line.uniforms),
      vertexShader: j.line.vertexShader,
      fragmentShader: j.line.fragmentShader,
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
const tt = new _(), et = new _(), m = new L(), g = new L(), S = new L(), G = new _(), H = new mt(), v = new Lt(), it = new _(), T = new Y(), I = new ut(), x = new L();
let b, z;
function nt(s, t, e) {
  return x.set(0, 0, -t, 1).applyMatrix4(s.projectionMatrix), x.multiplyScalar(1 / x.w), x.x = z / e.width, x.y = z / e.height, x.applyMatrix4(s.projectionMatrixInverse), x.multiplyScalar(1 / x.w), Math.abs(Math.max(x.x, x.y));
}
function Nt(s, t) {
  const e = s.matrixWorld, i = s.geometry, n = i.attributes.instanceStart, o = i.attributes.instanceEnd, r = Math.min(i.instanceCount, n.count);
  for (let a = 0, l = r; a < l; a++) {
    v.start.fromBufferAttribute(n, a), v.end.fromBufferAttribute(o, a), v.applyMatrix4(e);
    const h = new _(), d = new _();
    b.distanceSqToSegment(v.start, v.end, d, h), d.distanceTo(h) < z * 0.5 && t.push({
      point: d,
      pointOnLine: h,
      distance: b.origin.distanceTo(d),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function Vt(s, t, e) {
  const i = t.projectionMatrix, o = s.material.resolution, r = s.matrixWorld, a = s.geometry, l = a.attributes.instanceStart, h = a.attributes.instanceEnd, d = Math.min(a.instanceCount, l.count), c = -t.near;
  b.at(1, S), S.w = 1, S.applyMatrix4(t.matrixWorldInverse), S.applyMatrix4(i), S.multiplyScalar(1 / S.w), S.x *= o.x / 2, S.y *= o.y / 2, S.z = 0, G.copy(S), H.multiplyMatrices(t.matrixWorldInverse, r);
  for (let u = 0, f = d; u < f; u++) {
    if (m.fromBufferAttribute(l, u), g.fromBufferAttribute(h, u), m.w = 1, g.w = 1, m.applyMatrix4(H), g.applyMatrix4(H), m.z > c && g.z > c)
      continue;
    if (m.z > c) {
      const U = m.z - g.z, M = (m.z - c) / U;
      m.lerp(g, M);
    } else if (g.z > c) {
      const U = g.z - m.z, M = (g.z - c) / U;
      g.lerp(m, M);
    }
    m.applyMatrix4(i), g.applyMatrix4(i), m.multiplyScalar(1 / m.w), g.multiplyScalar(1 / g.w), m.x *= o.x / 2, m.y *= o.y / 2, g.x *= o.x / 2, g.y *= o.y / 2, v.start.copy(m), v.start.z = 0, v.end.copy(g), v.end.z = 0;
    const P = v.closestPointToPointParameter(G, !0);
    v.at(P, it);
    const E = zt.lerp(m.z, g.z, P), w = E >= -1 && E <= 1, St = G.distanceTo(it) < z * 0.5;
    if (w && St) {
      v.start.fromBufferAttribute(l, u), v.end.fromBufferAttribute(h, u), v.start.applyMatrix4(r), v.end.applyMatrix4(r);
      const U = new _(), M = new _();
      b.distanceSqToSegment(v.start, v.end, M, U), e.push({
        point: M,
        pointOnLine: U,
        distance: b.origin.distanceTo(M),
        object: s,
        face: null,
        faceIndex: u,
        uv: null,
        uv1: null
      });
    }
  }
}
class qt extends gt {
  constructor(t = new yt(), e = new Z({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const t = this.geometry, e = t.attributes.instanceStart, i = t.attributes.instanceEnd, n = new Float32Array(2 * e.count);
    for (let r = 0, a = 0, l = e.count; r < l; r++, a += 2)
      tt.fromBufferAttribute(e, r), et.fromBufferAttribute(i, r), n[a] = a === 0 ? 0 : n[a - 1], n[a + 1] = n[a] + tt.distanceTo(et);
    const o = new k(n, 2, 1);
    return t.setAttribute("instanceDistanceStart", new O(o, 1, 0)), t.setAttribute("instanceDistanceEnd", new O(o, 1, 1)), this;
  }
  raycast(t, e) {
    const i = this.material.worldUnits, n = t.camera;
    n === null && !i && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = t.params.Line2 !== void 0 && t.params.Line2.threshold || 0;
    b = t.ray;
    const r = this.matrixWorld, a = this.geometry, l = this.material;
    z = l.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), I.copy(a.boundingSphere).applyMatrix4(r);
    let h;
    if (i)
      h = z * 0.5;
    else {
      const c = Math.max(n.near, I.distanceToPoint(b.origin));
      h = nt(n, c, l.resolution);
    }
    if (I.radius += h, b.intersectsSphere(I) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), T.copy(a.boundingBox).applyMatrix4(r);
    let d;
    if (i)
      d = z * 0.5;
    else {
      const c = Math.max(n.near, T.distanceToPoint(b.origin));
      d = nt(n, c, l.resolution);
    }
    T.expandByScalar(d), b.intersectsBox(T) !== !1 && (i ? Nt(this, e) : Vt(this, n, e));
  }
}
class _t extends yt {
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
class $t extends qt {
  constructor(t = new _t(), e = new Z({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLine2 = !0, this.type = "Line2";
  }
}
const Xt = 2 * Math.PI, kt = {
  container: document.body,
  placement: "top-right",
  size: 128,
  lineWidth: 20,
  animated: !0,
  speed: 1,
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
}, wt = ["x", "y", "z", "nx", "ny", "nz"], Yt = {
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
}, Qt = (s) => {
  const t = new vt(), e = [], i = [];
  if (wt.forEach((a, l) => {
    const h = s[a];
    if (h.line === !1) return;
    const d = l < 3 ? 1 : -1, c = l < 3 ? 0.9 : 1.025;
    e.push(
      a.includes("x") ? c * d : 0,
      a.includes("y") ? c * d : 0,
      a.includes("z") ? c * d : 0,
      0,
      0,
      0
    );
    const u = h.colors.main, [f, y] = Array.isArray(u) ? u : [u, u];
    i.push(
      ...t.set(y).toArray(),
      ...t.set(f).toArray()
    );
  }), !e.length) return null;
  const n = new _t();
  n.setPositions(e), n.setColors(i);
  const o = new Z({
    linewidth: s.lineWidth ?? 20,
    vertexColors: !0,
    resolution: new B(window.innerWidth, window.innerHeight)
  }), r = new $t(n, o);
  return r.computeLineDistances(), r.scale.set(1, 1, 1), r.renderOrder = 1, r;
}, Zt = (s) => {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (!t) throw Error("Invalid DOM element");
  return t;
};
function Jt({
  color: s,
  opacity: t
} = {}) {
  const e = new Pt(1.6, 64, 64), i = new gt(
    e,
    new Ut({
      color: s,
      side: Ct,
      transparent: !0,
      opacity: t ?? 0.2
    })
  );
  return i.renderOrder = 0, i;
}
function Kt(s, t, e, i, n, o, r, a) {
  const l = document.createElement("canvas");
  t = t ?? 64;
  const h = 0.02;
  l.width = t * 2 + t * (h * 4), l.height = t + t * (h * 2);
  const d = t / 2, c = t / 2 + t * h, u = c * 3, f = l.getContext("2d");
  if (st(f, d, c, c, e, a), st(f, d, u, c, o || "#FFF", a), i != null) {
    const P = s.family || "sans-serif", E = s.weight || 500, w = te(f, i, P, E, t);
    f.textAlign = "center", f.textBaseline = "middle", f.fillStyle = n || "#000", f.fillText(i, c, c + w), f.fillStyle = r || n || "#000", f.fillText(i, u, c + w);
  }
  const y = new Ot(l);
  return y.colorSpace = Bt, y.wrapS = y.wrapT = Dt, y.repeat.x = 0.5, new Tt({
    map: y,
    toneMapped: !1,
    transparent: !0
  });
}
function st(s, t, e, i, n, o = !1) {
  const r = i * 0.1;
  t = o ? t - r : t, o && (s.globalAlpha = 0.2), s.beginPath(), s.arc(e, i, t, 0, 2 * Math.PI), s.closePath(), s.fillStyle = n, s.fill(), o && (s.globalAlpha = 1, s.strokeStyle = n, s.lineWidth = r, s.stroke());
}
function te(s, t, e, i, n) {
  const o = Math.sqrt(Math.pow(n * 0.7, 2) / 2);
  let r = o, a = 0, l = 0;
  do {
    s.font = `${i} ${r}px ${e}`;
    const c = s.measureText(t);
    a = c.width, l = c.fontBoundingBoxDescent, r--;
  } while (a > o && r > 0);
  const h = Math.min(o / a, o / l), d = Math.floor(r * h);
  return s.font = `${i} ${d}px ${e}`, o / l;
}
function ee(s) {
  const t = new vt(), { font: e, resolution: i } = s;
  return wt.map((n, o) => {
    const { text: r, colors: a, border: l } = s[n], h = o < 3, d = h ? n : n[1], { text: c, main: u, hover: f, hoverText: y } = a, P = Array.isArray(u) ? u[1] : u, E = l && r, w = new It(
      Kt(
        e,
        i,
        t.set(P).getStyle(),
        r,
        c != null ? t.set(c).getStyle() : null,
        f != null ? t.set(f).getStyle() : null,
        y != null ? t.set(y).getStyle() : null,
        l
      )
    );
    return w.userData.axis = n, w.userData.forceScale = E, w.scale.setScalar(E || h ? 0.6 : 0.4), w.position[d] = h ? 1.2 : -1.2, w.renderOrder = 100, w;
  });
}
const ie = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], ot = 1, rt = 0.5, at = /* @__PURE__ */ new _();
function ne(s, t) {
  at.set(0, 0, 1).applyQuaternion(t.quaternion), ie.forEach(([e, i, n]) => {
    const o = at[e];
    s[i].material.opacity = o >= 0 ? ot : rt, s[n].material.opacity = o >= 0 ? rt : ot;
  });
}
const se = (s, t, e = 10) => Math.abs(s.clientX - t.x) < e && Math.abs(s.clientY - t.y) < e;
function N(s) {
  for (let t = 0, e = s.length; t < e; t++)
    s[t].scale.setScalar(
      t < 3 || s[t].userData.forceScale ? 0.6 : 0.4
    ), s[t].material.map.offset.x = 1;
}
const ct = /* @__PURE__ */ new Rt(), V = /* @__PURE__ */ new B();
function lt(s, t, e, i) {
  V.x = (s.clientX - t.left) / t.width * 2 - 1, V.y = -((s.clientY - t.top) / t.height) * 2 + 1, ct.setFromCamera(V, e);
  const n = ct.intersectObjects(i);
  return n.length ? n[0].object : null;
}
const oe = (s, t, e) => Math.min(Math.max(s, t), e), dt = (s, { color: t, opacity: e, hoverColor: i, hoverOpacity: n } = {}, o = !0) => {
  const r = s.material;
  r.color.set(o && i || t || 16777215), r.opacity = o ? n ?? 0.2 : e ?? 0;
}, R = /* @__PURE__ */ new _(), q = /* @__PURE__ */ new Q(), A = /* @__PURE__ */ new Q(), W = /* @__PURE__ */ new Q(), C = /* @__PURE__ */ new mt(), ht = /* @__PURE__ */ new jt(), pt = /* @__PURE__ */ new Gt(), $ = /* @__PURE__ */ new B(), X = /* @__PURE__ */ new B();
class ce extends Wt {
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
    p(this, "_viewport", new L());
    p(this, "_originalViewport", new L());
    p(this, "_originalScissor", new L());
    p(this, "_renderer");
    p(this, "_orthoCamera", new Ft(-1.8, 1.8, 1.8, -1.8, 0, 4));
    p(this, "_container");
    p(this, "_domElement");
    p(this, "_domRect");
    p(this, "_dragging", !1);
    p(this, "_distance", 0);
    p(this, "_controls");
    p(this, "_controlsListeners");
    this._renderer = i, this.camera = e, this._orthoCamera.position.set(0, 0, 2), n = { ...kt, ...n || {} };
    const {
      container: o,
      placement: r,
      size: a,
      animated: l,
      speed: h,
      offset: d,
      sphere: c,
      id: u,
      className: f
    } = n;
    this.animated = l, this.speed = h;
    const y = Qt(n);
    y && this.add(y), this._spritePoints = ee(n), this.add(...this._spritePoints), c.enabled && (this._sphere = Jt(c), this._sphereConfig = c, this.add(this._sphere)), this._container = o ? Zt(o) : document.body, this._domElement = Ht(r, a, d, u, f), this._container.appendChild(this._domElement), this._startListening(), this.update();
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
    const { _renderer: e, _viewport: i } = this, n = e.getScissorTest(), o = e.autoClear;
    return e.autoClear = !1, e.setViewport(i), n && e.setScissor(i), e.clear(!1, !0, !1), e.render(this, this._orthoCamera), e.setViewport(this._originalViewport), n && e.setScissor(this._originalScissor), e.autoClear = o, this;
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
      var n, o, r, a;
      const i = e;
      (n = i.material) == null || n.dispose(), (r = (o = i.material) == null ? void 0 : o.map) == null || r.dispose(), (a = i.geometry) == null || a.dispose();
    }), this._domElement.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(e = !0) {
    e && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), ne(this._spritePoints, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    const { position: e, quaternion: i } = this.camera;
    if (e.set(0, 0, 1), !this.animated) {
      e.applyQuaternion(W).multiplyScalar(this._distance).add(this.target), i.copy(q), this._updateOrientation(), this.animating = !1, this.dispatchEvent({ type: "change" }), this.dispatchEvent({ type: "end" });
      return;
    }
    const o = ht.getDelta() * Xt * this.speed;
    A.rotateTowards(W, o), e.applyQuaternion(A).multiplyScalar(this._distance).add(this.target), i.rotateTowards(q, o), this._updateOrientation(), requestAnimationFrame(() => this.dispatchEvent({ type: "change" })), A.angleTo(W) === 0 && (this.animating = !1, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param axis - The axis to orient the camera along
   */
  _setOrientation(e) {
    const i = this.camera, n = this.target, [o, r] = Yt[e];
    R.fromArray(o), q.setFromEuler(pt.fromArray(r)), R.multiplyScalar(this._distance).add(n), C.setPosition(i.position), C.lookAt(i.position, n, this.up), A.setFromRotationMatrix(C), C.setPosition(R), C.lookAt(R, n, this.up), W.setFromRotationMatrix(C), this.animating = !0, ht.start(), this.dispatchEvent({ type: "start" });
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
    const i = (r) => {
      if (!this._dragging) {
        if (se(r, $)) return;
        N(this._spritePoints), this._dragging = !0;
      }
      X.set(r.clientX, r.clientY).sub($).multiplyScalar(1 / this._domRect.width * Math.PI), this.rotation.x = oe(
        o.x + X.y,
        Math.PI / -2 + 1e-3,
        Math.PI / 2 - 1e-3
      ), this.rotation.y = o.y + X.x, this.updateMatrixWorld(), A.copy(this.quaternion).invert(), this.camera.position.set(0, 0, 1).applyQuaternion(A).multiplyScalar(this._distance).add(this.target), this.camera.rotation.setFromQuaternion(A), this._updateOrientation(!1), this.dispatchEvent({ type: "change" });
    }, n = () => {
      if (document.removeEventListener("pointermove", i, !1), document.removeEventListener("pointerup", n, !1), !this._dragging) return this._handleClick(e);
      this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    e.preventDefault(), $.set(e.clientX, e.clientY);
    const o = pt.copy(this.rotation);
    this._distance = this.camera.position.distanceTo(this.target), document.addEventListener("pointermove", i, !1), document.addEventListener("pointerup", n, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(e) {
    !this.enabled || this._dragging || (this._sphere && dt(this._sphere, this._sphereConfig), this._handleHover(e));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    !this.enabled || this._dragging || (this._sphere && dt(this._sphere, this._sphereConfig, !1), N(this._spritePoints), this._domElement.style.cursor = "");
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(e) {
    const i = lt(
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
    const i = lt(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );
    N(this._spritePoints), i ? (i.material.map.offset.x = 0.5, i.scale.multiplyScalar(1.2), this._domElement.style.cursor = "pointer") : this._domElement.style.cursor = "";
  }
}
export {
  ce as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
