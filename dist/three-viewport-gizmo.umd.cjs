(function(z,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(z=typeof globalThis<"u"?globalThis:z||self,s(z.ThreeViewportGizmo={},z.THREE))})(this,function(z,s){"use strict";var ee=Object.defineProperty;var ne=(z,s,k)=>s in z?ee(z,s,{enumerable:!0,configurable:!0,writable:!0,value:k}):z[s]=k;var g=(z,s,k)=>ne(z,typeof s!="symbol"?s+"":s,k);const k=(o,e)=>{const[t,n]=e.split("-");return Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},Ut=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:c,left:l,right:d,bottom:f}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${c}px ${d}px ${f}px ${l}px`,borderRadius:"100%"}),k(r,o),n&&(r.id=n),i&&(r.className=i),r},Lt=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function tt(o,e,t){return Math.max(e,Math.min(t,o))}const zt=[["x",0,3],["y",1,4],["z",2,5]],lt=new s.Vector3;function dt({isSphere:o},e,t){o&&(lt.set(0,0,1).applyQuaternion(t.quaternion),zt.forEach(([n,i,r])=>{const c=lt[n];let l=e[i],d=l.userData.opacity;l.material.opacity=tt(c>=0?d:d/2,0,1),l=e[r],d=l.userData.opacity,l.material.opacity=tt(c>=0?d/2:d,0,1)}))}const Ct=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,ut=new s.Raycaster,ft=new s.Vector2,pt=(o,e,t,n)=>{ft.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),ut.setFromCamera(ft,t);const i=ut.intersectObjects(n,!1),r=i.length?i[0]:null;return!r||!r.object.visible?null:r},et=1e-6,Ot=2*Math.PI,ht=["x","y","z"],$=[...ht,"nx","ny","nz"],Dt=["right","top","front","left","bottom","back"],mt=1.3,gt=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},F=o=>JSON.parse(JSON.stringify(o)),Pt=o=>{const e=o.type||"sphere",t=e==="sphere",n=o.resolution||t?64:128,{container:i}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=i,Dt.forEach((d,f)=>{o[d]&&(o[$[f]]=o[d])});const r={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},c={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},l={type:e,container:document.body,size:128,placement:"top-right",resolution:n,lineWidth:20,radius:t?1:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...F(r),...t?{label:"X",color:16725587,line:!0}:{label:"Right"}},y:{...F(r),...t?{label:"Y",color:9100032,line:!0}:{label:"Top"}},z:{...F(r),...t?{label:"Z",color:2920447,line:!0}:{label:"Front"}},nx:{...F(c),label:t?"":"Left"},ny:{...F(c),label:t?"":"Bottom"},nz:{...F(c),label:t?"":"Back"}};return nt(o,l),ht.forEach(d=>nt(o[`n${d}`],F(o[d]))),{...o,isSphere:t}};function nt(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n!=="container"&&n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=nt(o[n]||{},t[n])));return o}const Rt=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:c,font:l,corners:d,edges:f}=o,a=$.map(m=>({...o[m],radius:c}));i&&d.enabled&&a.push(d),i&&f.enabled&&a.push(f);const p=document.createElement("canvas"),u=p.getContext("2d");p.width=r*2+n*2,p.height=r*a.length+n*a.length;const[h,v]=Q(a,r,l);a.forEach(({radius:m,label:E,color:V,labelColor:S,border:x,hover:{color:W,labelColor:C,border:R}},G)=>{const I=r*G+G*n+e;U(e,I,e,r,m,E,x,V,S),U(r+e*3,I,e,r,m,E,R??x,W??V,C??S)});const _=a.length,y=e/(r*2),w=e/(r*6),b=1/_,A=new s.CanvasTexture(p);return A.repeat.set(.5-2*y,b-2*w),A.offset.set(y,1-w),Object.assign(A,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:y,offsetY:w,cellHeight:b}}),A;function U(m,E,V,S,x,W,C,R,G){if(x=x*(S/2),R!=null&&R!==""&&(I(),u.fillStyle=t.set(R).getStyle(),u.fill()),C&&C.size){const N=C.size*S/2;m+=N,E+=N,S-=C.size*S,x=Math.max(0,x-N),I(),u.strokeStyle=t.set(C.color).getStyle(),u.lineWidth=C.size*S,u.stroke()}W&&L(u,m+S/2,E+(S+V)/2,W,t.set(G).getStyle());function I(){u.beginPath(),u.moveTo(m+x,E),u.lineTo(m+S-x,E),u.arcTo(m+S,E,m+S,E+x,x),u.lineTo(m+S,E+S-x),u.arcTo(m+S,E+S,m+S-x,E+S,x),u.lineTo(m+x,E+S),u.arcTo(m,E+S,m,E+S-x,x),u.lineTo(m,E+x),u.arcTo(m,E,m+x,E,x),u.closePath()}}function Q(m,E,V){const x=[...m].sort((K,te)=>{var Bt,Tt;return(((Bt=K.label)==null?void 0:Bt.length)||0)-(((Tt=te.label)==null?void 0:Tt.length)||0)}).pop().label,{family:W,weight:C}=V,R=i?Math.sqrt(Math.pow(E*.7,2)/2):E;let G=R,I=0,N=0;do{u.font=`${C} ${G}px ${W}`;const K=u.measureText(x);I=K.width,N=K.fontBoundingBoxDescent,G--}while(I>R&&G>0);const Mt=R/N,Zt=Math.min(R/I,Mt),Kt=Math.floor(G*Zt);return[`${C} ${Kt}px ${W}`,Mt]}function L(m,E,V,S,x){m.font=h,m.textAlign="center",m.textBaseline="middle",m.fillStyle=x,m.fillText(S,E,V+(i?v:0))}},Gt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,it=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function ot(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,c=o/t,l=(t-o)/t,d=o/n,f=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],p=[l,f,c,f,c,d,l,d],u=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(L=>u[L]);let v,_,y,w,b,A,U,Q;for(let L=0;L<4;L++){w=L<1||L>2?i:-i,b=L<2?r:-r,A=L<1||L>2?l:c,U=L<2?f:d;for(let m=0;m<=e;m++)v=Math.PI/2*(L+m/e),_=Math.cos(v),y=Math.sin(v),a.push(w+o*_,b+o*y,0),p.push(A+c*_,U+d*y),m<e&&(Q=(e+1)*L+m+4,h.push(L,Q,Q+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(p),2))}const It=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r}=o,c=ot(i,r);return $.map((l,d)=>{const f=d<3,a=$[d],p=d?e.clone():e;it(p,d);const{enabled:u,scale:h,opacity:v,hover:_}=o[a],y={map:p,opacity:v,transparent:!0},w=n?new s.Sprite(new s.SpriteMaterial(y)):new s.Mesh(c,new s.MeshBasicMaterial(y)),b=f?a:a[1];return w.position[b]=(f?1:-1)*(n?mt:1),n||w.lookAt(t.copy(w.position).multiplyScalar(1.7)),w.scale.setScalar(h),w.renderOrder=1,w.visible=u,w.userData={scale:h,opacity:v,hover:_},w})},Vt=(o,e)=>{const{isSphere:t,corners:n}=o;if(!n.enabled)return[];const{color:i,opacity:r,scale:c,radius:l,smoothness:d,hover:f}=n,a=t?null:ot(l,d),p={transparent:!0,opacity:r},u=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(v=>v*.85),h=new s.Vector3;return Array(u.length/3).fill(0).map((v,_)=>{if(t){const b=e.clone();it(b,6),p.map=b}else p.color=i;const y=t?new s.Sprite(new s.SpriteMaterial(p)):new s.Mesh(a,new s.MeshBasicMaterial(p)),w=_*3;return y.position.set(u[w],u[w+1],u[w+2]),t&&y.position.normalize().multiplyScalar(1.7),y.scale.setScalar(c),y.lookAt(h.copy(y.position).multiplyScalar(2)),y.renderOrder=1,y.userData={color:i,opacity:r,scale:c,hover:f},y})},kt=(o,e,t)=>{const{isSphere:n,edges:i}=o;if(!i.enabled)return[];const{color:r,opacity:c,scale:l,hover:d,radius:f,smoothness:a}=i,p=n?null:ot(f,a,1.2,.25),u={transparent:!0,opacity:c},h=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(y=>y*.925),v=new s.Vector3,_=new s.Vector3(0,1,0);return Array(h.length/3).fill(0).map((y,w)=>{if(n){const U=e.clone();it(U,t),u.map=U}else u.color=r;const b=n?new s.Sprite(new s.SpriteMaterial(u)):new s.Mesh(p,new s.MeshBasicMaterial(u)),A=w*3;return b.position.set(h[A],h[A+1],h[A+2]),n&&b.position.normalize().multiplyScalar(1.7),b.scale.setScalar(l),b.up.copy(_),b.lookAt(v.copy(b.position).multiplyScalar(2)),!n&&!b.position.y&&(b.rotation.z=Math.PI/2),b.renderOrder=1,b.userData={color:r,opacity:c,scale:l,hover:d},b})};function Ft(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},c={},l=o[0].morphTargetsRelative,d=new s.BufferGeometry;let f=0;for(let a=0;a<o.length;++a){const p=o[a];let u=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in p.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(p.attributes[h]),u++}if(u!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(l!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in p.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;c[h]===void 0&&(c[h]=[]),c[h].push(p.morphAttributes[h])}if(e){let h;if(t)h=p.index.count;else if(p.attributes.position!==void 0)h=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;d.addGroup(f,h,a),f+=h}}if(t){let a=0;const p=[];for(let u=0;u<o.length;++u){const h=o[u].index;for(let v=0;v<h.count;++v)p.push(h.getX(v)+a);a+=o[u].attributes.position.count}d.setIndex(p)}for(const a in r){const p=yt(r[a]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;d.setAttribute(a,p)}for(const a in c){const p=c[a][0].length;if(p===0)break;d.morphAttributes=d.morphAttributes||{},d.morphAttributes[a]=[];for(let u=0;u<p;++u){const h=[];for(let _=0;_<c[a].length;++_)h.push(c[a][_][u]);const v=yt(h);if(!v)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;d.morphAttributes[a].push(v)}}return d}function yt(o){let e,t,n,i=-1,r=0;for(let f=0;f<o.length;++f){const a=o[f];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const c=new e(r),l=new s.BufferAttribute(c,t,n);let d=0;for(let f=0;f<o.length;++f){const a=o[f];if(a.isInterleavedBufferAttribute){const p=d/t;for(let u=0,h=a.count;u<h;u++)for(let v=0;v<t;v++){const _=a.getComponent(u,v);l.setComponent(u+p,v,_)}}else c.set(a.array,d);d+=a.count*t}return i!==void 0&&(l.gpuType=i),l}const jt=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:c}}=e;let l;const d=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)l=new s.Mesh(new s.SphereGeometry(1.8,64,64),d);else{let f;o.forEach(a=>{const p=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const u=a.geometry.clone();u.applyMatrix4(a.matrix),f=f?Ft([f,u]):u,a.scale.setScalar(p)}),l=new s.Mesh(f,d)}return l.userData={color:i,opacity:r,hover:c},l},vt=new s.Box3,Y=new s.Vector3;class bt extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),vt.setFromBufferAttribute(t),this.boundingBox.union(vt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,c=e.count;r<c;r++)Y.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Y)),Y.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Y));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`};class st extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const rt=new s.Vector4,_t=new s.Vector3,wt=new s.Vector3,M=new s.Vector4,B=new s.Vector4,O=new s.Vector4,at=new s.Vector3,ct=new s.Matrix4,T=new s.Line3,St=new s.Vector3,J=new s.Box3,Z=new s.Sphere,D=new s.Vector4;let P,j;function xt(o,e,t){return D.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),D.multiplyScalar(1/D.w),D.x=j/t.width,D.y=j/t.height,D.applyMatrix4(o.projectionMatrixInverse),D.multiplyScalar(1/D.w),Math.abs(Math.max(D.x,D.y))}function Ht(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,c=Math.min(n.instanceCount,i.count);for(let l=0,d=c;l<d;l++){T.start.fromBufferAttribute(i,l),T.end.fromBufferAttribute(r,l),T.applyMatrix4(t);const f=new s.Vector3,a=new s.Vector3;P.distanceSqToSegment(T.start,T.end,a,f),a.distanceTo(f)<j*.5&&e.push({point:a,pointOnLine:f,distance:P.origin.distanceTo(a),object:o,face:null,faceIndex:l,uv:null,uv1:null})}}function Wt(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,c=o.matrixWorld,l=o.geometry,d=l.attributes.instanceStart,f=l.attributes.instanceEnd,a=Math.min(l.instanceCount,d.count),p=-e.near;P.at(1,O),O.w=1,O.applyMatrix4(e.matrixWorldInverse),O.applyMatrix4(n),O.multiplyScalar(1/O.w),O.x*=r.x/2,O.y*=r.y/2,O.z=0,at.copy(O),ct.multiplyMatrices(e.matrixWorldInverse,c);for(let u=0,h=a;u<h;u++){if(M.fromBufferAttribute(d,u),B.fromBufferAttribute(f,u),M.w=1,B.w=1,M.applyMatrix4(ct),B.applyMatrix4(ct),M.z>p&&B.z>p)continue;if(M.z>p){const A=M.z-B.z,U=(M.z-p)/A;M.lerp(B,U)}else if(B.z>p){const A=B.z-M.z,U=(B.z-p)/A;B.lerp(M,U)}M.applyMatrix4(n),B.applyMatrix4(n),M.multiplyScalar(1/M.w),B.multiplyScalar(1/B.w),M.x*=r.x/2,M.y*=r.y/2,B.x*=r.x/2,B.y*=r.y/2,T.start.copy(M),T.start.z=0,T.end.copy(B),T.end.z=0;const _=T.closestPointToPointParameter(at,!0);T.at(_,St);const y=s.MathUtils.lerp(M.z,B.z,_),w=y>=-1&&y<=1,b=at.distanceTo(St)<j*.5;if(w&&b){T.start.fromBufferAttribute(d,u),T.end.fromBufferAttribute(f,u),T.start.applyMatrix4(c),T.end.applyMatrix4(c);const A=new s.Vector3,U=new s.Vector3;P.distanceSqToSegment(T.start,T.end,U,A),t.push({point:U,pointOnLine:A,distance:P.origin.distanceTo(U),object:o,face:null,faceIndex:u,uv:null,uv1:null})}}}class qt extends s.Mesh{constructor(e=new bt,t=new st({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let c=0,l=0,d=t.count;c<d;c++,l+=2)_t.fromBufferAttribute(t,c),wt.fromBufferAttribute(n,c),i[l]=l===0?0:i[l-1],i[l+1]=i[l]+_t.distanceTo(wt);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;P=e.ray;const c=this.matrixWorld,l=this.geometry,d=this.material;j=d.linewidth+r,l.boundingSphere===null&&l.computeBoundingSphere(),Z.copy(l.boundingSphere).applyMatrix4(c);let f;if(n)f=j*.5;else{const p=Math.max(i.near,Z.distanceToPoint(P.origin));f=xt(i,p,d.resolution)}if(Z.radius+=f,P.intersectsSphere(Z)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),J.copy(l.boundingBox).applyMatrix4(c);let a;if(n)a=j*.5;else{const p=Math.max(i.near,J.distanceToPoint(P.origin));a=xt(i,p,d.resolution)}J.expandByScalar(a),P.intersectsBox(J)!==!1&&(n?Ht(this,t):Wt(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(rt),this.material.uniforms.resolution.value.set(rt.z,rt.w))}}class Et extends bt{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class Nt extends qt{constructor(e=new Et,t=new st({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const $t=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if($.forEach((l,d)=>{const{enabled:f,line:a,scale:p,color:u}=o[l];if(!f||!a)return;const h=d<3?1:-1,_=(i?mt-p/2:.975)*h;t.push(l.includes("x")?_:0,l.includes("y")?_:0,l.includes("z")?_:0,0,0,0);const y=e.set(u).toArray();n.push(...y,...y)}),!t.length)return null;const r=new Et().setPositions(t).setColors(n),c=new st({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new Nt(r,c).computeLineDistances()},Xt=o=>{const{corners:e,edges:t}=o,n=[],i=Rt(o),r=It(o,i);n.push(...r),e.enabled&&n.push(...Vt(o,i)),t.enabled&&n.push(...kt(o,i,e.enabled?7:6));const c=jt(r,o),l=$t(o);return[n,c,l]},X=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:c}=e?n.hover:n;o.scale.setScalar(c),t.opacity=i,t.map?Gt(t.map,e):t.color.set(r)},q=new s.Matrix4,Qt=new s.Spherical,Yt=new s.Vector2,H=new s.Vector3,At=new s.Vector4;class Jt extends s.Object3D{constructor(t,n,i={}){super();g(this,"enabled",!0);g(this,"camera");g(this,"renderer");g(this,"options");g(this,"target",new s.Vector3);g(this,"animated",!0);g(this,"speed",1);g(this,"animating",!1);g(this,"_options");g(this,"_intersections");g(this,"_background",null);g(this,"_viewport",[0,0,0,0]);g(this,"_originalViewport",[0,0,0,0]);g(this,"_originalScissor",[0,0,0,0]);g(this,"_scene");g(this,"_camera");g(this,"_container");g(this,"_domElement");g(this,"_domRect");g(this,"_dragging",!1);g(this,"_distance",0);g(this,"_clock",new s.Clock);g(this,"_targetQuaternion",new s.Quaternion);g(this,"_quaternionStart",new s.Quaternion);g(this,"_quaternionEnd",new s.Quaternion);g(this,"_pointerStart",new s.Vector2);g(this,"_focus",null);g(this,"_placement");g(this,"_controls");g(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new s.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=k(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Pt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=Xt(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:c,animated:l,speed:d}=this._options;return this.animated=l,this.speed=d,this._container=c?Lt(c):document.body,this._domElement=Ut(this._options),this._domElement.onpointerdown=f=>this._onPointerDown(f),this._domElement.onpointermove=f=>this._onPointerMove(f),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(At).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(At).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,c,l,d;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(l=(c=i.material)==null?void 0:c.map)==null||l.dispose(),(d=i.geometry)==null||d.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),dt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const r=this._clock.getDelta()*Ot*this.speed;this._quaternionStart.rotateTowards(this._quaternionEnd,r),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<et&&(this._controls&&(this._controls.enabled=!0),this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(t){const n=this.camera,i=this.target;H.copy(t).multiplyScalar(this._distance),q.setPosition(H).lookAt(H,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(q),H.add(i),q.lookAt(H,i,this.up),this._quaternionEnd.setFromRotationMatrix(q),q.setPosition(n.position).lookAt(n.position,i,this.up),this._quaternionStart.setFromRotationMatrix(q),this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=u=>{if(!this._dragging){if(Ct(u,this._pointerStart))return;this._dragging=!0}const h=Yt.set(u.clientX,u.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),v=H.subVectors(this.camera.position,this.target),{x:_,y,z:w}=this.coordinateConversion(v),b=Qt.setFromCartesianCoords(_,y,w);b.theta=a-h.x,b.phi=tt(p-h.y,et,Math.PI-et);const A=this.setFromSpherical(b);this.camera.position.set(A.x,A.y,A.z).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(X(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=H.subVectors(this.camera.position,this.target),{x:c,y:l,z:d}=this.coordinateConversion(r),f=new s.Spherical().setFromCartesianCoords(c,l,d),a=f.theta,p=f.phi;this._distance=f.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:c}=t;return s.Object3D.DEFAULT_UP.x===1?n?{x:r,y:c,z:i}:{x:c,y:i,z:r}:s.Object3D.DEFAULT_UP.z===1?n?{x:c,y:i,z:r}:{x:r,y:c,z:i}:{x:i,y:r,z:c}}setFromSpherical(t){const n=t.radius,i=t.phi,r=t.theta,c=Math.sin(i)*n,l=c*Math.sin(r),d=n*Math.cos(i),f=c*Math.cos(r);return this.coordinateConversion({x:l,y:d,z:f},!0)}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&gt(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&gt(this._background,!1),this._focus&&X(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const n=pt(t,this._domRect,this._camera,this._intersections);this._focus&&(X(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=pt(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&X(this._focus,!1),(this._focus=i)?X(i,!0):dt(this._options,this._intersections,this.camera))}}z.ViewportGizmo=Jt,Object.defineProperty(z,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
