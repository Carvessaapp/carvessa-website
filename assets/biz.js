// Business pages (pictures 269–271, Nov 18, 2026): join (agree → account → page), edit, and the public page.
// Talks to Supabase with the public key; the database rules decide what each person may read or change
// (migration 026: pages start 'pending', only Carvessa makes them live).
(function () {
  var C = window.BZ || {};
  var sb = window.supabase && window.supabase.createClient(C.url, C.key);
  var root = document.getElementById('bz');
  if (!sb || !root) return;
  var mode = root.getAttribute('data-mode');
  var WALLS = {
    sunset: 'linear-gradient(135deg,#7A2E1F,#C2542F 55%,#E8A15A)',
    ocean: 'linear-gradient(135deg,#123A78,#1F5FBF 60%,#6FB8E0)',
    forest: 'linear-gradient(135deg,#0F4227,#1C6B40 55%,#7CC79A)',
    night: 'linear-gradient(135deg,#0B1026,#1B2F66 60%,#5A3D6E)',
    steel: 'linear-gradient(135deg,#2B3A55,#5E6F8E 60%,#A9B4C6)'
  };
  var KINDS = [['repair', 'Repair shop'], ['tires', 'Tire shop'], ['dealer', 'Car dealer'], ['credit_union', 'Credit union'], ['insurance', 'Insurance'], ['other', 'Other']];
  var kindName = function (k) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0] === k) return KINDS[i][1]; return 'Business'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return n == null || n === '' ? '' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  var photoUrl = function (p) { return C.url + '/storage/v1/object/public/business-photos/' + p.split('/').map(encodeURIComponent).join('/'); };
  var wallCss = function (w) { return WALLS[w] ? WALLS[w] : 'url("' + photoUrl(w) + '") center/cover'; };
  var initials = function (n) { return (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(''); };
  var q = new URLSearchParams(location.search);

  // Photo → smaller JPEG (max 1600 px) so it stays well under the 3 MB limit.
  function shrink(file) {
    return new Promise(function (ok, bad) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? ok(b) : bad(new Error('photo')); }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { bad(new Error('photo')); };
      img.src = url;
    });
  }
  async function upload(uid, file) {
    var blob = await shrink(file);
    var path = uid + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    var r = await sb.storage.from('business-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (r.error) throw r.error;
    return path;
  }

  // ---------- The business form (join step 3 and edit) ----------
  function form(b, svcs, onSave) {
    var st = { kind: b.kind || 'repair', wall: b.wallpaper || 'sunset', photos: (b.photos || []).slice(), svcs: svcs.length ? svcs.map(function (s) { return { name: s.name, price: s.price_from == null ? '' : s.price_from }; }) : [{ name: '', price: '' }] };
    root.querySelector('#bzForm').innerHTML =
      '<label class="bz-f"><span>Business name</span><input id="fName" maxlength="80" value="' + esc(b.name) + '" autocomplete="organization"></label>' +
      '<div class="bz-f"><span>What kind of business?</span><div class="bz-chips" id="fKind"></div></div>' +
      '<label class="bz-f"><span>Address</span><input id="fAddr" maxlength="160" value="' + esc(b.address) + '" autocomplete="street-address"></label>' +
      '<label class="bz-f"><span>City</span><input id="fCity" maxlength="60" value="' + esc(b.city || 'Atlanta') + '"></label>' +
      '<label class="bz-f"><span>Phone</span><input id="fPhone" maxlength="30" value="' + esc(b.phone) + '" inputmode="tel" autocomplete="tel"></label>' +
      '<label class="bz-f"><span>Website (optional)</span><input id="fWeb" maxlength="200" value="' + esc(b.website) + '" inputmode="url"></label>' +
      '<label class="bz-f"><span>Hours</span><input id="fHours" maxlength="160" value="' + esc(b.hours) + '" placeholder="Mon–Sat 8 AM–6 PM · Closed Sunday"></label>' +
      '<label class="bz-f"><span>About your business</span><textarea id="fAbout" maxlength="600" placeholder="Family shop since 2009. Tires, brakes and oil changes, most same day.">' + esc(b.about) + '</textarea></label>' +
      '<label class="bz-f"><span>One offer (optional)</span><input id="fOffer" maxlength="120" value="' + esc(b.offer) + '" placeholder="Free tire check"><small>Shown at the top of your page.</small></label>' +
      '<div class="bz-f"><span>Services and prices (you set them)</span><div id="fSvcs"></div><button type="button" class="bz-btn soft" id="fAddSvc" style="min-height:42px;padding:9px 14px;font-size:14px">+ Add a service or item</button><small>Prices show as "from $X". Leave the price empty if it depends.</small></div>' +
      '<div class="bz-f"><span>Header wallpaper</span><div class="bz-walls" id="fWalls"></div><small id="fWallNote"></small></div>' +
      '<div class="bz-f"><span>Photos (up to 3)</span><div class="bz-pics" id="fPics"></div><small>Your shop, your work, your team. No customers\' license plates please.</small></div>' +
      '<div class="bz-row"><button class="bz-btn" id="fSave">' + (b.id ? 'Save changes' : 'Create my page') + '</button></div><div class="bz-msg" id="fMsg" role="status"></div>';
    var $ = function (id) { return root.querySelector('#' + id); };
    function drawKinds() { $('fKind').innerHTML = KINDS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" class="' + (st.kind === k[0] ? 'on' : '') + '">' + k[1] + '</button>'; }).join(''); }
    function drawSvcs() {
      $('fSvcs').innerHTML = st.svcs.map(function (s, i) { return '<div class="bz-svc"><input data-i="' + i + '" data-f="name" maxlength="80" placeholder="Oil change" value="' + esc(s.name) + '" aria-label="Service name"><input data-i="' + i + '" data-f="price" inputmode="decimal" placeholder="From $" value="' + esc(s.price) + '" aria-label="Price from"><button type="button" data-del="' + i + '" aria-label="Remove">✕</button></div>'; }).join('');
    }
    function drawWalls() {
      var own = !WALLS[st.wall];
      $('fWalls').innerHTML = Object.keys(WALLS).map(function (w) { return '<button type="button" data-w="' + w + '" class="' + (st.wall === w ? 'on' : '') + '" style="background:' + WALLS[w] + '" aria-label="' + w + '"></button>'; }).join('') +
        '<label class="bz-walls-own"><input type="file" accept="image/*" id="fWallFile" hidden><span class="' + (own ? 'on' : '') + '" style="display:grid;place-items:center;height:54px;border-radius:12px;border:3px solid ' + (own ? '#1F5FBF' : 'transparent') + ';background:' + (own ? wallCss(st.wall) : '#EEF2F8') + ';font-size:12px;font-weight:800;color:' + (own ? '#fff' : '#4A5565') + ';cursor:pointer">My photo</span></label>';
      $('fWallNote').textContent = own ? 'Your own photo is the wallpaper.' : '';
    }
    function drawPics() {
      $('fPics').innerHTML = st.photos.map(function (p, i) { return '<div class="p"><img src="' + photoUrl(p) + '" alt="Photo ' + (i + 1) + '"><button type="button" data-rm="' + i + '" aria-label="Remove photo">✕</button></div>'; }).join('') +
        (st.photos.length < 3 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="fPicFile" hidden></label>' : '');
    }
    drawKinds(); drawSvcs(); drawWalls(); drawPics();
    $('fKind').onclick = function (e) { var k = e.target.getAttribute('data-k'); if (k) { st.kind = k; drawKinds(); } };
    $('fSvcs').oninput = function (e) { var i = e.target.getAttribute('data-i'); if (i != null) st.svcs[+i][e.target.getAttribute('data-f')] = e.target.value; };
    $('fSvcs').onclick = function (e) { var i = e.target.getAttribute('data-del'); if (i != null) { st.svcs.splice(+i, 1); if (!st.svcs.length) st.svcs.push({ name: '', price: '' }); drawSvcs(); } };
    $('fAddSvc').onclick = function () { if (st.svcs.length < 30) { st.svcs.push({ name: '', price: '' }); drawSvcs(); } };
    $('fWalls').onclick = function (e) { var w = e.target.getAttribute('data-w'); if (w) { st.wall = w; drawWalls(); } };
    root.addEventListener('change', async function (e) {
      if (e.target.id !== 'fWallFile' && e.target.id !== 'fPicFile') return;
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var me = (await sb.auth.getUser()).data.user; if (!me) return;
      $('fMsg').className = 'bz-msg'; $('fMsg').textContent = 'Uploading…';
      try {
        var p = await upload(me.id, f);
        if (e.target.id === 'fWallFile') { st.wall = p; drawWalls(); } else { st.photos.push(p); drawPics(); }
        $('fMsg').textContent = '';
      } catch (err) { $('fMsg').className = 'bz-msg bad'; $('fMsg').textContent = 'That photo didn\'t upload. Try a JPG or PNG photo.'; }
    });
    $('fPics').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawPics(); } };
    $('fSave').onclick = async function () {
      var name = $('fName').value.trim(), phone = $('fPhone').value.trim();
      var msg = $('fMsg'); msg.className = 'bz-msg bad';
      if (name.length < 2) { msg.textContent = 'Please type your business name.'; return; }
      if (!/\d{7,}/.test(phone.replace(/\D/g, ''))) { msg.textContent = 'Please type a phone number we can call to confirm you\'re the owner.'; return; }
      var row = { name: name, kind: st.kind, address: $('fAddr').value.trim() || null, city: $('fCity').value.trim() || 'Atlanta', phone: phone, website: $('fWeb').value.trim() || null,
        hours: $('fHours').value.trim() || null, about: $('fAbout').value.trim() || null, offer: $('fOffer').value.trim() || null, wallpaper: st.wall, photos: st.photos };
      var svcs = st.svcs.map(function (s) { var n = String(s.name || '').trim(); var pr = String(s.price || '').replace(/[^\d.]/g, ''); return n ? { name: n, price_from: pr ? Number(pr) : null } : null; }).filter(Boolean);
      $('fSave').disabled = true; msg.className = 'bz-msg'; msg.textContent = 'Saving…';
      try { await onSave(row, svcs); } catch (err) { msg.className = 'bz-msg bad'; msg.textContent = (err && err.message && /up to 3/.test(err.message)) ? 'You can have up to 3 business pages.' : 'That didn\'t save. Please try again.'; }
      $('fSave').disabled = false;
    };
  }
  async function saveServices(id, svcs) {
    var d = await sb.from('business_services').delete().eq('business_id', id); if (d.error) throw d.error;
    if (svcs.length) { var r = await sb.from('business_services').insert(svcs.map(function (s, i) { return { business_id: id, name: s.name, price_from: s.price_from, sort: i }; })); if (r.error) throw r.error; }
  }

  // ---------- Sign in / create account ----------
  function account(next) {
    var box = root.querySelector('#bzAcct');
    sb.auth.getSession().then(function (r) {
      var u = r.data.session && r.data.session.user;
      if (u) {
        box.innerHTML = '<div class="bz-sec">Signed in as <b>' + esc(u.email) + '</b>. <a href="#" id="aOut">Not you?</a></div><div class="bz-row"><button class="bz-btn" id="aGo">Continue</button></div>';
        box.querySelector('#aGo').onclick = function () { next(u); };
        box.querySelector('#aOut').onclick = function (e) { e.preventDefault(); sb.auth.signOut().then(function () { account(next); }); };
        return;
      }
      var tab = 'join';
      function draw() {
        box.innerHTML = '<div class="bz-tabs"><button type="button" data-tab="join" class="' + (tab === 'join' ? 'on' : '') + '">Create account</button><button type="button" data-tab="login" class="' + (tab === 'login' ? 'on' : '') + '">Log in</button></div>' +
          '<p class="lead" style="font-size:15px">' + (tab === 'join' ? 'Your page belongs to this account. Use an email you check.' : 'Use the email and password of your Carvessa account.') + '</p>' +
          '<label class="bz-f"><span>Email</span><input id="aEmail" type="email" autocomplete="email" inputmode="email"></label>' +
          '<label class="bz-f"><span>Password' + (tab === 'join' ? ' (8 or more characters)' : '') + '</span><input id="aPw" type="password" autocomplete="' + (tab === 'join' ? 'new-password' : 'current-password') + '"></label>' +
          '<div class="bz-row"><button class="bz-btn" id="aDo">' + (tab === 'join' ? 'Create account' : 'Log in') + '</button></div><div class="bz-msg" id="aMsg" role="status"></div>';
        box.querySelector('.bz-tabs').onclick = function (e) { var t = e.target.getAttribute("data-tab"); if (t) { tab = t; draw(); } };
        box.querySelector('#aDo').onclick = async function () {
          var em = box.querySelector('#aEmail').value.trim().toLowerCase(), pw = box.querySelector('#aPw').value, m = box.querySelector('#aMsg');
          m.className = 'bz-msg bad';
          if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(em)) { m.textContent = 'Please type a real email.'; return; }
          if (pw.length < 8) { m.textContent = 'Your password needs 8 or more characters.'; return; }
          m.className = 'bz-msg'; m.textContent = tab === 'join' ? 'Creating your account…' : 'Logging in…';
          var r = tab === 'join' ? await sb.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: location.origin + location.pathname } }) : await sb.auth.signInWithPassword({ email: em, password: pw });
          if (r.error) { m.className = 'bz-msg bad'; m.textContent = /registered|exists/i.test(r.error.message) ? 'That email already has an account. Tap Log in.' : /invalid/i.test(r.error.message) ? 'Email or password is wrong.' : 'That didn\'t work. Please try again.'; return; }
          if (!r.data.session) { m.className = 'bz-msg good'; m.textContent = 'Almost done: we sent you an email. Tap the link in it, then come back to this page and log in.'; return; }
          next(r.data.session.user);
        };
      }
      draw();
    });
  }

  // ---------- Join: agree → account → page ----------
  if (mode === 'join') {
    var agreedAt = null;
    var steps = root.querySelectorAll('.bz-steps span'), panes = [root.querySelector('#bzP1'), root.querySelector('#bzP2'), root.querySelector('#bzP3'), root.querySelector('#bzP4')];
    var show = function (n) { panes.forEach(function (p, i) { p.hidden = i !== n; }); steps.forEach(function (s, i) { s.className = i === Math.min(n, 2) ? 'on' : ''; }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    var c1 = root.querySelector('#ck1'), c2 = root.querySelector('#ck2'), go1 = root.querySelector('#go1');
    var upd = function () { go1.disabled = !(c1.checked && c2.checked); };
    c1.onchange = upd; c2.onchange = upd; upd();
    go1.onclick = function () { agreedAt = new Date().toISOString(); show(1); account(function () { show(2); var pk = q.get('kind'), pre = { name: (q.get('name') || '').slice(0, 80), offer: (q.get('offer') || '').slice(0, 120), kind: KINDS.some(function (k) { return k[0] === pk; }) ? pk : undefined };
      form(pre, [], async function (row, svcs) {
      row.agreed_at = agreedAt; row.terms_version = C.terms; row.source = (q.get('src') || 'website').slice(0, 60);
      var r = await sb.from('businesses').insert(row).select('id, slug').single(); if (r.error) throw r.error;
      await saveServices(r.data.id, svcs);
      root.querySelector('#bzDoneLink').href = '/shops/?b=' + encodeURIComponent(r.data.slug);
      show(3);
    }); }); };
    return;
  }

  // ---------- Edit: your pages ----------
  if (mode === 'edit') {
    var STATUS = { pending: 'Waiting for our check', live: 'Live', hidden: 'Hidden', rejected: 'Not approved', blocked: 'Blocked' };
    var list = root.querySelector('#bzList'), area = root.querySelector('#bzEditArea');
    account(async function (u) {
      root.querySelector('#bzAcct').hidden = true;
      var r = await sb.from('businesses').select('*').eq('owner', u.id).order('created_at');
      var pages = r.data || [];
      if (!pages.length) { list.innerHTML = '<div class="bz-sec">You don\'t have a business page yet. <a href="/business/join/">Create your free page</a></div>'; return; }
      list.innerHTML = pages.map(function (b, i) { return '<div class="it"><div><b>' + esc(b.name) + '</b><br><span class="bz-pill ' + esc(b.status) + '">' + (STATUS[b.status] || b.status) + '</span></div><div class="bz-row" style="margin:0"><a class="bz-btn soft" href="/shops/?b=' + encodeURIComponent(b.slug) + '">View</a><button class="bz-btn" data-e="' + i + '">Edit</button></div></div>'; }).join('');
      list.onclick = async function (e) {
        var i = e.target.getAttribute('data-e'); if (i == null) return;
        var b = pages[+i], s = await sb.from('business_services').select('*').eq('business_id', b.id).order('sort');
        area.hidden = false; area.querySelector('h2').textContent = 'Edit ' + b.name;
        form(b, s.data || [], async function (row, svcs) {
          var x = await sb.from('businesses').update(row).eq('id', b.id).select('status').single(); if (x.error) throw x.error;
          await saveServices(b.id, svcs);
          var m = root.querySelector('#fMsg'); m.className = 'bz-msg good';
          m.textContent = x.data.status === 'pending' && b.status === 'live' ? 'Saved. You changed your name, address or phone, so we\'ll check it again before it shows.' : 'Saved.';
          b.status = x.data.status;
        });
        area.scrollIntoView({ behavior: 'smooth' });
      };
    });
    return;
  }

  // ---------- Public page ----------
  if (mode === 'shop') {
    (async function () {
      var slug = q.get('b') || '';
      var r = slug ? await sb.from('businesses').select('*').eq('slug', slug).maybeSingle() : { data: null };
      var b = r.data;
      if (!b) { root.innerHTML = '<div class="bz"><h1>This page isn\'t available</h1><p class="lead">It may be waiting for our check, or the link is wrong.</p><a class="bz-btn" href="/partners/">For businesses</a></div>'; return; }
      var s = await sb.from('business_services').select('name, price_from, note').eq('business_id', b.id).order('sort');
      var svcs = s.data || [];
      document.title = b.name + ' · Carvessa';
      var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.name, b.address, b.city].filter(Boolean).join(', '));
      var tel = (b.phone || '').replace(/[^\d+]/g, '');
      root.innerHTML =
        '<div class="shop-cover" style="background:' + wallCss(b.wallpaper) + '"><div class="shop-logo" aria-hidden="true">' + esc(initials(b.name)) + '</div></div>' +
        (b.status !== 'live' ? '<div class="shop-pre">Preview: only you can see this page. It goes live after we confirm you\'re the owner (we\'ll call or text you).</div>' : '') +
        '<div class="shop-head"><h1>' + esc(b.name) + '</h1><div class="k">' + esc(kindName(b.kind)) + ' · ' + esc(b.city || 'Atlanta') + '</div>' + (b.status === 'live' ? '<span class="shop-badge">✓ Verified by Carvessa</span>' : '') + '</div>' +
        (b.offer ? '<div class="shop-card shop-offer"><h2>' + esc(b.offer) + '</h2>Show this page at the counter.</div>' : '') +
        (svcs.length ? '<div class="shop-card"><h2>Services and prices</h2>' + svcs.map(function (x) { return '<div class="shop-svc"><span>' + esc(x.name) + '</span><b>' + (x.price_from != null ? 'from ' + money(x.price_from) : 'Ask') + '</b></div>'; }).join('') + '<div class="shop-note">Prices set by the business. Ask for a written quote.</div></div>' : '') +
        (b.about ? '<div class="shop-card"><h2>About</h2>' + esc(b.about) + '</div>' : '') +
        ((b.photos || []).length ? '<div class="shop-card"><h2>Photos</h2><div class="shop-pics">' + b.photos.map(function (p, i) { return '<img src="' + photoUrl(p) + '" alt="' + esc(b.name) + ' photo ' + (i + 1) + '" loading="lazy">'; }).join('') + '</div></div>' : '') +
        '<div class="shop-card"><div class="shop-kv">' + (b.address ? '<span>Address</span><div>' + esc(b.address) + ', ' + esc(b.city || '') + '</div>' : '') + (b.phone ? '<span>Phone</span><div>' + esc(b.phone) + '</div>' : '') + (b.hours ? '<span>Hours</span><div>' + esc(b.hours) + '</div>' : '') + (b.website ? '<span>Website</span><div><a href="' + esc(/^https?:/i.test(b.website) ? b.website : 'https://' + b.website) + '" rel="noopener nofollow" target="_blank">' + esc(b.website.replace(/^https?:\/\//i, '')) + '</a></div>' : '') + '</div>' +
        '<div class="bz-row">' + (tel ? '<a class="bz-btn" href="tel:' + esc(tel) + '">Call</a>' : '') + '<a class="bz-btn soft" href="' + maps + '" target="_blank" rel="noopener">Directions</a></div></div>' +
        '<div class="shop-card"><h2>Reviews</h2>Reviews from Carvessa members are coming soon.</div>' +
        '<p class="shop-note" style="margin-top:14px">Carvessa doesn\'t rank businesses by who pays. Paid spots in the app are always labeled. Is this your business? <a href="/business/edit/">Edit your page</a></p>';
    })();
  }
})();
