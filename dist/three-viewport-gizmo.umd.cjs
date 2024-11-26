(function(U,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(U=typeof globalThis<"u"?globalThis:U||self,s(U.ThreeViewportGizmo={},U.THREE))})(this,function(U,s){"use strict";var te=Object.defineProperty;var ee=(U,s,k)=>s in U?te(U,s,{enumerable:!0,configurable:!0,writable:!0,value:k}):U[s]=k;var g=(U,s,k)=>ee(U,typeof s!="symbol"?s+"":s,k);const k=(o,e)=>{const[t,n]=e.split("-");Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`})},Tt=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:d,left:c,right:u,bottom:p}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${d}px ${u}px ${p}px ${c}px`,borderRadius:"100%"}),k(r,o),Object.assign(r,{id:n,className:i}),r},Lt=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function K(o,e,t){return Math.max(e,Math.min(t,o))}const Ut=[["x",0,3],["y",1,4],["z",2,5]],at=1,ct=.5,lt=new s.Vector3;function dt({isSphere:o},e,t){o&&(lt.set(0,0,1).applyQuaternion(t.quaternion),Ut.forEach(([n,i,r])=>{const d=lt[n];e[i].material.opacity=K(d>=0?at:ct,0,1),e[r].material.opacity=K(d>=0?ct:at,0,1)}))}const zt=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,ut=new s.Raycaster,ft=new s.Vector2,pt=(o,e,t,n)=>{ft.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),ut.setFromCamera(ft,t);const i=ut.intersectObjects(n,!1);return i.length?i[0]:null},tt=1e-6,Ct=2*Math.PI,ht=["x","y","z"],N=[...ht,"nx","ny","nz"],Ot=["right","top","front","left","bottom","back"],mt=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},F=o=>JSON.parse(JSON.stringify(o)),Dt=o=>{const e=o.type||"sphere",t=e==="sphere",n=o.resolution||t?64:128;Ot.forEach((c,u)=>{o[c]&&(o[N[u]]=o[c])});const i={color:16777215,opacity:1,scale:t?.7:.8,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:t?.7:.8,border:{size:0,color:14540253}}},r={line:!1,scale:t?.45:.8,hover:{scale:t?.5:.8}},d={type:e,container:document.body,size:128,placement:"top-right",resolution:n,lineWidth:20,radius:t?1:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:16777215,opacity:1,scale:t?.15:.175,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.4:.2}},edges:{enabled:!t,color:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.4:1}},x:{...F(i),...t?{label:"X",color:16725587,line:!0}:{label:"Right"}},y:{...F(i),...t?{label:"Y",color:9100032,line:!0}:{label:"Top"}},z:{...F(i),...t?{label:"Z",color:2920447,line:!0}:{label:"Front"}},nx:{...F(r),label:t?"":"Left"},ny:{...F(r),label:t?"":"Bottom"},nz:{...F(r),label:t?"":"Back"}};return et(o,d),ht.forEach(c=>et(o[`n${c}`],o[c])),{...o,isSphere:t}};function et(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=et(o[n]||{},t[n])));return o}const Pt=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:d,font:c,corners:u,edges:p}=o,a=N.map(m=>({...o[m],radius:d}));i&&u.enabled&&a.push(u),i&&p.enabled&&a.push(p);const f=document.createElement("canvas"),l=f.getContext("2d");f.width=r*2+n*2,f.height=r*a.length+n*a.length;const[h,y]=X(a,r,c);a.forEach(({radius:m,label:x,color:I,labelColor:_,border:S,hover:{color:j,labelColor:C,border:R}},G)=>{const V=r*G+G*n+e;z(e,V,e,r,m,x,S,I,_),z(r+e*3,V,e,r,m,x,R??S,j??I,C??_)});const b=a.length,v=e/(r*2),w=e/(r*6),L=1/b,B=new s.CanvasTexture(f);return B.repeat.set(.5-2*v,L-2*w),B.offset.set(v,1-w),Object.assign(B,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:v,offsetY:w,cellHeight:L}}),B;function z(m,x,I,_,S,j,C,R,G){if(S=S*(_/2),R!=null&&R!==""&&(V(),l.fillStyle=t.set(R).getStyle(),l.fill()),C&&C.size){const q=C.size*_/2;m+=q,x+=q,_-=C.size*_,S=Math.max(0,S-q),V(),l.strokeStyle=t.set(C.color).getStyle(),l.lineWidth=C.size*_,l.stroke()}j&&T(l,m+_/2,x+(_+I)/2,j,t.set(G).getStyle());function V(){l.beginPath(),l.moveTo(m+S,x),l.lineTo(m+_-S,x),l.arcTo(m+_,x,m+_,x+S,S),l.lineTo(m+_,x+_-S),l.arcTo(m+_,x+_,m+_-S,x+_,S),l.lineTo(m+S,x+_),l.arcTo(m,x+_,m,x+_-S,S),l.lineTo(m,x+S),l.arcTo(m,x,m+S,x,S),l.closePath()}}function X(m,x,I){const S=[...m].sort((J,Kt)=>{var Mt,Bt;return(((Mt=J.label)==null?void 0:Mt.length)||0)-(((Bt=Kt.label)==null?void 0:Bt.length)||0)}).pop().label,{family:j,weight:C}=I,R=i?Math.sqrt(Math.pow(x*.7,2)/2):x;let G=R,V=0,q=0;do{l.font=`${C} ${G}px ${j}`;const J=l.measureText(S);V=J.width,q=J.fontBoundingBoxDescent,G--}while(V>R&&G>0);const At=R/q,Zt=Math.min(R/V,At),Jt=Math.floor(G*Zt);return[`${C} ${Jt}px ${j}`,At]}function T(m,x,I,_,S){m.font=h,m.textAlign="center",m.textBaseline="middle",m.fillStyle=S,m.fillText(_,x,I+(i?y:0))}},Rt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,nt=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function it(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,d=o/t,c=(t-o)/t,u=o/n,p=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],f=[c,p,d,p,d,u,c,u],l=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(T=>l[T]);let y,b,v,w,L,B,z,X;for(let T=0;T<4;T++){w=T<1||T>2?i:-i,L=T<2?r:-r,B=T<1||T>2?c:d,z=T<2?p:u;for(let m=0;m<=e;m++)y=Math.PI/2*(T+m/e),b=Math.cos(y),v=Math.sin(y),a.push(w+o*b,L+o*v,0),f.push(B+d*b,z+u*v),m<e&&(X=(e+1)*T+m+4,h.push(T,X,X+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(f),2))}const Gt=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r}=o,d=it(i,r);return N.map((c,u)=>{const p=u<3,a=N[u],f=u?e.clone():e;nt(f,u);const{scale:l,opacity:h,hover:y}=o[a],b={map:f,opacity:h,transparent:!0},v=n?new s.Sprite(new s.SpriteMaterial(b)):new s.Mesh(d,new s.MeshBasicMaterial(b)),w=p?a:a[1];return v.position[w]=(p?1:-1)*(n?1.4:1),n||v.lookAt(t.copy(v.position).multiplyScalar(1.7)),v.scale.setScalar(l),v.renderOrder=1,v.userData={scale:l,opacity:h,hover:y},v})},Vt=(o,e)=>{const{isSphere:t,corners:n}=o;if(!n.enabled)return[];const{color:i,opacity:r,scale:d,radius:c,smoothness:u,hover:p}=n,a=t?null:it(c,u),f={transparent:!0,opacity:r},l=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(y=>y*.85),h=new s.Vector3;return Array(l.length/3).fill(0).map((y,b)=>{if(t){const L=e.clone();nt(L,6),f.map=L}else f.color=i;const v=t?new s.Sprite(new s.SpriteMaterial(f)):new s.Mesh(a,new s.MeshBasicMaterial(f)),w=b*3;return v.position.set(l[w],l[w+1],l[w+2]),t&&v.position.normalize().multiplyScalar(1.7),v.scale.setScalar(d),v.lookAt(h.copy(v.position).multiplyScalar(2)),v.userData={color:i,opacity:r,scale:d,hover:p},v})},It=(o,e,t)=>{const{isSphere:n,edges:i}=o;if(!i.enabled)return[];const{color:r,opacity:d,scale:c,hover:u,radius:p,smoothness:a}=i,f=n?null:it(p,a,1.2,.25),l={transparent:!0,opacity:d},h=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(b=>b*.925),y=new s.Vector3;return Array(h.length/3).fill(0).map((b,v)=>{if(n){const B=e.clone();nt(B,t),l.map=B}else l.color=r;const w=n?new s.Sprite(new s.SpriteMaterial(l)):new s.Mesh(f,new s.MeshBasicMaterial(l)),L=v*3;return w.position.set(h[L],h[L+1],h[L+2]),n&&w.position.normalize().multiplyScalar(1.7),w.scale.setScalar(c),w.lookAt(y.copy(w.position).multiplyScalar(2)),!n&&!w.position.y&&(w.rotation.z=Math.PI/2),w.userData={color:r,opacity:d,scale:c,hover:u},w})};function kt(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},d={},c=o[0].morphTargetsRelative,u=new s.BufferGeometry;let p=0;for(let a=0;a<o.length;++a){const f=o[a];let l=0;if(t!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in f.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(f.attributes[h]),l++}if(l!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(c!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in f.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;d[h]===void 0&&(d[h]=[]),d[h].push(f.morphAttributes[h])}if(e){let h;if(t)h=f.index.count;else if(f.attributes.position!==void 0)h=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;u.addGroup(p,h,a),p+=h}}if(t){let a=0;const f=[];for(let l=0;l<o.length;++l){const h=o[l].index;for(let y=0;y<h.count;++y)f.push(h.getX(y)+a);a+=o[l].attributes.position.count}u.setIndex(f)}for(const a in r){const f=gt(r[a]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;u.setAttribute(a,f)}for(const a in d){const f=d[a][0].length;if(f===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[a]=[];for(let l=0;l<f;++l){const h=[];for(let b=0;b<d[a].length;++b)h.push(d[a][b][l]);const y=gt(h);if(!y)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;u.morphAttributes[a].push(y)}}return u}function gt(o){let e,t,n,i=-1,r=0;for(let p=0;p<o.length;++p){const a=o[p];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const d=new e(r),c=new s.BufferAttribute(d,t,n);let u=0;for(let p=0;p<o.length;++p){const a=o[p];if(a.isInterleavedBufferAttribute){const f=u/t;for(let l=0,h=a.count;l<h;l++)for(let y=0;y<t;y++){const b=a.getComponent(l,y);c.setComponent(l+f,y,b)}}else d.set(a.array,u);u+=a.count*t}return i!==void 0&&(c.gpuType=i),c}const Ht=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:d}}=e;let c;const u=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)c=new s.Mesh(new s.SphereGeometry(1.8,64,64),u);else{let p;o.forEach(a=>{const f=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const l=a.geometry.clone();l.applyMatrix4(a.matrix),p=p?kt([p,l]):l,a.scale.setScalar(f)}),c=new s.Mesh(p,u)}return c.userData={color:i,opacity:r,hover:d},c},yt=new s.Box3,Q=new s.Vector3;class vt extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),yt.setFromBufferAttribute(t),this.boundingBox.union(yt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,d=e.count;r<d;r++)Q.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Q)),Q.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Q));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`};class ot extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1))}}const bt=new s.Vector3,_t=new s.Vector3,E=new s.Vector4,A=new s.Vector4,O=new s.Vector4,st=new s.Vector3,rt=new s.Matrix4,M=new s.Line3,wt=new s.Vector3,Y=new s.Box3,Z=new s.Sphere,D=new s.Vector4;let P,H;function St(o,e,t){return D.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),D.multiplyScalar(1/D.w),D.x=H/t.width,D.y=H/t.height,D.applyMatrix4(o.projectionMatrixInverse),D.multiplyScalar(1/D.w),Math.abs(Math.max(D.x,D.y))}function jt(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,d=Math.min(n.instanceCount,i.count);for(let c=0,u=d;c<u;c++){M.start.fromBufferAttribute(i,c),M.end.fromBufferAttribute(r,c),M.applyMatrix4(t);const p=new s.Vector3,a=new s.Vector3;P.distanceSqToSegment(M.start,M.end,a,p),a.distanceTo(p)<H*.5&&e.push({point:a,pointOnLine:p,distance:P.origin.distanceTo(a),object:o,face:null,faceIndex:c,uv:null,uv1:null})}}function Ft(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,d=o.matrixWorld,c=o.geometry,u=c.attributes.instanceStart,p=c.attributes.instanceEnd,a=Math.min(c.instanceCount,u.count),f=-e.near;P.at(1,O),O.w=1,O.applyMatrix4(e.matrixWorldInverse),O.applyMatrix4(n),O.multiplyScalar(1/O.w),O.x*=r.x/2,O.y*=r.y/2,O.z=0,st.copy(O),rt.multiplyMatrices(e.matrixWorldInverse,d);for(let l=0,h=a;l<h;l++){if(E.fromBufferAttribute(u,l),A.fromBufferAttribute(p,l),E.w=1,A.w=1,E.applyMatrix4(rt),A.applyMatrix4(rt),E.z>f&&A.z>f)continue;if(E.z>f){const B=E.z-A.z,z=(E.z-f)/B;E.lerp(A,z)}else if(A.z>f){const B=A.z-E.z,z=(A.z-f)/B;A.lerp(E,z)}E.applyMatrix4(n),A.applyMatrix4(n),E.multiplyScalar(1/E.w),A.multiplyScalar(1/A.w),E.x*=r.x/2,E.y*=r.y/2,A.x*=r.x/2,A.y*=r.y/2,M.start.copy(E),M.start.z=0,M.end.copy(A),M.end.z=0;const b=M.closestPointToPointParameter(st,!0);M.at(b,wt);const v=s.MathUtils.lerp(E.z,A.z,b),w=v>=-1&&v<=1,L=st.distanceTo(wt)<H*.5;if(w&&L){M.start.fromBufferAttribute(u,l),M.end.fromBufferAttribute(p,l),M.start.applyMatrix4(d),M.end.applyMatrix4(d);const B=new s.Vector3,z=new s.Vector3;P.distanceSqToSegment(M.start,M.end,z,B),t.push({point:z,pointOnLine:B,distance:P.origin.distanceTo(z),object:o,face:null,faceIndex:l,uv:null,uv1:null})}}}class Wt extends s.Mesh{constructor(e=new vt,t=new ot({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let d=0,c=0,u=t.count;d<u;d++,c+=2)bt.fromBufferAttribute(t,d),_t.fromBufferAttribute(n,d),i[c]=c===0?0:i[c-1],i[c+1]=i[c]+bt.distanceTo(_t);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;P=e.ray;const d=this.matrixWorld,c=this.geometry,u=this.material;H=u.linewidth+r,c.boundingSphere===null&&c.computeBoundingSphere(),Z.copy(c.boundingSphere).applyMatrix4(d);let p;if(n)p=H*.5;else{const f=Math.max(i.near,Z.distanceToPoint(P.origin));p=St(i,f,u.resolution)}if(Z.radius+=p,P.intersectsSphere(Z)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),Y.copy(c.boundingBox).applyMatrix4(d);let a;if(n)a=H*.5;else{const f=Math.max(i.near,Y.distanceToPoint(P.origin));a=St(i,f,u.resolution)}Y.expandByScalar(a),P.intersectsBox(Y)!==!1&&(n?jt(this,t):Ft(this,i,t))}}class xt extends vt{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class qt extends Wt{constructor(e=new xt,t=new ot({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const Nt=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if(N.forEach((c,u)=>{const{line:p,scale:a,color:f}=o[c];if(!p)return;const l=u<3?1:-1,y=(i?1.4-a/2:.975)*l;t.push(c.includes("x")?y:0,c.includes("y")?y:0,c.includes("z")?y:0,0,0,0);const b=e.set(f).toArray();n.push(...b,...b)}),!t.length)return null;const r=new xt().setPositions(t).setColors(n),d=new ot({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new qt(r,d).computeLineDistances()},$t=o=>{const{corners:e,edges:t}=o,n=[],i=Pt(o),r=Gt(o,i);n.push(...r),e.enabled&&n.push(...Vt(o,i)),t.enabled&&n.push(...It(o,i,e.enabled?7:6));const d=Ht(r,o),c=Nt(o);return[n,d,c]},$=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:d}=e?n.hover:n;o.scale.setScalar(d),t.opacity=i,t.map?Rt(t.map,e):t.color.set(r)},W=new s.Matrix4,Xt=new s.Spherical,Et=new s.Vector3,Qt=new s.Vector2;class Yt extends s.Object3D{constructor(t,n,i={}){super();g(this,"type","ViewportGizmo");g(this,"enabled",!0);g(this,"camera");g(this,"renderer");g(this,"options");g(this,"target",new s.Vector3);g(this,"animated",!0);g(this,"speed",1);g(this,"animating",!1);g(this,"_options");g(this,"_intersections");g(this,"_background",null);g(this,"_viewport",new s.Vector4);g(this,"_originalViewport",new s.Vector4);g(this,"_originalScissor",new s.Vector4);g(this,"_camera");g(this,"_container");g(this,"_domElement");g(this,"_domRect");g(this,"_dragging",!1);g(this,"_distance",0);g(this,"_clock",new s.Clock);g(this,"_targetPosition",new s.Vector3);g(this,"_targetQuaternion",new s.Quaternion);g(this,"_quaternionStart",new s.Quaternion);g(this,"_quaternionEnd",new s.Quaternion);g(this,"_pointerStart",new s.Vector2);g(this,"_focus",null);g(this,"_placement");g(this,"_controls");g(this,"_controlsListeners");this.camera=t,this.renderer=n,this.set(i)}get placement(){return this._placement}set placement(t){this._placement=t,k(this._domElement,t)}set(t={}){this.dispose(),this.options=t,this._options=Dt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(25,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=$t(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:d,animated:c,speed:u}=this._options;return this.animated=c,this.speed=u,this._container=d?Lt(d):document.body,this._domElement=Tt(this._options),this._domElement.onpointerdown=p=>this._onPointerDown(p),this._domElement.onpointermove=p=>this._onPointerMove(p),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(n),i&&t.setScissor(n),t.clear(!1,!0,!1),t.render(this,this._camera),t.setViewport(this._originalViewport),i&&t.setScissor(this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.set(n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(this._originalViewport),t.getScissorTest()&&t.getScissor(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,d,c,u;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(c=(d=i.material)==null?void 0:d.map)==null||c.dispose(),(u=i.geometry)==null||u.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),dt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}const r=this._clock.getDelta()*Ct*this.speed;this._quaternionStart.rotateTowards(this._quaternionEnd,r),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,r),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<tt&&(this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(t){const n=this.camera,i=this.target;this._targetPosition.copy(t).multiplyScalar(this._distance),W.setPosition(this._targetPosition).lookAt(this._targetPosition,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(W),this._targetPosition.add(i),W.lookAt(this._targetPosition,i,this.up),this._quaternionEnd.setFromRotationMatrix(W),W.setPosition(n.position).lookAt(n.position,i,this.up),this._quaternionStart.setFromRotationMatrix(W),this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=u=>{if(!this._dragging){if(zt(u,this._pointerStart))return;this._dragging=!0}const p=Qt.set(u.clientX,u.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),a=Xt.setFromVector3(Et.subVectors(this.camera.position,this.target));a.theta=d-p.x,a.phi=K(c-p.y,tt,Math.PI-tt),this.camera.position.setFromSpherical(a).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&($(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=new s.Spherical().setFromVector3(Et.subVectors(this.camera.position,this.target)),d=r.theta,c=r.phi;this._distance=r.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&mt(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&mt(this._background,!1),this._focus&&$(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const n=pt(t,this._domRect,this._camera,this._intersections);this._focus&&($(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=pt(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&$(this._focus,!1),(this._focus=i)?$(i,!0):dt(this._options,this._intersections,this.camera))}}U.ViewportGizmo=Yt,Object.defineProperty(U,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
