/* ===== Configuration Web3Forms =====
   Créez une clé gratuite sur https://web3forms.com avec l'adresse e-mail du salon, puis collez-la ci-dessous. */
const WEB3FORMS_KEY = "VOTRE_CLE_WEB3FORMS";
const TREATWELL = "https://www.treatwell.be/fr/salon/the-cocoon-by-maite/";

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rot = (x, y, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
  const f1 = n => Math.round(n * 10) / 10;
  const pad = n => String(n).padStart(2, '0');

  /* ---------- Header, menu, retour en haut ---------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#burger'), menu = $('#mobile-menu'), closeBtn = menu.querySelector('.m-close');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) setTimeout(() => closeBtn.focus({ preventScroll: true }), 60);
  }
  burger.addEventListener('click', () => setMenu(true));
  closeBtn.addEventListener('click', () => { setMenu(false); burger.focus(); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width: 1061px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  const toTop = $('#to-top');
  $$('[data-top]').forEach(b => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })));
  if (toTop) { const t = () => toTop.classList.toggle('show', window.scrollY > 700); t(); window.addEventListener('scroll', t, { passive: true }); }
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
  const today = $(`.hours li[data-day="${new Date().getDay()}"]`); if (today) today.classList.add('today');

  function onVisible(el, fn) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: .35 });
    io.observe(el);
  }
  function svgPoint(svg, evt) {
    const p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  /* =====================================================================
     STUDIO ONGLES : le nuancier.
     Une étagère de flacons (dessinés en vectoriel, nets à toutes les tailles).
     On touche un flacon : la teinte envahit le miroir et révèle la vraie
     photo de la pose réalisée au salon.
     ===================================================================== */
  const nailRoot = $('#nail-studio');
  if (nailRoot) {
    const D = [
      { id: 'bordeaux', name: 'Cerise Bordeaux', c: '#6B1525', tech: 'Semi-permanent', price: 'Semi-permanent renforcé · 65 €', desc: "Le rouge profond signature du salon, posé en amande. Élégant toute l'année." },
      { id: 'framboise', name: 'Framboise', c: '#A3123F', tech: 'Semi-permanent', price: 'Semi-permanent renforcé · 65 €', desc: "Un rose framboise intense, entre le rouge et le fuchsia, qui réveille les mains." },
      { id: 'rose', name: 'Rose Bonbon', c: '#F28DAE', tech: 'Gel', price: 'Pose complète de gel · 80 €', desc: "Un rose lumineux et gourmand, superbe sur des ongles longs en amande." },
      { id: 'nude', name: 'Nude Laiteux', c: '#E9C7BA', tech: 'Semi-permanent', price: 'Semi-permanent renforcé · 65 €', desc: "Un voile rosé très doux, pour des mains nettes et naturelles au quotidien." },
      { id: 'coeurs', name: 'Micro-cœurs', c: '#F5D3D1', art: 'hearts', tech: 'Semi-permanent + nail art', price: 'Sur devis selon le motif', desc: "De minuscules cœurs rouges posés à la main sur une base nude, comme un détail secret." },
      { id: 'strass', name: 'Rose & Strass', c: '#F2B3C1', art: 'strass', tech: 'Gel + bijoux', price: 'Sur devis selon le motif', desc: "Une base rose tendre rehaussée de petits strass argentés, posés un à un." },
      { id: 'emeraude', name: 'Émeraude', c: '#0E5A3D', tech: 'Semi-permanent', price: 'Semi-permanent renforcé · 65 €', desc: "Un vert profond et chic, qui sublime les ongles courts et carrés." },
      { id: 'pomme', name: 'Vert Pomme', c: '#4DB46A', tech: 'Semi-permanent', price: 'Semi-permanent renforcé · 65 €', desc: "Un vert vitaminé et joyeux, parfait pour les beaux jours." },
      { id: 'kaki', name: 'Kaki Chromé', c: '#6C7A45', chrome: true, tech: 'Gel + effet chrome', price: 'Pose complète de gel · 80 €', desc: "Un olive aux reflets métalliques, qui change avec la lumière." }
    ];
    const stage = $('.nu-stage', nailRoot), arch = $('.nu-arch', nailRoot), shelf = $('.nu-shelf', nailRoot);
    const imgA = $('.nu-img.a', nailRoot), imgB = $('.nu-img.b', nailRoot), wash = $('.nu-wash', nailRoot);
    const ui = { k: $('#np-k'), title: $('#np-title'), desc: $('#np-desc'), tech: $('#np-tech'), price: $('#np-price'), num: $('#nu-num'), name: $('#nu-name'), hud: $('#hud-motif'), prev: $('#np-prev'), next: $('#np-next') };

    function bottle(d, i) {
      const fill = d.chrome ? `url(#bq-chrome-${i})` : d.c;
      const light = /^#(E|F)/i.test(d.c);
      let art = '';
      if (d.art === 'hearts') art = [[30, 98, 3.4], [47, 112, 2.8], [36, 126, 2.4], [52, 88, 2.2]].map(([x, y, s]) => `<path d="M${x},${y + s * .35} C${x - s * 1.1},${y - s * .35} ${x - s * .45},${y - s * 1.05} ${x},${y - s * .45} C${x + s * .45},${y - s * 1.05} ${x + s * 1.1},${y - s * .35} ${x},${y + s * .35}Z" fill="#C21F38"/>`).join('');
      if (d.art === 'strass') art = [[28, 96, 2.6], [48, 108, 2.1], [36, 124, 1.8], [54, 128, 2.4], [42, 90, 1.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bq-pearl)"/>`).join('');
      return `<svg viewBox="0 0 80 156" aria-hidden="true">
        <defs>
          <linearGradient id="bq-chrome-${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F3A1F"/><stop offset=".42" stop-color="#B9C596"/><stop offset=".6" stop-color="#5F6D3C"/><stop offset="1" stop-color="#29331A"/></linearGradient>
          <linearGradient id="bq-depth-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${light ? .18 : .1}"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${light ? .14 : .32}"/></linearGradient>
          <linearGradient id="bq-cap-${i}" x1="0" x2="1"><stop offset="0" stop-color="#0B0807"/><stop offset=".35" stop-color="#3A2E29"/><stop offset=".55" stop-color="#16110F"/><stop offset="1" stop-color="#050404"/></linearGradient>
          <radialGradient id="bq-pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#D9DCE3"/><stop offset="1" stop-color="#8F939D"/></radialGradient>
        </defs>
        <ellipse cx="40" cy="152" rx="30" ry="3.2" fill="#000" opacity=".45"/>
        <rect x="27" y="4" width="26" height="54" rx="6" fill="url(#bq-cap-${i})"/>
        <rect x="30" y="8" width="4" height="46" rx="2" fill="#fff" opacity=".22"/>
        <rect x="24" y="56" width="32" height="7" rx="2" fill="#C9A15A"/><rect x="24" y="56" width="32" height="2.4" rx="1.2" fill="#F3DCA2" opacity=".8"/>
        <rect x="7" y="62" width="66" height="88" rx="15" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
        <rect x="11" y="68" width="58" height="78" rx="11" fill="${fill}"/>
        ${art}
        <rect x="11" y="68" width="58" height="78" rx="11" fill="url(#bq-depth-${i})"/>
        <rect x="14" y="72" width="7" height="68" rx="3.5" fill="#fff" opacity=".42"/>
        <rect x="59" y="74" width="3" height="40" rx="1.5" fill="#fff" opacity=".18"/>
        <ellipse cx="54" cy="76" rx="5" ry="2.4" fill="#fff" opacity=".55"/>
        <text x="40" y="132" text-anchor="middle" font-family="Italiana, Georgia, serif" font-size="13" fill="${light ? 'rgba(43,31,26,.45)' : 'rgba(255,255,255,.55)'}">C</text>
      </svg>`;
    }
    shelf.innerHTML = D.map((d, i) => `<button class="bottle" type="button" role="radio" aria-checked="false" data-i="${i}" style="--i:${i}">${bottle(d, i)}<span>${d.name}</span></button>`).join('');
    const bottles = $$('.bottle', shelf);
    // précharge les photos
    D.forEach(d => { const im = new Image(); im.src = `images/vitrine-${d.id}.jpg`; });

    let cur = 0, busy = false, front = imgA, back = imgB, auto = null, touched = false;
    function washStyle(d) {
      return d.chrome ? 'linear-gradient(135deg,#2F3A1F,#B9C596 42%,#5F6D3C 60%,#29331A)' : `radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,.38), rgba(255,255,255,0) 42%), radial-gradient(100% 80% at 80% 100%, rgba(0,0,0,.22), rgba(0,0,0,0) 60%), ${d.c}`;
    }
    function info(i) {
      const d = D[i];
      ui.k.textContent = 'Teinte ' + pad(i + 1) + ' / ' + pad(D.length);
      ui.title.textContent = d.name; ui.desc.textContent = d.desc; ui.tech.textContent = d.tech; ui.price.textContent = d.price;
      ui.num.textContent = pad(i + 1); ui.name.textContent = d.name; ui.hud.textContent = d.name;
      bottles.forEach((b, k) => b.setAttribute('aria-checked', String(k === i)));
      stage.style.setProperty('--tint', d.chrome ? '#8A9866' : d.c);
      const bt = bottles[i]; if (shelf.scrollWidth > shelf.clientWidth) shelf.scrollTo({ left: bt.offsetLeft - shelf.clientWidth / 2 + bt.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
    function select(i, fromUser) {
      if (fromUser) { touched = true; stopAuto(); }
      if (i === cur || busy) return;
      busy = true; cur = i; const d = D[i];
      info(i);
      const b = bottles[i], ar = arch.getBoundingClientRect(), br = b.getBoundingClientRect();
      const ox = ((br.left + br.width / 2 - ar.left) / ar.width * 100).toFixed(1) + '%', oy = ((br.top - ar.top) / ar.height * 100).toFixed(1) + '%';
      wash.style.background = washStyle(d);
      const nextSrc = `images/vitrine-${d.id}.jpg`;
      if (reduce) { front.src = nextSrc; busy = false; return; }
      b.classList.remove('pour'); void b.offsetWidth; b.classList.add('pour');
      const fill = wash.animate([{ clipPath: `circle(0% at ${ox} ${oy})` }, { clipPath: `circle(150% at ${ox} ${oy})` }], { duration: 620, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      fill.onfinish = () => {
        back.src = nextSrc;
        const go = () => {
          back.classList.add('on'); front.classList.remove('on');
          [front, back] = [back, front];
          front.animate([{ transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 1400, easing: 'cubic-bezier(.2,.7,.2,1)' });
          const out = wash.animate([{ clipPath: `circle(150% at 50% 0%)` }, { clipPath: `circle(0% at 50% -10%)` }], { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
          out.onfinish = () => { arch.classList.remove('sheen'); void arch.offsetWidth; arch.classList.add('sheen'); busy = false; };
        };
        if (back.complete && back.naturalWidth) go(); else { back.onload = () => { back.onload = null; go(); }; }
      };
    }
    shelf.addEventListener('click', e => { const b = e.target.closest('.bottle'); if (b) select(+b.dataset.i, true); });
    shelf.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); const n = (cur + (e.key === 'ArrowRight' ? 1 : -1) + D.length) % D.length; select(n, true); bottles[n].focus();
    });
    ui.prev.addEventListener('click', () => select((cur - 1 + D.length) % D.length, true));
    ui.next.addEventListener('click', () => select((cur + 1) % D.length, true));
    stage.addEventListener('pointerdown', () => { touched = true; stopAuto(); }, { passive: true });

    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } stage.classList.remove('autoplay'); }
    function startAuto() {
      if (reduce || touched || auto) return;
      stage.classList.add('autoplay');
      auto = setInterval(() => { if (document.hidden) return; select((cur + 1) % D.length, false); }, 3800);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? startAuto() : stopAuto()), { threshold: .45 }).observe(stage);
    }
    front.src = `images/vitrine-${D[0].id}.jpg`; front.classList.add('on');
    wash.style.background = washStyle(D[0]);
    info(0);
  }

  /* =====================================================================
     STUDIO REGARD : de vraies photos avant / après de clientes,
     superposées et alignées sur l'iris, à comparer en glissant.
     ===================================================================== */
  const eyeRoot = $('#eye-studio');
  if (eyeRoot) {
    const stage = $('.ba', eyeRoot), after = $('.ba-after', eyeRoot), handle = $('.ba-handle', eyeRoot);
    const CL = [
      { n: 2, name: 'Rehaussement + sourcils', desc: "Rehaussement et teinture des cils, sourcils restructurés et teintés : le regard est plus net et plus ouvert.", m1: ['Cils', 'Rehaussement + teinte'], m2: ['Sourcils', 'Teinture + épilation'] },
      { n: 3, name: 'Rehaussement de cils', desc: "Les cils naturels sont recourbés depuis la racine et teintés : ils paraissent plus longs, sans mascara.", m1: ['Effet', 'Courbure + teinte'], m2: ['Tenue', 'En moyenne 6 à 8 semaines'] },
      { n: 6, name: 'Rehaussement de cils', desc: "Une courbe nette et régulière, qui dégage la paupière et illumine le regard.", m1: ['Effet', 'Courbure + teinte'], m2: ['Tenue', 'En moyenne 6 à 8 semaines'] },
      { n: 1, name: 'Rehaussement de cils', desc: "Des cils droits transformés en une frange recourbée, visible même de loin.", m1: ['Effet', 'Courbure + teinte'], m2: ['Tenue', 'En moyenne 6 à 8 semaines'] },
      { n: 4, name: 'Rehaussement de cils', desc: "Un résultat naturel : on garde ses cils, on gagne en courbe et en intensité.", m1: ['Effet', 'Courbure + teinte'], m2: ['Tenue', 'En moyenne 6 à 8 semaines'] }
    ];
    const chips = $('#ep-clients');
    chips.innerHTML = CL.map((c, k) => `<button class="chip" type="button" data-c="${k}" aria-pressed="${k === 0}">Cliente ${pad(k + 1)}</button>`).join('');
    let pos = 50, drag = false, curC = 0;
    function setPos(p) {
      pos = Math.max(0, Math.min(100, p));
      after.style.clipPath = `inset(0 0 0 ${pos}%)`;
      handle.style.left = pos + '%';
      handle.setAttribute('aria-valuenow', Math.round(pos));
      $('#hud-split').textContent = Math.round(pos) + ' / ' + (100 - Math.round(pos));
    }
    function setClient(k) {
      curC = k; const c = CL[k];
      stage.classList.add('swap');
      setTimeout(() => {
        $('.ba-before img', eyeRoot).src = `images/regard-${c.n}-avant.jpg`;
        $('.ba-after img', eyeRoot).src = `images/regard-${c.n}-apres.jpg`;
        stage.classList.remove('swap');
      }, reduce ? 0 : 260);
      $('#ep-name').textContent = c.name; $('#ep-desc').textContent = c.desc;
      $('#ep-m1k').textContent = c.m1[0]; $('#ep-m1').textContent = c.m1[1];
      $('#ep-m2k').textContent = c.m2[0]; $('#ep-m2').textContent = c.m2[1];
      $('#hud-client').textContent = 'Cliente ' + pad(k + 1) + ' / ' + pad(CL.length);
      $$('[data-c]', chips).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === k)));
    }
    const fromEvt = e => { const r = stage.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    stage.addEventListener('pointerdown', e => { drag = true; stage.setPointerCapture(e.pointerId); stage.classList.add('dragging'); setPos(fromEvt(e)); });
    stage.addEventListener('pointermove', e => { if (drag) setPos(fromEvt(e)); });
    const end = () => { drag = false; stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { setPos(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { setPos(pos + 5); e.preventDefault(); } });
    chips.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { setClient(+b.dataset.c); demo(); } });
    function demo() {
      if (reduce) return;
      const keys = [[0, pos], [700, 18], [1600, 82], [2300, 50]], t0 = performance.now();
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      (function stepF(now) {
        if (drag) return;
        const t = now - t0; let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
        const [ta, xa] = keys[i], [tb, xb] = keys[i + 1];
        setPos(xa + (xb - xa) * ease(Math.min(1, Math.max(0, (t - ta) / (tb - ta)))));
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(stepF);
      })(t0);
    }
    setClient(0); setPos(50);
    onVisible(stage, demo);
  }

  /* =====================================================================
     STUDIO ÉPILATION : une soie vivante (WebGL), douce comme une peau
     après la cire. On tire une bande : une onde traverse la soie et le
     nom de la zone s'écrit au centre.
     ===================================================================== */
  function Silk(canvas, opts) {
    opts = opts || {};
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return null;
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision highp float;
  uniform vec2 uR;uniform float uT;uniform float uW;uniform vec2 uP;uniform vec2 uM;uniform float uMs;
  uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;
  float h(vec2 p){
    float t=uT*.16;
    vec2 q=p;
    q.x+=.42*sin(p.y*1.6+t*1.3);
    q.y+=.30*sin(p.x*1.2-t*1.1);
    q+= .12*vec2(sin(q.y*3.1+t*2.),cos(q.x*2.7-t*1.7));
    float v=sin(q.x*2.3+q.y*.9+t*2.)*.55
           +sin(-q.x*1.25+q.y*2.6-t*1.4)*.36
           +sin((q.x-q.y*.4)*4.6+t*1.1)*.12
           +sin((q.x+q.y)*7.+t*.7)*.03;
    vec2 dm=p-uM; v+=.16*uMs*exp(-dot(dm,dm)*5.);
    float d=length(p-uP);
    if(uW>=0.) v+=.17*sin(d*9.-uW*8.)*exp(-pow(d-uW*1.15,2.)*5.)*exp(-uW*.75);
    return v;
  }
  void main(){
    vec2 p=(gl_FragCoord.xy*2.-uR)/min(uR.x,uR.y);
    float e=.006;
    float hx=(h(p+vec2(e,0.))-h(p-vec2(e,0.)))/(2.*e);
    float hy=(h(p+vec2(0.,e))-h(p-vec2(0.,e)))/(2.*e);
    vec3 n=normalize(vec3(-hx*.42,-hy*.42,1.));
    vec3 L=normalize(vec3(-.45,.55,.85));
    float diff=clamp(dot(n,L)*.5+.5,0.,1.);
    diff=pow(diff,2.4);
    vec3 H=normalize(L+vec3(0.,0.,1.));
    float spec=pow(clamp(dot(n,H),0.,1.),52.);
    float sheen=pow(clamp(1.-abs(dot(n,normalize(vec3(.6,.8,0.)))),0.,1.),4.);
    vec3 col=mix(uA,uB,smoothstep(.05,.95,diff));
    col+=uC*spec*.5+uC*sheen*.07;
    float lm=max(max(col.r,col.g),col.b);
    if(lm>.84) col*=(.84+(lm-.84)/(1.+(lm-.84)*2.2))/lm;
    float vg=smoothstep(1.9,.25,length(p*vec2(.75,1.)));
    col*=mix(.42,1.,vg);
    col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.018;
    gl_FragColor=vec4(col,1.);
  }`;
    function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; }
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uR', 'uT', 'uW', 'uP', 'uM', 'uMs', 'uA', 'uB', 'uC'].forEach(k => U[k] = gl.getUniformLocation(pr, k));
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    let A = hex(opts.shadow || '#4A2A20'), B = hex(opts.base || '#EDC9B2'), C = hex(opts.light || '#FFF4EA');
    gl.uniform3fv(U.uA, A); gl.uniform3fv(U.uB, B); gl.uniform3fv(U.uC, C);
    let w0 = -1, wp = [0, 0], m = [0, 0], ms = 0, mt = 0, t0 = performance.now(), raf = 0, visible = true, still = !!opts.still;
    function size() { const d = Math.min(2, window.devicePixelRatio || 1) * (opts.scale || .75); const w = Math.max(1, Math.round(canvas.clientWidth * d)), h = Math.max(1, Math.round(canvas.clientHeight * d)); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); } }
    function frame(now) {
      size();
      const t = (now - t0) / 1000;
      ms += ((performance.now() - mt < 900 ? 1 : 0) - ms) * .05;
      gl.uniform2f(U.uR, canvas.width, canvas.height); gl.uniform1f(U.uT, still ? 12 : t);
      gl.uniform1f(U.uW, w0 < 0 ? -1 : (now - w0) / 1000); gl.uniform2f(U.uP, wp[0], wp[1]);
      gl.uniform2f(U.uM, m[0], m[1]); gl.uniform1f(U.uMs, ms);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still && visible) raf = requestAnimationFrame(frame);
    }
    const toP = (x, y) => { const r = canvas.getBoundingClientRect(), mn = Math.min(r.width, r.height); return [((x - r.left) * 2 - r.width) / mn, -((y - r.top) * 2 - r.height) / mn]; };
    canvas.addEventListener('pointermove', e => { m = toP(e.clientX, e.clientY); mt = performance.now(); });
    raf = requestAnimationFrame(frame);
    return {
      wave(x, y) { wp = x === undefined ? [0, 0] : toP(x, y); w0 = performance.now(); if (still) frame(performance.now()); },
      pause() { visible = false; cancelAnimationFrame(raf); },
      resume() { if (!visible) { visible = true; raf = requestAnimationFrame(frame); } },
      colors(a, b, c) { gl.uniform3fv(U.uA, hex(a)); gl.uniform3fv(U.uB, hex(b)); gl.uniform3fv(U.uC, hex(c)); }
    };
  }

  const waxRoot = $('#wax-studio');
  if (waxRoot) {
    const strips = $$('.strip', waxRoot), stage = $('.wax-stage', waxRoot), canvas = $('.silk', waxRoot);
    const hudZone = $('#hud-zone'), title = $('#wx-title'), wName = $('#ww-name'), wK = $('#ww-k'), wPrice = $('#ww-price');
    let open = -1, demoDone = false;
    const silk = Silk(canvas, { still: reduce });
    if (!silk) stage.classList.add('no-gl');
    if (silk && 'IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? silk.resume() : silk.pause())).observe(stage);
    const OPTS = { duration: 760, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' };

    function write(el, text) {
      el.innerHTML = [...text].map((c, k) => `<span style="--d:${k * 28}ms">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
    }
    function peel(i) {
      const b = strips[i], front = $('.strip-front', b), curl = $('.strip-curl', b);
      b.setAttribute('aria-expanded', 'true'); b.parentElement.classList.add('open');
      if (reduce) { front.style.clipPath = 'inset(0 0 0 100%)'; return; }
      front.animate([{ clipPath: 'inset(0 0 0 0%)' }, { clipPath: 'inset(0 0 0 100%)' }], OPTS);
      curl.animate([{ left: '0%', width: '0px', opacity: 1 }, { left: '35%', width: '46px', opacity: 1, offset: .35 }, { left: '100%', width: '0px', opacity: 0 }], OPTS);
    }
    function stick(i) {
      const b = strips[i], front = $('.strip-front', b);
      b.setAttribute('aria-expanded', 'false'); b.parentElement.classList.remove('open');
      if (reduce) { front.style.clipPath = 'inset(0 0 0 0%)'; return; }
      front.animate([{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)' }], { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    }
    function select(i) {
      if (open === i) { stick(i); open = -1; hudZone.textContent = '—'; title.textContent = 'Tirez une bande'; write(wName, 'Peau douce'); wK.textContent = 'Cire tiède · femme'; wPrice.textContent = ''; return; }
      if (open >= 0) stick(open);
      open = i; peel(i);
      const name = $('.strip-under b', strips[i]).textContent;
      hudZone.textContent = name; title.textContent = name;
      wK.textContent = 'Zone ' + pad(i + 1) + ' / ' + pad(strips.length);
      write(wName, name);
      wPrice.textContent = $('.sd-price', strips[i].parentElement).textContent;
      if (silk) silk.wave();
      stage.classList.remove('glint'); void stage.offsetWidth; stage.classList.add('glint');
    }
    strips.forEach((b, i) => b.addEventListener('click', () => { demoDone = true; select(i); }));
    write(wName, 'Peau douce');
    onVisible(stage, () => setTimeout(() => { if (!demoDone && open < 0) select(3); }, 1100));
  }

  /* =====================================================================
     STUDIO VISAGE : le rituel en cinq temps, sur un cadran de lumière.
     ===================================================================== */
  const ritRoot = $('#ritual-studio');
  if (ritRoot) {
    const SKINS = {
      normale: { label: 'Normale', tint: '#FFE9D8', mask: "Un masque éclat pour lisser le teint et lui redonner de la lumière." },
      seche: { label: 'Sèche', tint: '#F5C98F', mask: "Un masque nourrissant et hydratant, pour une peau souple et confortable." },
      mixte: { label: 'Mixte', tint: '#BFE0CB', mask: "Un masque équilibrant qui purifie la zone T sans dessécher les joues." },
      sensible: { label: 'Sensible', tint: '#F4BFCB', mask: "Un masque apaisant aux textures douces, pour calmer les rougeurs." }
    };
    const S = [
      { t: 'Diagnostic', d: "On s'installe dans le fauteuil. Maïté observe votre peau et choisit avec vous les soins adaptés.", img: 'salon.jpg', pos: '35% 50%' },
      { t: 'Nettoyage', d: "Démaquillage et nettoyage en douceur, pour préparer la peau à recevoir les soins.", img: 'soin-nb.jpg', pos: '45% 50%' },
      { t: 'Exfoliation', d: "On affine le grain de peau et on ravive son éclat, sans l'agresser.", img: 'visage-exfo.jpg', pos: '50% 45%' },
      { t: 'Masque', d: '', img: 'soin-detente.jpg', pos: '40% 60%' },
      { t: 'Modelage', d: "Un modelage du visage, du cou et des épaules pour relâcher toutes les tensions.", img: 'maite.jpg', pos: '55% 45%' }
    ];
    const DUR = 3600, GAP = 5, R = 232;
    const stage = $('.rit-stage', ritRoot), svg = $('.rit-dial', ritRoot), imgs = $$('.rp', ritRoot);
    const ui = { n: $('#rit-n'), t: $('#rit-t'), name: $('#rit-name'), desc: $('#rit-desc'), play: $('#rit-play'), hudPlay: $('#hud-play'), hudSkin: $('#hud-skin'), skins: $('#rit-skins'), steps: $('#rit-steps') };
    let skin = 'normale', cur = 0, playing = false, t0 = 0, raf = 0, front = 0;
    S.forEach(s => { const im = new Image(); im.src = 'images/' + s.img; });

    const P = a => { const r = (a - 90) * Math.PI / 180; return [250 + R * Math.cos(r), 250 + R * Math.sin(r)]; };
    const arc = (a0, a1) => { const [x0, y0] = P(a0), [x1, y1] = P(a1); return `M${f1(x0)},${f1(y0)} A${R},${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f1(x1)},${f1(y1)}`; };
    const seg = 360 / S.length;
    let ticks = '';
    for (let k = 0; k < 120; k++) {
      const a = k * 3, r1 = 252, r2 = k % 8 === 0 ? 264 : 258, rr = (a - 90) * Math.PI / 180;
      ticks += `<line x1="${f1(250 + r1 * Math.cos(rr))}" y1="${f1(250 + r1 * Math.sin(rr))}" x2="${f1(250 + r2 * Math.cos(rr))}" y2="${f1(250 + r2 * Math.sin(rr))}" stroke="#FFE9D8" stroke-opacity="${k % 8 === 0 ? .4 : .14}" stroke-width="1"/>`;
    }
    svg.innerHTML = `<defs><filter id="rit-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx="250" cy="250" r="${R}" fill="none" stroke="#FFE9D8" stroke-opacity=".08" stroke-width="1"/>
      ${ticks}
      ${S.map((s, i) => { const a0 = i * seg + GAP / 2, a1 = (i + 1) * seg - GAP / 2, [lx, ly] = (() => { const m = (a0 + a1) / 2, rr = (m - 90) * Math.PI / 180; return [250 + 282 * Math.cos(rr), 250 + 282 * Math.sin(rr)]; })(), anc = lx > 268 ? 'start' : lx < 232 ? 'end' : 'middle';
        return `<g class="rseg" data-i="${i}">
          <path class="rs-base" d="${arc(a0, a1)}" fill="none" stroke-linecap="round"/>
          <path class="rs-fill" d="${arc(a0, a1)}" fill="none" stroke-linecap="round" filter="url(#rit-glow)"/>
          <path class="rs-hit" d="${arc(a0, a1)}" fill="none" stroke="transparent" stroke-width="44"/>
          <text class="rit-lab" x="${f1(lx)}" y="${f1(ly)}" text-anchor="${anc}" dominant-baseline="middle">${pad(i + 1)} · ${s.t.toUpperCase()}</text>
        </g>`; }).join('')}
      <circle class="rit-dot" r="7" fill="#fff" filter="url(#rit-glow)"/>`;
    const segs = $$('.rseg', svg), fills = segs.map(g => $('.rs-fill', g)), dot = $('.rit-dot', svg);
    const lens = fills.map(f => f.getTotalLength());
    fills.forEach((f, i) => { f.style.strokeDasharray = lens[i]; f.style.strokeDashoffset = lens[i]; });

    ui.skins.innerHTML = Object.entries(SKINS).map(([k, v]) => `<button class="chip" type="button" data-skin="${k}" aria-pressed="${k === skin}">${v.label}</button>`).join('');
    ui.steps.innerHTML = S.map((s, i) => `<li><button type="button" data-step="${i}" aria-pressed="false"><span>${pad(i + 1)}</span>${s.t}</button></li>`).join('');

    function desc(i) { return i === 3 ? SKINS[skin].mask : S[i].d; }
    function setProgress(i, p) {
      fills.forEach((f, k) => { f.style.strokeDashoffset = k < i ? 0 : k === i ? lens[k] * (1 - p) : lens[k]; });
      const a = i * seg + GAP / 2 + (seg - GAP) * p, [x, y] = P(a);
      dot.setAttribute('cx', f1(x)); dot.setAttribute('cy', f1(y));
    }
    function show(i) {
      cur = i; const s = S[i];
      ui.n.textContent = pad(i + 1) + ' / ' + pad(S.length); ui.t.textContent = s.t;
      ui.name.textContent = s.t; ui.desc.textContent = desc(i);
      segs.forEach((g, k) => { g.classList.toggle('on', k === i); g.classList.toggle('done', k < i); });
      $$('[data-step]', ui.steps).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      const next = imgs[1 - front], prev = imgs[front];
      next.src = 'images/' + s.img; next.style.objectPosition = s.pos;
      const swap = () => {
        next.classList.add('on'); prev.classList.remove('on'); front = 1 - front;
        if (!reduce) next.animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1.02)' }], { duration: DUR + 800, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
      };
      if (next.complete && next.naturalWidth) swap(); else next.onload = () => { next.onload = null; swap(); };
    }
    function tick(now) {
      const p = Math.min(1, (now - t0) / DUR);
      setProgress(cur, p);
      if (p >= 1) {
        if (cur < S.length - 1) { show(cur + 1); t0 = now; }
        else { stop(true); return; }
      }
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (reduce) { show(cur); setProgress(cur, 1); return; }
      if (cur === S.length - 1 && !playing) show(0);
      playing = true; t0 = performance.now(); stage.classList.add('playing');
      ui.play.textContent = 'Mettre en pause'; ui.hudPlay.textContent = 'Rituel en cours';
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    function stop(ended) {
      playing = false; cancelAnimationFrame(raf); stage.classList.remove('playing');
      ui.play.textContent = ended ? 'Revoir le rituel' : 'Reprendre le rituel';
      ui.hudPlay.textContent = ended ? 'Rituel terminé' : 'Rituel en pause';
      if (ended) setProgress(cur, 1);
    }
    ui.play.addEventListener('click', () => playing ? stop(false) : play());
    function jump(i) { stop(false); show(i); setProgress(i, 1); ui.play.textContent = 'Lancer le rituel'; }
    ui.steps.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (b) jump(+b.dataset.step); });
    segs.forEach((g, i) => g.addEventListener('click', () => jump(i)));
    ui.skins.addEventListener('click', e => {
      const b = e.target.closest('[data-skin]'); if (!b) return;
      skin = b.dataset.skin;
      $$('[data-skin]', ui.skins).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      stage.style.setProperty('--tint', SKINS[skin].tint); ui.hudSkin.textContent = SKINS[skin].label;
      if (cur === 3) ui.desc.textContent = desc(3);
      else { stop(false); show(3); setProgress(3, 1); }
    });
    show(0); setProgress(0, 0);
    onVisible(stage, () => setTimeout(play, 500));
  }

  /* ---------- Infos : ouvert / fermé en direct ---------- */
  const nowEl = $('#now');
  if (nowEl) {
    const OPEN = { 1: 1, 4: 1, 5: 1, 6: 1 }, NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const d = new Date(), day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const tday = $(`.week [data-day="${day}"]`); if (tday) tday.classList.add('today');
    let txt, open = false;
    if (OPEN[day] && m >= 540 && m < 1080) { open = true; txt = "Ouvert · jusqu'à 18:00"; }
    else if (OPEN[day] && m < 540) txt = "Ouvre aujourd'hui à 9:00";
    else { let n = (day + 1) % 7, k = 1; while (!OPEN[n]) { n = (n + 1) % 7; k++; } txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : NAMES[n]) + ' à 9:00'; }
    nowEl.classList.toggle('open', open); $('span', nowEl).textContent = txt;
  }

  /* ---------- Formulaire de contact (Web3Forms) ---------- */
  const form = $('#form-contact');
  if (form) {
    const box = $('.status', form), btn = $('button[type="submit"]', form);
    const show = (type, msg) => { box.className = 'status show ' + type; box.textContent = msg; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); show('err', 'Merci de compléter les champs obligatoires.'); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.botcheck) return; delete data.botcheck;
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY === 'VOTRE_CLE_WEB3FORMS') { show('info', "Formulaire prêt. Ajoutez votre clé Web3Forms dans script.js pour activer l'envoi."); return; }
      btn.disabled = true; const label = btn.textContent; btn.textContent = 'Envoi…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ access_key: WEB3FORMS_KEY, subject: 'Nouveau message – The Cocoon (' + data.sujet + ')', from_name: 'Site The Cocoon' }, data)) });
        const json = await res.json();
        if (json.success) { show('ok', 'Merci ! Votre message est bien envoyé. Maïté vous répond rapidement.'); form.reset(); }
        else show('err', "L'envoi a échoué (" + (json.message || 'erreur inconnue') + "). Réessayez dans un instant.");
      } catch (err) { show('err', "Impossible d'envoyer pour le moment. Vérifiez votre connexion et réessayez."); }
      finally { btn.disabled = false; btn.textContent = label; }
    });
  }
})();
