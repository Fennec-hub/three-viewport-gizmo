(function(w,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(w=typeof globalThis<"u"?globalThis:w||self,s(w.ThreeViewportGizmo={},w.THREE))})(this,function(w,s){"use strict";var zt=Object.defineProperty;var Ut=(w,s,U)=>s in w?zt(w,s,{enumerable:!0,configurable:!0,writable:!0,value:U}):w[s]=U;var p=(w,s,U)=>Ut(w,typeof s!="symbol"?s+"":s,U);const U=(o,t,e,i,n)=>{const r=document.createElement("div"),a=e.top??0,c=e.left??0,d=e.right??0,f=e.bottom??0,[u,l]=o.split("-");return Object.assign(r.style,{height:`${t}px`,width:`${t}px`,borderRadius:"100%",position:"absolute",background:"#fff3",opacity:"0",zIndex:"10000",transform:`${l==="center"?"translateX(-50%)":""} ${u==="center"?"translateY(-50%)":""}`,margin:`${a}px ${d}px ${f}px ${c}px`,left:l==="left"?"0":l==="center"?"50%":"",right:l==="right"?"0":"",top:u==="top"?"0":u==="bottom"?"":"50%",bottom:u==="bottom"?"0":""}),i&&(r.id=i),n&&(r.className=n),r},$=new s.Box3,O=new s.Vector3;class X extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],e=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new s.Float32BufferAttribute(t,3)),this.setAttribute("uv",new s.Float32BufferAttribute(e,2))}applyMatrix4(t){const e=this.attributes.instanceStart,i=this.attributes.instanceEnd;return e!==void 0&&(e.applyMatrix4(t),i.applyMatrix4(t),e.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const i=new s.InstancedInterleavedBuffer(e,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(i,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const i=new s.InstancedInterleavedBuffer(e,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(i,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(i,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new s.WireframeGeometry(t.geometry)),this}fromLineSegments(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;t!==void 0&&e!==void 0&&(this.boundingBox.setFromBufferAttribute(t),$.setFromBufferAttribute(e),this.boundingBox.union($))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;if(t!==void 0&&e!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let r=0,a=t.count;r<a;r++)O.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(O)),O.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(O));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`,fragmentShader:`
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
		`};class R extends s.ShaderMaterial{constructor(t){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1))}}const k=new s.Vector3,Q=new s.Vector3,g=new s.Vector4,v=new s.Vector4,x=new s.Vector4,W=new s.Vector3,F=new s.Matrix4,y=new s.Line3,Y=new s.Vector3,T=new s.Box3,D=new s.Sphere,b=new s.Vector4;let E,M;function Z(o,t,e){return b.set(0,0,-t,1).applyMatrix4(o.projectionMatrix),b.multiplyScalar(1/b.w),b.x=M/e.width,b.y=M/e.height,b.applyMatrix4(o.projectionMatrixInverse),b.multiplyScalar(1/b.w),Math.abs(Math.max(b.x,b.y))}function lt(o,t){const e=o.matrixWorld,i=o.geometry,n=i.attributes.instanceStart,r=i.attributes.instanceEnd,a=Math.min(i.instanceCount,n.count);for(let c=0,d=a;c<d;c++){y.start.fromBufferAttribute(n,c),y.end.fromBufferAttribute(r,c),y.applyMatrix4(e);const f=new s.Vector3,u=new s.Vector3;E.distanceSqToSegment(y.start,y.end,u,f),u.distanceTo(f)<M*.5&&t.push({point:u,pointOnLine:f,distance:E.origin.distanceTo(u),object:o,face:null,faceIndex:c,uv:null,uv1:null})}}function dt(o,t,e){const i=t.projectionMatrix,r=o.material.resolution,a=o.matrixWorld,c=o.geometry,d=c.attributes.instanceStart,f=c.attributes.instanceEnd,u=Math.min(c.instanceCount,d.count),l=-t.near;E.at(1,x),x.w=1,x.applyMatrix4(t.matrixWorldInverse),x.applyMatrix4(i),x.multiplyScalar(1/x.w),x.x*=r.x/2,x.y*=r.y/2,x.z=0,W.copy(x),F.multiplyMatrices(t.matrixWorldInverse,a);for(let h=0,m=u;h<m;h++){if(g.fromBufferAttribute(d,h),v.fromBufferAttribute(f,h),g.w=1,v.w=1,g.applyMatrix4(F),v.applyMatrix4(F),g.z>l&&v.z>l)continue;if(g.z>l){const C=g.z-v.z,z=(g.z-l)/C;g.lerp(v,z)}else if(v.z>l){const C=v.z-g.z,z=(v.z-l)/C;v.lerp(g,z)}g.applyMatrix4(i),v.applyMatrix4(i),g.multiplyScalar(1/g.w),v.multiplyScalar(1/v.w),g.x*=r.x/2,g.y*=r.y/2,v.x*=r.x/2,v.y*=r.y/2,y.start.copy(g),y.start.z=0,y.end.copy(v),y.end.z=0;const P=y.closestPointToPointParameter(W,!0);y.at(P,Y);const L=s.MathUtils.lerp(g.z,v.z,P),S=L>=-1&&L<=1,Lt=W.distanceTo(Y)<M*.5;if(S&&Lt){y.start.fromBufferAttribute(d,h),y.end.fromBufferAttribute(f,h),y.start.applyMatrix4(a),y.end.applyMatrix4(a);const C=new s.Vector3,z=new s.Vector3;E.distanceSqToSegment(y.start,y.end,z,C),e.push({point:z,pointOnLine:C,distance:E.origin.distanceTo(z),object:o,face:null,faceIndex:h,uv:null,uv1:null})}}}class ut extends s.Mesh{constructor(t=new X,e=new R({color:Math.random()*16777215})){super(t,e),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,e=t.attributes.instanceStart,i=t.attributes.instanceEnd,n=new Float32Array(2*e.count);for(let a=0,c=0,d=e.count;a<d;a++,c+=2)k.fromBufferAttribute(e,a),Q.fromBufferAttribute(i,a),n[c]=c===0?0:n[c-1],n[c+1]=n[c]+k.distanceTo(Q);const r=new s.InstancedInterleavedBuffer(n,2,1);return t.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),t.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(t,e){const i=this.material.worldUnits,n=t.camera;n===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=t.params.Line2!==void 0&&t.params.Line2.threshold||0;E=t.ray;const a=this.matrixWorld,c=this.geometry,d=this.material;M=d.linewidth+r,c.boundingSphere===null&&c.computeBoundingSphere(),D.copy(c.boundingSphere).applyMatrix4(a);let f;if(i)f=M*.5;else{const l=Math.max(n.near,D.distanceToPoint(E.origin));f=Z(n,l,d.resolution)}if(D.radius+=f,E.intersectsSphere(D)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),T.copy(c.boundingBox).applyMatrix4(a);let u;if(i)u=M*.5;else{const l=Math.max(n.near,T.distanceToPoint(E.origin));u=Z(n,l,d.resolution)}T.expandByScalar(u),E.intersectsBox(T)!==!1&&(i?lt(this,e):dt(this,n,e))}}class J extends X{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const e=t.length-3,i=new Float32Array(2*e);for(let n=0;n<e;n+=3)i[2*n]=t[n],i[2*n+1]=t[n+1],i[2*n+2]=t[n+2],i[2*n+3]=t[n+3],i[2*n+4]=t[n+4],i[2*n+5]=t[n+5];return super.setPositions(i),this}setColors(t){const e=t.length-3,i=new Float32Array(2*e);for(let n=0;n<e;n+=3)i[2*n]=t[n],i[2*n+1]=t[n+1],i[2*n+2]=t[n+2],i[2*n+3]=t[n+3],i[2*n+4]=t[n+4],i[2*n+5]=t[n+5];return super.setColors(i),this}fromLine(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}}class ft extends ut{constructor(t=new J,e=new R({color:Math.random()*16777215})){super(t,e),this.isLine2=!0,this.type="Line2"}}const pt=2*Math.PI,ht={container:document.body,placement:"top-right",size:128,lineWidth:20,animated:!0,speed:1,offset:{top:0,left:0,right:0,bottom:0},font:{family:"helvetica",weight:900},resolution:64,sphere:{enabled:!0,color:16777215,opacity:0,hoverColor:16777215,hoverOpacity:.2},x:{text:"X",colors:{main:"#ff3653"}},y:{text:"Y",colors:{main:"#8adb00"}},z:{text:"Z",colors:{main:"#2c8fff"}},nx:{line:!1,colors:{main:"#ff3653"}},ny:{line:!1,colors:{main:"#8adb00"}},nz:{line:!1,colors:{main:"#2c8fff"}}},K=["x","y","z","nx","ny","nz"],mt={x:[[1,0,0],[0,Math.PI*.5,0]],y:[[0,1,0],[-Math.PI*.5,0,0]],z:[[0,0,1],[0,0,0]],nx:[[-1,0,0],[0,-Math.PI*.5,0]],ny:[[0,-1,0],[Math.PI*.5,0,0]],nz:[[0,0,-1],[0,Math.PI,0]]},gt=o=>{const t=new s.Color,e=[],i=[];if(K.forEach((c,d)=>{const f=o[c];if(f.line===!1)return;const u=d<3?1:-1,l=d<3?.9:1.025;e.push(c.includes("x")?l*u:0,c.includes("y")?l*u:0,c.includes("z")?l*u:0,0,0,0);const h=f.colors.main,[m,_]=Array.isArray(h)?h:[h,h];i.push(...t.set(_).toArray(),...t.set(m).toArray())}),!e.length)return null;const n=new J;n.setPositions(e),n.setColors(i);const r=new R({linewidth:o.lineWidth??20,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)}),a=new ft(n,r);return a.computeLineDistances(),a.scale.set(1,1,1),a.renderOrder=1,a},vt=o=>{const t=typeof o=="string"?document.querySelector(o):o;if(!t)throw Error("Invalid DOM element");return t};function yt({color:o,opacity:t}={}){const e=new s.SphereGeometry(1.6,64,64),i=new s.Mesh(e,new s.MeshBasicMaterial({color:o,side:s.BackSide,transparent:!0,opacity:t??.2}));return i.renderOrder=0,i}function _t(o,t,e,i,n,r,a,c){const d=document.createElement("canvas");t=t??64;const f=.02;d.width=t*2+t*(f*4),d.height=t+t*(f*2);const u=t/2,l=t/2+t*f,h=l*3,m=d.getContext("2d");if(tt(m,u,l,l,e,c),tt(m,u,h,l,r||"#FFF",c),i!=null){const P=o.family||"sans-serif",L=o.weight||500,S=wt(m,i,P,L,t);m.textAlign="center",m.textBaseline="middle",m.fillStyle=n||"#000",m.fillText(i,l,l+S),m.fillStyle=a||n||"#000",m.fillText(i,h,l+S)}const _=new s.CanvasTexture(d);return _.colorSpace=s.SRGBColorSpace,_.wrapS=_.wrapT=s.RepeatWrapping,_.repeat.x=.5,new s.SpriteMaterial({map:_,toneMapped:!1,transparent:!0})}function tt(o,t,e,i,n,r=!1){const a=i*.1;t=r?t-a:t,r&&(o.globalAlpha=.2),o.beginPath(),o.arc(e,i,t,0,2*Math.PI),o.closePath(),o.fillStyle=n,o.fill(),r&&(o.globalAlpha=1,o.strokeStyle=n,o.lineWidth=a,o.stroke())}function wt(o,t,e,i,n){const r=Math.sqrt(Math.pow(n*.7,2)/2);let a=r,c=0,d=0;do{o.font=`${i} ${a}px ${e}`;const l=o.measureText(t);c=l.width,d=l.fontBoundingBoxDescent,a--}while(c>r&&a>0);const f=Math.min(r/c,r/d),u=Math.floor(a*f);return o.font=`${i} ${u}px ${e}`,r/d}function St(o){const t=new s.Color,{font:e,resolution:i}=o;return K.map((n,r)=>{const{text:a,colors:c,border:d}=o[n],f=r<3,u=f?n:n[1],{text:l,main:h,hover:m,hoverText:_}=c,P=Array.isArray(h)?h[1]:h,L=d&&a,S=new s.Sprite(_t(e,i,t.set(P).getStyle(),a,l!=null?t.set(l).getStyle():null,m!=null?t.set(m).getStyle():null,_!=null?t.set(_).getStyle():null,d));return S.userData.axis=n,S.userData.forceScale=L,S.scale.setScalar(L||f?.6:.4),S.position[u]=f?1.2:-1.2,S.renderOrder=100,S})}const xt=[["x",0,3],["y",1,4],["z",2,5]],et=1,it=.5,nt=new s.Vector3;function bt(o,t){nt.set(0,0,1).applyQuaternion(t.quaternion),xt.forEach(([e,i,n])=>{const r=nt[e];o[i].material.opacity=r>=0?et:it,o[n].material.opacity=r>=0?it:et})}const Et=(o,t,e=10)=>Math.abs(o.clientX-t.x)<e&&Math.abs(o.clientY-t.y)<e;function j(o){for(let t=0,e=o.length;t<e;t++)o[t].scale.setScalar(t<3||o[t].userData.forceScale?.6:.4),o[t].material.map.offset.x=1}const st=new s.Raycaster,G=new s.Vector2;function ot(o,t,e,i){G.x=(o.clientX-t.left)/t.width*2-1,G.y=-((o.clientY-t.top)/t.height)*2+1,st.setFromCamera(G,e);const n=st.intersectObjects(i);return n.length?n[0].object:null}const Mt=(o,t,e)=>Math.min(Math.max(o,t),e),rt=(o,{color:t,opacity:e,hoverColor:i,hoverOpacity:n}={},r=!0)=>{const a=o.material;a.color.set(r&&i||t||16777215),a.opacity=r?n??.2:e??0},I=new s.Vector3,H=new s.Quaternion,A=new s.Quaternion,V=new s.Quaternion,B=new s.Matrix4,at=new s.Clock,ct=new s.Euler,N=new s.Vector2,q=new s.Vector2;class At extends s.Object3D{constructor(e,i,n){super();p(this,"enabled",!0);p(this,"camera");p(this,"target",new s.Vector3);p(this,"animated",!0);p(this,"speed",1);p(this,"animating",!1);p(this,"_sphere");p(this,"_sphereConfig");p(this,"_spritePoints");p(this,"_viewport",new s.Vector4);p(this,"_originalViewport",new s.Vector4);p(this,"_originalScissor",new s.Vector4);p(this,"_renderer");p(this,"_orthoCamera",new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,0,4));p(this,"_container");p(this,"_domElement");p(this,"_domRect");p(this,"_dragging",!1);p(this,"_distance",0);p(this,"_controls");p(this,"_controlsListeners");this._renderer=i,this.camera=e,this._orthoCamera.position.set(0,0,2),n={...ht,...n||{}};const{container:r,placement:a,size:c,animated:d,speed:f,offset:u,sphere:l,id:h,className:m}=n;this.animated=d,this.speed=f;const _=gt(n);_&&this.add(_),this._spritePoints=St(n),this.add(...this._spritePoints),l.enabled&&(this._sphere=yt(l),this._sphereConfig=l,this.add(this._sphere)),this._container=r?vt(r):document.body,this._domElement=U(a,c,u,h,m),this._container.appendChild(this._domElement),this._startListening(),this.update()}render(){this.animating&&this._animate();const{_renderer:e,_viewport:i}=this,n=e.getScissorTest(),r=e.autoClear;return e.autoClear=!1,e.setViewport(i),n&&e.setScissor(i),e.clear(!1,!0,!1),e.render(this,this._orthoCamera),e.setViewport(this._originalViewport),n&&e.setScissor(this._originalScissor),e.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const e=this._renderer,i=this._domRect,n=e.domElement.getBoundingClientRect();return this._viewport.set(i.left-n.left,e.domElement.clientHeight-(i.top-n.top+i.height),i.width,i.height),e.getViewport(this._originalViewport),e.getScissorTest()&&e.getScissor(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(e=!0){return e&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(e){this.detachControls(),this.target=e.target,this._controlsListeners={start:()=>e.enabled=!1,end:()=>e.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),e.addEventListener("change",this._controlsListeners.change),this._controls=e}detachControls(){!this._controlsListeners||!this._controls||(this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0)}dispose(){this.detachControls(),this.children.forEach(e=>{var n,r,a,c;const i=e;(n=i.material)==null||n.dispose(),(a=(r=i.material)==null?void 0:r.map)==null||a.dispose(),(c=i.geometry)==null||c.dispose()}),this._domElement.remove()}_updateOrientation(e=!0){e&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),bt(this._spritePoints,this.camera)}_animate(){const{position:e,quaternion:i}=this.camera;if(e.set(0,0,1),!this.animated){e.applyQuaternion(V).multiplyScalar(this._distance).add(this.target),i.copy(H),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}const r=at.getDelta()*pt*this.speed;A.rotateTowards(V,r),e.applyQuaternion(A).multiplyScalar(this._distance).add(this.target),i.rotateTowards(H,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),A.angleTo(V)===0&&(this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(e){const i=this.camera,n=this.target,[r,a]=mt[e];I.fromArray(r),H.setFromEuler(ct.fromArray(a)),I.multiplyScalar(this._distance).add(n),B.setPosition(i.position),B.lookAt(i.position,n,this.up),A.setFromRotationMatrix(B),B.setPosition(I),B.lookAt(I,n,this.up),V.setFromRotationMatrix(B),this.animating=!0,at.start(),this.dispatchEvent({type:"start"})}_startListening(){this._domElement.onpointerdown=e=>this._onPointerDown(e),this._domElement.onpointermove=e=>this._onPointerMove(e),this._domElement.onpointerleave=()=>this._onPointerLeave()}_onPointerDown(e){if(!this.enabled)return;const i=a=>{if(!this._dragging){if(Et(a,N))return;j(this._spritePoints),this._dragging=!0}q.set(a.clientX,a.clientY).sub(N).multiplyScalar(1/this._domRect.width*Math.PI),this.rotation.x=Mt(r.x+q.y,Math.PI/-2+.001,Math.PI/2-.001),this.rotation.y=r.y+q.x,this.updateMatrixWorld(),A.copy(this.quaternion).invert(),this.camera.position.set(0,0,1).applyQuaternion(A).multiplyScalar(this._distance).add(this.target),this.camera.rotation.setFromQuaternion(A),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},n=()=>{if(document.removeEventListener("pointermove",i,!1),document.removeEventListener("pointerup",n,!1),!this._dragging)return this._handleClick(e);this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;e.preventDefault(),N.set(e.clientX,e.clientY);const r=ct.copy(this.rotation);this._distance=this.camera.position.distanceTo(this.target),document.addEventListener("pointermove",i,!1),document.addEventListener("pointerup",n,!1),this.dispatchEvent({type:"start"})}_onPointerMove(e){!this.enabled||this._dragging||(this._sphere&&rt(this._sphere,this._sphereConfig),this._handleHover(e))}_onPointerLeave(){!this.enabled||this._dragging||(this._sphere&&rt(this._sphere,this._sphereConfig,!1),j(this._spritePoints),this._domElement.style.cursor="")}_handleClick(e){const i=ot(e,this._domRect,this._orthoCamera,this._spritePoints);i&&(this._setOrientation(i.userData.axis),this.dispatchEvent({type:"change"}))}_handleHover(e){const i=ot(e,this._domRect,this._orthoCamera,this._spritePoints);j(this._spritePoints),i?(i.material.map.offset.x=.5,i.scale.multiplyScalar(1.2),this._domElement.style.cursor="pointer"):this._domElement.style.cursor=""}}w.ViewportGizmo=At,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
