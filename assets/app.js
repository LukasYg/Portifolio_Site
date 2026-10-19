// ---------- Filtros ----------
  const filtros = document.querySelectorAll('.filtro');
  const itens = document.querySelectorAll('.item');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      const cat = btn.dataset.filtro;
      itens.forEach(it => {
        const mostra = cat === 'todos' || it.dataset.cat === cat;
        it.classList.toggle('oculto', !mostra);
      });
    });
  });

  // ---------- Lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-imagem');
  const lbTit = document.getElementById('lb-titulo');
  const lbDesc = document.getElementById('lb-desc');

  itens.forEach(it => {
    it.addEventListener('click', () => {
      const thumb = it.querySelector('.thumb');
      lbImg.style.backgroundImage = thumb.style.backgroundImage;
      lbTit.textContent = it.dataset.titulo || '';
      lbDesc.textContent = it.dataset.desc || '';
      const lbLink = document.getElementById('lb-link');
      if (it.dataset.link) { lbLink.href = it.dataset.link; lbLink.style.display = 'inline-block'; }
      else { lbLink.style.display = 'none'; }
      lb.classList.add('aberto');
    });
  });
  function fecharLb() { lb.classList.remove('aberto'); }
  document.getElementById('fechar').addEventListener('click', fecharLb);
  lb.addEventListener('click', e => { if (e.target === lb) fecharLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharLb(); });

  // ---------- Revelar ao rolar ----------
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  function iniciarReveals() { document.querySelectorAll('.revelar').forEach(el => obs.observe(el)); }

  // ---------- Barra de progresso ----------
  const progressEl = document.getElementById('progress');
  let agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      if (progressEl) progressEl.style.width = (p * 100) + '%';
      agendado = false;
    });
  }
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  // ---------- Spotlight segue o mouse ----------
  const spot = document.getElementById('spotlight');
  if (spot) {
    addEventListener('mousemove', (e) => {
      spot.style.opacity = '1';
      spot.style.left = e.clientX + 'px';
      spot.style.top = e.clientY + 'px';
    }, { passive: true });
    addEventListener('mouseleave', () => { spot.style.opacity = '0'; });
  }

  // ---------- Contadores das estatisticas ----------
  function formatar(v, dec) { return v.toFixed(dec).replace('.', ','); }
  const obsCont = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      obsCont.unobserve(el);
      const raw = el.textContent.trim();
      const m = raw.match(/^([\d.,]+)(.*)$/);
      if (!m) return;
      const ns = m[1].replace(',', '.');
      const suf = m[2];
      const alvo = parseFloat(ns);
      const dec = (ns.split('.')[1] || '').length;
      const t0 = performance.now();
      const dur = 2600;
      const passo = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = formatar(alvo * e, dec) + suf;
        if (k < 1) requestAnimationFrame(passo); else el.textContent = raw;
      };
      requestAnimationFrame(passo);
    });
  }, { threshold: 0.6 });
  function iniciarContadores() { document.querySelectorAll('.stats strong').forEach((c) => obsCont.observe(c)); }
  window.__intro = { iniciar: function () { iniciarReveals(); iniciarContadores(); } };

  // ---------- Revelar em cascata + tilt nos cards ----------
  document.querySelectorAll('.grid .item').forEach((el, i) => {
    el.style.transitionDelay = (i * 55) + 'ms';
    el.addEventListener('mousemove', (ev) => {
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(760px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg) translateY(-8px) scale(1.05)';
      el.style.zIndex = '6';
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.zIndex = ''; });
  });

  // ---------- Claquete / Gate de entrada ----------
  (function () {
    const pre = document.getElementById('preloader');
    const palco = document.getElementById('palco');
    let aberto = false;
    function abrir() {
      if (aberto) return; aberto = true;
      document.body.classList.add('entrou');
      if (palco) palco.classList.add('camera');
      if (window.__player && window.__player.iniciar) window.__player.iniciar();
      if (window.__intro && window.__intro.iniciar) window.__intro.iniciar();
      const h1g = document.querySelector('.hero h1');
      if (h1g) { h1g.classList.add('glitche'); setTimeout(function () { h1g.classList.remove('glitche'); }, 1600); }
      const tagg = document.querySelector('.hero .tag');
      if (tagg) { tagg.classList.add('flick'); setTimeout(function () { tagg.classList.remove('flick'); }, 1600); }
      if (pre) { pre.classList.add('oculto'); setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 900); }
    }
    window.__abrir = abrir;
    ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(function (ev) {
      addEventListener(ev, abrir, { once: true, passive: true });
    });
    setTimeout(abrir, 9000);
  })();

  // ---------- Titulo letra por letra ----------
  (function () {
    const h1 = document.querySelector('.hero h1');
    if (!h1) return;
    const quebrar = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (part === '') return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const palavra = document.createElement('span');
            palavra.className = 'palavra';
            [...part].forEach((ch) => {
              const sp = document.createElement('span');
              sp.className = 'letra';
              sp.textContent = ch;
              palavra.appendChild(sp);
            });
            frag.appendChild(palavra);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { quebrar(child); }
      });
    };
    quebrar(h1);
    h1.querySelectorAll('.letra').forEach((l, i) => { l.style.animationDelay = (0.05 + i * 0.028).toFixed(3) + 's'; });
  })();

  // ---------- Cursor personalizado ----------
  (function () {
    if (matchMedia('(hover: none)').matches) return;
    const anel = document.getElementById('cursor');
    const ponto = document.getElementById('cursor-dot');
    if (!anel || !ponto) return;
    document.body.classList.add('tem-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      ponto.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      anel.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    const alvos = 'a, button, .item, .filtro, .marca, .foto';
    document.querySelectorAll(alvos).forEach((el) => {
      el.addEventListener('mouseenter', () => anel.classList.add('grande'));
      el.addEventListener('mouseleave', () => anel.classList.remove('grande'));
    });
  })();

  // ---------- Parallax ----------
  const paraEls = [];
  document.querySelectorAll('.bts-strip figure').forEach((el, i) => {
    el.style.willChange = 'transform';
    paraEls.push({ el: el, f: (i % 2 ? 0.09 : -0.09) });
  });

  function parallax() {
    const meio = innerHeight / 2;
    paraEls.forEach((item) => {
      const r = item.el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - meio) * item.f;
      item.el.style.transform = 'translateY(' + off.toFixed(1) + 'px)';
    });
  }

  // parallax no scroll
  let paraAgendado = false;
  addEventListener('scroll', () => {
    if (paraAgendado) return;
    paraAgendado = true;
    requestAnimationFrame(() => { parallax(); paraAgendado = false; });
  }, { passive: true });
  addEventListener('resize', parallax);
  parallax();

  // ---------- Abas (Carreira / Estudos) ----------
  document.querySelectorAll('.aba').forEach(function (b) {
    b.addEventListener('click', function () {
      const alvo = b.dataset.aba;
      document.querySelectorAll('.aba').forEach(function (x) { x.classList.toggle('ativa', x === b); });
      document.querySelectorAll('.aba-painel').forEach(function (pl) { pl.classList.toggle('oculto', pl.dataset.painel !== alvo); });
    });
  });

  // ---------- Player de arquivos (abertura + trilha) ----------
  (function () {
    const A = document.getElementById('auAbertura');
    const T = document.getElementById('auTrilha');
    const btn = document.getElementById('somBtn');
    const dica = document.getElementById('somHint');
    if (!A || !T) return;
    let vol = 0.3, tentando = false, tocandoTrilha = false;
    window.__player = { ativo: true, setVolume: null };

    function mostrarDica() { if (dica) dica.classList.remove('oculto'); }
    function esconderDica() { if (dica) dica.classList.add('oculto'); }
    function volA() { return vol * 0.55; }
    function volT() { return vol * 0.32; }
    function aplicarVolume() {
      A.volume = volA(); T.volume = volT();
      A.muted = false; T.muted = false;
      window.__somLigado = vol > 0;
      if (window.__synthVol) window.__synthVol(vol);
    }
    function comSom() { aplicarVolume(); if (btn) btn.classList.add('ativo'); esconderDica(); }

    function fade(el, de, para, dur) {
      const t0 = performance.now();
      function passo(now) {
        const k = Math.min(1, (now - t0) / dur);
        el.volume = Math.max(0, Math.min(1, de + (para - de) * k));
        if (k < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }
    function tocarTrilha() {
      if (tocandoTrilha) return; tocandoTrilha = true;
      T.loop = true; T.volume = 0; T.muted = false;
      const p = T.play(); if (p && p.catch) p.catch(function () {});
      fade(T, 0, volT(), 2200);
      fade(A, A.volume, 0, 2200);
    }

    function tentarTocar() {
      if (tentando || tocandoTrilha) return;
      tentando = true;
      A.muted = false; aplicarVolume();
      const p = A.play();
      if (p && p.then) {
        p.then(function () { tentando = false; comSom(); })
         .catch(function (er) {
            tentando = false;
            if (er && (er.name === 'NotAllowedError' || er.name === 'AbortError')) { aguardar(); }
            else { window.__player.ativo = false; }
         });
      } else { tentando = false; comSom(); }
    }

    function aguardar() {
      mostrarDica();
      const evs = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];
      function h() { evs.forEach(function (e2) { removeEventListener(e2, h); }); tentarTocar(); }
      evs.forEach(function (e2) { addEventListener(e2, h, { passive: true }); });
    }

    A.addEventListener('ended', function () { tocarTrilha(); });
    A.addEventListener('timeupdate', function () {
      if (tocandoTrilha) return;
      const t = A.currentTime;
      if (t >= 2.2 || (isFinite(A.duration) && A.duration - t <= 2.5)) tocarTrilha();
    });
    A.addEventListener('error', function () { window.__player.ativo = false; });
    T.addEventListener('error', function () { window.__player.ativo = false; });
    window.__player.setVolume = function (v) {
      vol = Math.max(0, Math.min(1, v));
      aplicarVolume();
      if (btn) { if (vol > 0) btn.classList.add('ativo'); else btn.classList.remove('ativo'); }
    };
    document.body.classList.add('audio-arquivo');

    window.__player.iniciar = tentarTocar;
  })();

  // ---------- Audio: trilha epica + efeitos de UI ----------
  (function () {
    const btn = document.getElementById('somBtn');
    if (!btn || !(window.AudioContext || window.webkitAudioContext)) return;
    let ctx = null, master = null, sfx = null, bus = null, tocando = false, seqTimer = null, volSynth = 0.7;
    let proximoTempo = 0, passo = 0;
    const BPM = 100, passoDur = 60 / BPM / 4;
    const acordes = [
      { root: 110.00, arp: [220.00, 261.63, 329.63, 440.00], pad: [164.81, 220.00, 329.63] },
      { root: 87.31,  arp: [174.61, 220.00, 261.63, 349.23], pad: [130.81, 174.61, 261.63] },
      { root: 130.81, arp: [261.63, 329.63, 392.00, 523.25], pad: [196.00, 261.63, 392.00] },
      { root: 98.00,  arp: [196.00, 246.94, 293.66, 392.00], pad: [146.83, 196.00, 293.66] }
    ];
    function impulso(dur, decay) {
      const rate = ctx.sampleRate, len = Math.floor(rate * dur);
      const buf = ctx.createBuffer(2, len, rate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
      return buf;
    }
    function montarAudio() {
      const conv = ctx.createConvolver(); conv.buffer = impulso(2.8, 2.2);
      const wet = ctx.createGain(); wet.gain.value = 0.4; conv.connect(wet); wet.connect(master);
      const revIn = ctx.createGain(); revIn.gain.value = 1; revIn.connect(conv);
      bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master); bus.connect(revIn);
    }
    function garantir() {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(ctx.destination);
        montarAudio();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function voz(freq, t, dur, vol, tipo, dest) {
      const o = ctx.createOscillator(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || bus); o.start(t); o.stop(t + dur + 0.03);
    }
    function kick(t) {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(135, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.22);
    }
    function ruido(t, dur, freq, vol, tipo) {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = ctx.createBufferSource(); s.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = tipo || 'highpass'; f.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = vol;
      s.connect(f); f.connect(g); g.connect(bus); s.start(t);
    }
    function tocarPasso() {
      const t = proximoTempo;
      const barra = Math.floor(passo / 16) % 4;
      const ac = acordes[barra];
      const p = passo % 16;
      const b = Math.floor(passo / 16);
      if (b >= 2) { const i = (passo % 8); voz(ac.arp[i % ac.arp.length], t, 0.22, 0.045, 'triangle'); }
      if (p === 0) { voz(ac.root, t, 1.5, 0.16, 'triangle'); ac.pad.forEach(function (f) { voz(f, t, 3.2, 0.035, 'sine'); }); }
      if (p === 3 || p === 6 || p === 11 || p === 14) voz(ac.root, t, 0.35, 0.11, 'triangle');
      if (p === 8) voz(ac.root * 1.5, t, 1.1, 0.13, 'triangle');
      if (b >= 4) {
        if (p === 0 || p === 8) kick(t);
        if (p === 4 || p === 12) ruido(t, 0.16, 1400, 0.18, 'bandpass');
        if (p % 2 === 1) ruido(t, 0.05, 7500, 0.04, 'highpass');
      }
      if (b >= 6 && (p === 0 || p === 10)) voz(ac.arp[(p ? 2 : 0)] * 2, t, 1.6, 0.05, 'sine');
    }
    function agendar() {
      if (!tocando || !ctx) return;
      while (proximoTempo < ctx.currentTime + 0.25) { tocarPasso(); proximoTempo += passoDur; passo++; }
    }
    function tom(freq, dur, vol, tipo, atraso, dest) {
      if (window.__somLigado === false) return;
      garantir();
      const t0 = ctx.currentTime + (atraso || 0);
      const o = ctx.createOscillator(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(dest || sfx); o.start(t0); o.stop(t0 + dur + 0.03);
    }
    function ligar() {
      garantir();
      const t0 = ctx.currentTime;
      master.gain.cancelScheduledValues(t0);
      master.gain.setValueAtTime(0.0001, t0);
      master.gain.linearRampToValueAtTime(0.3 * volSynth / 0.7, t0 + 2.5);
      master.gain.linearRampToValueAtTime(0.62 * volSynth / 0.7, t0 + 40);
      tocando = true; proximoTempo = t0 + 0.12; passo = 0;
      if (!seqTimer) seqTimer = setInterval(agendar, 60);
      btn.classList.add('ativo');
    }
    function desligar() {
      tocando = false;
      if (seqTimer) { clearInterval(seqTimer); seqTimer = null; }
      btn.classList.remove('ativo');
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); }
    }
    const dica = document.getElementById('somHint');
    btn.addEventListener('click', function () {
      if (dica) dica.classList.add('oculto');
      if (window.__player && window.__player.ativo) return;
      tocando ? desligar() : ligar();
    });
    let ultimoHover = 0;
    function hoverSom() { const a = performance.now(); if (a - ultimoHover < 70) return; ultimoHover = a; tom(1200, 0.09, 0.06, 'sine'); tom(1800, 0.07, 0.032, 'sine', 0.02); }
    function cliqueSom() { tom(680, 0.13, 0.095, 'triangle'); tom(1020, 0.15, 0.068, 'sine', 0.05); tom(1360, 0.17, 0.048, 'sine', 0.11); }
    const alvosHover = '.item, .filtro, .marca, .btn, nav a, .aba, .foto-pilha';
    document.querySelectorAll(alvosHover).forEach(function (el) { el.addEventListener('mouseenter', hoverSom); });
    document.querySelectorAll('a, button, .item, .filtro').forEach(function (el) { el.addEventListener('click', cliqueSom); });
    let ultimoRolar = 0;
    addEventListener('wheel', function () {
      if (window.__somLigado === false) return;
      const a = performance.now();
      if (a - ultimoRolar < 65) return;
      ultimoRolar = a;
      tom(780 + Math.random() * 190, 0.06, 0.03, 'sine');
      tom(1560, 0.04, 0.015, 'sine', 0.015);
    }, { passive: true });
    window.__synthVol = function (v) { volSynth = v; if (ctx && master && tocando) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0.62 * v / 0.7, ctx.currentTime + 0.25); } };
    window.__sfx = {
      hit: function () { tom(1500, 0.09, 0.06, 'sine'); tom(2250, 0.11, 0.03, 'sine', 0.04); },
      bonus: function () { tom(1200, 0.09, 0.06, 'sine'); tom(1800, 0.10, 0.05, 'sine', 0.06); tom(2400, 0.14, 0.04, 'sine', 0.12); },
      miss: function () { tom(200, 0.14, 0.045, 'sawtooth'); }
    };
  })();

  // ---------- Minigame (mira) ----------
  (function () {
    const arena = document.getElementById('arena');
    const mira = document.getElementById('mira');
    const ret = document.querySelector('.ret');
    const msg = document.getElementById('arenaMsg');
    const texto = document.getElementById('arenaTexto');
    const btn = document.getElementById('btnJogar');
    const hudTempo = document.getElementById('hudTempo');
    const hudScore = document.getElementById('hudScore');
    const hudPrec = document.getElementById('hudPrec');
    const hudCombo = document.getElementById('hudCombo');
    if (!arena) return;
    const RECORDE = 3200;
    let jogando = false, score = 0, tiros = 0, acertos = 0, combo = 0, tempo = 20, timer = null, spawner = null;
    function sfx(n) { if (window.__sfx && window.__sfx[n]) window.__sfx[n](); }
    function mult() { return Math.min(5, 1 + Math.floor(combo / 4)); }
    function atualizarHud() {
      hudPrec.textContent = (tiros > 0 ? Math.round((acertos / tiros) * 100) : 100) + '%';
      hudScore.textContent = score + ' pts';
      hudCombo.textContent = combo >= 2 ? ('x' + mult() + '  ' + combo + ' seguidos') : '';
    }
    function pop(x, y, txt, bonus) {
      const el = document.createElement('div');
      el.className = 'pop' + (bonus ? ' bonus' : '');
      el.textContent = txt;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      arena.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 820);
    }
    function criarAlvo() {
      if (!jogando) return;
      const bonus = Math.random() < 0.22;
      const tam = bonus ? (24 + Math.random() * 14) : (34 + Math.random() * 36);
      const r = arena.getBoundingClientRect();
      const x = Math.random() * (r.width - tam - 24) + 12;
      const y = Math.random() * (r.height - tam - 74) + 58;
      const el = document.createElement('div');
      el.className = 'alvo' + (bonus ? ' bonus' : '');
      el.style.width = tam + 'px'; el.style.height = tam + 'px';
      el.style.left = x + 'px'; el.style.top = y + 'px';
      mira.appendChild(el);
      let vivo = true;
      const to = setTimeout(function () {
        if (!vivo) return;
        vivo = false; el.classList.add('errou');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
      }, bonus ? 850 : Math.max(680, 1400 - (20 - tempo) * 36));
      el.addEventListener('mousedown', function (ev) {
        ev.stopPropagation();
        if (!jogando || !vivo) return;
        vivo = false; clearTimeout(to);
        tiros++; acertos++; combo++;
        const pontos = (bonus ? 250 : 100) * mult();
        score += pontos;
        pop(x + tam / 2, y + tam / 2, '+' + pontos, bonus);
        atualizarHud();
        sfx(bonus ? 'bonus' : 'hit');
        el.classList.add('errou');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
      });
    }
    arena.addEventListener('mousedown', function () {
      if (!jogando) return;
      tiros++; combo = 0; atualizarHud(); sfx('miss');
    });
    arena.addEventListener('mousemove', function (e) {
      if (!ret) return;
      const r = arena.getBoundingClientRect();
      ret.style.left = (e.clientX - r.left) + 'px';
      ret.style.top = (e.clientY - r.top) + 'px';
    });
    function iniciar() {
      jogando = true; score = 0; tiros = 0; acertos = 0; combo = 0; tempo = 20;
      arena.classList.add('jogando'); document.body.classList.add('mirando');
      atualizarHud(); hudTempo.textContent = '20.0s';
      msg.classList.add('oculto'); mira.innerHTML = '';
      timer = setInterval(function () {
        tempo -= 0.1;
        if (tempo <= 0) { terminar(); return; }
        hudTempo.textContent = tempo.toFixed(1) + 's';
      }, 100);
      spawner = setInterval(criarAlvo, 480);
      criarAlvo(); criarAlvo(); criarAlvo();
    }
    function terminar() {
      jogando = false; arena.classList.remove('jogando'); document.body.classList.remove('mirando');
      clearInterval(timer); clearInterval(spawner);
      mira.innerHTML = ''; hudCombo.textContent = '';
      const pr = tiros > 0 ? Math.round((acertos / tiros) * 100) : 0;
      let rank = 'Continue treinando!';
      if (score >= 2000) rank = 'Mira de elite! 🎯';
      else if (score >= 1200) rank = 'Ótima mira! 🔥';
      else if (score >= 600) rank = 'Boa! 💪';
      const bateu = score > RECORDE ? ' 🎁 Você bateu meu recorde — o presentinho é seu!' : '';
      texto.innerHTML = '<strong>' + score + ' pts</strong> · precisão <strong>' + pr + '%</strong> · ' + rank + bateu;
      btn.textContent = 'Jogar de novo';
      msg.classList.remove('oculto');
    }
    btn.addEventListener('click', iniciar);
  })();
  // ---------- Knob de volume ----------
  (function () {
    const knob = document.getElementById('somBtn');
    if (!knob) return;
    const arco = document.getElementById('kArco');
    const ponteiro = document.getElementById('kPonteiro');
    const pct = document.getElementById('kPct');
    const L = 89.5;
    let vol = 0.3, arrastando = false, inicioY = 0, volInicio = 0;
    function pintar() {
      if (arco) arco.style.strokeDasharray = (L * vol) + ' 200';
      if (ponteiro) ponteiro.style.transform = 'rotate(' + (-135 + vol * 270).toFixed(1) + 'deg)';
      if (pct) pct.textContent = Math.round(vol * 100);
      knob.setAttribute('aria-valuenow', Math.round(vol * 100));
      if (window.__player && window.__player.setVolume) window.__player.setVolume(vol);
    }
    knob.addEventListener('pointerdown', function (e) {
      arrastando = true; inicioY = e.clientY; volInicio = vol;
      try { knob.setPointerCapture(e.pointerId); } catch (err) {}
      knob.classList.add('ativo'); e.preventDefault();
    });
    knob.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      vol = Math.max(0, Math.min(1, volInicio + (inicioY - e.clientY) / 150));
      pintar();
    });
    function soltar(e) {
      if (!arrastando) return;
      arrastando = false;
      try { knob.releasePointerCapture(e.pointerId); } catch (err) {}
      setTimeout(function () { knob.classList.remove('ativo'); }, 1000);
    }
    knob.addEventListener('pointerup', soltar);
    knob.addEventListener('pointercancel', soltar);
    knob.addEventListener('wheel', function (e) {
      e.preventDefault();
      vol = Math.max(0, Math.min(1, vol - e.deltaY / 900));
      pintar();
    }, { passive: false });
    knob.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { vol = Math.min(1, vol + 0.05); pintar(); e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { vol = Math.max(0, vol - 0.05); pintar(); e.preventDefault(); }
    });
    pintar();
  })();
  // ---------- Preview de video no hover (cards de trabalho) ----------
  (function () {
    document.querySelectorAll('.grid .item').forEach(function (card) {
      const link = card.dataset.link || '';
      const m = link.match(/(?:youtu\.be\/|watch\?v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
      if (!m) return;
      const id = m[1];
      let frame = null, timer = null, remTimer = null;
      card.addEventListener('mouseenter', function () {
        clearTimeout(remTimer);
        if (frame) return;
        timer = setTimeout(function () {
          if (frame) return;
          frame = document.createElement('div');
          frame.className = 'prev';
          frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + id + '&modestbranding=1&rel=0&playsinline=1&start=2" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="preview"></iframe>';
          card.classList.add('pv');
          card.appendChild(frame);
          requestAnimationFrame(function () { card.classList.add('prev-ativo'); });
        }, 420);
      });
      card.addEventListener('mouseleave', function () {
        clearTimeout(timer);
        card.classList.remove('prev-ativo'); card.classList.remove('pv');
        remTimer = setTimeout(function () {
          if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
          frame = null;
        }, 420);
      });
    });
  })();

  // ---------- Polaroid: clique troca a foto ----------
  (function () {
    const pilha = document.querySelector('.foto-pilha');
    if (!pilha) return;
    const imgs = [].slice.call(pilha.querySelectorAll('img'));
    if (imgs.length < 2) return;
    const base = imgs.map(function (i) { return i.getAttribute('src'); });
    let idx = 0;
    pilha.title = 'Clique para trocar a foto';
    pilha.addEventListener('click', function () {
      idx = (idx + 1) % base.length;
      const ordem = base.slice(idx).concat(base.slice(0, idx));
      imgs.forEach(function (im, k) { im.setAttribute('src', ordem[k]); });
    });
  })();
  // ---------- Showreel ----------
  (function () {
    const v = document.getElementById('srVideo');
    const b = document.getElementById('srPlay');
    const aviso = document.getElementById('srAviso');
    if (!v || !b) return;
    let semArq = false;
    const src = document.createElement('source');
    src.src = 'assets/showreel.mp4';
    src.type = 'video/mp4';
    src.addEventListener('error', function () { semArq = true; });
    v.appendChild(src);
    v.addEventListener('error', function () { semArq = true; }, true);
    b.addEventListener('click', function () {
      if (semArq || v.error) { if (aviso) aviso.classList.add('mostra'); return; }
      const p = v.play();
      if (p && p.then) {
        p.then(function () { b.style.display = 'none'; v.controls = true; });
        if (p.catch) p.catch(function () { if (aviso) aviso.classList.add('mostra'); });
      } else { b.style.display = 'none'; v.controls = true; }
    });
  })();
