import{C as e,S as t,T as n,a as r,b as i,g as a,h as o,m as s,o as c,p as l,r as u,t as d,u as f,y as p}from"./three.module.mJOrM8gH.js";var m=new n;function h(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;m.copy(t),m[r]=0,m.normalize();let l=.5*o/(o+s),u=1-m.angleTo(e)/c;return Math.sign(m[n])===1?u*l:s/(o+s)+l+l*(1-u)}var g=class e extends u{constructor(e=1,t=1,r=1,i=2,a=.1){let o=i*2+1;if(a=Math.min(e/2,t/2,r/2,a),super(1,1,1,o,o,o),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:r,segments:i,radius:a},o===1)return;let s=this.toNonIndexed();this.index=null,this.attributes.position=s.attributes.position,this.attributes.normal=s.attributes.normal,this.attributes.uv=s.attributes.uv;let c=new n,l=new n,u=new n(e,t,r).divideScalar(2).subScalar(a),d=this.attributes.position.array,f=this.attributes.normal.array,p=this.attributes.uv.array,m=d.length/6,g=new n,_=.5/o;for(let n=0,i=0;n<d.length;n+=3,i+=2)switch(c.fromArray(d,n),l.copy(c),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),d[n+0]=u.x*Math.sign(c.x)+l.x*a,d[n+1]=u.y*Math.sign(c.y)+l.y*a,d[n+2]=u.z*Math.sign(c.z)+l.z*a,f[n+0]=l.x,f[n+1]=l.y,f[n+2]=l.z,Math.floor(n/m)){case 0:g.set(1,0,0),p[i+0]=h(g,l,`z`,`y`,a,r),p[i+1]=1-h(g,l,`y`,`z`,a,t);break;case 1:g.set(-1,0,0),p[i+0]=1-h(g,l,`z`,`y`,a,r),p[i+1]=1-h(g,l,`y`,`z`,a,t);break;case 2:g.set(0,1,0),p[i+0]=1-h(g,l,`x`,`z`,a,e),p[i+1]=h(g,l,`z`,`x`,a,r);break;case 3:g.set(0,-1,0),p[i+0]=1-h(g,l,`x`,`z`,a,e),p[i+1]=1-h(g,l,`z`,`x`,a,r);break;case 4:g.set(0,0,1),p[i+0]=1-h(g,l,`x`,`y`,a,e),p[i+1]=1-h(g,l,`y`,`x`,a,t);break;case 5:g.set(0,0,-1),p[i+0]=h(g,l,`x`,`y`,a,e),p[i+1]=1-h(g,l,`y`,`x`,a,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}},_=`ABCDEFGHIJKLMNOPRSTUVWYZ`,v=6,y=4,b=[`#FFFFFF`,`#FFFFFF`,`#FFFFFF`,`#FF5A5F`,`#FFD84D`,`#6D4BFF`,`#B7A4FF`];function x(){let e=document.createElement(`canvas`);e.width=768,e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#ffffff`,t.fillRect(0,0,e.width,e.height),t.fillStyle=`#0C0B12`,t.textAlign=`center`,t.textBaseline=`middle`,t.font=`800 78px Unbounded, "Arial Black", sans-serif`,[..._].forEach((e,n)=>{let r=n%v*128+64,i=Math.floor(n/v)*128+64+4;t.fillText(e,r,i)});let n=new r(e);return n.minFilter=o,n.magFilter=o,n.generateMipmaps=!1,n}var S=`
  attribute float aLetter;
  attribute vec3 aFace;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vFace;
  varying float vDepth;
  varying float vLetter;
  varying float vFront;
  void main() {
    vUv = uv;
    vFace = aFace;
    vLetter = aLetter;
    vec3 n = normalize(mat3(instanceMatrix) * normal);
    vNormal = normalize(normalMatrix * n);
    vFront = step(0.9, normal.z);
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`,C=`
  uniform sampler2D uAtlas;
  uniform vec3 uFog;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vFace;
  varying float vDepth;
  varying float vLetter;
  varying float vFront;
  void main() {
    float col = mod(vLetter, ${v}.0);
    float row = floor(vLetter / ${v}.0);
    vec2 cell = vec2((col + vUv.x) / ${v}.0, 1.0 - (row + 1.0 - vUv.y) / ${y}.0);
    float ink = 1.0 - texture2D(uAtlas, cell).r;
    vec3 light = normalize(vec3(0.35, 0.8, 0.6));
    float shade = 0.45 + 0.55 * max(dot(normalize(vNormal), light), 0.0);
    vec3 face = vFace * shade;
    // Dark letters on light faces, white letters on violet.
    vec3 inkColor = dot(vFace, vec3(0.33)) > 0.55 ? vec3(0.05, 0.04, 0.08) : vec3(1.0);
    vec3 color = mix(face, inkColor * shade, ink * vFront);
    float fog = smoothstep(6.0, 34.0, vDepth);
    gl_FragColor = vec4(mix(color, uFog, 0.35 + fog * 0.55), 1.0 - fog * 0.55);
  }
`,w=40,T=3e3,E=1500,D=class{canvas;opts;onSlow;renderer;scene=new t;camera=new p(42,1,.1,80);mesh;tiles=[];raf=0;last=0;pointer={x:0,y:0};look={x:0,y:0};flight=0;visible=!0;m=new a;q=new i;s=new n;io;tilted=!1;began=0;winStart=0;winFrames=0;slowCalled=!1;constructor(t,r={count:70,pixelRatio:.55,motion:`pointer`},i=()=>void 0){this.canvas=t,this.opts=r,this.onSlow=i;let a=r.count;this.renderer=new d({canvas:t,antialias:!1,alpha:!0,powerPreference:`low-power`}),this.renderer.setPixelRatio(r.pixelRatio),this.renderer.setClearColor(0,0),this.resize();let o=new g(1,1,.32,3,.16),u=new e({vertexShader:S,fragmentShader:C,transparent:!0,uniforms:{uAtlas:{value:x()},uFog:{value:new c(`#0C0B12`)}}});this.mesh=new s(o,u,a);let p=new Float32Array(a),m=new Float32Array(a*3),h=new c;for(let e=0;e<a;e++){p[e]=Math.floor(Math.random()*24),h.set(b[e%b.length]),m.set([h.r,h.g,h.b],e*3);let t=this.spot();this.tiles.push({home:t,pos:t.clone(),vel:new n,seed:Math.random()*100,rot:new f(Math.random()*.8-.4,Math.random()*1.2-.6,Math.random()*.8-.4),spin:new n,scale:this.camera.aspect<1?.55+Math.random()*.45:.8+Math.random()*.7})}this.mesh.geometry.setAttribute(`aLetter`,new l(p,1)),this.mesh.geometry.setAttribute(`aFace`,new l(m,3)),this.scene.add(this.mesh),this.camera.position.set(0,0,8),this.resize(),window.addEventListener(`resize`,this.resize),r.motion===`pointer`?window.addEventListener(`pointermove`,this.onPointer,{passive:!0}):window.addEventListener(`deviceorientation`,this.onTilt,{passive:!0}),document.addEventListener(`visibilitychange`,this.onVisibility),this.io=new IntersectionObserver(([e])=>{this.visible=e.isIntersecting,this.visible&&this.start()}),this.io.observe(t),this.start()}spot(){if(this.camera.aspect<1)return new n((Math.random()-.5)*10,(Math.random()-.5)*22,-7-Math.random()*17);let e=(Math.random()<.5?-1:1)*(3+Math.random()*12),t=(Math.random()-.5)*16,r=-4-Math.random()*26;return new n(Math.random()<.18?(Math.random()-.5)*8:e,t,r)}resize=()=>{let e=this.canvas.clientWidth||window.innerWidth,t=this.canvas.clientHeight||window.innerHeight;this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()};onPointer=e=>{this.pointer.x=e.clientX/window.innerWidth*2-1,this.pointer.y=e.clientY/window.innerHeight*2-1};onTilt=e=>{e.beta!==null&&e.gamma!==null&&(this.tilted=!0,this.pointer.x=Math.max(-1,Math.min(1,e.gamma/30)),this.pointer.y=Math.max(-1,Math.min(1,(e.beta-45)/30)))};onVisibility=()=>{document.hidden?this.stop():this.start()};watch(e){if(this.slowCalled)return;if(!this.began){this.began=e,this.winStart=e+E;return}if(e<this.winStart)return;this.winFrames+=1;let t=e-this.winStart;if(t>=T){let n=this.winFrames*1e3/t;this.winStart=e,this.winFrames=0,n<w&&(this.slowCalled=!0,this.onSlow())}}start(){this.raf||!this.visible||document.hidden||(this.last=performance.now(),this.began=0,this.winFrames=0,this.raf=requestAnimationFrame(this.frame))}stop(){cancelAnimationFrame(this.raf),this.raf=0}celebrate(){this.flight=2.4;for(let e of this.tiles)e.vel.set((Math.random()-.5)*6,9+Math.random()*9,(Math.random()-.5)*4),e.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9),e.home=this.spot();this.start()}frame=e=>{let t=Math.min(.05,(e-this.last)/1e3);this.last=e;let r=e/1e3;this.watch(e),this.opts.motion===`tilt`&&!this.tilted&&(this.pointer.x=Math.sin(r*.12)*.8,this.pointer.y=Math.cos(r*.09)*.5),this.look.x+=(this.pointer.x*.9-this.look.x)*Math.min(1,t*2.5),this.look.y+=(-this.pointer.y*.6-this.look.y)*Math.min(1,t*2.5),this.camera.position.x=this.look.x,this.camera.position.y=this.look.y,this.camera.lookAt(0,0,-12);let i=this.flight>0;i&&(this.flight-=t),this.tiles.forEach((e,a)=>{if(i&&this.flight>1.1)e.vel.y-=14*t,e.pos.addScaledVector(e.vel,t),e.rot.x+=e.spin.x*t,e.rot.y+=e.spin.y*t,e.rot.z+=e.spin.z*t;else{let a=new n(Math.sin(r*.35+e.seed)*.5,Math.cos(r*.3+e.seed*1.3)*.6,0),o=e.home.clone().add(a);e.pos.lerp(o,Math.min(1,t*(i?2.2:1.2))),e.spin.multiplyScalar(1-Math.min(1,t*2)),e.rot.x+=(Math.sin(r*.2+e.seed)*.35-e.rot.x)*t*.8+e.spin.x*t,e.rot.y+=(Math.cos(r*.18+e.seed)*.5-e.rot.y)*t*.8+e.spin.y*t,e.rot.z+=e.spin.z*t}this.q.setFromEuler(e.rot),this.s.setScalar(e.scale),this.m.compose(e.pos,this.q,this.s),this.mesh.setMatrixAt(a,this.m)}),this.mesh.instanceMatrix.needsUpdate=!0,this.renderer.render(this.scene,this.camera),this.raf=requestAnimationFrame(this.frame)};dispose(){this.stop(),this.io.disconnect(),window.removeEventListener(`resize`,this.resize),window.removeEventListener(`pointermove`,this.onPointer),window.removeEventListener(`deviceorientation`,this.onTilt),document.removeEventListener(`visibilitychange`,this.onVisibility),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.renderer.dispose()}};export{D as TileField};