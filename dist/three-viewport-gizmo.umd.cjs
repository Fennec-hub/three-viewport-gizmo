(function(L,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(L=typeof globalThis<"u"?globalThis:L||self,s(L.ThreeViewportGizmo={},L.THREE))})(this,function(L,s){"use strict";var le=Object.defineProperty;var de=(L,s,H)=>s in L?le(L,s,{enumerable:!0,configurable:!0,writable:!0,value:H}):L[s]=H;var v=(L,s,H)=>de(L,typeof s!="symbol"?s+"":s,H);const H=(o,e)=>{const[t,n]=e.split("-");return Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},Gt=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:l,left:c,right:u,bottom:h}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${l}px ${u}px ${h}px ${c}px`,borderRadius:"100%"}),H(r,o),n&&(r.id=n),i&&(r.className=i),r},Pt=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function nt(o,e,t){return Math.max(e,Math.min(t,o))}const It=[["x",0,3],["y",1,4],["z",2,5]],mt=new s.Vector3;function gt({isSphere:o},e,t){o&&(mt.set(0,0,1).applyQuaternion(t.quaternion),It.forEach(([n,i,r])=>{const l=mt[n];let c=e[i],u=c.userData.opacity;c.material.opacity=nt(l>=0?u:u/2,0,1),c=e[r],u=c.userData.opacity,c.material.opacity=nt(l>=0?u/2:u,0,1)}))}const Ft=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,yt=new s.Raycaster,vt=new s.Vector2,_t=(o,e,t,n)=>{vt.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),yt.setFromCamera(vt,t);const i=yt.intersectObjects(n,!1);if(i.length>0){i.sort((h,a)=>h.distance-a.distance);const l=.2,c=i[0].distance,u=i.filter(h=>h.distance<=c+l);u.length>1&&(u.sort((h,a)=>(a.object.userData.intersectionOrder||0)-(h.object.userData.intersectionOrder||0)),i.splice(0,u.length,...u))}const r=i.length?i[0]:null;return!r||!r.object.visible?null:r},it=1e-6,Vt=2*Math.PI,bt=["x","y","z"],N=[...bt,"nx","ny","nz"],Ht=["x","z","y","nx","nz","ny"],jt=["z","x","y","nz","nx","ny"],ot="Right",Q="Top",st="Front",rt="Left",Y="Bottom",at="Back",kt=[ot,Q,st,rt,Y,at].map(o=>o.toLocaleLowerCase()),wt=1.3,St=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},j=o=>JSON.parse(JSON.stringify(o)),Wt=o=>{const e=o.type||"sphere",t=e==="sphere",n=e==="rounded-cube",i=o.resolution||t?64:128,r=s.Object3D.DEFAULT_UP,l=r.z===1,c=r.x===1,{container:u}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=u;const h=l?Ht:c?jt:N;kt.forEach((d,g)=>{o[d]&&(o[h[g]]=o[d])});const a={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},p={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},f={type:e,container:document.body,size:128,placement:"top-right",resolution:i,lineWidth:4,radius:t?1:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:n?15658734:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...j(a),...t?{label:"X",color:16725587,line:!0}:{label:c?Q:ot}},y:{...j(a),...t?{label:"Y",color:9100032,line:!0}:{label:l||c?st:Q}},z:{...j(a),...t?{label:"Z",color:2920447,line:!0}:{label:l?Q:c?ot:st}},nx:{...j(p),label:t?"":c?Y:rt},ny:{...j(p),label:t?"":l||c?at:Y},nz:{...j(p),label:t?"":l?Y:c?rt:at}};if(ct(o,f),n){const d=o;d.edges.radius=d.radius,d.edges.scale=1,d.edges.opacity=1,d.edges.hover.scale=1,d.edges.hover.opacity=1,d.corners.radius=d.radius,d.corners.scale=1,d.corners.opacity=1,d.corners.hover.scale=1,d.corners.hover.opacity=1,d.radius=0,N.forEach(g=>{d[g].scale=1,d[g].opacity=1,d[g].hover.scale=1,d[g].hover.opacity=1})}return bt.forEach(d=>ct(o[`n${d}`],j(o[d]))),{...o,isSphere:t}};function ct(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n!=="container"&&n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=ct(o[n]||{},t[n])));return o}const qt=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:l,font:c,corners:u,edges:h}=o,a=N.map(m=>({...o[m],radius:l}));i&&u.enabled&&a.push(u),i&&h.enabled&&a.push(h);const p=document.createElement("canvas"),f=p.getContext("2d");p.width=r*2+n*2,p.height=r*a.length+n*a.length;const[d,g]=C(a,r,c);a.forEach(({radius:m,label:S,color:V,labelColor:x,border:E,hover:{color:q,labelColor:z,border:P}},I)=>{const F=r*I+I*n+e;b(e,F,e,r,m,S,E,V,x),b(r+e*3,F,e,r,m,S,P??E,q??V,z??x)});const _=a.length,A=e/(r*2),M=e/(r*6),O=1/_,w=new s.CanvasTexture(p);return w.repeat.set(.5-2*A,O-2*M),w.offset.set(A,1-M),Object.assign(w,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:A,offsetY:M,cellHeight:O}}),w;function b(m,S,V,x,E,q,z,P,I){if(E=E*(x/2),P!=null&&P!==""&&(F(),f.fillStyle=t.set(P).getStyle(),f.fill()),z&&z.size){const Z=z.size*x/2;m+=Z,S+=Z,x-=z.size*x,E=Math.max(0,E-Z),F(),f.strokeStyle=t.set(z.color).getStyle(),f.lineWidth=z.size*x,f.stroke()}q&&y(f,m+x/2,S+(x+V)/2,q,t.set(I).getStyle());function F(){f.beginPath(),f.moveTo(m+E,S),f.lineTo(m+x-E,S),f.arcTo(m+x,S,m+x,S+E,E),f.lineTo(m+x,S+x-E),f.arcTo(m+x,S+x,m+x-E,S+x,E),f.lineTo(m+E,S+x),f.arcTo(m,S+x,m,S+x-E,E),f.lineTo(m,S+E),f.arcTo(m,S,m+E,S,E),f.closePath()}}function C(m,S,V){const E=[...m].sort((et,ce)=>{var Dt,Rt;return(((Dt=et.label)==null?void 0:Dt.length)||0)-(((Rt=ce.label)==null?void 0:Rt.length)||0)}).pop().label,{family:q,weight:z}=V,P=i?Math.sqrt(Math.pow(S*.7,2)/2):S;let I=P,F=0,Z=0;do{f.font=`${z} ${I}px ${q}`;const et=f.measureText(E);F=et.width,Z=et.fontBoundingBoxDescent,I--}while(F>P&&I>0);const zt=P/Z,re=Math.min(P/F,zt),ae=Math.floor(I*re);return[`${z} ${ae}px ${q}`,zt]}function y(m,S,V,x,E){m.font=d,m.textAlign="center",m.textBaseline="middle",m.fillStyle=E,m.fillText(x,S,V+(i?g:0))}},Nt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,lt=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function dt(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,l=o/t,c=(t-o)/t,u=o/n,h=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],p=[c,h,l,h,l,u,c,u],f=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],d=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(y=>f[y]);let g,_,A,M,O,w,b,C;for(let y=0;y<4;y++){M=y<1||y>2?i:-i,O=y<2?r:-r,w=y<1||y>2?c:l,b=y<2?h:u;for(let m=0;m<=e;m++)g=Math.PI/2*(y+m/e),_=Math.cos(g),A=Math.sin(g),a.push(M+o*_,O+o*A,0),p.push(w+l*_,b+u*A),m<e&&(C=(e+1)*y+m+4,d.push(y,C,C+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(d),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(p),2))}const Xt=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r,type:l}=o,u=l==="rounded-cube"?2-o.edges.radius*2:2,h=dt(i,r,u,u);return N.map((a,p)=>{const f=p<3,d=N[p],g=p?e.clone():e;lt(g,p);const{enabled:_,scale:A,opacity:M,hover:O}=o[d],w={map:g,opacity:M,transparent:!0},b=n?new s.Sprite(new s.SpriteMaterial(w)):new s.Mesh(h,new s.MeshBasicMaterial(w)),C=f?d:d[1];return b.position[C]=(f?1:-1)*(n?wt:1),n||b.lookAt(t.copy(b.position).multiplyScalar(1.7)),b.scale.setScalar(A),b.renderOrder=1,b.visible=_,b.userData={scale:A,opacity:M,hover:O},b})},Zt=(o,e)=>{const{isSphere:t,corners:n,type:i}=o,r=i==="rounded-cube";if(!n.enabled)return[];const{color:l,opacity:c,scale:u,radius:h,smoothness:a,hover:p}=n,f=t?null:r?new s.SphereGeometry(h,a*2,a):dt(h,a),d={transparent:!0,opacity:c},g=r?1-h:.85,_=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(M=>M*g),A=new s.Vector3;return Array(_.length/3).fill(0).map((M,O)=>{if(t){const C=e.clone();lt(C,6),d.map=C}else d.color=l;const w=t?new s.Sprite(new s.SpriteMaterial(d)):new s.Mesh(f,new s.MeshBasicMaterial(d)),b=O*3;return w.position.set(_[b],_[b+1],_[b+2]),t&&w.position.normalize().multiplyScalar(1.7),w.scale.setScalar(u),w.lookAt(A.copy(w.position).multiplyScalar(2)),w.renderOrder=1,w.userData={color:l,opacity:c,scale:u,hover:p,intersectionOrder:1},w})},$t=(o,e,t)=>{const{isSphere:n,edges:i,type:r}=o,l=r==="rounded-cube";if(!i.enabled)return[];const{color:c,opacity:u,scale:h,hover:a,radius:p,smoothness:f}=i,d=l?2-p*2:1.2,g=n?null:l?new s.CylinderGeometry(p,p,d,f*4):dt(p,f,d,.25),_={transparent:!0,opacity:u},A=l?1-p:.925,M=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(b=>b*A),O=new s.Vector3,w=new s.Vector3(0,1,0);return Array(M.length/3).fill(0).map((b,C)=>{if(n){const S=e.clone();lt(S,t),_.map=S}else _.color=c;const y=n?new s.Sprite(new s.SpriteMaterial(_)):new s.Mesh(g,new s.MeshBasicMaterial(_)),m=C*3;return y.position.set(M[m],M[m+1],M[m+2]),n&&y.position.normalize().multiplyScalar(1.7),y.scale.setScalar(h),y.up.copy(w),y.lookAt(O.copy(y.position).multiplyScalar(2)),l?(!n&&!y.position.z&&(y.rotation.z=Math.PI),!n&&!y.position.x&&(y.rotation.x=0),!n&&!y.position.x&&(y.rotation.z=Math.PI/2)):!n&&!y.position.y&&(y.rotation.z=Math.PI/2),y.renderOrder=1,y.userData={color:c,opacity:u,scale:h,hover:a},y})};function Qt(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},l={},c=o[0].morphTargetsRelative,u=new s.BufferGeometry;let h=0;for(let a=0;a<o.length;++a){const p=o[a];let f=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in p.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(p.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(c!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in p.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;l[d]===void 0&&(l[d]=[]),l[d].push(p.morphAttributes[d])}if(e){let d;if(t)d=p.index.count;else if(p.attributes.position!==void 0)d=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;u.addGroup(h,d,a),h+=d}}if(t){let a=0;const p=[];for(let f=0;f<o.length;++f){const d=o[f].index;for(let g=0;g<d.count;++g)p.push(d.getX(g)+a);a+=o[f].attributes.position.count}u.setIndex(p)}for(const a in r){const p=xt(r[a]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;u.setAttribute(a,p)}for(const a in l){const p=l[a][0].length;if(p===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[a]=[];for(let f=0;f<p;++f){const d=[];for(let _=0;_<l[a].length;++_)d.push(l[a][_][f]);const g=xt(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;u.morphAttributes[a].push(g)}}return u}function xt(o){let e,t,n,i=-1,r=0;for(let h=0;h<o.length;++h){const a=o[h];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const l=new e(r),c=new s.BufferAttribute(l,t,n);let u=0;for(let h=0;h<o.length;++h){const a=o[h];if(a.isInterleavedBufferAttribute){const p=u/t;for(let f=0,d=a.count;f<d;f++)for(let g=0;g<t;g++){const _=a.getComponent(f,g);c.setComponent(f+p,g,_)}}else l.set(a.array,u);u+=a.count*t}return i!==void 0&&(c.gpuType=i),c}const Yt=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:l}}=e;let c;const u=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)c=new s.Mesh(new s.SphereGeometry(1.8,64,64),u);else{let h;o.forEach(a=>{const p=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const f=a.geometry.clone();f.applyMatrix4(a.matrix),h=h?Qt([h,f]):f,a.scale.setScalar(p)}),c=new s.Mesh(h,u)}return c.userData={color:i,opacity:r,hover:l},c},Et=new s.Box3,J=new s.Vector3;class At extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Et.setFromBufferAttribute(t),this.boundingBox.union(Et))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,l=e.count;r<l;r++)J.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(J)),J.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(J));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`};class ut extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const ft=new s.Vector4,Mt=new s.Vector3,Tt=new s.Vector3,T=new s.Vector4,B=new s.Vector4,D=new s.Vector4,pt=new s.Vector3,ht=new s.Matrix4,U=new s.Line3,Bt=new s.Vector3,K=new s.Box3,tt=new s.Sphere,R=new s.Vector4;let G,k;function Ut(o,e,t){return R.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),R.multiplyScalar(1/R.w),R.x=k/t.width,R.y=k/t.height,R.applyMatrix4(o.projectionMatrixInverse),R.multiplyScalar(1/R.w),Math.abs(Math.max(R.x,R.y))}function Jt(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,l=Math.min(n.instanceCount,i.count);for(let c=0,u=l;c<u;c++){U.start.fromBufferAttribute(i,c),U.end.fromBufferAttribute(r,c),U.applyMatrix4(t);const h=new s.Vector3,a=new s.Vector3;G.distanceSqToSegment(U.start,U.end,a,h),a.distanceTo(h)<k*.5&&e.push({point:a,pointOnLine:h,distance:G.origin.distanceTo(a),object:o,face:null,faceIndex:c,uv:null,uv1:null})}}function Kt(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,l=o.matrixWorld,c=o.geometry,u=c.attributes.instanceStart,h=c.attributes.instanceEnd,a=Math.min(c.instanceCount,u.count),p=-e.near;G.at(1,D),D.w=1,D.applyMatrix4(e.matrixWorldInverse),D.applyMatrix4(n),D.multiplyScalar(1/D.w),D.x*=r.x/2,D.y*=r.y/2,D.z=0,pt.copy(D),ht.multiplyMatrices(e.matrixWorldInverse,l);for(let f=0,d=a;f<d;f++){if(T.fromBufferAttribute(u,f),B.fromBufferAttribute(h,f),T.w=1,B.w=1,T.applyMatrix4(ht),B.applyMatrix4(ht),T.z>p&&B.z>p)continue;if(T.z>p){const w=T.z-B.z,b=(T.z-p)/w;T.lerp(B,b)}else if(B.z>p){const w=B.z-T.z,b=(B.z-p)/w;B.lerp(T,b)}T.applyMatrix4(n),B.applyMatrix4(n),T.multiplyScalar(1/T.w),B.multiplyScalar(1/B.w),T.x*=r.x/2,T.y*=r.y/2,B.x*=r.x/2,B.y*=r.y/2,U.start.copy(T),U.start.z=0,U.end.copy(B),U.end.z=0;const _=U.closestPointToPointParameter(pt,!0);U.at(_,Bt);const A=s.MathUtils.lerp(T.z,B.z,_),M=A>=-1&&A<=1,O=pt.distanceTo(Bt)<k*.5;if(M&&O){U.start.fromBufferAttribute(u,f),U.end.fromBufferAttribute(h,f),U.start.applyMatrix4(l),U.end.applyMatrix4(l);const w=new s.Vector3,b=new s.Vector3;G.distanceSqToSegment(U.start,U.end,b,w),t.push({point:b,pointOnLine:w,distance:G.origin.distanceTo(b),object:o,face:null,faceIndex:f,uv:null,uv1:null})}}}class te extends s.Mesh{constructor(e=new At,t=new ut({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let l=0,c=0,u=t.count;l<u;l++,c+=2)Mt.fromBufferAttribute(t,l),Tt.fromBufferAttribute(n,l),i[c]=c===0?0:i[c-1],i[c+1]=i[c]+Mt.distanceTo(Tt);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;G=e.ray;const l=this.matrixWorld,c=this.geometry,u=this.material;k=u.linewidth+r,c.boundingSphere===null&&c.computeBoundingSphere(),tt.copy(c.boundingSphere).applyMatrix4(l);let h;if(n)h=k*.5;else{const p=Math.max(i.near,tt.distanceToPoint(G.origin));h=Ut(i,p,u.resolution)}if(tt.radius+=h,G.intersectsSphere(tt)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),K.copy(c.boundingBox).applyMatrix4(l);let a;if(n)a=k*.5;else{const p=Math.max(i.near,K.distanceToPoint(G.origin));a=Ut(i,p,u.resolution)}K.expandByScalar(a),G.intersectsBox(K)!==!1&&(n?Jt(this,t):Kt(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ft),this.material.uniforms.resolution.value.set(ft.z,ft.w))}}class Lt extends At{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class ee extends te{constructor(e=new Lt,t=new ut({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const ne=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if(N.forEach((c,u)=>{const{enabled:h,line:a,scale:p,color:f}=o[c];if(!h||!a)return;const d=u<3?1:-1,_=(i?wt-p/2:.975)*d;t.push(c.includes("x")?_:0,c.includes("y")?_:0,c.includes("z")?_:0,0,0,0);const A=e.set(f).toArray();n.push(...A,...A)}),!t.length)return null;const r=new Lt().setPositions(t).setColors(n),l=new ut({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new ee(r,l).computeLineDistances()},ie=o=>{const{corners:e,edges:t}=o,n=[],i=qt(o),r=Xt(o,i);n.push(...r),e.enabled&&n.push(...Zt(o,i)),t.enabled&&n.push(...$t(o,i,e.enabled?7:6));const l=Yt(r,o),c=ne(o);return[n,l,c]},$=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:l}=e?n.hover:n;o.scale.setScalar(l),t.opacity=i,t.map?Nt(t.map,e):t.color.set(r)},X=new s.Matrix4,Ot=new s.Spherical,oe=new s.Vector2,W=new s.Vector3,Ct=new s.Vector4;class se extends s.Object3D{constructor(t,n,i={}){super();v(this,"enabled",!0);v(this,"camera");v(this,"renderer");v(this,"options");v(this,"target",new s.Vector3);v(this,"animated",!0);v(this,"speed",1);v(this,"animating",!1);v(this,"_options");v(this,"_intersections");v(this,"_background",null);v(this,"_viewport",[0,0,0,0]);v(this,"_originalViewport",[0,0,0,0]);v(this,"_originalScissor",[0,0,0,0]);v(this,"_scene");v(this,"_camera");v(this,"_container");v(this,"_domElement");v(this,"_domRect");v(this,"_dragging",!1);v(this,"_distance",0);v(this,"_clock",new s.Clock);v(this,"_targetQuaternion",new s.Quaternion);v(this,"_quaternionStart",new s.Quaternion);v(this,"_quaternionEnd",new s.Quaternion);v(this,"_pointerStart",new s.Vector2);v(this,"_focus",null);v(this,"_placement");v(this,"_controls");v(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new s.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=H(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Wt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=ie(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:l,animated:c,speed:u}=this._options;return this.animated=c,this.speed=u,this._container=l?Pt(l):document.body,this._domElement=Gt(this._options),this._domElement.onpointerdown=h=>this._onPointerDown(h),this._domElement.onpointermove=h=>this._onPointerMove(h),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(Ct).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(Ct).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,l,c,u;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(c=(l=i.material)==null?void 0:l.map)==null||c.dispose(),(u=i.geometry)==null||u.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),gt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const r=this._clock.getDelta()*Vt*this.speed;this._quaternionStart.rotateTowards(this._quaternionEnd,r),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<it&&(this._controls&&(this._controls.enabled=!0),this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(t){const n=this.camera,i=this.target;W.copy(t).multiplyScalar(this._distance),X.setPosition(W).lookAt(W,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(X),W.add(i),X.lookAt(W,i,this.up),this._quaternionEnd.setFromRotationMatrix(X),X.setPosition(n.position).lookAt(n.position,i,this.up),this._quaternionStart.setFromRotationMatrix(X),this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=h=>{if(!this._dragging){if(Ft(h,this._pointerStart))return;this._dragging=!0}const a=oe.set(h.clientX,h.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),p=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),f=Ot.setFromVector3(p);f.theta=c-a.x,f.phi=nt(u-a.y,it,Math.PI-it),this.coordinateConversion(this.camera.position.setFromSpherical(f),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&($(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),l=Ot.setFromVector3(r),c=l.theta,u=l.phi;this._distance=l.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:l}=t,c=s.Object3D.DEFAULT_UP;return c.x===1?n?t.set(r,l,i):t.set(l,i,r):c.z===1?n?t.set(l,i,r):t.set(r,l,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&St(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&St(this._background,!1),this._focus&&$(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const n=_t(t,this._domRect,this._camera,this._intersections);this._focus&&($(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=_t(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&$(this._focus,!1),(this._focus=i)?$(i,!0):gt(this._options,this._intersections,this.camera))}}L.ViewportGizmo=se,Object.defineProperty(L,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
