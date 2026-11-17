/* Picture 248 C · Tap to drive (Nov 17, 2026, Loudjier: "build C").
   Computers 1200px and wider. A car stays parked on an Atlanta street. When someone taps a monthly
   payment, the parked car drives off and a car that fits drives in, brakes, and flashes its lights.
   window.DRIVE (from home2.py) has, per car, where its wheels and headlights are in the picture
   (percent), which way the photo faces, and whether it is shown mirrored so every car drives left to right. */
(function () {
  var D = window.DRIVE || {}, st = document.getElementById('stageC'), tag = document.getElementById('ctag');
  if (!st || !tag) return;
  var wide = matchMedia('(min-width:1200px)'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IN = [.15, .7, .25, 1], OUT = [.55, 0, .9, .45], TIN = 1150, TOUT = 800, GAP = 60, FLOOR = 528;
  var cur = null, busy = false, want = null, render = null;

  function el(t, c, p) { var e = document.createElement(t); if (c) e.className = c; if (p) p.appendChild(e); return e; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function bez(p) {
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var lo = 0, hi = 1, t = .5;
      for (var n = 0; n < 30; n++) { t = (lo + hi) / 2; var bx = 3 * (1 - t) * (1 - t) * t * p[0] + 3 * (1 - t) * t * t * p[2] + t * t * t; if (bx < x) lo = t; else hi = t; }
      return 3 * (1 - t) * (1 - t) * t * p[1] + 3 * (1 - t) * t * t * p[3] + t * t * t;
    };
  }
  var eIn = bez(IN), eOut = bez(OUT);
  function ease(p) { return 'cubic-bezier(' + p.join(',') + ')'; }
  // Where the car stops (middle of the right side) and how big cars are for this box width.
  function geo() { var W = st.clientWidth, sw = Math.max(200, W - 396); return { W: W, cx: W - 16 - sw / 2, s: Math.min(1, (sw + 40) / 440) }; }
  function place() { var cx = geo().cx; st.style.setProperty('--cx', cx + 'px'); if (cur && !busy) cur.el.style.left = cx + 'px'; }

  // How long after the last car starts leaving the next one can start coming, so they always keep GAP px apart.
  function safeDelay(P, cw, from) {
    for (var d = 0; d < 4000; d += 50) {
      var ok = true;
      for (var t = d; t < d + TIN; t += 20) {
        if (t >= TOUT) break; // the old car is out of the box by then
        var xp = P.to * eOut(t / TOUT), xn = from * (1 - eIn((t - d) / TIN));
        if ((xp - P.cw / 2) - (xn + cw / 2) < GAP) { ok = false; break; }
      }
      if (ok) return d;
    }
    return 4000;
  }

  function make(c) {
    var d = D[c.id] || { face: 1, wheels: [], lights: [] }, g = geo();
    var car = el('div', 'dcar', st), body = el('div', 'dbody', car);
    car.style.visibility = 'hidden'; car.style.left = g.cx + 'px';
    el('div', 'dshadow', body);
    var host = body; if (d.flip) { host = el('div', 'dflip', body); }
    (d.wheels || []).forEach(function (Q) { var t = el('i', 'dtyre', host); t.style.left = Q.x + '%'; t.style.top = Math.min(100, Q.y + Q.h * .66) + '%'; t.style.width = (Q.w * 1.9) + '%'; });
    var img = el('img', 'dimg', host); img.alt = c.name; img.src = '/assets/cutouts/' + c.id + '.webp';
    return new Promise(function (resolve) {
      function ready() {
        var asp = img.naturalWidth / img.naturalHeight || 2;
        // Same size: every car covers about the same area, whatever the shape of its photo.
        var cw = Math.min(380, Math.sqrt(340 * 178 * asp)) * g.s, ch = cw / asp, lights = [], wheels = [];
        car.style.width = cw + 'px'; car.style.marginLeft = (-cw / 2) + 'px'; car.style.top = (FLOOR - ch + 4) + 'px';
        (d.lights || []).forEach(function (L, i) {
          var h = el('i', 'dhl', host); h.style.left = L.x + '%'; h.style.top = L.y + '%'; h.style.width = (L.w * cw / 100 * 2.3) + 'px'; h.style.height = (L.h * cw / 100 * 3.8) + 'px'; lights.push(h);
          if (i === 0) { var b = el('i', 'dbeam', host); b.style.top = L.y + '%'; if (d.face > 0) b.style.left = L.x + '%'; else { b.style.left = (L.x - 50) + '%'; b.style.transform = 'translateY(-50%) scaleX(-1)'; } lights.push(b); }
        });
        // Spinning wheels: a round copy of each rim, squashed back into the wheel's oval.
        (d.wheels || []).forEach(function (Q) {
          var wpx = Q.w * cw / 100 * .92, hpx = Q.h * ch / 100 * .92, x = Q.x * cw / 100, y = Q.y * ch / 100, kx = hpx / wpx;
          var o = el('div', 'dwh', host); o.style.cssText += 'left:' + (x - wpx / 2) + 'px;top:' + (y - hpx / 2) + 'px;width:' + wpx + 'px;height:' + hpx + 'px';
          var r = el('i', '', o); r.style.cssText += 'width:' + hpx + 'px;height:' + hpx + 'px;margin:' + (-hpx / 2) + 'px 0 0 ' + (-hpx / 2) + 'px;background-image:url(' + img.src + ');background-size:' + (cw * kx) + 'px ' + ch + 'px;background-position:' + (-(x * kx - hpx / 2)) + 'px ' + (-(y - hpx / 2)) + 'px;transform:scaleX(' + (1 / kx) + ')';
          wheels.push({ el: r, k: 1 / kx, circ: Math.PI * hpx });
        });
        (d.cover || []).forEach(function (Q) { var p = el('i', 'dplate', host); p.style.cssText += 'left:' + Q.x + '%;top:' + Q.y + '%;width:' + Q.w + '%;height:' + Q.h + '%' + (Q.c ? ';background:' + Q.c + ';border-radius:' + (Q.r || '4px') + ';box-shadow:none' : ''); });
        resolve({ el: car, body: body, lights: lights, wheels: wheels, c: c, d: d, cw: cw });
      }
      if (img.complete && img.naturalWidth) ready(); else { img.onload = ready; img.onerror = ready; }
    });
  }
  function go(e, frames, ms, ez) { return e.animate(frames, { duration: ms, easing: ez, fill: 'forwards' }).finished; }
  function spin(k, dist, ms, ez, entering) {
    k.wheels.forEach(function (w) {
      var t = dist / w.circ * 360 * (k.d.face || 1), a = entering ? -t : 0, b = entering ? 0 : t;
      w.el.animate([{ transform: 'scaleX(' + w.k + ') rotate(' + a + 'deg)' }, { transform: 'scaleX(' + w.k + ') rotate(' + b + 'deg)' }], { duration: ms, easing: ez, fill: 'forwards' });
    });
  }
  function flash(k) {
    var kf = [{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: .15, offset: .26 }, { opacity: 1, offset: .4 }, { opacity: .15, offset: .54 }, { opacity: 1, offset: .7 }, { opacity: .45 }];
    k.lights.forEach(function (h) { h.animate(kf, { duration: 1300, fill: 'forwards' }); });
  }
  function moving(on) { st.classList.toggle('moving', on); }
  function blur(k, on) { k.el.style.filter = on ? 'url(#dmb)' : ''; var f = document.getElementById('dmbv'); if (f) f.setAttribute('stdDeviation', on ? '5 0' : '0 0'); }
  function showTag(c) { if (render) render(c); tag.classList.add('show'); }

  async function park(c) {
    var k = await make(c); k.el.style.visibility = ''; k.lights.forEach(function (h) { h.style.opacity = .45; }); cur = k; showTag(c);
  }
  async function driveTo(c) {
    busy = true; tag.classList.remove('show');
    var k = await make(c), from = -(geo().cx + k.cw / 2 + 30);
    k.el.style.transform = 'translateX(' + from + 'px)'; k.el.style.visibility = '';
    if (cur) {
      var old = cur, to = geo().W - geo().cx + old.cw / 2 + 30, P = { t0: performance.now(), to: to, cw: old.cw };
      moving(true); blur(old, true); spin(old, to, TOUT, ease(OUT), false);
      go(old.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(' + to + 'px)' }], TOUT, ease(OUT)).then(function () { old.el.remove(); });
      var wait = P.t0 + safeDelay(P, k.cw, from) - performance.now(); if (wait > 0) await sleep(wait);
    }
    cur = k; moving(true); blur(k, true); spin(k, -from, TIN, ease(IN), true);
    await go(k.el, [{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(0)' }], TIN, ease(IN));
    blur(k, false); moving(false);
    await go(k.body, [{ transform: 'rotate(0)' }, { transform: 'rotate(.9deg)' }, { transform: 'rotate(0)' }], 340, 'ease-out');
    showTag(c); await sleep(150); flash(k); await sleep(200);
    busy = false; if (want) { var w = want; want = null; show(w); }
  }
  function show(c) {
    if (!c) return;
    if (busy) { want = c; return; }
    if (cur && cur.c.id === c.id) { cur.c = c; showTag(c); flash(cur); go(cur.body, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], 380, 'ease-out'); return; }
    if (!cur || still || !D[c.id] || !D[cur.c.id]) { if (cur) cur.el.remove(); cur = null; park(c); return; }
    driveTo(c);
  }
  // A car with no wheel data can't drive nicely: it just appears, parked.
  window.Drive = {
    on: function () { return wide.matches; },
    has: function (id) { return !!D[id]; },
    show: function (c, r) { render = r || render; place(); show(c); }
  };
  place(); addEventListener('resize', place);
})();
