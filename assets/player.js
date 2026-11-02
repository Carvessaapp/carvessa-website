// Shared player brain for the three car-screen players: videos, play/pause, seek, volume, speed, map, clock.
const VIDEOS=[
  {id:'en',title:'Carvessa in 30 seconds',short:'English',sub:'Shoppers · English',src:'/assets/video/maya-wide-en.mp4',poster:'/assets/video/maya-poster.jpg',art:['#F6C27A','#C9733A']},
  {id:'es',title:'En español',short:'Español',sub:'Compradores · Español',src:'/assets/video/maya-wide-es.mp4',poster:'/assets/video/maya-poster.jpg',art:['#8FD9B0','#1C7C4A']},
  {id:'biz',title:'For businesses',short:'Business',sub:'Coming soon',soon:true,art:['#9CC0F7','#1F5FBF']},
];
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const svg=(p,w=22)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const ICON={
  play:svg('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
  pause:svg('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>'),
  prev:svg('<path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor"/>',20),
  next:svg('<path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor"/>',20),
  home:svg('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="currentColor"/>'),
  map:svg('<path d="M4 11L20 4l-7 16-2-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'),
  sound:svg('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  mute:svg('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  restart:svg('<path d="M5 12a7 7 0 1 0 2.1-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M4 3v5h5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  full:svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>',20),
  en:svg('<path d="M5 16l1.5-5h11l1.5 5v3h-2v-1H7v1H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  biz:svg('<rect x="4" y="8" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 8V6h6v2" fill="none" stroke="currentColor" stroke-width="2"/>'),
  es:svg('<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15.5" text-anchor="middle" font-size="8.5" font-weight="800" fill="currentColor" font-family="Manrope">ES</text>'),
  john:svg('<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6" fill="none" stroke="currentColor" stroke-width="2"/>'),
};
const RATES=[0.75,1,1.25,1.5];
const rateText=r=>(r%0.5?r.toFixed(2):r.toFixed(1))+'×';

function makePlayer(root,v,h={}){
  let idx=0; const real=VIDEOS.map((x,i)=>i).filter(i=>!VIDEOS[i].soon);
  const P={root,v,real,vol:8,ri:1,get idx(){return idx}};
  P.load=(i,auto)=>{ if(VIDEOS[i].soon) return; idx=i; v.src=VIDEOS[i].src; v.poster=VIDEOS[i].poster||''; h.select&&h.select(i); paint(); if(auto) P.play(); };
  P.play=()=>{ const p=v.play(); if(p) p.catch(()=>{}); };
  P.toggle=()=>v.paused?P.play():v.pause();
  P.step=d=>{ const k=real.indexOf(idx)+d; if(k>=0&&k<real.length) P.load(real[k],true); };
  P.nextIdx=()=>{ const k=real.indexOf(idx)+1; return real[k<real.length?k:0]; };
  P.seekFrac=f=>{ if(v.duration) v.currentTime=clamp(f*v.duration,0,v.duration-.1); };
  P.knob=(k,d)=>{ if(k==='vol'){ P.vol=clamp(P.vol+d,0,10); v.volume=P.vol/10; v.muted=P.vol===0; } else { P.ri=clamp(P.ri+d,0,RATES.length-1); v.playbackRate=RATES[P.ri]; } paint(); };
  const all=(s,fn)=>root.querySelectorAll(s).forEach(fn);
  function paint(){ const f=v.duration?v.currentTime/v.duration:0; root.classList.toggle('playing',!v.paused);
    all('[data-icon="toggle"]',b=>{ b.innerHTML=v.paused?ICON.play:ICON.pause; b.setAttribute('aria-label',v.paused?'Play':'Pause'); });
    all('[data-act="seek"] i',i=>i.style.width=f*100+'%');
    all('[data-act="seek"]',b=>b.setAttribute('aria-valuenow',Math.round(f*100)));
    all('[data-cur]',e=>e.textContent=fmt(v.currentTime)); all('[data-dur]',e=>e.textContent=fmt(v.duration));
    all('[data-left]',e=>e.textContent=fmt((v.duration||0)-v.currentTime)+' left');
    all('[data-vol]',e=>e.textContent=(v.muted?0:P.vol*10)+'%'); all('[data-rate]',e=>e.textContent=rateText(RATES[P.ri]));
    all('[data-act="mute"]',b=>{ b.innerHTML=v.muted?ICON.mute:ICON.sound; b.classList.toggle('on',v.muted); });
    h.paint&&h.paint(f); }
  P.paint=paint;
  ['timeupdate','play','pause','loadedmetadata','seeked','volumechange','ratechange','durationchange'].forEach(e=>v.addEventListener(e,paint));
  v.addEventListener('loadedmetadata',()=>{ v.playbackRate=RATES[P.ri]; v.volume=P.vol/10; });
  v.addEventListener('ended',()=>P.step(1));
  root.addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(!b||!root.contains(b)||b.classList.contains('soon')) return; const a=b.dataset.act;
    if(a==='toggle') P.toggle(); else if(a==='mute'){ v.muted=!v.muted; if(!v.muted&&P.vol===0){ P.vol=5; v.volume=.5; } }
    else if(a==='prev') P.step(-1); else if(a==='next') P.step(1); else if(a==='restart'){ v.currentTime=0; P.play(); }
    else if(a==='seek'){ const r=b.getBoundingClientRect(); P.seekFrac((e.clientX-r.left)/r.width); }
    else if(a==='knob') P.knob(b.dataset.k,+b.dataset.d); else if(a==='chap') P.load(+b.dataset.i,true); });
  root.addEventListener('keydown',e=>{ if(!e.target.closest('[data-act="seek"]')) return; if(e.key==='ArrowRight'){ v.currentTime+=5; e.preventDefault(); } if(e.key==='ArrowLeft'){ v.currentTime-=5; e.preventDefault(); } });
  return P;
}
// Chapter buttons ("one per video"); the hook marks the playing one.
function chapters(box,cls=''){ box.innerHTML=VIDEOS.map((x,i)=>`<button class="${cls} ${x.soon?'soon':''}" data-act="chap" data-i="${i}" ${x.soon?'aria-disabled="true"':''}>${ICON[x.id]}<span>${x.short}</span></button>`).join(''); }
function markChap(root,i){ root.querySelectorAll('[data-act="chap"]').forEach(b=>b.classList.toggle('on',+b.dataset.i===i)); }
// Dark navigation map. The blue route fills in and the arrow drives as the video plays.
function mapSVG(){ let s=7; const rnd=()=>(s=(s*16807)%2147483647)/2147483647; let roads='';
  for(let k=0;k<34;k++){ const big=k<6; let x=rnd()*800,y=rnd()*450,a=rnd()*6.28,d=`M${x|0} ${y|0}`;
    for(let j=0;j<5;j++){ a+=(rnd()-.5)*.9; const L=big?150:70+rnd()*60; const cx=x+Math.cos(a)*L*.5, cy=y+Math.sin(a)*L*.5; a+=(rnd()-.5)*.7; x=cx+Math.cos(a)*L*.5; y=cy+Math.sin(a)*L*.5; d+=` Q${cx|0} ${cy|0} ${x|0} ${y|0}`; }
    roads+=`<path d="${d}" ${big?'stroke="#56657A" stroke-width="2.6"':''}/>`; }
  const R='M300 40C350 70 300 110 330 160S420 210 400 270 330 330 360 375 430 400 470 420';
  return `<svg class="map" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="800" height="450" fill="#0A1018"/>
  <path d="M0 0h470c-30 60 10 110-20 170s-90 70-70 150 70 90 40 130H0z" fill="#18212C"/><path d="M800 140c-70 10-120 60-110 120s-60 90-30 140 50 50 40 50H800z" fill="#1A2530"/><path d="M600 0c-10 40 40 60 80 50s90-30 120-20V0z" fill="#18212C"/>
  <g stroke="#3A4656" stroke-width="1.4" fill="none" opacity=".9">${roads}</g>
  <path d="${R}" stroke="#3D7BE0" stroke-opacity=".35" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path class="done" d="${R}" stroke="#7FB2FF" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g transform="translate(470 420)"><circle r="14" fill="#CDB38B" opacity=".25"/><circle r="7" fill="#CDB38B" stroke="#fff" stroke-width="2.5"/></g>
  <g class="arrow"><circle r="20" fill="#fff"/><path d="M0 -10L8 8 0 4-8 8z" fill="#1F5FBF"/></g></svg>`; }
function mapUpdate(el,f){ const done=el.querySelector('.done'), arrow=el.querySelector('.arrow'); if(!done) return; const len=done.getTotalLength();
  done.style.strokeDasharray=len; done.style.strokeDashoffset=len*(1-f);
  const p=done.getPointAtLength(Math.max(1,len*f)), q=done.getPointAtLength(Math.max(0,len*f-1));
  arrow.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${Math.atan2(p.y-q.y,p.x-q.x)*180/Math.PI+90})`); }
function clock(root){ const t=()=>{ const d=new Date(); root.querySelectorAll('[data-clock]').forEach(e=>e.textContent=(d.getHours()%12||12)+':'+String(d.getMinutes()).padStart(2,'0')); }; t(); setInterval(t,20000); }
const SIGNAL='<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M1 11h2V8H1zM5 11h2V6H5zM9 11h2V3H9zM13 11h2V0h-2z" fill="currentColor"/></svg>';
// The video's own colors, sampled a few times a second (for glow lights).
function ambient(v,cb){ const c=document.createElement('canvas'); c.width=c.height=8; const x=c.getContext('2d',{willReadFrequently:true});
  setInterval(()=>{ if(v.paused||v.readyState<2) return; try{ x.drawImage(v,0,0,8,8); const d=x.getImageData(0,0,8,8).data; let r=0,g=0,b=0; for(let i=0;i<d.length;i+=4){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; } const n=d.length/4; cb(r/n|0,g/n|0,b/n|0); }catch(e){} },300); }
// Album-style cover drawn by us (never the live video, so the video only plays in one place).
function coverArt(x){ return `<div class="cover" style="background:linear-gradient(135deg,${x.art[0]},${x.art[1]})"><span>${ICON[x.id].replace(/width="22" height="22"/,'width="34" height="34"')}</span><b>${x.short}</b></div>`; }

document.querySelectorAll('[data-ico]').forEach(e=>e.outerHTML=ICON[e.dataset.ico]);document.querySelectorAll('.sig').forEach(e=>e.outerHTML=SIGNAL);
(()=>{ const root=document.querySelector('[data-player]'), v=root.querySelector('video'), vb=root.querySelector('[data-vbox]');
  const mapBox=root.querySelector('[data-map]'); mapBox.innerHTML=mapSVG();
  chapters(root.querySelector('[data-chap]'));
  const ring=(el,f,txt)=>{ const r=19,c=2*Math.PI*r; el.innerHTML=`<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/><circle cx="23" cy="23" r="${r}" fill="none" stroke="#CDB38B" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 23 23)"/></svg><b>${txt}</b>`; };
  let state='off';
  const setState=s=>{ state=s; root.classList.toggle('off-state',s==='off'); root.classList.toggle('boot',s==='boot'); root.classList.toggle('on',s==='on'); };
  function ignite(){ if(state==='on'){ P.toggle(); return; } if(state==='boot') return;
    setState('boot'); P.play(); v.pause(); // unlock sound on this tap, then play after the boot
    setTimeout(()=>{ setState('on'); P.play(); }, matchMedia('(prefers-reduced-motion: reduce)').matches?50:1500); }
  root.querySelector('[data-start]').addEventListener('click',ignite);
  vb.addEventListener('click',e=>{ if(state!=='on'&&!e.target.closest('[data-start]')){ e.stopPropagation(); ignite(); } },true);
  root.querySelector('[data-nextcard]').addEventListener('click',()=>P.load(P.nextIdx(),true));
  root.querySelector('[data-full]').addEventListener('click',()=>{ const box=root.querySelector('.vid'); if(document.fullscreenElement){ document.exitFullscreen(); return; } if(box.requestFullscreen) box.requestFullscreen().catch(()=>{}); else if(v.webkitEnterFullscreen) v.webkitEnterFullscreen(); });
  // Controls fade away while it plays; a touch or mouse move brings them back.
  let idle; const wake=()=>{ root.classList.remove('idle'); clearTimeout(idle); idle=setTimeout(()=>root.classList.add('idle'),2600); };
  root.querySelector('.vid').addEventListener('pointermove',wake); root.querySelector('.vid').addEventListener('pointerdown',wake); v.addEventListener('play',wake); v.addEventListener('pause',()=>root.classList.remove('idle'));
  root.querySelector('.vid video').addEventListener('click',()=>{ if(state==='on') P.toggle(); });
  const P=makePlayer(root,v,{select:i=>markChap(root,i),
    paint:f=>{ mapUpdate(mapBox,f); ring(root.querySelector('[data-ring="vol"]'),v.muted?0:P.vol/10,(v.muted?0:P.vol*10)+'%'); ring(root.querySelector('[data-ring="rate"]'),(P.ri+1)/RATES.length,rateText(RATES[P.ri]));
      const n=VIDEOS[P.nextIdx()]; root.querySelector('[data-next-title]').textContent=n.title; root.querySelector('[data-next-art]').style.backgroundImage=`url(${n.poster})`; }});
  ambient(v,(r,g,b)=>{ const m=Math.max(r,g,b)||1, k=Math.min(1.7,210/m); root.style.setProperty('--glow',`rgb(${Math.min(255,r*k)|0},${Math.min(255,g*k)|0},${Math.min(255,b*k)|0})`); });
  clock(root); P.load(0);
})();
