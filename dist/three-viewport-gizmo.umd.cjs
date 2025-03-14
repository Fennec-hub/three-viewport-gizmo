(function(z,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(z=typeof globalThis<"u"?globalThis:z||self,s(z.ThreeViewportGizmo={},z.THREE))})(this,function(z,s){"use strict";var le=Object.defineProperty;var ue=(z,s,V)=>s in z?le(z,s,{enumerable:!0,configurable:!0,writable:!0,value:V}):z[s]=V;var g=(z,s,V)=>ue(z,typeof s!="symbol"?s+"":s,V);const V=(o,e)=>{const[t,n]=e.split("-");return Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},Pt=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:c,left:u,right:d,bottom:p}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${c}px ${d}px ${p}px ${u}px`,borderRadius:"100%"}),V(r,o),n&&(r.id=n),i&&(r.className=i),r},It=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function nt(o,e,t){return Math.max(e,Math.min(t,o))}const Rt=[["x",0,3],["y",1,4],["z",2,5]],mt=new s.Vector3;function gt({isSphere:o},e,t){o&&(mt.set(0,0,1).applyQuaternion(t.quaternion),Rt.forEach(([n,i,r])=>{const c=mt[n];let u=e[i],d=u.userData.opacity;u.material.opacity=nt(c>=0?d:d/2,0,1),u=e[r],d=u.userData.opacity,u.material.opacity=nt(c>=0?d/2:d,0,1)}))}const Ft=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,yt=new s.Raycaster,vt=new s.Vector2,_t=(o,e,t,n)=>{vt.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),yt.setFromCamera(vt,t);const i=yt.intersectObjects(n,!1),r=i.length?i[0]:null;return!r||!r.object.visible?null:r},it=1e-6,Vt=2*Math.PI,bt=["x","y","z"],X=[...bt,"nx","ny","nz"],kt=["x","z","y","nx","nz","ny"],jt=["z","x","y","nz","nx","ny"],ot="Right",Q="Top",st="Front",rt="Left",Y="Bottom",at="Back",Ht=[ot,Q,st,rt,Y,at].map(o=>o.toLocaleLowerCase()),wt=1.3,St=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},k=o=>JSON.parse(JSON.stringify(o)),Wt=o=>{const e=o.type||"sphere",t=e==="sphere",n=o.resolution||t?64:128,i=s.Object3D.DEFAULT_UP,r=i.z===1,c=i.x===1,{container:u}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=u;const d=r?kt:c?jt:X;Ht.forEach((l,h)=>{o[l]&&(o[d[h]]=o[l])});const p={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},a={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},f={type:e,container:document.body,size:128,placement:"top-right",resolution:n,lineWidth:4,radius:t?1:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...k(p),...t?{label:"X",color:16725587,line:!0}:{label:c?Q:ot}},y:{...k(p),...t?{label:"Y",color:9100032,line:!0}:{label:r||c?st:Q}},z:{...k(p),...t?{label:"Z",color:2920447,line:!0}:{label:r?Q:c?ot:st}},nx:{...k(a),label:t?"":c?Y:rt},ny:{...k(a),label:t?"":r||c?at:Y},nz:{...k(a),label:t?"":r?Y:c?rt:at}};return ct(o,f),bt.forEach(l=>ct(o[`n${l}`],k(o[l]))),{...o,isSphere:t}};function ct(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n!=="container"&&n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=ct(o[n]||{},t[n])));return o}const qt=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:c,font:u,corners:d,edges:p}=o,a=X.map(m=>({...o[m],radius:c}));i&&d.enabled&&a.push(d),i&&p.enabled&&a.push(p);const f=document.createElement("canvas"),l=f.getContext("2d");f.width=r*2+n*2,f.height=r*a.length+n*a.length;const[h,v]=$(a,r,u);a.forEach(({radius:m,label:E,color:F,labelColor:_,border:S,hover:{color:W,labelColor:O,border:P}},I)=>{const R=r*I+I*n+e;U(e,R,e,r,m,E,S,F,_),U(r+e*3,R,e,r,m,E,P??S,W??F,O??_)});const b=a.length,y=e/(r*2),x=e/(r*6),w=1/b,A=new s.CanvasTexture(f);return A.repeat.set(.5-2*y,w-2*x),A.offset.set(y,1-x),Object.assign(A,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:y,offsetY:x,cellHeight:w}}),A;function U(m,E,F,_,S,W,O,P,I){if(S=S*(_/2),P!=null&&P!==""&&(R(),l.fillStyle=t.set(P).getStyle(),l.fill()),O&&O.size){const N=O.size*_/2;m+=N,E+=N,_-=O.size*_,S=Math.max(0,S-N),R(),l.strokeStyle=t.set(O.color).getStyle(),l.lineWidth=O.size*_,l.stroke()}W&&L(l,m+_/2,E+(_+F)/2,W,t.set(I).getStyle());function R(){l.beginPath(),l.moveTo(m+S,E),l.lineTo(m+_-S,E),l.arcTo(m+_,E,m+_,E+S,S),l.lineTo(m+_,E+_-S),l.arcTo(m+_,E+_,m+_-S,E+_,S),l.lineTo(m+S,E+_),l.arcTo(m,E+_,m,E+_-S,S),l.lineTo(m,E+S),l.arcTo(m,E,m+S,E,S),l.closePath()}}function $(m,E,F){const S=[...m].sort((et,ce)=>{var Dt,Gt;return(((Dt=et.label)==null?void 0:Dt.length)||0)-(((Gt=ce.label)==null?void 0:Gt.length)||0)}).pop().label,{family:W,weight:O}=F,P=i?Math.sqrt(Math.pow(E*.7,2)/2):E;let I=P,R=0,N=0;do{l.font=`${O} ${I}px ${W}`;const et=l.measureText(S);R=et.width,N=et.fontBoundingBoxDescent,I--}while(R>P&&I>0);const Ct=P/N,re=Math.min(P/R,Ct),ae=Math.floor(I*re);return[`${O} ${ae}px ${W}`,Ct]}function L(m,E,F,_,S){m.font=h,m.textAlign="center",m.textBaseline="middle",m.fillStyle=S,m.fillText(_,E,F+(i?v:0))}},Nt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,lt=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function ut(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,c=o/t,u=(t-o)/t,d=o/n,p=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],f=[u,p,c,p,c,d,u,d],l=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(L=>l[L]);let v,b,y,x,w,A,U,$;for(let L=0;L<4;L++){x=L<1||L>2?i:-i,w=L<2?r:-r,A=L<1||L>2?u:c,U=L<2?p:d;for(let m=0;m<=e;m++)v=Math.PI/2*(L+m/e),b=Math.cos(v),y=Math.sin(v),a.push(x+o*b,w+o*y,0),f.push(A+c*b,U+d*y),m<e&&($=(e+1)*L+m+4,h.push(L,$,$+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(f),2))}const Xt=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r}=o,c=ut(i,r);return X.map((u,d)=>{const p=d<3,a=X[d],f=d?e.clone():e;lt(f,d);const{enabled:l,scale:h,opacity:v,hover:b}=o[a],y={map:f,opacity:v,transparent:!0},x=n?new s.Sprite(new s.SpriteMaterial(y)):new s.Mesh(c,new s.MeshBasicMaterial(y)),w=p?a:a[1];return x.position[w]=(p?1:-1)*(n?wt:1),n||x.lookAt(t.copy(x.position).multiplyScalar(1.7)),x.scale.setScalar(h),x.renderOrder=1,x.visible=l,x.userData={scale:h,opacity:v,hover:b},x})},Zt=(o,e)=>{const{isSphere:t,corners:n}=o;if(!n.enabled)return[];const{color:i,opacity:r,scale:c,radius:u,smoothness:d,hover:p}=n,a=t?null:ut(u,d),f={transparent:!0,opacity:r},l=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(v=>v*.85),h=new s.Vector3;return Array(l.length/3).fill(0).map((v,b)=>{if(t){const w=e.clone();lt(w,6),f.map=w}else f.color=i;const y=t?new s.Sprite(new s.SpriteMaterial(f)):new s.Mesh(a,new s.MeshBasicMaterial(f)),x=b*3;return y.position.set(l[x],l[x+1],l[x+2]),t&&y.position.normalize().multiplyScalar(1.7),y.scale.setScalar(c),y.lookAt(h.copy(y.position).multiplyScalar(2)),y.renderOrder=1,y.userData={color:i,opacity:r,scale:c,hover:p},y})},$t=(o,e,t)=>{const{isSphere:n,edges:i}=o;if(!i.enabled)return[];const{color:r,opacity:c,scale:u,hover:d,radius:p,smoothness:a}=i,f=n?null:ut(p,a,1.2,.25),l={transparent:!0,opacity:c},h=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(y=>y*.925),v=new s.Vector3,b=new s.Vector3(0,1,0);return Array(h.length/3).fill(0).map((y,x)=>{if(n){const U=e.clone();lt(U,t),l.map=U}else l.color=r;const w=n?new s.Sprite(new s.SpriteMaterial(l)):new s.Mesh(f,new s.MeshBasicMaterial(l)),A=x*3;return w.position.set(h[A],h[A+1],h[A+2]),n&&w.position.normalize().multiplyScalar(1.7),w.scale.setScalar(u),w.up.copy(b),w.lookAt(v.copy(w.position).multiplyScalar(2)),!n&&!w.position.y&&(w.rotation.z=Math.PI/2),w.renderOrder=1,w.userData={color:r,opacity:c,scale:u,hover:d},w})};function Qt(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},c={},u=o[0].morphTargetsRelative,d=new s.BufferGeometry;let p=0;for(let a=0;a<o.length;++a){const f=o[a];let l=0;if(t!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in f.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(f.attributes[h]),l++}if(l!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(u!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in f.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;c[h]===void 0&&(c[h]=[]),c[h].push(f.morphAttributes[h])}if(e){let h;if(t)h=f.index.count;else if(f.attributes.position!==void 0)h=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;d.addGroup(p,h,a),p+=h}}if(t){let a=0;const f=[];for(let l=0;l<o.length;++l){const h=o[l].index;for(let v=0;v<h.count;++v)f.push(h.getX(v)+a);a+=o[l].attributes.position.count}d.setIndex(f)}for(const a in r){const f=xt(r[a]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;d.setAttribute(a,f)}for(const a in c){const f=c[a][0].length;if(f===0)break;d.morphAttributes=d.morphAttributes||{},d.morphAttributes[a]=[];for(let l=0;l<f;++l){const h=[];for(let b=0;b<c[a].length;++b)h.push(c[a][b][l]);const v=xt(h);if(!v)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;d.morphAttributes[a].push(v)}}return d}function xt(o){let e,t,n,i=-1,r=0;for(let p=0;p<o.length;++p){const a=o[p];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const c=new e(r),u=new s.BufferAttribute(c,t,n);let d=0;for(let p=0;p<o.length;++p){const a=o[p];if(a.isInterleavedBufferAttribute){const f=d/t;for(let l=0,h=a.count;l<h;l++)for(let v=0;v<t;v++){const b=a.getComponent(l,v);u.setComponent(l+f,v,b)}}else c.set(a.array,d);d+=a.count*t}return i!==void 0&&(u.gpuType=i),u}const Yt=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:c}}=e;let u;const d=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)u=new s.Mesh(new s.SphereGeometry(1.8,64,64),d);else{let p;o.forEach(a=>{const f=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const l=a.geometry.clone();l.applyMatrix4(a.matrix),p=p?Qt([p,l]):l,a.scale.setScalar(f)}),u=new s.Mesh(p,d)}return u.userData={color:i,opacity:r,hover:c},u},Et=new s.Box3,J=new s.Vector3;class At extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Et.setFromBufferAttribute(t),this.boundingBox.union(Et))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,c=e.count;r<c;r++)J.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(J)),J.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(J));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`};class dt extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const ft=new s.Vector4,Mt=new s.Vector3,Bt=new s.Vector3,M=new s.Vector4,B=new s.Vector4,C=new s.Vector4,pt=new s.Vector3,ht=new s.Matrix4,T=new s.Line3,Tt=new s.Vector3,K=new s.Box3,tt=new s.Sphere,D=new s.Vector4;let G,j;function Ut(o,e,t){return D.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),D.multiplyScalar(1/D.w),D.x=j/t.width,D.y=j/t.height,D.applyMatrix4(o.projectionMatrixInverse),D.multiplyScalar(1/D.w),Math.abs(Math.max(D.x,D.y))}function Jt(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,c=Math.min(n.instanceCount,i.count);for(let u=0,d=c;u<d;u++){T.start.fromBufferAttribute(i,u),T.end.fromBufferAttribute(r,u),T.applyMatrix4(t);const p=new s.Vector3,a=new s.Vector3;G.distanceSqToSegment(T.start,T.end,a,p),a.distanceTo(p)<j*.5&&e.push({point:a,pointOnLine:p,distance:G.origin.distanceTo(a),object:o,face:null,faceIndex:u,uv:null,uv1:null})}}function Kt(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,c=o.matrixWorld,u=o.geometry,d=u.attributes.instanceStart,p=u.attributes.instanceEnd,a=Math.min(u.instanceCount,d.count),f=-e.near;G.at(1,C),C.w=1,C.applyMatrix4(e.matrixWorldInverse),C.applyMatrix4(n),C.multiplyScalar(1/C.w),C.x*=r.x/2,C.y*=r.y/2,C.z=0,pt.copy(C),ht.multiplyMatrices(e.matrixWorldInverse,c);for(let l=0,h=a;l<h;l++){if(M.fromBufferAttribute(d,l),B.fromBufferAttribute(p,l),M.w=1,B.w=1,M.applyMatrix4(ht),B.applyMatrix4(ht),M.z>f&&B.z>f)continue;if(M.z>f){const A=M.z-B.z,U=(M.z-f)/A;M.lerp(B,U)}else if(B.z>f){const A=B.z-M.z,U=(B.z-f)/A;B.lerp(M,U)}M.applyMatrix4(n),B.applyMatrix4(n),M.multiplyScalar(1/M.w),B.multiplyScalar(1/B.w),M.x*=r.x/2,M.y*=r.y/2,B.x*=r.x/2,B.y*=r.y/2,T.start.copy(M),T.start.z=0,T.end.copy(B),T.end.z=0;const b=T.closestPointToPointParameter(pt,!0);T.at(b,Tt);const y=s.MathUtils.lerp(M.z,B.z,b),x=y>=-1&&y<=1,w=pt.distanceTo(Tt)<j*.5;if(x&&w){T.start.fromBufferAttribute(d,l),T.end.fromBufferAttribute(p,l),T.start.applyMatrix4(c),T.end.applyMatrix4(c);const A=new s.Vector3,U=new s.Vector3;G.distanceSqToSegment(T.start,T.end,U,A),t.push({point:U,pointOnLine:A,distance:G.origin.distanceTo(U),object:o,face:null,faceIndex:l,uv:null,uv1:null})}}}class te extends s.Mesh{constructor(e=new At,t=new dt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let c=0,u=0,d=t.count;c<d;c++,u+=2)Mt.fromBufferAttribute(t,c),Bt.fromBufferAttribute(n,c),i[u]=u===0?0:i[u-1],i[u+1]=i[u]+Mt.distanceTo(Bt);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;G=e.ray;const c=this.matrixWorld,u=this.geometry,d=this.material;j=d.linewidth+r,u.boundingSphere===null&&u.computeBoundingSphere(),tt.copy(u.boundingSphere).applyMatrix4(c);let p;if(n)p=j*.5;else{const f=Math.max(i.near,tt.distanceToPoint(G.origin));p=Ut(i,f,d.resolution)}if(tt.radius+=p,G.intersectsSphere(tt)===!1)return;u.boundingBox===null&&u.computeBoundingBox(),K.copy(u.boundingBox).applyMatrix4(c);let a;if(n)a=j*.5;else{const f=Math.max(i.near,K.distanceToPoint(G.origin));a=Ut(i,f,d.resolution)}K.expandByScalar(a),G.intersectsBox(K)!==!1&&(n?Jt(this,t):Kt(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ft),this.material.uniforms.resolution.value.set(ft.z,ft.w))}}class Lt extends At{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class ee extends te{constructor(e=new Lt,t=new dt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const ne=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if(X.forEach((u,d)=>{const{enabled:p,line:a,scale:f,color:l}=o[u];if(!p||!a)return;const h=d<3?1:-1,b=(i?wt-f/2:.975)*h;t.push(u.includes("x")?b:0,u.includes("y")?b:0,u.includes("z")?b:0,0,0,0);const y=e.set(l).toArray();n.push(...y,...y)}),!t.length)return null;const r=new Lt().setPositions(t).setColors(n),c=new dt({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new ee(r,c).computeLineDistances()},ie=o=>{const{corners:e,edges:t}=o,n=[],i=qt(o),r=Xt(o,i);n.push(...r),e.enabled&&n.push(...Zt(o,i)),t.enabled&&n.push(...$t(o,i,e.enabled?7:6));const c=Yt(r,o),u=ne(o);return[n,c,u]},Z=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:c}=e?n.hover:n;o.scale.setScalar(c),t.opacity=i,t.map?Nt(t.map,e):t.color.set(r)},q=new s.Matrix4,zt=new s.Spherical,oe=new s.Vector2,H=new s.Vector3,Ot=new s.Vector4;class se extends s.Object3D{constructor(t,n,i={}){super();g(this,"enabled",!0);g(this,"camera");g(this,"renderer");g(this,"options");g(this,"target",new s.Vector3);g(this,"animated",!0);g(this,"speed",1);g(this,"animating",!1);g(this,"_options");g(this,"_intersections");g(this,"_background",null);g(this,"_viewport",[0,0,0,0]);g(this,"_originalViewport",[0,0,0,0]);g(this,"_originalScissor",[0,0,0,0]);g(this,"_scene");g(this,"_camera");g(this,"_container");g(this,"_domElement");g(this,"_domRect");g(this,"_dragging",!1);g(this,"_distance",0);g(this,"_clock",new s.Clock);g(this,"_targetQuaternion",new s.Quaternion);g(this,"_quaternionStart",new s.Quaternion);g(this,"_quaternionEnd",new s.Quaternion);g(this,"_pointerStart",new s.Vector2);g(this,"_focus",null);g(this,"_placement");g(this,"_controls");g(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new s.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=V(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Wt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=ie(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:c,animated:u,speed:d}=this._options;return this.animated=u,this.speed=d,this._container=c?It(c):document.body,this._domElement=Pt(this._options),this._domElement.onpointerdown=p=>this._onPointerDown(p),this._domElement.onpointermove=p=>this._onPointerMove(p),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this._updateOrientation(!0),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(Ot).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(Ot).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,c,u,d;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(u=(c=i.material)==null?void 0:c.map)==null||u.dispose(),(d=i.geometry)==null||d.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),gt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const r=this._clock.getDelta()*Vt*this.speed;this._quaternionStart.rotateTowards(this._quaternionEnd,r),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<it&&(this._controls&&(this._controls.enabled=!0),this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(t){const n=this.camera,i=this.target;H.copy(t).multiplyScalar(this._distance),q.setPosition(H).lookAt(H,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(q),H.add(i),q.lookAt(H,i,this.up),this._quaternionEnd.setFromRotationMatrix(q),q.setPosition(n.position).lookAt(n.position,i,this.up),this._quaternionStart.setFromRotationMatrix(q),this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=p=>{if(!this._dragging){if(Ft(p,this._pointerStart))return;this._dragging=!0}const a=oe.set(p.clientX,p.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),f=this.coordinateConversion(H.subVectors(this.camera.position,this.target)),l=zt.setFromVector3(f);l.theta=u-a.x,l.phi=nt(d-a.y,it,Math.PI-it),this.coordinateConversion(this.camera.position.setFromSpherical(l),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(Z(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=this.coordinateConversion(H.subVectors(this.camera.position,this.target)),c=zt.setFromVector3(r),u=c.theta,d=c.phi;this._distance=c.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:c}=t,u=s.Object3D.DEFAULT_UP;return u.x===1?n?t.set(r,c,i):t.set(c,i,r):u.z===1?n?t.set(c,i,r):t.set(r,c,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&St(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&St(this._background,!1),this._focus&&Z(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const n=_t(t,this._domRect,this._camera,this._intersections);this._focus&&(Z(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=_t(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&Z(this._focus,!1),(this._focus=i)?Z(i,!0):gt(this._options,this._intersections,this.camera))}}z.ViewportGizmo=se,Object.defineProperty(z,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
