// Website opening (picture 44 · Mix 2, approved Oct 14, 2026): gold V start button with a rev ring.
// About 3 seconds: the starter cranks, the ring fills as the engine revs, everything turns green,
// then it fades into the home page. Only on someone's first visit (remembered in this browser).
// Skip link, or a tap anywhere, skips it. Browsers usually block sound until someone taps, so the
// engine sound plays only when the browser allows it; otherwise the opening is silent.
(function () {
  var root = document.documentElement, open = document.getElementById('opening');
  if (!open || !root.classList.contains('opening')) return;
  var fill = document.getElementById('op-fill');
  var R = 86, C = 100, START = 135, SWEEP = 270, timers = [], raf = 0, done = false;
  function pt(a) { var r = a * Math.PI / 180; return [C + R * Math.cos(r), C + R * Math.sin(r)]; }
  function arc(deg) {
    if (deg <= 0.01) return '';
    var a = pt(START), b = pt(START + deg);
    return 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' A' + R + ' ' + R + ' 0 ' + (deg > 180 ? 1 : 0) + ' 1 ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2);
  }
  document.getElementById('op-track').setAttribute('d', arc(SWEEP));
  try { localStorage.setItem('carvessa:opened', '1'); } catch (e) {}

  // Engine sound made in the browser: a short starter crank, revs that climb with the ring, then idle.
  var ctx = null, out = null;
  function sound() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state !== 'running') { ctx.close(); ctx = null; return; } // blocked until a tap: stay silent
    } catch (e) { ctx = null; return; }
    var t = ctx.currentTime;
    out = ctx.createGain(); out.gain.setValueAtTime(0.0001, t); out.connect(ctx.destination);
    var len = ctx.sampleRate * 0.7, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var n = 0; n < len; n++) d[n] = (Math.random() * 2 - 1) * (0.55 + 0.45 * Math.sin(n / ctx.sampleRate * 2 * Math.PI * 9));
    var crank = ctx.createBufferSource(); crank.buffer = buf;
    var cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 900; cf.Q.value = 0.8;
    var cg = ctx.createGain(); cg.gain.setValueAtTime(0.18, t); cg.gain.linearRampToValueAtTime(0, t + 0.65);
    crank.connect(cf); cf.connect(cg); cg.connect(out); crank.start(t); crank.stop(t + 0.7);
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square';
    var shaper = ctx.createWaveShaper(), curve = new Float32Array(256);
    for (var k = 0; k < 256; k++) curve[k] = Math.tanh(2.5 * (k / 128 - 1));
    shaper.curve = curve;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
    var g2 = ctx.createGain(); g2.gain.value = 0.5;
    o1.connect(shaper); o2.connect(g2); g2.connect(shaper); shaper.connect(lp); lp.connect(out);
    var a = t + 0.45, up = a + 1.35, settle = up + 0.5;
    [o1, o2].forEach(function (o, i) {
      var m = i ? 0.5 : 1;
      o.frequency.setValueAtTime(26 * m, t); o.frequency.setValueAtTime(26 * m, a);
      o.frequency.exponentialRampToValueAtTime(95 * m, up); o.frequency.exponentialRampToValueAtTime(32 * m, settle);
      o.start(t + 0.35); o.stop(t + 3.4);
    });
    lp.frequency.setValueAtTime(380, t); lp.frequency.exponentialRampToValueAtTime(2400, up); lp.frequency.exponentialRampToValueAtTime(520, settle);
    out.gain.setValueAtTime(1, t + 0.01);
    out.gain.exponentialRampToValueAtTime(0.22, t + 0.5); out.gain.exponentialRampToValueAtTime(0.32, up);
    out.gain.exponentialRampToValueAtTime(0.16, settle); out.gain.exponentialRampToValueAtTime(0.0001, t + 3.3);
  }
  function hush() {
    if (!ctx || !out) return;
    try { var t = ctx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); } catch (e) {}
  }

  function end(fast) {
    if (done) return; done = true;
    cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    fill.setAttribute('d', arc(SWEEP)); open.classList.add('lit');
    setTimeout(function () {
      open.classList.add('gone');
      setTimeout(function () { root.classList.remove('opening'); open.remove(); }, 550);
    }, fast ? 150 : 700);
  }
  open.addEventListener('click', function () { hush(); end(true); });
  document.getElementById('op-skip').addEventListener('click', function (e) { e.stopPropagation(); hush(); end(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { hush(); end(true); } });

  // Timeline: 0–0.5 s starter cranks, 0.45–1.8 s ring fills as it revs, 1.8 s green, 2.5 s fade, 3 s home.
  sound();
  var t0 = performance.now() + 450, dur = 1350;
  (function tick(now) {
    if (done) return;
    var k = Math.min(1, Math.max(0, (now - t0) / dur));
    var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    fill.setAttribute('d', arc(SWEEP * e));
    if (k < 1) raf = requestAnimationFrame(tick); else end(false);
  })(performance.now());
})();
