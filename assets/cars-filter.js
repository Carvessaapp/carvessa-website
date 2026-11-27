/* All cars page with filters (picture 311, Nov 27, 2026). Data from window.CF (built from the app's own prices and payments). */
(function () {
  var D = window.CF, root = document.getElementById('cf'); if (!D || !root) return;
  var W = D.w, BASE = root.getAttribute('data-base'), $ = function (id) { return document.getElementById(id); };
  var YS = []; D.cars.forEach(function (c) { c.y.forEach(function (y) { if (YS.indexOf(y[0]) < 0) YS.push(y[0]); }); }); YS.sort();
  var st = { t: [], nu: '', y1: YS[0], y2: YS[YS.length - 1], mode: 'pay', max: 0, seats: '', f: [], sort: 'pay' };
  var LIM = { pay: [200, 1500, 25], price: [10000, 100000, 1000] };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  function read() {
    var q = new URLSearchParams(location.search);
    if (q.get('type')) st.t = q.get('type').split(',').filter(Boolean);
    if (q.get('nu')) st.nu = q.get('nu'); if (q.get('y1')) st.y1 = +q.get('y1'); if (q.get('y2')) st.y2 = +q.get('y2');
    if (q.get('mode') === 'price') st.mode = 'price'; if (q.get('max')) st.max = +q.get('max');
    if (q.get('seats')) st.seats = q.get('seats'); if (q.get('f')) st.f = q.get('f').split(',').filter(Boolean); if (q.get('sort')) st.sort = q.get('sort');
  }
  function write() {
    var q = new URLSearchParams(); if (st.t.length) q.set('type', st.t.join(',')); if (st.nu) q.set('nu', st.nu);
    if (st.y1 !== YS[0]) q.set('y1', st.y1); if (st.y2 !== YS[YS.length - 1]) q.set('y2', st.y2);
    if (st.mode === 'price') q.set('mode', 'price'); if (st.max && st.max < LIM[st.mode][1]) q.set('max', st.max);
    if (st.seats) q.set('seats', st.seats); if (st.f.length) q.set('f', st.f.join(',')); if (st.sort !== 'pay') q.set('sort', st.sort);
    var s = q.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }
  function isType(c, t) { return t === 'Hybrid' ? c.green === 'hybrid' : t === 'Electric' ? c.green === 'ev' : t === 'Luxury' ? c.lux : c.body === t; }
  function pick(c) { // the newest year that fits every filter
    if (st.t.length && !st.t.some(function (t) { return isType(c, t); })) return null;
    if (st.seats && c.seats < +st.seats) return null;
    if (st.f.indexOf('green') >= 0 && !c.green) return null; if (st.f.indexOf('awd') >= 0 && !c.awd) return null;
    var best = null;
    c.y.forEach(function (y) {
      var yr = y[0], price = y[1], isNew = y[2], pay = y[3], stars = y[4], rec = y[5];
      if (yr < st.y1 || yr > st.y2) return; if (st.nu === 'new' && !isNew) return; if (st.nu === 'used' && isNew) return;
      if (st.max && st.max < LIM[st.mode][1] && (st.mode === 'pay' ? pay > st.max : price > st.max)) return;
      if (st.f.indexOf('cp') >= 0 && !(c.cp && yr >= 2020)) return;
      if (st.f.indexOf('safe') >= 0 && stars !== 5) return; if (st.f.indexOf('norec') >= 0 && rec !== 0) return;
      if (!best || yr > best[0]) best = y;
    });
    return best;
  }
  function card(c, y) {
    var pic = c.pic ? '<img src="/assets/cutouts/' + c.id + '.webp" alt="" loading="lazy">' : 'Photo coming soon';
    var f = ['<span>' + c.seats + ' ' + W.seat + '</span>']; if (c.awd) f.push('<span>' + W.awdl + '</span>'); if (c.green) f.push('<span>' + W.kinds[c.green === 'ev' ? 'Electric' : 'Hybrid'] + '</span>');
    return '<a class="cfc" href="' + BASE + c.slug + '/"><div class="pic">' + pic + '</div><div class="in"><small>' + y[0] + ' · ' + (y[2] ? W.newl : W.usedl).toUpperCase() + '</small><h3>' + c.name + '</h3>' +
      '<div class="pr"><b>' + money(y[1]) + '</b><span>≈ ' + money(y[3]) + W.mo + '</span></div><div class="f">' + f.join('') + '</div></div></a>';
  }
  function draw() {
    var out = []; D.cars.forEach(function (c) { var y = pick(c); if (y) out.push([c, y]); });
    out.sort(function (a, b) { return st.sort === 'price' ? a[1][1] - b[1][1] : st.sort === 'new' ? b[1][0] - a[1][0] || a[1][3] - b[1][3] : a[1][3] - b[1][3]; });
    $('cfGrid').innerHTML = out.length ? out.map(function (x) { return card(x[0], x[1]); }).join('') : '<div class="cf-none">' + W.none + '</div>';
    $('cfCount').textContent = W.fit.replace('{n}', out.length); $('cfShow').textContent = W.show.replace('{n}', out.length);
    // pills
    var p = []; st.t.forEach(function (t) { p.push(['t:' + t, W.kinds[t] || t]); });
    if (st.nu) p.push(['nu', st.nu === 'new' ? W.new : W.used]);
    if (st.y1 !== YS[0] || st.y2 !== YS[YS.length - 1]) p.push(['y', st.y1 + '–' + st.y2]);
    if (st.max && st.max < LIM[st.mode][1]) p.push(['max', W.upto + ' ' + money(st.max) + (st.mode === 'pay' ? W.mo : '')]);
    if (st.seats) p.push(['seats', st.seats === '7' ? W.s7 : st.seats + '+']);
    var FN = { green: W.green, awd: W.awd, cp: 'CarPlay', safe: '5★', norec: W.norec.split(' (')[0] }; st.f.forEach(function (k) { p.push(['f:' + k, FN[k]]); });
    $('cfPills').innerHTML = p.map(function (x) { return '<button type="button" data-p="' + x[0] + '">' + x[1] + ' ✕</button>'; }).join('');
    $('cfN').textContent = p.length ? '(' + p.length + ')' : '';
    write(); sync();
  }
  function sync() { // panel shows the current choices
    [].forEach.call($('cfType').children, function (b) { b.classList.toggle('on', st.t.indexOf(b.getAttribute('data-cft')) >= 0); });
    [['cfNu', st.nu], ['cfMode', st.mode], ['cfSeats', st.seats]].forEach(function (g) { [].forEach.call($(g[0]).children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === g[1]); }); });
    $('cfY1').value = st.y1; $('cfY2').value = st.y2; $('cfSort').value = st.sort;
    var L = LIM[st.mode], r = $('cfMax'); r.min = L[0]; r.max = L[1]; r.step = L[2]; r.value = st.max || L[1];
    $('cfMin').textContent = money(L[0]) + (st.mode === 'pay' ? W.mo : '');
    $('cfMaxL').textContent = (!st.max || st.max >= L[1]) ? money(L[1]) + '+' + (st.mode === 'pay' ? W.mo : '') : W.upto + ' ' + money(st.max) + (st.mode === 'pay' ? W.mo : '');
    [].forEach.call(root.querySelectorAll('[data-f]'), function (x) { x.checked = st.f.indexOf(x.getAttribute('data-f')) >= 0; });
  }
  $('cfType').onclick = function (e) { var b = e.target.closest('[data-cft]'); if (!b) return; var t = b.getAttribute('data-cft'), i = st.t.indexOf(t); if (i >= 0) st.t.splice(i, 1); else st.t.push(t); draw(); };
  [['cfNu', 'nu'], ['cfSeats', 'seats']].forEach(function (g) { $(g[0]).onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) { st[g[1]] = b.getAttribute('data-v'); draw(); } }; });
  $('cfMode').onclick = function (e) { var b = e.target.closest('[data-v]'); if (b && b.getAttribute('data-v') !== st.mode) { st.mode = b.getAttribute('data-v'); st.max = 0; draw(); } };
  $('cfY1').onchange = function () { st.y1 = +this.value; if (st.y1 > st.y2) st.y2 = st.y1; draw(); };
  $('cfY2').onchange = function () { st.y2 = +this.value; if (st.y2 < st.y1) st.y1 = st.y2; draw(); };
  $('cfMax').oninput = function () { st.max = +this.value; draw(); };
  $('cfSort').onchange = function () { st.sort = this.value; draw(); };
  root.addEventListener('change', function (e) { var x = e.target.closest('[data-f]'); if (!x) return; var k = x.getAttribute('data-f'), i = st.f.indexOf(k); if (x.checked && i < 0) st.f.push(k); if (!x.checked && i >= 0) st.f.splice(i, 1); draw(); });
  $('cfPills').onclick = function (e) { var b = e.target.closest('[data-p]'); if (!b) return; var k = b.getAttribute('data-p');
    if (k.indexOf('t:') === 0) st.t.splice(st.t.indexOf(k.slice(2)), 1); else if (k.indexOf('f:') === 0) st.f.splice(st.f.indexOf(k.slice(2)), 1);
    else if (k === 'y') { st.y1 = YS[0]; st.y2 = YS[YS.length - 1]; } else if (k === 'max') st.max = 0; else st[k] = ''; draw(); };
  $('cfClear').onclick = function () { st = { t: [], nu: '', y1: YS[0], y2: YS[YS.length - 1], mode: 'pay', max: 0, seats: '', f: [], sort: st.sort }; draw(); };
  var open = function (on) { root.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : ''; };
  $('cfOpen').onclick = function () { open(true); }; $('cfClose').onclick = $('cfShow').onclick = function () { open(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
  read(); draw();
})();
