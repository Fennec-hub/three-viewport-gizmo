(function(L,o){typeof exports=="object"&&typeof module<"u"?o(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],o):(L=typeof globalThis<"u"?globalThis:L||self,o(L.ThreeViewportGizmo={},L.THREE))})(this,function(L,o){"use strict";var fe=Object.defineProperty;var pe=(L,o,j)=>o in L?fe(L,o,{enumerable:!0,configurable:!0,writable:!0,value:j}):L[o]=j;var v=(L,o,j)=>pe(L,typeof o!="symbol"?o+"":o,j);const j=(s,e)=>{const[t,n]=e.split("-");return Object.assign(s.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},Gt=({placement:s,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:c,left:l,right:d,bottom:f}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${c}px ${d}px ${f}px ${l}px`,borderRadius:"100%"}),j(r,s),n&&(r.id=n),i&&(r.className=i),r},Ft=s=>{const e=typeof s=="string"?document.querySelector(s):s;if(!e)throw Error("Invalid DOM element");return e};function lt(s,e,t){return Math.max(e,Math.min(t,s))}const Vt=[["x",0,3],["y",1,4],["z",2,5]],yt=new o.Vector3;function _t({isSphere:s},e,t){s&&(yt.set(0,0,1).applyQuaternion(t.quaternion),Vt.forEach(([n,i,r])=>{const c=yt[n];let l=e[i],d=l.userData.opacity;l.material.opacity=lt(c>=0?d:d/2,0,1),l=e[r],d=l.userData.opacity,l.material.opacity=lt(c>=0?d/2:d,0,1)}))}const jt=(s,e,t=10)=>Math.abs(s.clientX-e.x)<t&&Math.abs(s.clientY-e.y)<t,vt=new o.Raycaster,bt=new o.Vector2,wt=(s,e,t,n)=>{bt.set((s.clientX-e.left)/e.width*2-1,-((s.clientY-e.top)/e.height)*2+1),vt.setFromCamera(bt,t);const i=vt.intersectObjects(n,!1);if(i.length>0){i.sort((f,a)=>f.distance-a.distance);const c=.2,l=i[0].distance,d=i.filter(f=>f.distance<=l+c);d.length>1&&(d.sort((f,a)=>(a.object.userData.intersectionOrder||0)-(f.object.userData.intersectionOrder||0)),i.splice(0,d.length,...d))}const r=i.length?i[0]:null;return!r||!r.object.visible?null:r},$=1e-6,Ht=2*Math.PI,St=["x","y","z"],N=[...St,"nx","ny","nz"],kt=["x","z","y","nx","nz","ny"],Wt=["z","x","y","nz","nx","ny"],Y="Right",J="Top",K="Front",tt="Left",et="Bottom",nt="Back",qt=[Y,J,K,tt,et,nt].map(s=>s.toLocaleLowerCase()),xt=1.3,Et=(s,e=!0)=>{const{material:t,userData:n}=s,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},H=s=>JSON.parse(JSON.stringify(s)),Nt={yUp:{x:Y,y:J,z:K,nx:tt,ny:et,nz:nt},zUp:{x:Y,y:nt,z:J,nx:tt,ny:K,nz:et},xUp:{x:J,y:K,z:Y,nx:et,ny:nt,nz:tt}},Zt=s=>{const e=s.type||"sphere",t=e==="sphere",n=e==="rounded-cube",i=s.resolution||t?64:128,r=o.Object3D.DEFAULT_UP,c=r.z===1,l=r.x===1,f=Nt[c?"zUp":l?"xUp":"yUp"],{container:a}=s;s.container=void 0,s=JSON.parse(JSON.stringify(s)),s.container=a;const p=c?kt:l?Wt:N;qt.forEach((m,S)=>{s[m]&&(s[p[S]]=s[m])});const u={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},h={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},b={type:e,container:document.body,size:128,placement:"top-right",resolution:i,lineWidth:4,radius:t?1:n?.3:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:n?15658734:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...H(u),...t?{label:"X",color:16725587,line:!0}:{label:f.x}},y:{...H(u),...t?{label:"Y",color:9100032,line:!0}:{label:f.y}},z:{...H(u),...t?{label:"Z",color:2920447,line:!0}:{label:f.z}},nx:{...H(h),label:t?"":f.nx},ny:{...H(h),label:t?"":f.ny},nz:{...H(h),label:t?"":f.nz}};if(dt(s,b),n){const m=s;m.edges.radius=m.radius,m.edges.scale=1,m.edges.opacity=1,m.edges.hover.scale=1,m.edges.hover.opacity=1,m.corners.radius=m.radius,m.corners.scale=1,m.corners.opacity=1,m.corners.hover.scale=1,m.corners.hover.opacity=1,m.radius=0,N.forEach(S=>{m[S].scale=1,m[S].opacity=1,m[S].hover.scale=1,m[S].hover.opacity=1})}return St.forEach(m=>dt(s[`n${m}`],H(s[m]))),{...s,isSphere:t}};function dt(s,...e){if(s instanceof HTMLElement||typeof s!="object"||s===null)return s;for(const t of e)for(const n in t)n!=="container"&&n in t&&(s[n]===void 0?s[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(s[n]=dt(s[n]||{},t[n])));return s}const Xt=(s,e=2)=>{const t=new o.Color,n=e*2,{isSphere:i,resolution:r,radius:c,font:l,corners:d,edges:f}=s,a=N.map(g=>({...s[g],radius:c}));i&&d.enabled&&a.push(d),i&&f.enabled&&a.push(f);const p=document.createElement("canvas"),u=p.getContext("2d");p.width=r*2+n*2,p.height=r*a.length+n*a.length;const[h,b]=O(a,r,l);a.forEach(({radius:g,label:x,color:V,labelColor:E,border:A,hover:{color:q,labelColor:C,border:I}},G)=>{const F=r*G+G*n+e;_(e,F,e,r,g,x,A,V,E),_(r+e*3,F,e,r,g,x,I??A,q??V,C??E)});const m=a.length,S=e/(r*2),M=e/(r*6),B=1/m,w=new o.CanvasTexture(p);return w.repeat.set(.5-2*S,B-2*M),w.offset.set(S,1-M),Object.assign(w,{colorSpace:o.SRGBColorSpace,wrapS:o.RepeatWrapping,wrapT:o.RepeatWrapping,userData:{offsetX:S,offsetY:M,cellHeight:B}}),w;function _(g,x,V,E,A,q,C,I,G){if(A=A*(E/2),I!=null&&I!==""&&(F(),u.fillStyle=t.set(I).getStyle(),u.fill()),C&&C.size){const X=C.size*E/2;g+=X,x+=X,E-=C.size*E,A=Math.max(0,A-X),F(),u.strokeStyle=t.set(C.color).getStyle(),u.lineWidth=C.size*E,u.stroke()}q&&y(u,g+E/2,x+(E+V)/2,q,t.set(G).getStyle());function F(){u.beginPath(),u.moveTo(g+A,x),u.lineTo(g+E-A,x),u.arcTo(g+E,x,g+E,x+A,A),u.lineTo(g+E,x+E-A),u.arcTo(g+E,x+E,g+E-A,x+E,A),u.lineTo(g+A,x+E),u.arcTo(g,x+E,g,x+E-A,A),u.lineTo(g,x+A),u.arcTo(g,x,g+A,x,A),u.closePath()}}function O(g,x,V){const A=[...g].sort((ct,ue)=>{var Rt,It;return(((Rt=ct.label)==null?void 0:Rt.length)||0)-(((It=ue.label)==null?void 0:It.length)||0)}).pop().label,{family:q,weight:C}=V,I=i?Math.sqrt(Math.pow(x*.7,2)/2):x;let G=I;s.font.size>0&&(G=s.font.size);let F=0,X=0;do{u.font=`${C} ${G}px ${q}`;const ct=u.measureText(A);F=ct.width,X=ct.fontBoundingBoxDescent,G--}while(F>I&&G>0);const Pt=I/X,le=Math.min(I/F,Pt),de=Math.floor(G*le);return[`${C} ${de}px ${q}`,Pt]}function y(g,x,V,E,A){g.font=h,g.textAlign="center",g.textBaseline="middle",g.fillStyle=A,g.fillText(E,x,V+(i?b:0))}},Qt=(s,e)=>s.offset.x=(e?.5:0)+s.userData.offsetX,ut=(s,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=s;t.y=1-(e+1)*i+n};function ft(s,e,t=2,n=2){const i=t/2-s,r=n/2-s,c=s/t,l=(t-s)/t,d=s/n,f=(n-s)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],p=[l,f,c,f,c,d,l,d],u=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(y=>u[y]);let b,m,S,M,B,w,_,O;for(let y=0;y<4;y++){M=y<1||y>2?i:-i,B=y<2?r:-r,w=y<1||y>2?l:c,_=y<2?f:d;for(let g=0;g<=e;g++)b=Math.PI/2*(y+g/e),m=Math.cos(b),S=Math.sin(b),a.push(M+s*m,B+s*S,0),p.push(w+c*m,_+d*S),g<e&&(O=(e+1)*y+g+4,h.push(y,O,O+1))}return new o.BufferGeometry().setIndex(new o.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new o.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new o.BufferAttribute(new Float32Array(p),2))}const $t=(s,e)=>{const t=new o.Vector3,{isSphere:n,radius:i,smoothness:r,type:c}=s,d=c==="rounded-cube"?2-s.edges.radius*2:2,f=ft(i,r,d,d);return N.map((a,p)=>{const u=p<3,h=N[p],b=p?e.clone():e;ut(b,p);const{enabled:m,scale:S,opacity:M,hover:B}=s[h],w={map:b,opacity:M,transparent:!0},_=n?new o.Sprite(new o.SpriteMaterial(w)):new o.Mesh(f,new o.MeshBasicMaterial(w)),O=u?h:h[1];if(_.position[O]=(u?1:-1)*(n?xt:1),!n){_.lookAt(t.copy(_.position).multiplyScalar(1.7));const y=o.Object3D.DEFAULT_UP.z===1,g=o.Object3D.DEFAULT_UP.x===1;(y||g)&&(h==="z"&&y||h==="x"&&g?_.rotateZ(-Math.PI/2):(h==="nz"&&y||h==="nx"&&g)&&_.rotateZ(Math.PI/2))}return _.scale.setScalar(S),_.renderOrder=1,_.visible=m,_.userData={scale:S,opacity:M,hover:B},_})},Yt=(s,e)=>{const{isSphere:t,corners:n,type:i}=s,r=i==="rounded-cube";if(!n.enabled)return[];const{color:c,opacity:l,scale:d,radius:f,smoothness:a,hover:p}=n,u=t?null:r?new o.SphereGeometry(f,a*2,a):ft(f,a),h={transparent:!0,opacity:l},b=r?1-f:.85,m=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(M=>M*b),S=new o.Vector3;return Array(m.length/3).fill(0).map((M,B)=>{if(t){const O=e.clone();ut(O,6),h.map=O}else h.color=c;const w=t?new o.Sprite(new o.SpriteMaterial(h)):new o.Mesh(u,new o.MeshBasicMaterial(h)),_=B*3;return w.position.set(m[_],m[_+1],m[_+2]),t&&w.position.normalize().multiplyScalar(1.7),w.scale.setScalar(d),w.lookAt(S.copy(w.position).multiplyScalar(2)),w.renderOrder=1,w.userData={color:c,opacity:l,scale:d,hover:p,intersectionOrder:1},w})},Jt=(s,e,t)=>{const{isSphere:n,edges:i,type:r}=s,c=r==="rounded-cube";if(!i.enabled)return[];const{color:l,opacity:d,scale:f,hover:a,radius:p,smoothness:u}=i,h=c?2-p*2:1.2,b=n?null:c?new o.CylinderGeometry(p,p,h,u*4):ft(p,u,h,.25),m={transparent:!0,opacity:d},S=c?1-p:.925,M=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(_=>_*S),B=new o.Vector3,w=new o.Vector3(0,1,0);return Array(M.length/3).fill(0).map((_,O)=>{if(n){const x=e.clone();ut(x,t),m.map=x}else m.color=l;const y=n?new o.Sprite(new o.SpriteMaterial(m)):new o.Mesh(b,new o.MeshBasicMaterial(m)),g=O*3;return y.position.set(M[g],M[g+1],M[g+2]),n&&y.position.normalize().multiplyScalar(1.7),y.scale.setScalar(f),y.up.copy(w),y.lookAt(B.copy(y.position).multiplyScalar(2)),c?(!n&&!y.position.z&&(y.rotation.z=Math.PI),!n&&!y.position.x&&(y.rotation.x=0),!n&&!y.position.x&&(y.rotation.z=Math.PI/2)):!n&&!y.position.y&&(y.rotation.z=Math.PI/2),y.renderOrder=1,y.userData={color:l,opacity:d,scale:f,hover:a},y})};function Kt(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},c={},l=s[0].morphTargetsRelative,d=new o.BufferGeometry;let f=0;for(let a=0;a<s.length;++a){const p=s[a];let u=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in p.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(p.attributes[h]),u++}if(u!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(l!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in p.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;c[h]===void 0&&(c[h]=[]),c[h].push(p.morphAttributes[h])}if(e){let h;if(t)h=p.index.count;else if(p.attributes.position!==void 0)h=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;d.addGroup(f,h,a),f+=h}}if(t){let a=0;const p=[];for(let u=0;u<s.length;++u){const h=s[u].index;for(let b=0;b<h.count;++b)p.push(h.getX(b)+a);a+=s[u].attributes.position.count}d.setIndex(p)}for(const a in r){const p=At(r[a]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;d.setAttribute(a,p)}for(const a in c){const p=c[a][0].length;if(p===0)break;d.morphAttributes=d.morphAttributes||{},d.morphAttributes[a]=[];for(let u=0;u<p;++u){const h=[];for(let m=0;m<c[a].length;++m)h.push(c[a][m][u]);const b=At(h);if(!b)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;d.morphAttributes[a].push(b)}}return d}function At(s){let e,t,n,i=-1,r=0;for(let f=0;f<s.length;++f){const a=s[f];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const c=new e(r),l=new o.BufferAttribute(c,t,n);let d=0;for(let f=0;f<s.length;++f){const a=s[f];if(a.isInterleavedBufferAttribute){const p=d/t;for(let u=0,h=a.count;u<h;u++)for(let b=0;b<t;b++){const m=a.getComponent(u,b);l.setComponent(u+p,b,m)}}else c.set(a.array,d);d+=a.count*t}return i!==void 0&&(l.gpuType=i),l}const te=(s,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:c}}=e;let l;const d=new o.MeshBasicMaterial({color:i,side:o.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)l=new o.Mesh(new o.SphereGeometry(1.8,64,64),d);else{let f;s.forEach(a=>{const p=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const u=a.geometry.clone();u.applyMatrix4(a.matrix),f=f?Kt([f,u]):u,a.scale.setScalar(p)}),l=new o.Mesh(f,d)}return l.userData={color:i,opacity:r,hover:c},l},Mt=new o.Box3,it=new o.Vector3;class Ut extends o.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new o.Float32BufferAttribute(e,3)),this.setAttribute("uv",new o.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new o.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new o.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new o.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new o.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new o.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new o.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new o.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new o.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Mt.setFromBufferAttribute(t),this.boundingBox.union(Mt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new o.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,c=e.count;r<c;r++)it.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(it)),it.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(it));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}o.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new o.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},o.ShaderLib.line={uniforms:o.UniformsUtils.merge([o.UniformsLib.common,o.UniformsLib.fog,o.UniformsLib.line]),vertexShader:`
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
		`};class pt extends o.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:o.UniformsUtils.clone(o.ShaderLib.line.uniforms),vertexShader:o.ShaderLib.line.vertexShader,fragmentShader:o.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const ht=new o.Vector4,zt=new o.Vector3,Tt=new o.Vector3,U=new o.Vector4,z=new o.Vector4,D=new o.Vector4,mt=new o.Vector3,gt=new o.Matrix4,T=new o.Line3,Lt=new o.Vector3,ot=new o.Box3,st=new o.Sphere,P=new o.Vector4;let R,k;function Bt(s,e,t){return P.set(0,0,-e,1).applyMatrix4(s.projectionMatrix),P.multiplyScalar(1/P.w),P.x=k/t.width,P.y=k/t.height,P.applyMatrix4(s.projectionMatrixInverse),P.multiplyScalar(1/P.w),Math.abs(Math.max(P.x,P.y))}function ee(s,e){const t=s.matrixWorld,n=s.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,c=Math.min(n.instanceCount,i.count);for(let l=0,d=c;l<d;l++){T.start.fromBufferAttribute(i,l),T.end.fromBufferAttribute(r,l),T.applyMatrix4(t);const f=new o.Vector3,a=new o.Vector3;R.distanceSqToSegment(T.start,T.end,a,f),a.distanceTo(f)<k*.5&&e.push({point:a,pointOnLine:f,distance:R.origin.distanceTo(a),object:s,face:null,faceIndex:l,uv:null,uv1:null})}}function ne(s,e,t){const n=e.projectionMatrix,r=s.material.resolution,c=s.matrixWorld,l=s.geometry,d=l.attributes.instanceStart,f=l.attributes.instanceEnd,a=Math.min(l.instanceCount,d.count),p=-e.near;R.at(1,D),D.w=1,D.applyMatrix4(e.matrixWorldInverse),D.applyMatrix4(n),D.multiplyScalar(1/D.w),D.x*=r.x/2,D.y*=r.y/2,D.z=0,mt.copy(D),gt.multiplyMatrices(e.matrixWorldInverse,c);for(let u=0,h=a;u<h;u++){if(U.fromBufferAttribute(d,u),z.fromBufferAttribute(f,u),U.w=1,z.w=1,U.applyMatrix4(gt),z.applyMatrix4(gt),U.z>p&&z.z>p)continue;if(U.z>p){const w=U.z-z.z,_=(U.z-p)/w;U.lerp(z,_)}else if(z.z>p){const w=z.z-U.z,_=(z.z-p)/w;z.lerp(U,_)}U.applyMatrix4(n),z.applyMatrix4(n),U.multiplyScalar(1/U.w),z.multiplyScalar(1/z.w),U.x*=r.x/2,U.y*=r.y/2,z.x*=r.x/2,z.y*=r.y/2,T.start.copy(U),T.start.z=0,T.end.copy(z),T.end.z=0;const m=T.closestPointToPointParameter(mt,!0);T.at(m,Lt);const S=o.MathUtils.lerp(U.z,z.z,m),M=S>=-1&&S<=1,B=mt.distanceTo(Lt)<k*.5;if(M&&B){T.start.fromBufferAttribute(d,u),T.end.fromBufferAttribute(f,u),T.start.applyMatrix4(c),T.end.applyMatrix4(c);const w=new o.Vector3,_=new o.Vector3;R.distanceSqToSegment(T.start,T.end,_,w),t.push({point:_,pointOnLine:w,distance:R.origin.distanceTo(_),object:s,face:null,faceIndex:u,uv:null,uv1:null})}}}class ie extends o.Mesh{constructor(e=new Ut,t=new pt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let c=0,l=0,d=t.count;c<d;c++,l+=2)zt.fromBufferAttribute(t,c),Tt.fromBufferAttribute(n,c),i[l]=l===0?0:i[l-1],i[l+1]=i[l]+zt.distanceTo(Tt);const r=new o.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new o.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new o.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;R=e.ray;const c=this.matrixWorld,l=this.geometry,d=this.material;k=d.linewidth+r,l.boundingSphere===null&&l.computeBoundingSphere(),st.copy(l.boundingSphere).applyMatrix4(c);let f;if(n)f=k*.5;else{const p=Math.max(i.near,st.distanceToPoint(R.origin));f=Bt(i,p,d.resolution)}if(st.radius+=f,R.intersectsSphere(st)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),ot.copy(l.boundingBox).applyMatrix4(c);let a;if(n)a=k*.5;else{const p=Math.max(i.near,ot.distanceToPoint(R.origin));a=Bt(i,p,d.resolution)}ot.expandByScalar(a),R.intersectsBox(ot)!==!1&&(n?ee(this,t):ne(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ht),this.material.uniforms.resolution.value.set(ht.z,ht.w))}}class Ot extends Ut{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class oe extends ie{constructor(e=new Ot,t=new pt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const se=s=>{const e=new o.Color,t=[],n=[],{isSphere:i}=s;if(N.forEach((l,d)=>{const{enabled:f,line:a,scale:p,color:u}=s[l];if(!f||!a)return;const h=d<3?1:-1,m=(i?xt-p/2:.975)*h;t.push(l.includes("x")?m:0,l.includes("y")?m:0,l.includes("z")?m:0,0,0,0);const S=e.set(u).toArray();n.push(...S,...S)}),!t.length)return null;const r=new Ot().setPositions(t).setColors(n),c=new pt({linewidth:s.lineWidth,vertexColors:!0,resolution:new o.Vector2(window.innerWidth,window.innerHeight)});return new oe(r,c).computeLineDistances()},re=s=>{const{corners:e,edges:t}=s,n=[],i=Xt(s),r=$t(s,i);n.push(...r),e.enabled&&n.push(...Yt(s,i)),t.enabled&&n.push(...Jt(s,i,e.enabled?7:6));const c=te(r,s),l=se(s);return[n,c,l]},Q=(s,e=!0)=>{const{material:t,userData:n}=s,{opacity:i,color:r,scale:c}=e?n.hover:n;s.scale.setScalar(c),t.opacity=i,t.map?Qt(t.map,e):t.color.set(r)},Z=new o.Matrix4,Ct=new o.Spherical,ae=new o.Vector2,W=new o.Vector3,Dt=new o.Vector4,rt=new o.Quaternion().setFromAxisAngle(new o.Vector3(0,0,1),Math.PI/2),at=new o.Quaternion().setFromAxisAngle(new o.Vector3(0,0,1),-Math.PI/2);class ce extends o.Object3D{constructor(t,n,i={}){super();v(this,"enabled",!0);v(this,"camera");v(this,"renderer");v(this,"options");v(this,"target",new o.Vector3);v(this,"animated",!0);v(this,"speed",1);v(this,"animating",!1);v(this,"_options");v(this,"_intersections");v(this,"_background",null);v(this,"_viewport",[0,0,0,0]);v(this,"_originalViewport",[0,0,0,0]);v(this,"_originalScissor",[0,0,0,0]);v(this,"_scene");v(this,"_camera");v(this,"_container");v(this,"_domElement");v(this,"_domRect");v(this,"_dragging",!1);v(this,"_distance",0);v(this,"_clock",new o.Clock);v(this,"_targetQuaternion",new o.Quaternion);v(this,"_quaternionStart",new o.Quaternion);v(this,"_quaternionEnd",new o.Quaternion);v(this,"_pointerStart",new o.Vector2);v(this,"_focus",null);v(this,"_placement");v(this,"_controls");v(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new o.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=j(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Zt(t),this._camera=this._options.isSphere?new o.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new o.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=re(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:c,animated:l,speed:d}=this._options;return this.animated=l,this.speed=d,this._container=c?Ft(c):document.body,this._domElement=Gt(this._options),this._domElement.onpointerdown=f=>this._onPointerDown(f),this._domElement.onpointermove=f=>this._onPointerMove(f),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(Dt).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(Dt).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new o.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,c,l,d;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(l=(c=i.material)==null?void 0:c.map)==null||l.dispose(),(d=i.geometry)==null||d.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),_t(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const r=this._clock.getDelta()*Ht*this.speed;if(this._quaternionStart.rotateTowards(this._quaternionEnd,r),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<$){if(this._controls){const c=this.camera.position.clone().sub(this.target).normalize(),l=o.Object3D.DEFAULT_UP.z===1&&Math.abs(c.z)>.99,d=o.Object3D.DEFAULT_UP.x===1&&Math.abs(c.x)>.99;l?this.camera.position.set(0,-1e-6,this.camera.position.z):d&&this.camera.position.set(this.camera.position.x,$,0),this._controls.update(),this._controls.enabled=!0}this.animating=!1,this.dispatchEvent({type:"end"})}}_setOrientation(t){const n=this.camera,i=this.target;if(W.copy(t).multiplyScalar(this._distance),Z.setPosition(W).lookAt(W,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(Z),W.add(i),Z.lookAt(W,i,this.up),this._quaternionEnd.setFromRotationMatrix(Z),Z.setPosition(n.position).lookAt(n.position,i,this.up),this._quaternionStart.setFromRotationMatrix(Z),o.Object3D.DEFAULT_UP.z===1&&Math.abs(t.z)>.99){const r=Math.sign(t.z);this._targetQuaternion.multiply(r===1?at:rt),this._quaternionEnd.multiply(r===1?at:rt)}else if(o.Object3D.DEFAULT_UP.x===1&&Math.abs(t.x)>.99){const r=Math.sign(t.x);this._targetQuaternion.multiply(r===1?at:rt),this._quaternionEnd.multiply(r===1?at:rt)}this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=f=>{if(!this._dragging){if(jt(f,this._pointerStart))return;this._dragging=!0}const a=ae.set(f.clientX,f.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),p=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),u=Ct.setFromVector3(p);u.theta=l-a.x,u.phi=lt(d-a.y,$,Math.PI-$),this.coordinateConversion(this.camera.position.setFromSpherical(u),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(Q(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),c=Ct.setFromVector3(r),l=c.theta,d=c.phi;this._distance=c.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:c}=t,l=o.Object3D.DEFAULT_UP;return l.x===1?n?t.set(r,c,i):t.set(c,i,r):l.z===1?n?t.set(c,i,r):t.set(r,c,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&Et(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&Et(this._background,!1),this._focus&&Q(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const n=wt(t,this._domRect,this._camera,this._intersections);this._focus&&(Q(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=wt(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&Q(this._focus,!1),(this._focus=i)?Q(i,!0):_t(this._options,this._intersections,this.camera))}}L.ViewportGizmo=ce,Object.defineProperty(L,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
