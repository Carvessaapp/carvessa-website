// Business pages (pictures 269–281, Nov 18–19, 2026): join (agree → account → page), Business HQ (the owner's
// private dashboard) and the public page. Talks to Supabase with the public key; the database rules decide what
// each person may read or change (migrations 026–028: pages start 'pending', only Carvessa makes them live).
(function () {
  var C = window.BZ || {};
  var sb = window.supabase && window.supabase.createClient(C.url, C.key);
  var root = document.getElementById('bz');
  if (!sb || !root) return;
  var mode = root.getAttribute('data-mode');
  // Live now (Nov 19, 2026): signed-in people say 'I'm here' every 2 minutes while the page is visible.
  // Business HQ counts as 'business'; a driver on a shop page or in messages counts as 'app'. Guests are never counted.
  (function () {
    var kind = mode === 'edit' ? 'business' : 'app';
    var ping = function () {
      if (document.hidden) return;
      sb.auth.getSession().then(function (r) {
        if (!r.data.session) return;
        sb.rpc('presence_ping', { p_kind: kind, p_device: innerWidth < 760 ? 'web-phone' : 'web-computer' }).then(function () {}, function () {});
      });
    };
    setTimeout(ping, 1500); setInterval(ping, 120000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) ping(); });
  })();
  var WALLS = {
    sunset: 'linear-gradient(135deg,#7A2E1F,#C2542F 55%,#E8A15A)',
    ocean: 'linear-gradient(135deg,#123A78,#1F5FBF 60%,#6FB8E0)',
    forest: 'linear-gradient(135deg,#0F4227,#1C6B40 55%,#7CC79A)',
    night: 'linear-gradient(135deg,#0B1026,#1B2F66 60%,#5A3D6E)',
    steel: 'linear-gradient(135deg,#2B3A55,#5E6F8E 60%,#A9B4C6)'
  };
  var KINDS = [['repair', 'Repair shop'], ['tires', 'Tire shop'], ['dealer', 'Car dealer'], ['credit_union', 'Credit union / lender'], ['insurance', 'Insurance'], ['body', 'Body shop'], ['tow', 'Towing'], ['detail', 'Detailing / car wash'], ['other', 'Other']];
  // Free header photos (CC BY, found with Openverse). Credit is shown under the header.
  var FREE = {
    repair: ['Ivan Radic', 'https://www.flickr.com/photos/26344495@N05/51316529244'],
    tires: ['MSVG', 'https://www.flickr.com/photos/13907834@N00/4491986605'],
    dealer: ['bradywahl', 'https://www.flickr.com/photos/66192446@N00/4445373875'],
    credit_union: ['free pictures of money', 'https://www.flickr.com/photos/126278138@N03/17309004521'],
    insurance: ['Dimitry B', 'https://www.flickr.com/photos/61533954@N00/15001243695'],
    body: ['blastpaintrestore', 'https://www.flickr.com/photos/123973741@N03/14042802437'],
    tow: ['srqpix', 'https://www.flickr.com/photos/85549619@N00/3606871463'],
    detail: ['bark', 'https://www.flickr.com/photos/49503168860@N01/3595680965']
  };
  var freeKind = function (k) { return FREE[k] ? k : 'insurance'; };
  // What each kind of page shows drivers (picture 280).
  var KINFO = {
    repair: { svc: 'Services and prices', tip: ['Bring your mechanic note', 'Used Carvessa’s car help? Tap “What do I tell the mechanic?” and show the note here: car, miles, what happened and your photos.'], first: 'call' },
    tires: { svc: 'Tire services and prices', tip: ['Tire light on?', 'Ask for a free pressure check. If the light stays on with good air, ask them to check the tire sensors.'], first: 'directions' },
    dealer: { svc: 'What they offer', tip: ['Ask for the out-the-door price', 'The total with Georgia tax and fees, in writing, before you go. Carvessa’s car pages show an estimate you can compare.'], first: 'call' },
    credit_union: { svc: 'Loans and services', tip: ['Rates and who can join', 'Rates, terms and membership are set by the credit union. Not an offer from Carvessa.'], first: 'call' },
    insurance: { svc: 'What they cover', tip: ['Before you buy a car', 'Ask what insurance would cost for the exact car you’re looking at, then compare it with your payment.'], first: 'call' },
    body: { svc: 'Services and prices', tip: ['Estimate from photos', 'Take 3 clear photos of the damage (close, middle, far) and send them when you call or message.'], first: 'call' },
    tow: { svc: 'Prices', tip: ['Ask the price before they come', 'Tell them where you are and what happened. If you’re on a highway, stay safe away from traffic.'], first: 'call' },
    detail: { svc: 'Packages', tip: ['Selling or trading your car?', 'A clean car can help when you trade it in or sell it.'], first: 'call' },
    other: { svc: 'Services and prices', tip: null, first: 'call' }
  };
  // Business HQ looks (picture 278). #1 is the default.
  var LOOKS = [
    ['racing', 'Carvessa Clean', 'The new default', '#0F1B33', '#F4F6FA', '#1F5FBF', '#E63B2E'],
    ['garage', 'Garage Night', 'Dark garage, gold trim', '#0E0F12', '#16181C', '#E8C985', '#FF8A5B'],
    ['cluster', 'Dashboard Cluster', 'Glowing dials', '#06080B', '#0B1118', '#5BC0FF', '#FFB547'],
    ['pit', 'Pit Wall', 'Black, white, racing red', '#111111', '#FFFFFF', '#111111', '#E63B2E'],
    ['showroom', 'Showroom', 'Bright floor, gold', '#FFFFFF', '#FBFAF7', '#9A7535', '#B0362B'],
    ['cu', 'Credit Union', 'Calm green, rate card', '#123B2E', '#F5F2EA', '#1D7A46', '#B07A1F'],
    ['shield', 'Shield', 'Navy and teal', '#0B2545', '#F2F6FA', '#13807A', '#C2410C'],
    ['lot', 'Dealer Lot', 'Window-sticker cards', '#0D1B4C', '#F3F5FB', '#2347D9', '#E5322D'],
    ['workshop', 'Workshop', 'Steel gray, safety orange', '#2B3036', '#ECEEF0', '#E8710A', '#C0392B'],
    ['tread', 'Tire Tread', 'Charcoal and yellow', '#1A1A1A', '#F4F4F2', '#1A1A1A', '#F2B705']
  ];
  var SUGGEST = { credit_union: 'cu', insurance: 'shield', dealer: 'lot', repair: 'workshop', body: 'workshop', tires: 'tread' };
  var PUB = 'id, owner, slug, name, kind, brand_color, page_theme, customer_parts, address, city, state, phone, website, hours, social, about, offer, wallpaper, photos, logo, header, status, founding, created_at, updated_at';
  var MINE = PUB + ', hq_dark, lat, lon, legal_name, control_no, owner_role, since_year, hq_look, notify_email';
  var STATES = { alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY' };

  var kindName = function (k) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0] === k) return KINDS[i][1]; return 'Business'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return n == null || n === '' ? '' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  var photoUrl = function (p) { return C.url + '/storage/v1/object/public/business-photos/' + p.split('/').map(encodeURIComponent).join('/'); };
  var initials = function (n) { return (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(''); };
  var hex = function (c, d) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : d; };
  var q = new URLSearchParams(location.search);

  // The header drivers see: a free photo for their kind (default), their own photo, their colors, or nothing.
  function headerOf(b) {
    var h = b.header || {}, s = h.style || 'photo';
    if (s === 'own' && h.photo) return { css: 'url("' + photoUrl(h.photo) + '") center/cover' };
    if (s === 'color') {
      var a = hex(h.c1, '#1F3F9F'), z = hex(h.c2, '#5B8DEF'), p = h.pattern || 'fade';
      if (p === 'solid') return { css: a };
      if (p === 'stripes') return { css: 'repeating-linear-gradient(90deg,' + a + ' 0 22px,' + z + ' 22px 30px,' + a + ' 30px 38px,' + z + ' 38px 46px,' + a + ' 46px 70px)' };
      if (p === 'checker') return { css: 'repeating-conic-gradient(' + a + ' 0 25%,' + z + ' 0 50%) 0 0/28px 28px' };
      return { css: 'linear-gradient(120deg,' + a + ',' + z + ')' };
    }
    if (s === 'none') return { css: 'linear-gradient(120deg,#E3ECFA,#F4F6FA)' };
    if (s === 'legacy' && WALLS[b.wallpaper]) return { css: WALLS[b.wallpaper] };
    var k = freeKind(b.kind);
    return { css: 'url("/assets/biz-photos/' + k + '.jpg") center/cover', credit: FREE[k] };
  }
  function logoHtml(b, cls) {
    return b.logo ? '<div class="' + cls + '"><img src="' + photoUrl(b.logo) + '" alt=""></div>' : '<div class="' + cls + '" aria-hidden="true">' + esc(initials(b.name)) + '</div>';
  }

  // ---------- Line icons (picture 283; no emoji) ----------
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', msg: '<path d="M4 5h16v11H8l-4 4z"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    wrench: '<path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 1-2-2z"/>', post: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>', cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    phone: '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/>', pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', check: '<path d="M5 12l5 5 9-10"/>', tag: '<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.5"/>', share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/>',
    snow: '<path d="M12 2v20M4 6l16 12M20 6L4 18"/>', gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>', heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.2 1.3 5 4"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    down: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/>', moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>', out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'
  };
  var icon = function (n, s) { return '<svg class="ic" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; };
  // ---------- Brand color (picture 288 color A: match my logo) ----------
  var KIND_COLOR = { repair: '#C0362C', tires: '#1D7A46', dealer: '#0D1B4C', credit_union: '#123B2E', insurance: '#13807A', body: '#B8560A', tow: '#D63A2F', detail: '#6E3FA8', other: '#1F5FBF' };
  var SWATCH = [['#1F5FBF', 'Blue'], ['#C0362C', 'Red'], ['#1D7A46', 'Green'], ['#0F1B33', 'Navy'], ['#E8710A', 'Orange'], ['#6E3FA8', 'Purple'], ['#13807A', 'Teal'], ['#9A7535', 'Gold'], ['#111111', 'Black'], ['#C2185B', 'Pink']];
  var rgb = function (h) { h = hex(h, '#1F5FBF'); return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var toHex = function (c) { return '#' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); };
  var lum = function (h) { return rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); };
  var contrast = function (a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  var shade = function (h, f) { return toHex(rgb(h).map(function (v) { return v * (1 - f); })); };
  var onColor = function (h) { return contrast(h, '#FFFFFF') >= 4.5 ? '#FFFFFF' : '#10151B'; };
  var readable = function (h, bg) { bg = bg || '#FFFFFF'; var c = hex(h, '#1F5FBF'), n = 0; while (contrast(c, bg) < 4.5 && n++ < 12) c = shade(c, 0.12); return c; };
  var brandOf = function (b) { return hex(b.brand_color, KIND_COLOR[b.kind] || KIND_COLOR.other); };
  // Colors in a logo: small canvas, count bright colors, skip near-white, near-black and grays, top 3 that differ.
  function logoColors(url) {
    return new Promise(function (ok) {
      var img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'); g.drawImage(img, 0, 0, 64, 64);
          var d = g.getImageData(0, 0, 64, 64).data, box = {}, gray = {};
          for (var i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            var r = d[i], gg = d[i + 1], bb = d[i + 2], mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb);
            var key = [r >> 5, gg >> 5, bb >> 5].join(',');
            var tgt = (mx > 235 && mn > 215) || mx < 22 ? null : (mx - mn < 28 ? gray : box);
            if (!tgt) continue; (tgt[key] = tgt[key] || { n: 0, r: 0, g: 0, b: 0 }); tgt[key].n++; tgt[key].r += r; tgt[key].g += gg; tgt[key].b += bb;
          }
          var pick = function (m) { return Object.keys(m).map(function (k) { var v = m[k]; return { n: v.n, c: toHex([v.r / v.n, v.g / v.n, v.b / v.n]) }; }).sort(function (a, b) { return b.n - a.n; }); };
          var out = []; pick(box).concat(pick(gray)).forEach(function (x) { if (out.length < 3 && out.every(function (o) { return contrast(o, x.c) > 1.6; })) out.push(x.c); });
          ok(out);
        } catch (err) { ok([]); }
      };
      img.onerror = function () { ok([]); };
      img.src = url;
    });
  }
  var shortDay = function (d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  var today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // "Mon–Fri 8 AM–6 PM · Sat 9 AM–2 PM · Closed Sunday" → open now? (the driver's clock; null when we can't tell)
  function openNow(hours, at) {
    if (!hours) return null;
    var D = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], now = at || new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var di = function (w) { return D.indexOf(String(w).slice(0, 3).toLowerCase()); };
    var tm = function (t) { var m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(t.trim()); if (!m) return null; var h = +m[1] % 12; if (/pm/i.test(m[3] || '')) h += 12; if (!m[3] && +m[1] < 7) h += 12; return h * 60 + (+m[2] || 0); };
    var nice = function (t) { return t.trim().replace(/\s+/g, ' ').toUpperCase().replace(/(\d)(AM|PM)/, '$1 $2'); };
    var found = null;
    hours.split(/\s*[·;\n]\s*/).forEach(function (seg) {
      var c = /^closed\s+(\w+)/i.exec(seg) || /^(\w+)\w*\s*:?\s*closed$/i.exec(seg);
      if (c && di(c[1]) === day) { found = { closed: true }; return; }
      var m = /^(\w{3})\w*(?:\s*[–-]\s*(\w{3})\w*)?\s*:?\s+(\d[^–-]*?)\s*[–-]\s*(\d.*)$/i.exec(seg);
      if (!m) return;
      var a = di(m[1]), z = m[2] ? di(m[2]) : a; if (a < 0 || z < 0) return;
      var inR = a <= z ? day >= a && day <= z : day >= a || day <= z;
      if (inR) { var o = tm(m[3]), e = tm(m[4]); if (o != null && e != null) found = { o: o, e: e, on: nice(m[3]), off: nice(m[4]) }; }
    });
    if (!found) return null;
    if (found.closed) return { open: false, text: 'Closed today' };
    if (mins >= found.o && mins < found.e) return { open: true, text: 'Open now · until ' + found.off };
    if (mins < found.o) return { open: false, text: 'Closed · opens ' + found.on };
    return { open: false, text: 'Closed now' };
  }
  var addDays = function (n) { var d = new Date(Date.now() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ---------- Deals (picture 284): templates, the deal card, the share kit ----------
  var TPL = {
    price: { name: 'Price special', k: 'PRICE SPECIAL', ic: 'wrench', bg: ['#1F5FBF', '#0F2F6B'], price: 1, title: 'Oil change', body: 'Up to 5 qt conventional. Most cars.' },
    sale: { name: 'Sale', k: 'SALE', ic: 'tag', bg: ['#D9342A', '#A51B2A'], title: '20% off brakes', body: 'All brake jobs this week.' },
    free: { name: 'Free check', k: 'FREE CHECK', ic: 'check', bg: ['#1D7A46', '#0E4E2C'], title: 'Free tire check', body: 'Pressure, tread and a sensor look. No cost, no catch.' },
    season: { name: 'Seasonal', k: 'SEASON', ic: 'snow', bg: ['#2F6FB5', '#16407A'], title: 'Winter ready', body: 'Battery test, wipers and tire pressure in one stop.' },
    bundle: { name: 'Bundle', k: 'BUNDLE', ic: 'gift', bg: ['#6E3FA8', '#3D1F6B'], price: 1, title: 'Oil change + tire rotation', body: 'Both for one price.' },
    new_customer: { name: 'New customer', k: 'NEW CUSTOMERS', ic: 'user', bg: ['#0F1B33', '#2A3A5C'], title: '$15 off your first visit', body: 'Show your code at the counter.', who: 'new' },
    holiday: { name: 'Holiday', k: 'HOLIDAY', ic: 'flag', bg: ['#D2552C', '#A8380B'], title: 'Holiday weekend sale', body: 'Open Friday to Sunday.' },
    new_service: { name: 'New service', k: 'NEW', ic: 'bolt', bg: ['#8A6A2C', '#5E4718'], title: 'Now doing EV service', body: 'Tires, brakes and A/C on electric cars.', news: 1 },
    news: { name: 'News', k: 'NEWS', ic: 'post', bg: ['#2B3A55', '#4E5F7E'], title: 'Open Sundays starting this week', body: '', news: 1 }
  };
  // Per kind of business: better starting words for a few templates.
  var TPL_KIND = {
    tires: { price: ['Tire rotation', 'All 4 tires, pressure set.'], sale: ['$40 off a set of 4 tires', 'Mounting and balancing included.'] },
    dealer: { price: ['Oil change at our service desk', 'Most cars.'], sale: ['Weekend sale event', 'Ask for the out-the-door price in writing.'], free: ['Free trade-in appraisal', 'Bring your car, get a written number.'], new_customer: ['First-time buyer welcome', 'We explain every line of the paperwork.'] },
    body: { price: ['Small dent repair', 'From one panel, no paint.'], free: ['Free estimate from photos', 'Send 3 photos, get a written estimate.'] },
    detail: { price: ['Full detail', 'Inside and out.'], sale: ['20% off interior detail', 'This week only.'] },
    tow: { price: ['Local tow', 'Up to 5 miles.'], free: ['Free jump start for members', 'In our service area.'] },
    credit_union: { free: ['Free car loan check-up', 'Bring your current loan, we take a look.'], news: ['New branch hours', ''] },
    insurance: { free: ['Free quote review', 'Bring your current policy, we compare it.'], season: ['Winter driving check-up', 'Make sure your coverage fits.'] }
  };
  var LENDING = /\b(apr|a\.p\.r|interest|financ\w*|per month|\/\s*mo\b|monthly|down payment|\d+\s*%\s*(off\s+)?(rate|apr))\b/i;
  var tplOf = function (p) { return TPL[p.template] || (p.kind === 'special' ? TPL.price : TPL.news); };
  var endText = function (p) { return p.until ? 'Ends ' + shortDay(p.until) : 'No end date'; };
  function dealCard(p, b, cls) {
    var t = tplOf(p);
    return '<div class="dl ' + (cls || '') + '" style="background:linear-gradient(150deg,' + t.bg[0] + ',' + t.bg[1] + ')"><div class="dl-k">' + icon(t.ic, 14) + t.k + (p.who === 'new' ? ' · NEW CUSTOMERS' : '') + '</div>' +
      '<h3>' + esc(p.title || t.title) + '</h3>' + (p.price != null && p.price !== '' ? '<div class="dl-p">' + money(p.price) + '</div>' : '') + (p.body ? '<p>' + esc(p.body) + '</p>' : '') + (p.fine ? '<small class="dl-fine">' + esc(p.fine) + '</small>' : '') +
      '<div class="dl-ft">' + logoHtml(b, 'dl-lo') + '<span>' + esc(b.name) + '</span><em>' + endText(p) + '</em></div></div>';
  }
  // Share kit: a square post, a story, a flyer with a QR code, and text to copy. Every link goes to the Carvessa page.
  // Short links (Nov 20, 2026): carvessa.app/b/<link> (the 404 page sends it to /shops/?b=).
  var shortUrl = function (slug) { return 'https://carvessa.app/b/' + slug; };
  function dealUrl(p, b) { return shortUrl(b.slug) + '?deal=' + p.id; }
  function dealText(p, b) { return b.name + ': ' + p.title + (p.price != null ? ' · ' + money(p.price) : '') + (p.until ? ' · until ' + shortDay(p.until) : '') + '.' + (p.body ? ' ' + p.body : '') + ' See it on Carvessa: ' + dealUrl(p, b); }
  function wrapText(g, text, x, y, maxW, lh, maxLines) {
    var words = String(text || '').split(/\s+/), line = '', n = 0;
    for (var i = 0; i < words.length; i++) {
      var tryL = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(tryL).width > maxW && line) { g.fillText(line, x, y); y += lh; n++; line = words[i]; if (n >= maxLines - 1) { var rest = words.slice(i).join(' '); while (g.measureText(rest + '…').width > maxW && rest.length) rest = rest.slice(0, -1); g.fillText(rest + (rest.length < words.slice(i).join(' ').length ? '…' : ''), x, y); return y + lh; } }
      else line = tryL;
    }
    if (line) { g.fillText(line, x, y); y += lh; }
    return y;
  }
  async function drawDeal(p, b, w, h) {
    try { await Promise.all([document.fonts.load('800 60px Manrope'), document.fonts.load('700 30px Manrope')]); } catch (e) { /* system font is fine */ }
    var t = tplOf(p), c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, w * 0.6, h); gr.addColorStop(0, t.bg[0]); gr.addColorStop(1, t.bg[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var pad = w * 0.08, y = h > w ? h * 0.14 : pad + 40;
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '800 ' + Math.round(w * 0.03) + 'px Manrope, sans-serif'; g.fillText(t.k.split('').join(String.fromCharCode(8202)), pad, y);
    y += w * 0.1; g.fillStyle = '#fff'; g.font = '800 ' + Math.round(w * 0.085) + 'px Manrope, sans-serif';
    y = wrapText(g, p.title, pad, y, w - pad * 2, w * 0.095, 3);
    if (p.price != null) { g.font = '800 ' + Math.round(w * 0.13) + 'px Manrope, sans-serif'; y += w * 0.06; g.fillText(money(p.price), pad, y); y += w * 0.05; }
    if (p.body) { g.font = '700 ' + Math.round(w * 0.038) + 'px Manrope, sans-serif'; g.fillStyle = 'rgba(255,255,255,.9)'; y += w * 0.03; y = wrapText(g, p.body, pad, y, w - pad * 2, w * 0.05, 3); }
    // Footer: name, end date, Carvessa
    var fy = h - pad - w * 0.06;
    g.fillStyle = '#fff'; g.font = '800 ' + Math.round(w * 0.042) + 'px Manrope, sans-serif'; g.fillText(b.name, pad, fy);
    g.font = '700 ' + Math.round(w * 0.032) + 'px Manrope, sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText(endText(p) + '  ·  Find us on Carvessa', pad, fy + w * 0.055);
    return c;
  }
  function shareKit(host, p, b) {
    var url = dealUrl(p, b);
    host.innerHTML = '<div class="hq-card sk-card"><h4>SHARE IT</h4><p class="hq-fine">Every share links to your Carvessa page, so your customers find you there, follow you and get your next deal.</p><div class="sk">' +
      '<button type="button" class="sk-b" data-sk="post">' + icon('down') + '<b>Post picture</b><small>Instagram, Facebook</small></button>' +
      '<button type="button" class="sk-b" data-sk="story">' + icon('down') + '<b>Story picture</b><small>Stories, WhatsApp status</small></button>' +
      '<a class="sk-b" href="/business/flyer/?p=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener">' + icon('print') + '<b>Flyer with QR</b><small>Counter, window</small></a>' +
      '<button type="button" class="sk-b" data-sk="copy">' + icon('copy') + '<b>Copy text</b><small>Google, texts</small></button>' +
      (navigator.share ? '<button type="button" class="sk-b" data-sk="share">' + icon('share') + '<b>Share…</b><small>Any app</small></button>' : '') +
      '</div><div class="bz-msg" role="status"></div></div>';
    var m = host.querySelector('.bz-msg');
    host.querySelector('.sk').onclick = async function (e) {
      var k = e.target.closest('[data-sk]'); if (!k) return; k = k.getAttribute('data-sk');
      if (k === 'copy') { try { await navigator.clipboard.writeText(dealText(p, b)); m.className = 'bz-msg good'; m.textContent = 'Copied. Paste it in Google, a text or a post.'; } catch (err) { prompt('Copy this text:', dealText(p, b)); } return; }
      if (k === 'share') { try { await navigator.share({ title: b.name, text: dealText(p, b), url: url }); } catch (err) { /* closed */ } return; }
      var c = await drawDeal(p, b, 1080, k === 'story' ? 1920 : 1080);
      c.toBlob(async function (blob) {
        var name = (b.slug + '-' + (k === 'story' ? 'story' : 'post') + '.png');
        var file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android|iPhone/i.test(navigator.userAgent)) { try { await navigator.share({ files: [file], text: dealText(p, b) }); return; } catch (err) { /* fall back to download */ } }
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        m.className = 'bz-msg good'; m.textContent = 'Saved the picture. Add the link ' + url.replace('https://', '') + ' when you post it.';
      }, 'image/png');
    };
  }

  // ---------- Follow a business (picture 285) ----------
  function followSheet(host, b, f, onChange) {
    var row = function (k, t, s) { return '<label class="fw-row"><span>' + t + '<small>' + s + '</small></span><input type="checkbox" class="fw-sw" data-k="' + k + '"' + (f[k] ? ' checked' : '') + '></label>'; };
    host.innerHTML = '<div class="fw-sheet" role="dialog" aria-label="Follow settings"><div class="fw-ok">' + icon('check', 16) + ' You follow ' + esc(b.name) + '</div><h3>What should we tell you?</h3>' +
      row('deals', 'New deals and specials', 'Price specials, sales, free checks') + row('news', 'News from the shop', 'New service, holiday hours') +
      row('messages', 'Messages from this shop', 'They can write to you here, like a price or “your car is ready”. Stop any time.') + row('push', 'Phone alert', 'In the Carvessa app, signed in with this account') + row('email', 'Email too', 'One email, never more than 1 a week per shop') +
      '<p class="rv-fine">At most 2 phone alerts a week from one shop, and none from 9 PM to 8 AM. The shop sees how many people follow it, never who.</p>' +
      '<div class="bz-row"><button type="button" class="bz-btn" data-fw="done">Done</button><button type="button" class="bz-btn soft" data-fw="mute">Mute 30 days</button><button type="button" class="bz-btn red" data-fw="unfollow">Unfollow</button></div><div class="bz-msg" role="status"></div><p class="rv-fine"><a href="/following/">All shops I follow ›</a></p></div>';
    var m = host.querySelector('.bz-msg');
    host.querySelector('.fw-sheet').onchange = async function (e) {
      var k = e.target.getAttribute('data-k'); if (!k) return;
      var v = e.target.checked, up = {}; up[k] = v;
      var x = await sb.from('business_follows').update(up).eq('business_id', b.id).eq('user_id', f.user_id);
      if (x.error) { e.target.checked = !v; m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
      f[k] = v; m.className = 'bz-msg good'; m.textContent = 'Saved.';
    };
    host.querySelector('.fw-sheet').onclick = async function (e) {
      var a = e.target.getAttribute('data-fw'); if (!a) return;
      if (a === 'done') { host.innerHTML = ''; onChange(f); return; }
      if (a === 'mute') { var until = new Date(Date.now() + 30 * 864e5).toISOString(); await sb.from('business_follows').update({ muted_until: until }).eq('business_id', b.id).eq('user_id', f.user_id); f.muted_until = until; m.className = 'bz-msg good'; m.textContent = 'Muted for 30 days. Their deals still show on their page.'; return; }
      if (a === 'unfollow') { await sb.from('business_follows').delete().eq('business_id', b.id).eq('user_id', f.user_id); host.innerHTML = ''; onChange(null); }
    };
  }


  // Photo → smaller JPEG (max 1600 px) so it stays well under the 3 MB limit.
  function shrink(file, max) {
    return new Promise(function (ok, bad) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, (max || 1600) / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? ok(b) : bad(new Error('photo')); }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { bad(new Error('photo')); };
      img.src = url;
    });
  }
  async function upload(uid, file, max) {
    var blob = await shrink(file, max);
    var path = uid + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    var r = await sb.storage.from('business-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (r.error) throw r.error;
    return path;
  }

  // ---------- Name search: free OpenStreetMap search near the person, tap to fill the boxes ----------
  var OSMKIND = { car_repair: 'repair', tyres: 'tires', car: 'dealer', car_parts: 'repair', car_wash: 'detail', insurance: 'insurance', bank: 'credit_union' };
  function niceHours(oh) {
    if (!oh || oh.length > 120) return oh || '';
    var D = { Mo: 'Mon', Tu: 'Tue', We: 'Wed', Th: 'Thu', Fr: 'Fri', Sa: 'Sat', Su: 'Sun' };
    var t = function (x) { var m = /^(\d{1,2}):(\d{2})$/.exec(x); if (!m) return x; var h = +m[1], ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (m[2] !== '00' ? ':' + m[2] : '') + ' ' + ap; };
    return oh.split(/\s*;\s*/).map(function (part) {
      return part.replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, function (d) { return D[d]; }).replace(/-/g, '–').replace(/(\d{1,2}:\d{2})–(\d{1,2}:\d{2})/g, function (_, a, b) { return t(a) + '–' + t(b); }).replace(/\boff\b/, 'Closed');
    }).join(' · ');
  }
  function nameSearch(st, $, onPick) {
    var inp = $('fName'), box = $('fSug'), timer = null, last = '';
    inp.setAttribute('autocomplete', 'off');
    inp.addEventListener('input', function () {
      clearTimeout(timer);
      var v = inp.value.trim();
      if (v.length < 3 || st.picked === v) { box.hidden = true; return; }
      timer = setTimeout(async function () {
        if (v === last) return; last = v;
        try {
          var r = await fetch('https://photon.komoot.io/api/?limit=6&lat=33.75&lon=-84.39&q=' + encodeURIComponent(v));
          var d = await r.json();
          var hits = (d.features || []).filter(function (f) { var p = f.properties || {}; return p.name && /^(shop|amenity|craft|office)$/.test(p.osm_key || '') && (p.countrycode || 'US') === 'US'; }).slice(0, 4);
          if (inp.value.trim() !== v) return;
          box.innerHTML = '<div class="bz-sug-h">Is this you? Tap to fill your details</div>' + hits.map(function (f, i) {
            var p = f.properties; return '<button type="button" data-i="' + i + '"><b>' + esc(p.name) + '</b><small>' + esc([[p.housenumber, p.street].filter(Boolean).join(' '), p.city, STATES[(p.state || '').toLowerCase()] || p.state].filter(Boolean).join(', ')) + '</small></button>';
          }).join('') + '<div class="bz-sug-f">' + (hits.length ? 'Not listed? Keep typing and fill it in yourself.' : 'No match on the map. Just fill it in yourself.') + ' Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>.</div>';
          box.hidden = false;
          box.onclick = async function (e) {
            var btn = e.target.closest('button[data-i]'); if (!btn) return;
            var hit = hits[+btn.getAttribute('data-i')], p = hit.properties, gc = (hit.geometry && hit.geometry.coordinates) || []; box.hidden = true; st.picked = p.name;
            var info = { name: p.name, address: [p.housenumber, p.street].filter(Boolean).join(' '), city: [p.city || p.county, STATES[(p.state || '').toLowerCase()] || p.state].filter(Boolean).join(', '), kind: OSMKIND[p.osm_value], lat: gc[1], lon: gc[0] };
            if (info.kind === 'credit_union' && !/credit union|\bcu\b|federal/i.test(p.name)) info.kind = undefined;
            try {
              var t = { N: 'N', W: 'W', R: 'R' }[p.osm_type];
              if (t) {
                var x = await fetch('https://nominatim.openstreetmap.org/lookup?format=json&extratags=1&osm_ids=' + t + p.osm_id); var j = (await x.json())[0];
                var ex = (j && j.extratags) || {};
                info.phone = ex.phone || ex['contact:phone'] || ''; info.website = ex.website || ex['contact:website'] || ''; info.hours = niceHours(ex.opening_hours);
              }
            } catch (err) { /* the map details are a bonus */ }
            onPick(info);
          };
        } catch (err) { box.hidden = true; }
      }, 350);
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== inp) box.hidden = true; });
  }

  // ---------- Picture 294: day-by-day hours and social links ----------
  // Hours are saved as text in a form openNow() reads ("Mon–Fri 8 AM–6 PM · Sat 9 AM–2 PM · Closed Sun").
  var WDAYS = [['mon', 'Mon', 'Monday'], ['tue', 'Tue', 'Tuesday'], ['wed', 'Wed', 'Wednesday'], ['thu', 'Thu', 'Thursday'], ['fri', 'Fri', 'Friday'], ['sat', 'Sat', 'Saturday'], ['sun', 'Sun', 'Sunday']];
  var JSDAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  var hm = function (m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM'; return (h % 12 || 12) + (mm ? ':' + String(mm).padStart(2, '0') : '') + ' ' + ap; };
  function parseWeek(text) {
    var w = {}, any = false; WDAYS.forEach(function (d) { w[d[0]] = { s: 'unset', o: 480, c: 1080 }; });
    if (!text) return { week: w, any: false };
    var D = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var di = function (x) { return D.indexOf(String(x).slice(0, 3).toLowerCase()); };
    var tm = function (t) { var m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(t.trim()); if (!m) return null; var h = +m[1] % 12; if (/pm/i.test(m[3] || '')) h += 12; if (!m[3] && +m[1] < 7) h += 12; return h * 60 + (+m[2] || 0); };
    text.split(/\s*[·;\n]\s*/).forEach(function (seg) {
      var c = /^closed\s+(\w+)(?:\s*[–-]\s*(\w+))?/i.exec(seg) || /^(\w+)\w*(?:\s*[–-]\s*(\w+))?\s*:?\s*closed$/i.exec(seg);
      var m = c ? null : /^(\w{3})\w*(?:\s*[–-]\s*(\w{3})\w*)?\s*:?\s+(\d[^–-]*?)\s*[–-]\s*(\d.*)$/i.exec(seg);
      var src = c || m; if (!src) return;
      var a = di(src[1]), z = src[2] ? di(src[2]) : a; if (a < 0 || z < 0) return;
      for (var k = 0; k < 7; k++) {
        var inR = a <= z ? k >= a && k <= z : k >= a || k <= z; if (!inR) continue;
        if (c) { w[D[k]] = { s: 'closed', o: 480, c: 1080 }; any = true; }
        else { var o = tm(m[3]), e = tm(m[4]); if (o != null && e != null && e > o) { w[D[k]] = { s: 'open', o: o, c: e }; any = true; } }
      }
    });
    return { week: w, any: any };
  }
  function weekText(w) {
    var out = [], i = 0;
    while (i < 7) {
      var d = w[WDAYS[i][0]];
      if (d.s === 'unset') { i++; continue; }
      if (d.s === 'closed') { out.push('Closed ' + WDAYS[i][1]); i++; continue; }
      var j = i; while (j + 1 < 7 && w[WDAYS[j + 1][0]].s === 'open' && w[WDAYS[j + 1][0]].o === d.o && w[WDAYS[j + 1][0]].c === d.c) j++;
      out.push(WDAYS[i][1] + (j > i ? '–' + WDAYS[j][1] : '') + ' ' + hm(d.o) + '–' + hm(d.c)); i = j + 1;
    }
    return out.join(' · ');
  }
  var SOCIAL = [['instagram', 'Instagram', '@yourshop'], ['facebook', 'Facebook', 'facebook.com/yourshop'], ['tiktok', 'TikTok', '@yourshop'], ['youtube', 'YouTube', '@yourshop'], ['google', 'Google Business', 'Paste your Google Maps link']];
  // What the owner typed → the full link, null when empty, false when we can't read it.
  function socialUrl(k, v) {
    v = String(v || '').trim(); if (!v) return null;
    var bare = v.replace(/^https?:\/\//i, '').replace(/^(www\.|m\.)/i, '');
    if (k === 'instagram' || k === 'tiktok') {
      var h = bare.replace(/^(instagram|tiktok)\.com\//i, '').replace(/^@/, '').replace(/[/?#].*$/, '');
      return /^[A-Za-z0-9_.]{1,40}$/.test(h) ? (k === 'instagram' ? 'https://instagram.com/' : 'https://tiktok.com/@') + h : false;
    }
    if (k === 'youtube') {
      if (/^youtube\.com\//i.test(bare)) { var yp = bare.replace(/^youtube\.com\//i, '').replace(/[?#].*$/, ''); return /^[A-Za-z0-9_.@\-/]{1,120}$/.test(yp) ? 'https://youtube.com/' + yp : false; }
      var yh = bare.replace(/^@/, ''); return /^[A-Za-z0-9_.\-]{1,60}$/.test(yh) ? 'https://youtube.com/@' + yh : false;
    }
    if (k === 'facebook') {
      var fp = /^facebook\.com\//i.test(bare) ? bare.replace(/^facebook\.com\//i, '') : bare.replace(/^@/, '');
      fp = fp.replace(/#.*$/, ''); return /^[A-Za-z0-9_.\-/?=&]{2,120}$/.test(fp) ? 'https://facebook.com/' + fp : false;
    }
    if (k === 'google') { var gu = 'https://' + bare; return /^https:\/\/(g\.page|maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.com\/maps|maps\.google\.com|business\.google\.com)\/[^\s<>"]{1,200}$/.test(gu) ? gu : false; }
    return false;
  }
  function socialShow(k, url) {
    if (!url) return '';
    if (k === 'instagram') return '@' + url.replace(/^https:\/\/instagram\.com\//, '');
    if (k === 'tiktok') return url.replace(/^https:\/\/tiktok\.com\//, '');
    if (k === 'youtube') return url.replace(/^https:\/\/youtube\.com\//, '');
    if (k === 'facebook') return url.replace(/^https:\/\//, '');
    return url;
  }
  var SOC_SVG = {
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    facebook: '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
    youtube: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',
    google: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'
  };
  function socialRow(social, cls) {
    if (!social) return '';
    var html = SOCIAL.filter(function (x) { return social[x[0]]; }).map(function (x) {
      return '<a class="' + (cls || 'sp-soc') + '" href="' + esc(social[x[0]]) + '" target="_blank" rel="noopener nofollow" aria-label="' + x[1] + '" title="' + x[1] + '" data-c="social"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SOC_SVG[x[0]] + '</svg></a>';
    }).join('');
    return html ? '<div class="sp-socs">' + html + '</div>' : '';
  }

  // ---------- Appointments (picture 295): drivers book, shops confirm ----------
  var APCOLS = 'id, business_id, driver_name, service, minutes, starts_at, offered_at, car, note, remind, status, shop_note, created_at, updated_at';
  var TZS = [['America/New_York', 'Eastern'], ['America/Chicago', 'Central'], ['America/Denver', 'Mountain'], ['America/Phoenix', 'Arizona'], ['America/Los_Angeles', 'Pacific'], ['America/Anchorage', 'Alaska'], ['Pacific/Honolulu', 'Hawaii']];
  function tzParts(d, tz) {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(d).forEach(function (x) { o[x.type] = x.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, dow: String(o.weekday).slice(0, 3).toLowerCase(), date: o.year + '-' + o.month + '-' + o.day };
  }
  // A wall-clock time at the shop (date + minutes after midnight) → the real moment.
  function zoned(date, mins, tz) {
    var a = date.split('-').map(Number), guess = Date.UTC(a[0], a[1] - 1, a[2], Math.floor(mins / 60), mins % 60);
    for (var i = 0; i < 2; i++) { var p = tzParts(new Date(guess), tz), seen = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi); guess += Date.UTC(a[0], a[1] - 1, a[2], Math.floor(mins / 60), mins % 60) - seen; }
    return new Date(guess);
  }
  function whenText(iso, tz, short) { var d = new Date(iso); return d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }) + (short ? ' ' : ' · ') + d.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }); }
  function shopDays(tz, n) { var out = [], seen = {}; for (var i = 0; out.length < n && i < n + 3; i++) { var p = tzParts(new Date(Date.now() + i * 864e5), tz); if (!seen[p.date]) { seen[p.date] = 1; out.push(p); } } return out; }
  // Open start times for one day: inside the shop's hours, outside blocked times, at least 30 min from now, room for one more car.
  function daySlots(k, week, day, mins, busy) {
    var w = week[day.dow]; if (!w || w.s !== 'open') return null;
    var out = [], slot = k.slot_min || 30, cap = k.capacity || 1, soon = Date.now() + 30 * 60000;
    for (var m = w.o; m + mins <= w.c; m += slot) {
      var blocked = (k.blocks || []).some(function (x) { var f = hmToMin(x.f), t = hmToMin(x.t); return (x.d === day.dow || x.d === day.date) && f != null && t != null && m < t && m + mins > f; });
      if (blocked) continue;
      var st = zoned(day.date, m, k.tz), en = st.getTime() + mins * 60000;
      if (st.getTime() < soon) continue;
      var n = (busy || []).filter(function (x) { var a = new Date(x.starts_at).getTime(); return a < en && a + x.minutes * 60000 > st.getTime(); }).length;
      out.push({ m: m, iso: st.toISOString(), full: n >= cap });
    }
    return out;
  }
  var hmToMin = function (v) { var mm = /^(\d{1,2}):(\d{2})/.exec(v || ''); return mm ? +mm[1] * 60 + +mm[2] : null; };
  var minToHm = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  function icsFile(a, b, tz) {
    var f = function (d) { return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }, e = function (t) { return String(t || '').replace(/[\\,;]/g, '\\$&').replace(/\n/g, ' '); };
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Carvessa//Appointments//EN', 'BEGIN:VEVENT', 'UID:' + a.id + '@carvessa.app', 'DTSTAMP:' + f(Date.now()), 'DTSTART:' + f(a.starts_at), 'DTEND:' + f(new Date(a.starts_at).getTime() + a.minutes * 60000),
      'SUMMARY:' + e(a.service + ' · ' + b.name), 'LOCATION:' + e([b.address, b.city].filter(Boolean).join(', ')), 'DESCRIPTION:' + e('Booked on Carvessa. Change or cancel up to 2 hours before: https://carvessa.app/appointments/'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })), l = document.createElement('a'); l.href = url; l.download = 'carvessa-appointment.ics'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function bkSheet() {
    var ov = document.createElement('div'); ov.className = 'bk-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="bk-box"><button type="button" class="bk-x" aria-label="Close">✕</button><div class="bk-in"></div></div>';
    document.body.appendChild(ov); document.body.classList.add('bk-open');
    var close = function () { ov.remove(); document.body.classList.remove('bk-open'); };
    ov.querySelector('.bk-x').onclick = close; ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); } });
    return { el: ov.querySelector('.bk-in'), close: close };
  }
  // The driver's booking flow. opts.change = an appointment to move (service stays the same).
  async function bookFlow(b, k, opts) {
    opts = opts || {};
    var sh = bkSheet(), host = sh.el, week = parseWeek(b.hours).week;
    host.innerHTML = '<p class="lead">Loading open times…</p>';
    var sv = opts.change ? { data: [] } : await sb.from('business_services').select('name, price_from, minutes, bookable').eq('business_id', b.id).order('sort');
    var list = (sv.data || []).filter(function (x) { return x.bookable !== false; });
    var days = shopDays(k.tz, 14), from = zoned(days[0].date, 0, k.tz).toISOString(), to = zoned(days[days.length - 1].date, 1439, k.tz).toISOString();
    var busy = (await sb.rpc('appt_busy', { b: b.id, d0: from, d1: to })).data || [];
    if (opts.change) busy = busy.filter(function (x) { return !(x.starts_at === opts.change.starts_at && x.minutes === opts.change.minutes); });
    var st = { svc: opts.change ? { name: opts.change.service, minutes: opts.change.minutes } : null, other: '', day: null, slot: null, car: '', note: '', remind: true };
    var hasHours = WDAYS.some(function (d) { return week[d[0]].s === 'open'; });
    function draw() {
      var mins = st.svc ? st.svc.minutes : 30;
      var dayHtml = days.map(function (d, i) { var sl = daySlots(k, week, d, mins, busy), open = sl && sl.some(function (x) { return !x.full; }), lab = new Date(zoned(d.date, 720, k.tz)).toLocaleDateString('en-US', { timeZone: k.tz, weekday: 'short' });
        return '<button type="button" data-day="' + i + '" class="bk-day' + (st.day === i ? ' on' : '') + '"' + (open ? '' : ' disabled') + '><small>' + lab + '</small><b>' + d.d + '</b><em>' + (sl ? (open ? '' : 'Full') : 'Closed') + '</em></button>'; }).join('');
      var slots = st.day != null ? daySlots(k, week, days[st.day], mins, busy) || [] : [];
      host.innerHTML = '<p class="bk-k">' + (opts.change ? 'CHANGE YOUR TIME' : 'BOOK A TIME') + '</p><h2 class="bk-h">' + esc(b.name) + '</h2>' +
        (!hasHours ? '<div class="bz-msg bad">This business hasn’t set its hours yet, so online booking isn’t open. Message or call them instead.</div>' :
        (opts.change ? '<p class="bk-sub">' + esc(st.svc.name) + ' · now ' + esc(whenText(opts.change.starts_at, k.tz)) + '</p>' :
          '<h3 class="bk-s"><i>1</i>What do you need?</h3><div class="bk-svcs">' + list.map(function (x, i) { var mn = x.minutes || 30; return '<button type="button" data-svc="' + i + '" class="bk-svc' + (st.svc && st.svc.i === i ? ' on' : '') + '"><b>' + esc(x.name) + '</b><span>' + (mn >= 60 ? (mn / 60) + ' hr' : mn + ' min') + (x.price_from != null ? ' · from $' + Number(x.price_from).toLocaleString('en-US') : '') + '</span></button>'; }).join('') +
          '<button type="button" data-svc="other" class="bk-svc' + (st.svc && st.svc.i === 'other' ? ' on' : '') + '"><b>Something else</b><span>Tell them below</span></button></div>') +
        (st.svc ? '<h3 class="bk-s"><i>' + (opts.change ? 1 : 2) + '</i>Pick a day</h3><div class="bk-days">' + dayHtml + '</div>' : '') +
        (st.day != null ? '<h3 class="bk-s"><i>' + (opts.change ? 2 : 3) + '</i>Pick a time</h3>' + (slots.length ? '<div class="bk-slots">' + slots.map(function (x, i) { return '<button type="button" data-slot="' + i + '" class="bk-slot' + (st.slot === i ? ' on' : '') + '"' + (x.full ? ' disabled aria-label="' + hm(x.m) + ', full"' : '') + '>' + hm(x.m) + '</button>'; }).join('') + '</div>' : '<p class="bk-sub">No open times left that day.</p>') : '') +
        (st.slot != null && !opts.change ? '<h3 class="bk-s"><i>4</i>Your car and a note</h3><div class="bz-two"><label class="bz-f"><span>Your car</span><input id="bkCar" maxlength="80" placeholder="2018 Chevy Trax" value="' + esc(st.car) + '"></label><label class="bz-f"><span>Miles (optional)</span><input id="bkMi" maxlength="9" inputmode="numeric" placeholder="84,200"></label></div>' +
          '<label class="bz-f"><span>' + (st.svc.i === 'other' ? 'What do you need?' : 'Anything they should know? (optional)') + '</span><textarea id="bkNote" maxlength="400" placeholder="Tire light came on too. Can you check?">' + esc(st.note) + '</textarea></label>' +
          '<label class="bz-ck"><input type="checkbox" id="bkRem"' + (st.remind ? ' checked' : '') + '><span>Remind me the day before and 1 hour before</span></label>' +
          '<p class="rv-fine">The shop sees your first name, car and note. Your phone and email stay private unless you share them. No payment on Carvessa.</p>' : '') +
        (st.slot != null ? '<div class="bz-row"><button type="button" class="bz-btn" id="bkGo">' + (opts.change ? 'Change to ' : k.auto_confirm ? 'Book ' : 'Ask for ') + esc(whenText(slots[st.slot].iso, k.tz, true)) + '</button></div><div class="bz-msg" id="bkM" role="status"></div><div id="bkAcct"></div>' : ''));
    }
    draw();
    host.addEventListener('input', function (e) { if (e.target.id === 'bkCar') st.car = e.target.value; if (e.target.id === 'bkNote') st.note = e.target.value; });
    host.addEventListener('change', function (e) { if (e.target.id === 'bkRem') st.remind = e.target.checked; });
    host.addEventListener('click', async function (e) {
      var t = e.target.closest('button'); if (!t || t.disabled) return;
      if (t.hasAttribute('data-svc')) { var v = t.getAttribute('data-svc'); st.svc = v === 'other' ? { i: 'other', name: 'Something else', minutes: Math.max(k.slot_min || 30, 60) } : { i: +v, name: list[+v].name, minutes: list[+v].minutes || 30 }; st.slot = null; draw(); return; }
      if (t.hasAttribute('data-day')) { st.day = +t.getAttribute('data-day'); st.slot = null; draw(); var sl = host.querySelector('.bk-slots'); if (sl) sl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
      if (t.hasAttribute('data-slot')) { st.slot = +t.getAttribute('data-slot'); draw(); var go = host.querySelector('#bkGo'); if (go) go.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
      if (t.id !== 'bkGo') return;
      var slot = daySlots(k, week, days[st.day], st.svc.minutes, busy)[st.slot], m = host.querySelector('#bkM');
      if (!opts.change && st.svc.i === 'other' && st.note.trim().length < 3) { m.className = 'bz-msg bad'; m.textContent = 'Please tell them what you need.'; return; }
      var u = (await sb.auth.getUser()).data.user;
      var send = async function () {
        m.className = 'bz-msg'; m.textContent = 'Sending…'; t.disabled = true;
        var mi = host.querySelector('#bkMi'), car = (st.car.trim() + (mi && mi.value.trim() ? ' · ' + mi.value.replace(/[^\d,]/g, '') + ' mi' : '')).slice(0, 80);
        var r = opts.change ? await sb.rpc('appt_driver', { a: opts.change.id, action: 'change', new_st: slot.iso })
          : await sb.rpc('appt_book', { b: b.id, svc: st.svc.i === 'other' ? 'Something else' : st.svc.name, mins: st.svc.minutes, st: slot.iso, car_t: car || null, note_t: st.note.trim() || null, rem: st.remind });
        t.disabled = false;
        if (r.error) { m.className = 'bz-msg bad'; m.textContent = (r.error.message || '').replace(/^.*?:\s*/, '') || 'That didn’t go through. Please try again.'; if (/filled up/.test(r.error.message || '')) { busy.push({ starts_at: slot.iso, minutes: 1e4 }); } return; }
        var auto = !opts.change && k.auto_confirm;
        host.innerHTML = '<div class="bk-done"><span class="bk-ok">' + icon('check', 28) + '</span><h2 class="bk-h">' + (opts.change ? 'Time changed' : auto ? 'You’re booked' : 'Request sent') + '</h2>' +
          '<p class="bk-sub">' + esc(st.svc.name) + ' · ' + esc(whenText(slot.iso, k.tz)) + ' · ' + esc(b.name) + '</p>' +
          '<p>' + (auto || (opts.change && k.auto_confirm) ? 'It’s confirmed. We’ll remind you the day before and 1 hour before.' : 'The shop confirms it here and we email you. If they can’t, they can offer another time.') + '</p>' +
          '<div class="bz-row"><a class="bz-btn" href="/appointments/">See my appointments</a><button type="button" class="bz-btn soft" id="bkDone">Close</button></div></div>';
        host.querySelector('#bkDone').onclick = function () { sh.close(); };
        if (opts.onDone) opts.onDone();
      };
      if (u) { send(); return; }
      // Not logged in yet: sign in right here, then send. Everything they picked stays.
      m.className = 'bz-msg'; m.textContent = 'Last step: log in or create a free account, so the shop can confirm and we can remind you.';
      account(function () { host.querySelector('#bkAcct').innerHTML = ''; send(); }, host.querySelector('#bkAcct'));
    });
  }
  // Business HQ › Appointments
  async function hqAppts(el, cur, head, go) {
    var k = (await sb.from('business_booking').select('*').eq('business_id', cur.id).maybeSingle()).data;
    var kk = k || { active: false, slot_min: 30, capacity: 1, auto_confirm: false, tz: 'America/New_York', blocks: [] };
    var since = new Date(Date.now() - 3 * 864e5).toISOString();
    var r = await sb.from('appointments').select(APCOLS).eq('business_id', cur.id).gte('starts_at', since).order('starts_at').limit(400);
    var all = r.data || [], now = Date.now(), tz = kk.tz, week = parseWeek(cur.hours).week, hasHours = WDAYS.some(function (d) { return week[d[0]].s === 'open'; });
    var reqs = all.filter(function (a) { return a.status === 'requested'; }), offered = all.filter(function (a) { return a.status === 'offered'; });
    var coming = all.filter(function (a) { return a.status === 'confirmed' && new Date(a.starts_at).getTime() > now - 3 * 3600e3; });
    var unmarked = all.filter(function (a) { return a.status === 'confirmed' && new Date(a.starts_at).getTime() <= now - 3 * 3600e3; });
    var card = function (a, btns) {
      return '<div class="ap-c" data-a="' + a.id + '"><div class="ap-t"><b>' + esc(whenText(a.starts_at, tz)) + '</b><span>' + esc(a.minutes >= 60 ? a.minutes / 60 + ' hr' : a.minutes + ' min') + '</span></div>' +
        '<div class="ap-w"><b>' + esc(a.driver_name) + ' · ' + esc(a.service) + '</b>' + (a.car ? '<span>' + esc(a.car) + '</span>' : '') + (a.note ? '<q>' + esc(a.note) + '</q>' : '') +
        (a.status === 'offered' && a.offered_at ? '<span class="ap-off">You offered ' + esc(whenText(a.offered_at, tz)) + '. Waiting for ' + esc(a.driver_name) + '.</span>' : '') + '</div>' +
        '<div class="ap-b">' + btns + B('chat', 'Message', 'soft') + '</div><div class="ap-x"></div><div class="bz-msg" role="status"></div></div>';
    };
    var B = function (act, lab, cls) { return '<button type="button" class="bz-btn bz-small ' + (cls || '') + '" data-act="' + act + '">' + lab + '</button>'; };
    var byDay = {}; coming.forEach(function (a) { var d = whenText(a.starts_at, tz).split(' · ')[0]; (byDay[d] = byDay[d] || []).push(a); });
    el.innerHTML = head('APPOINTMENTS', kk.active ? (reqs.length ? reqs.length + ' new request' + (reqs.length > 1 ? 's' : '') : 'Your week') : 'Let drivers book a time', kk.active ? 'On' : '') +
      (!kk.active ? '<div class="hq-card"><p>Drivers pick a service, a day and an open time from your hours. You confirm each one (or turn on auto-confirm). They get reminders, so fewer no-shows. No payment on Carvessa.</p></div>' : '') +
      (kk.active && !hasHours ? '<div class="bz-msg bad">Set your hours first (My page › Hours). Without hours, drivers can’t see open times.</div>' : '') +
      (reqs.length ? '<h3 class="ap-h">New requests</h3>' + reqs.map(function (a) { return card(a, B('confirm', 'Confirm') + B('offer', 'Offer another time', 'soft') + B('decline', 'Decline', 'soft')); }).join('') : '') +
      (offered.length ? '<h3 class="ap-h">Waiting for the driver</h3>' + offered.map(function (a) { return card(a, B('decline', 'Cancel it', 'soft')); }).join('') : '') +
      (unmarked.length ? '<h3 class="ap-h">Did they come in?</h3>' + unmarked.map(function (a) { return card(a, B('came', 'Came in') + B('noshow', 'No-show', 'soft')); }).join('') : '') +
      (kk.active ? '<h3 class="ap-h">Coming up</h3>' + (coming.length ? Object.keys(byDay).map(function (d) { return '<p class="ap-d">' + esc(d) + '</p>' + byDay[d].map(function (a) { return card(a, (new Date(a.starts_at).getTime() < now + 12 * 3600e3 ? B('came', 'Came in') + B('noshow', 'No-show', 'soft') : '') + B('offer', 'Move it', 'soft') + B('decline', 'Cancel it', 'soft')); }).join(''); }).join('') : '<p class="hq-fine">Nothing booked yet. Share your page link so drivers can book.</p>') : '') +
      '<h3 class="ap-h">Booking settings</h3><div class="hq-card ap-set">' +
        '<label class="bz-ck"><input type="checkbox" id="apOn"' + (kk.active ? ' checked' : '') + '><span><b>Open for booking</b> (drivers see “Book a time” on your page)</span></label>' +
        '<div class="bz-two"><label class="bz-f"><span>Time slots</span><select id="apSlot">' + [15, 30, 60].map(function (n) { return '<option value="' + n + '"' + (kk.slot_min === n ? ' selected' : '') + '>Every ' + n + ' min</option>'; }).join('') + '</select></label>' +
        '<label class="bz-f"><span>Cars at the same time</span><select id="apCap">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option' + (kk.capacity === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="bz-ck"><input type="checkbox" id="apAuto"' + (kk.auto_confirm ? ' checked' : '') + '><span>Confirm automatically (no tap needed)</span></label>' +
        '<label class="bz-f"><span>Time zone</span><select id="apTz">' + TZS.map(function (z) { return '<option value="' + z[0] + '"' + (kk.tz === z[0] ? ' selected' : '') + '>' + z[1] + '</option>'; }).join('') + '</select></label>' +
        '<div class="bz-f"><span>Blocked times (lunch, days off)</span><div id="apBlocks"></div><div class="ap-add"><select id="apBd"><option value="">Every…</option>' + WDAYS.map(function (d) { return '<option value="' + d[0] + '">Every ' + d[2] + '</option>'; }).join('') + '</select><input type="date" id="apBdt" aria-label="Or one date"><input type="time" id="apBf" value="12:00" aria-label="From"><input type="time" id="apBt" value="13:00" aria-label="To"><button type="button" class="bz-btn soft bz-small" id="apBadd">Add</button></div></div>' +
        '<p class="hq-fine">Open times come from your hours (My page › Hours). How long each service takes: My page › Services and prices.</p>' +
        '<div class="bz-row"><button type="button" class="bz-btn" id="apSave">Save settings</button></div><div class="bz-msg" id="apM" role="status"></div></div>';
    var blocks = (kk.blocks || []).slice();
    var drawBlocks = function () { el.querySelector('#apBlocks').innerHTML = blocks.length ? blocks.map(function (x, i) { var d = WDAYS.filter(function (w) { return w[0] === x.d; })[0]; return '<div class="ap-bl"><span>' + esc(d ? 'Every ' + d[2] : new Date(x.d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })) + ' · ' + hm(hmToMin(x.f)) + '–' + hm(hmToMin(x.t)) + '</span><button type="button" data-rmb="' + i + '" aria-label="Remove">✕</button></div>'; }).join('') : '<p class="hq-fine">None yet.</p>'; };
    drawBlocks();
    el.querySelector('#apBlocks').onclick = function (e) { var i = e.target.getAttribute('data-rmb'); if (i != null) { blocks.splice(+i, 1); drawBlocks(); } };
    el.querySelector('#apBadd').onclick = function () {
      var d = el.querySelector('#apBdt').value || el.querySelector('#apBd').value, f = el.querySelector('#apBf').value, t = el.querySelector('#apBt').value, m = el.querySelector('#apM');
      if (!d || !f || !t || hmToMin(t) <= hmToMin(f)) { m.className = 'bz-msg bad'; m.textContent = 'Pick a day (or a date) and a time where “to” is after “from”.'; return; }
      blocks.push({ d: d, f: f, t: t }); drawBlocks(); m.textContent = '';
    };
    el.querySelector('#apSave').onclick = async function () {
      var m = el.querySelector('#apM'), row = { business_id: cur.id, active: el.querySelector('#apOn').checked, slot_min: +el.querySelector('#apSlot').value, capacity: +el.querySelector('#apCap').value, auto_confirm: el.querySelector('#apAuto').checked, tz: el.querySelector('#apTz').value, blocks: blocks, updated_at: new Date().toISOString() };
      m.className = 'bz-msg'; m.textContent = 'Saving…';
      var x = k ? await sb.from('business_booking').update(row).eq('business_id', cur.id) : await sb.from('business_booking').insert(row);
      if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
      hqAppts(el, cur, head, go);
    };
    el.onclick = async function (e) {
      var bt = e.target.closest('[data-act]'); if (!bt) return;
      var c = bt.closest('.ap-c'), id = c.getAttribute('data-a'), act = bt.getAttribute('data-act'), m = c.querySelector('.bz-msg'), a = all.filter(function (x) { return x.id === id; })[0];
      if (act === 'chat') { bt.disabled = true; var ch = await sb.rpc('appt_chat', { a: id }); bt.disabled = false; if (ch.error) { m.className = 'bz-msg bad'; m.textContent = (ch.error.message || '').replace(/^.*?:\s*/, ''); return; } if (go) go('messages', ch.data); return; }
      if (act === 'offer') {
        var days = shopDays(tz, 14), x = c.querySelector('.ap-x');
        x.innerHTML = '<div class="ap-pick"><select data-od><option value="">Pick a day</option>' + days.map(function (d, i) { return '<option value="' + i + '">' + new Date(zoned(d.date, 720, tz)).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }) + '</option>'; }).join('') + '</select><select data-ot disabled><option>Time</option></select><input data-om maxlength="200" placeholder="Short note (optional)"><button type="button" class="bz-btn bz-small" data-act="offer-go">Send this time</button></div>';
        var busy = ((await sb.rpc('appt_busy', { b: cur.id, d0: zoned(days[0].date, 0, tz).toISOString(), d1: zoned(days[13].date, 1439, tz).toISOString() })).data || []).filter(function (y) { return y.starts_at !== a.starts_at; });
        x.querySelector('[data-od]').onchange = function () { var sl = this.value === '' ? [] : daySlots(kk, week, days[+this.value], a.minutes, busy) || [], ot = x.querySelector('[data-ot]'); ot.disabled = !sl.length; ot.innerHTML = sl.length ? sl.filter(function (z) { return !z.full; }).map(function (z) { return '<option value="' + z.iso + '">' + hm(z.m) + '</option>'; }).join('') : '<option>No open times</option>'; };
        return;
      }
      var arg = { a: id, action: act === 'offer-go' ? 'offer' : act };
      if (act === 'offer-go') { var ot = c.querySelector('[data-ot]'); if (!ot || ot.disabled || !ot.value || !/T/.test(ot.value)) { m.className = 'bz-msg bad'; m.textContent = 'Pick a day and a time.'; return; } arg.new_st = ot.value; arg.msg = c.querySelector('[data-om]').value || null; }
      if (act === 'decline') { var why = prompt('Tell ' + a.driver_name + ' why (optional). They’ll get an email.', ''); if (why === null) return; arg.msg = why || null; }
      bt.disabled = true; m.className = 'bz-msg'; m.textContent = 'Saving…';
      var res = await sb.rpc('appt_shop', arg);
      if (res.error) { bt.disabled = false; m.className = 'bz-msg bad'; m.textContent = (res.error.message || '').replace(/^.*?:\s*/, '') || 'That didn’t save.'; return; }
      if (act === 'came' && res.data && res.data.stamped) alert('Added a loyalty stamp for ' + a.driver_name + '.');
      hqAppts(el, cur, head, go);
    };
  }

  // ---------- The business form (join step 3 and My page) ----------
  function form(b, svcs, onSave, host) {
    host = host || root.querySelector('#bzForm');
    var h = b.header || { style: b.id && WALLS[b.wallpaper] && !b.header ? 'legacy' : 'photo' };
    var st = { kind: b.kind || 'repair', header: { style: h.style || 'photo', pattern: h.pattern || 'fade', c1: hex(h.c1, '#1F3F9F'), c2: hex(h.c2, '#5B8DEF'), photo: h.photo || null }, logo: b.logo || null, photos: (b.photos || []).slice(), svcs: svcs.length ? svcs.map(function (s) { return { name: s.name, price: s.price_from == null ? '' : s.price_from, minutes: s.minutes || '' }; }) : [{ name: '', price: '', minutes: '' }] };
    var f = function (id, label, val, extra) { return '<label class="bz-f"><span>' + label + '</span><input id="' + id + '" value="' + esc(val) + '" ' + (extra || '') + '></label>'; };
    var STEPS = [
      ['Find you', 'Type your business name. We look it up on the map and fill in what we can.'],
      ['Basics', 'Check what drivers will see.'],
      ['Hours', 'Pick each day. Drivers see “Open now” or “Closed”.'],
      ['About and links', 'Tell drivers why they should pick you. Add the places they already follow you.'],
      ['Your look', 'Header, logo and photos. All optional, you can change them later.'],
      ['Services and prices', 'You set them. Prices show as “from $X”.'],
      ['Owner check', 'We confirm every business before its page goes live. Drivers never see this.']];
    var sec = function (n, inner) { return '<section class="pf-sec" data-step="' + n + '"' + (n ? ' hidden' : '') + '><h3 class="pf-h">' + STEPS[n][0] + '</h3><p class="pf-sub">' + STEPS[n][1] + '</p>' + inner + '</section>'; };
    var soc = b.social || {};
    host.innerHTML = '<div class="pf"><div class="pf-main">' +
      '<ol class="pf-steps" id="fSteps">' + STEPS.map(function (x, n) { return '<li><button type="button" data-go="' + n + '"><i>' + (n + 1) + '</i><span>' + x[0] + '</span></button></li>'; }).join('') + '</ol>' +
      '<div class="bz-msg" id="fDraft" role="status" hidden></div>' +
      '<details class="pf-pvm"><summary>See your page as you go</summary><div class="pf-pv" id="fPv2"></div></details>' +
      sec(0, '<div class="bz-f bz-namebox"><span>Business name</span><input id="fName" maxlength="80" value="' + esc(b.name) + '" placeholder="Start typing, we’ll look you up"><div class="bz-sug" id="fSug" hidden></div></div>' +
        '<div class="bz-found" id="fFound" hidden></div>') +
      sec(1, '<div class="bz-f"><span>What kind of business?</span><div class="bz-chips" id="fKind"></div></div>' +
        f('fAddr', 'Street address', b.address, 'maxlength="160" autocomplete="street-address"') +
        f('fCity', 'City and state', b.city, 'maxlength="60" placeholder="Atlanta, GA"') +
        f('fPhone', 'Phone', b.phone, 'maxlength="30" inputmode="tel" autocomplete="tel"')) +
      sec(2, '<input type="hidden" id="fHours" value="' + esc(b.hours) + '"><div class="bz-msg" id="fHoursOld" hidden></div><div class="pf-week" id="fWeek"></div>' +
        '<button type="button" class="bz-btn soft bz-small" id="fCopy">Same hours every weekday? Copy Monday to Tue–Fri</button><small class="pf-small">Holidays can change hours. Post a “Hours change” update in Business HQ when they do.</small>') +
      sec(3, '<label class="bz-f"><span>About your business</span><textarea id="fAbout" maxlength="600" placeholder="Family shop since 2009. Tires, brakes and oil changes, most same day. Hablamos español.">' + esc(b.about) + '</textarea><small>Tip: what you do best, how long you’ve been open, languages you speak.</small></label>' +
        f('fWeb', 'Website (optional)', b.website, 'maxlength="200" inputmode="url" placeholder="yourshop.com"') +
        '<div class="bz-f"><span>Social media (optional)</span><div class="pf-socs">' + SOCIAL.map(function (x) { return '<label class="pf-soc"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SOC_SVG[x[0]] + '</svg></i><input id="fS_' + x[0] + '" maxlength="220" placeholder="' + x[2] + '" value="' + esc(socialShow(x[0], soc[x[0]])) + '" aria-label="' + x[1] + '"></label>'; }).join('') + '</div><small>They show as round buttons on your page. Make sure each one opens your page.</small></div>' +
        '<label class="bz-f"><span>One offer (optional)</span><input id="fOffer" maxlength="120" value="' + esc(b.offer) + '" placeholder="Free tire check"><small>Shown at the top of your page.</small></label>') +
      sec(4, '<div class="bz-f"><span>Header (optional)</span><div class="bz-hopts" id="fHopt"></div><div id="fHpanel"></div><div class="bz-hprev" id="fHprev"></div></div>' +
        '<div class="bz-f"><span>Logo (optional)</span><div class="bz-logo-row" id="fLogo"></div></div>' +
        '<div class="bz-f"><span>Photos (optional, up to 24)</span><div class="bz-pics" id="fPics"></div><small>Your shop, your work, your team. They show as a gallery on your page. No customers’ license plates please.</small></div>') +
      sec(5, '<div class="bz-f"><span id="fSvcLab">Services and prices (you set them)</span><div id="fSvcs"></div><button type="button" class="bz-btn soft bz-small" id="fAddSvc">+ Add a service or item</button><small>Leave the price empty if it depends. “How long?” is used for appointments.</small></div>') +
      sec(6, '<div class="bz-check" style="margin-top:0"><p>These help us find your business record fast.</p>' +
        f('fLegal', 'Legal name, as registered with your state', b.legal_name, 'maxlength="120" placeholder="Tony’s Auto Shop LLC"') +
        '<div class="bz-two">' + f('fRegState', 'State where it’s registered', b.state || '', 'maxlength="30" placeholder="Georgia"') + f('fCtrl', 'State control or file number (optional)', b.control_no, 'maxlength="30" placeholder="Helps us find you"') + '</div>' +
        '<div class="bz-two"><label class="bz-f"><span>Your role</span><select id="fRole">' + ['Owner', 'Co-owner', 'Manager', 'Other'].map(function (r) { return '<option' + (b.owner_role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></label>' + f('fSince', 'In business since (year)', b.since_year || '', 'inputmode="numeric" maxlength="4" placeholder="2014"') + '</div></div>') +
      '<div class="bz-row pf-nav"><button type="button" class="bz-btn soft" id="fBack">Back</button><button type="button" class="bz-btn" id="fNext">Next</button><button type="button" class="bz-btn" id="fSave">' + (b.id ? 'Save changes' : 'Send my page for the check') + '</button></div><div class="bz-msg" id="fMsg" role="status"></div>' +
      '</div><aside class="pf-side" aria-label="Live preview"><div class="pf-lab">LIVE PREVIEW · YOUR PAGE</div><div class="pf-pv" id="fPv"></div></aside></div>';
    var $ = function (id) { return host.querySelector('#' + id); };
    function drawKinds() {
      $('fKind').innerHTML = KINDS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" class="' + (st.kind === k[0] ? 'on' : '') + '">' + k[1] + '</button>'; }).join('');
      $('fSvcLab').textContent = (KINFO[st.kind] || KINFO.other).svc + ' (you set them)';
    }
    function drawSvcs() {
      var MINS = [['', 'How long?'], [15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 hr'], [90, '1½ hr'], [120, '2 hr'], [180, '3 hr'], [240, '4 hr'], [480, 'All day']];
      $('fSvcs').innerHTML = st.svcs.map(function (s, i) { return '<div class="bz-svc"><input data-i="' + i + '" data-f="name" maxlength="80" placeholder="Oil change" value="' + esc(s.name) + '" aria-label="Service name"><input data-i="' + i + '" data-f="price" inputmode="decimal" placeholder="From $" value="' + esc(s.price) + '" aria-label="Price from"><select data-i="' + i + '" data-f="minutes" aria-label="How long it takes">' + MINS.map(function (m) { return '<option value="' + m[0] + '"' + (String(s.minutes || '') === String(m[0]) ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select><button type="button" data-del="' + i + '" aria-label="Remove">✕</button></div>'; }).join('');
    }
    var HOPTS = [['photo', 'Free photo'], ['color', 'My colors'], ['own', 'My photo'], ['none', 'No picture']];
    var SW = ['#1F3F9F', '#5B8DEF', '#0F1B33', '#E63B2E', '#1D7A46', '#C9A45E', '#E8710A', '#13807A', '#6E3FA8', '#111111'];
    function drawHeader() {
      var hs = st.header;
      $('fHopt').innerHTML = HOPTS.map(function (o) { return '<button type="button" data-h="' + o[0] + '" class="' + (hs.style === o[0] || (o[0] === 'photo' && hs.style === 'legacy') ? 'on' : '') + '">' + o[1] + '</button>'; }).join('');
      var p = '';
      if (hs.style === 'color') {
        p = '<div class="bz-chips bz-pat">' + [['fade', 'Fade'], ['solid', 'Solid'], ['stripes', 'Stripes'], ['checker', 'Checker']].map(function (x) { return '<button type="button" data-p="' + x[0] + '" class="' + (hs.pattern === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
          '<div class="bz-colors"><label>Color 1 <input type="color" id="fC1" value="' + hs.c1 + '"></label>' + (hs.pattern === 'solid' ? '' : '<label>Color 2 <input type="color" id="fC2" value="' + hs.c2 + '"></label>') + '</div>' +
          '<div class="bz-sw">' + SW.map(function (c) { return '<button type="button" data-sw="' + c + '" style="background:' + c + '" aria-label="Use ' + c + '"></button>'; }).join('') + '</div><small>Tap a color square to open the color picker, or tap a ready color.</small>';
      } else if (hs.style === 'own') {
        p = '<label class="bz-btn soft bz-small" style="margin-top:8px">' + (hs.photo ? 'Change photo' : 'Choose a photo') + '<input type="file" accept="image/*" id="fHFile" hidden></label>';
      } else if (hs.style === 'photo' || hs.style === 'legacy') {
        p = '<small>A free photo that matches your kind of business. Change it any time.</small>';
      }
      $('fHpanel').innerHTML = p;
      var hv = headerOf({ header: hs, kind: st.kind, wallpaper: b.wallpaper });
      $('fHprev').style.background = hv.css;
      $('fHprev').innerHTML = (st.logo ? '<span class="lg"><img src="' + photoUrl(st.logo) + '" alt=""></span>' : '<span class="lg">' + esc(initials($('fName').value || b.name || 'Your Shop')) + '</span>') + (hv.credit ? '<em>Photo: ' + esc(hv.credit[0]) + ' · CC BY</em>' : '');
    }
    function drawLogo() {
      $('fLogo').innerHTML = (st.logo ? '<span class="bz-logo"><img src="' + photoUrl(st.logo) + '" alt="Your logo"></span><button type="button" class="bz-btn soft bz-small" id="fLogoRm">Remove</button>' : '<span class="bz-logo">' + esc(initials($('fName').value || b.name || '?')) + '</span>') +
        '<label class="bz-btn soft bz-small">' + (st.logo ? 'Change logo' : 'Upload a logo') + '<input type="file" accept="image/*" id="fLogoFile" hidden></label><small>Square works best. No logo? We show your initials.</small>';
    }
    function drawPics() {
      $('fPics').innerHTML = st.photos.map(function (p, i) { return '<div class="p"><img src="' + photoUrl(p) + '" alt="Photo ' + (i + 1) + '"><button type="button" data-rm="' + i + '" aria-label="Remove photo">✕</button></div>'; }).join('') +
        (st.photos.length < 24 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="fPicFile" hidden></label>' : '');
    }
    drawKinds(); drawSvcs(); drawHeader(); drawLogo(); drawPics();

    // Hours, day by day (picture 294).
    var pw = parseWeek(b.hours); st.week = pw.week;
    if (b.hours && !pw.any) { $('fHoursOld').hidden = false; $('fHoursOld').textContent = 'Your old hours: “' + b.hours + '”. Pick them below so “Open now” works.'; }
    var TOPTS = []; for (var tmn = 0; tmn < 1440; tmn += 30) TOPTS.push(tmn);
    var tsel = function (day, which, val) { return '<select data-d="' + day + '" data-w="' + which + '" aria-label="' + (which === 'o' ? 'Opens' : 'Closes') + '">' + TOPTS.map(function (m) { return '<option value="' + m + '"' + (m === val ? ' selected' : '') + '>' + hm(m) + '</option>'; }).join('') + '</select>'; };
    function drawWeek() {
      $('fWeek').innerHTML = WDAYS.map(function (d) {
        var x = st.week[d[0]];
        return '<div class="pf-day"><b>' + d[1] + '</b><select data-d="' + d[0] + '" data-w="s" aria-label="' + d[2] + '"><option value="unset"' + (x.s === 'unset' ? ' selected' : '') + '>Not set</option><option value="open"' + (x.s === 'open' ? ' selected' : '') + '>Open</option><option value="closed"' + (x.s === 'closed' ? ' selected' : '') + '>Closed</option></select>' +
          (x.s === 'open' ? '<span class="pf-tm">' + tsel(d[0], 'o', x.o) + '<em>to</em>' + tsel(d[0], 'c', x.c) + '</span>' : '<span class="pf-tm pf-off">' + (x.s === 'closed' ? 'Closed all day' : '') + '</span>') + '</div>';
      }).join('');
    }
    function syncHours() { $('fHours').value = weekText(st.week); }
    drawWeek(); if (pw.any) syncHours();
    $('fWeek').onchange = function (e) {
      var d = e.target.getAttribute('data-d'), w = e.target.getAttribute('data-w'); if (!d) return;
      var x = st.week[d];
      if (w === 's') { x.s = e.target.value; drawWeek(); }
      else { x[w] = +e.target.value; if (x.c <= x.o) { x.c = Math.min(x.o + 60, 1410); drawWeek(); } }
      syncHours(); pv();
    };
    $('fCopy').onclick = function () { var m = st.week.mon; ['tue', 'wed', 'thu', 'fri'].forEach(function (k) { st.week[k] = { s: m.s, o: m.o, c: m.c }; }); drawWeek(); syncHours(); pv(); };

    // Live preview: the page drivers will see, updating as they type.
    function pv() {
      var name = $('fName').value.trim() || 'Your business', kindL = (KINDS.filter(function (k) { return k[0] === st.kind; })[0] || [0, ''])[1];
      var hv = headerOf({ header: st.header, kind: st.kind, wallpaper: b.wallpaper }), hrs = $('fHours').value, os = openNow(hrs);
      var social = {}; SOCIAL.forEach(function (x) { var u = socialUrl(x[0], $('fS_' + x[0]).value); if (u) social[x[0]] = u; });
      var svc = st.svcs.filter(function (x) { return String(x.name || '').trim(); }).slice(0, 4);
      var html = '<div class="pv-hd" style="background:' + hv.css.replace(/"/g, "'") + '"><span class="pv-lg">' + (st.logo ? '<img src="' + photoUrl(st.logo) + '" alt="">' : esc(initials(name))) + '</span></div>' +
        '<div class="pv-b"><b class="pv-n">' + esc(name) + '</b><span class="pv-k">' + esc([kindL, $('fCity').value.trim()].filter(Boolean).join(' · ')) + '</span>' +
        (hrs ? '<div class="pv-card"><b>Hours</b>' + (os ? '<span class="pv-os ' + (os.open ? 'on' : '') + '">' + esc(os.text) + '</span>' : '') + hrs.split(' · ').map(function (h) { return '<div class="pv-hr">' + esc(h) + '</div>'; }).join('') + '</div>' : '<div class="pv-card pv-empty">Hours show here</div>') +
        ($('fAbout').value.trim() ? '<div class="pv-card"><b>About</b><p>' + esc($('fAbout').value.trim()) + '</p></div>' : '') +
        socialRow(Object.keys(social).length ? social : null, 'sp-soc pv-soc') +
        (svc.length ? '<div class="pv-card"><b>' + esc((KINFO[st.kind] || KINFO.other).svc) + '</b>' + svc.map(function (x) { var pr = String(x.price || '').replace(/[^\d.]/g, ''); return '<div class="pv-sv"><span>' + esc(x.name) + '</span><em>' + (pr ? 'from $' + esc(pr) : '') + '</em></div>'; }).join('') + '</div>' : '') +
        ($('fAddr').value.trim() ? '<div class="pv-card pv-addr">' + esc([$('fAddr').value.trim(), $('fCity').value.trim()].filter(Boolean).join(', ')) + '</div>' : '') +
        '</div><div class="pv-bar"><span class="on">Message</span><span>Call</span><span>Go</span></div>';
      $('fPv').innerHTML = html; $('fPv2').innerHTML = html;
    }
    var pvT = 0; host.addEventListener('input', function () { cancelAnimationFrame(pvT); pvT = requestAnimationFrame(pv); });
    host.addEventListener('click', function () { cancelAnimationFrame(pvT); pvT = requestAnimationFrame(pv); });

    // Steps: one short step at a time. New pages keep a draft on this device; My page saves on each Next.
    var stepNow = 0, seen = b.id ? 6 : 0, DKEY = 'carvessa:pagedraft:v1';
    var FIELDS = ['fName', 'fAddr', 'fCity', 'fPhone', 'fWeb', 'fHours', 'fAbout', 'fOffer', 'fLegal', 'fRegState', 'fCtrl', 'fRole', 'fSince'].concat(SOCIAL.map(function (x) { return 'fS_' + x[0]; }));
    function saveDraft() {
      if (b.id) return;
      var v = {}; FIELDS.forEach(function (id) { v[id] = $(id).value; });
      try { localStorage.setItem(DKEY, JSON.stringify({ at: Date.now(), v: v, kind: st.kind, header: st.header, logo: st.logo, photos: st.photos, svcs: st.svcs, week: st.week, step: stepNow, seen: seen })); } catch (err) { /* private mode: fine */ }
    }
    if (!b.id) {
      try {
        var dr = JSON.parse(localStorage.getItem(DKEY) || 'null');
        if (dr && Date.now() - dr.at < 14 * 864e5 && dr.v && dr.v.fName) {
          FIELDS.forEach(function (id) { if (dr.v[id] != null) $(id).value = dr.v[id]; });
          st.kind = dr.kind || st.kind; st.header = dr.header || st.header; st.logo = dr.logo || null; st.photos = dr.photos || []; st.svcs = dr.svcs && dr.svcs.length ? dr.svcs : st.svcs; if (dr.week) st.week = dr.week;
          st.picked = dr.v.fName; seen = dr.seen || 0;
          drawKinds(); drawSvcs(); drawHeader(); drawLogo(); drawPics(); drawWeek();
          $('fDraft').hidden = false; $('fDraft').className = 'bz-msg good'; $('fDraft').innerHTML = '✓ We kept what you typed last time. <button type="button" class="pf-link" id="fClear">Start over</button>';
          $('fDraft').querySelector('#fClear').onclick = function () { try { localStorage.removeItem(DKEY); } catch (err) { /* fine */ } location.reload(); };
          stepNow = Math.min(dr.step || 0, 6);
        }
      } catch (err) { /* a broken draft is skipped */ }
    }
    function checkStep(n) {
      var m = $('fMsg'); m.className = 'bz-msg bad'; m.textContent = '';
      if (n === 0 && $('fName').value.trim().length < 2) { m.textContent = 'Please type your business name.'; return false; }
      if (n === 1) {
        if ($('fCity').value.trim().length < 2) { m.textContent = 'Please type your city and state.'; return false; }
        if (!/\d{7,}/.test($('fPhone').value.replace(/\D/g, ''))) { m.textContent = 'Please type a phone number we can call to confirm you’re the owner.'; return false; }
      }
      if (n === 3) { for (var k = 0; k < SOCIAL.length; k++) { if (socialUrl(SOCIAL[k][0], $('fS_' + SOCIAL[k][0]).value) === false) { m.textContent = 'We can’t read your ' + SOCIAL[k][1] + ' link. ' + (SOCIAL[k][0] === 'google' ? 'Paste the link from Google Maps (Share › Copy link).' : 'Type it like ' + SOCIAL[k][2] + '.'); return false; } } }
      return true;
    }
    function goStep(n) {
      stepNow = n; seen = Math.max(seen, n);
      host.querySelectorAll('.pf-sec').forEach(function (x) { x.hidden = +x.getAttribute('data-step') !== n; });
      host.querySelectorAll('#fSteps button').forEach(function (bt) { var k = +bt.getAttribute('data-go'); bt.className = k === n ? 'on' : k <= seen ? 'done' : ''; bt.disabled = k > seen; if (k === n) bt.setAttribute('aria-current', 'step'); else bt.removeAttribute('aria-current'); });
      $('fBack').hidden = n === 0;
      $('fNext').hidden = n === 6;
      $('fNext').textContent = n < 6 ? 'Next: ' + STEPS[n + 1][0].toLowerCase() : 'Next';
      $('fSave').hidden = !b.id && n !== 6;
      saveDraft(); pv();
    }
    host._go = function (fieldId) { var el = host.querySelector('#' + fieldId); var sc = el && el.closest('.pf-sec'); if (sc) goStep(+sc.getAttribute('data-step')); return el; };
    $('fSteps').onclick = function (e) { var bt = e.target.closest('[data-go]'); if (bt && !bt.disabled) { var n = +bt.getAttribute('data-go'); if (n <= stepNow || checkStep(stepNow)) goStep(n); } };
    $('fBack').onclick = function () { if (stepNow > 0) { goStep(stepNow - 1); host.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
    $('fNext').onclick = async function () {
      if (!checkStep(stepNow)) return;
      if (b.id) { var ok = await doSave(true); if (!ok) return; }
      goStep(stepNow + 1); host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    host.addEventListener('change', function () { saveDraft(); });
    nameSearch(st, $, function (info) {
      var put = function (id, v) { if (v && !$(id).value.trim()) { $(id).value = v; return 1; } return 0; };
      var n = 0;
      $('fName').value = info.name; n += put('fAddr', info.address) + put('fCity', info.city) + put('fPhone', info.phone) + put('fWeb', info.website) + put('fHours', info.hours);
      if (info.hours) { var pw2 = parseWeek($('fHours').value); if (pw2.any) { st.week = pw2.week; drawWeek(); syncHours(); } }
      if (info.kind) { st.kind = info.kind; drawKinds(); n++; }
      if (!$('fRegState').value && /, GA$/.test(info.city || '')) $('fRegState').value = 'Georgia';
      if (info.lat != null) st.spot = { lat: info.lat, lon: info.lon, key: [$('fAddr').value.trim(), $('fCity').value.trim()].join('|') };
      $('fFound').hidden = false;
      $('fFound').textContent = n ? '✓ We filled in ' + n + ' thing' + (n > 1 ? 's' : '') + ' from OpenStreetMap (© OpenStreetMap contributors). Check them and fix anything that’s off.' : 'Found you on the map, but there were no extra details. Please fill in the rest.';
      drawHeader(); drawLogo();
    });
    $('fKind').onclick = function (e) { var k = e.target.getAttribute('data-k'); if (k) { st.kind = k; drawKinds(); drawHeader(); } };
    $('fSvcs').oninput = $('fSvcs').onchange = function (e) { var i = e.target.getAttribute('data-i'); if (i != null) st.svcs[+i][e.target.getAttribute('data-f')] = e.target.value; };
    $('fSvcs').onclick = function (e) { var i = e.target.getAttribute('data-del'); if (i != null) { st.svcs.splice(+i, 1); if (!st.svcs.length) st.svcs.push({ name: '', price: '', minutes: '' }); drawSvcs(); } };
    $('fAddSvc').onclick = function () { if (st.svcs.length < 30) { st.svcs.push({ name: '', price: '', minutes: '' }); drawSvcs(); } };
    $('fHopt').onclick = function (e) { var s = e.target.getAttribute('data-h'); if (s) { st.header.style = s; drawHeader(); } };
    $('fHpanel').onclick = function (e) {
      var p = e.target.getAttribute('data-p'), c = e.target.getAttribute('data-sw');
      if (p) { st.header.pattern = p; drawHeader(); }
      if (c) { if (st.header.pattern === 'solid' || st._next !== 2) { st.header.c1 = c; st._next = 2; } else { st.header.c2 = c; st._next = 1; } drawHeader(); }
    };
    $('fHpanel').oninput = function (e) { if (e.target.id === 'fC1') st.header.c1 = e.target.value; if (e.target.id === 'fC2') st.header.c2 = e.target.value; var hv = headerOf({ header: st.header, kind: st.kind }); $('fHprev').style.background = hv.css; };
    $('fName').addEventListener('input', function () { if (!st.logo) { drawLogo(); var l = $('fHprev').querySelector('.lg'); if (l) l.textContent = initials($('fName').value || 'Your Shop'); } });
    $('fLogo').onclick = function (e) { if (e.target.id === 'fLogoRm') { st.logo = null; drawLogo(); drawHeader(); } };
    host.addEventListener('change', async function (e) {
      var id = e.target.id; if (['fHFile', 'fPicFile', 'fLogoFile'].indexOf(id) < 0) return;
      var file = e.target.files && e.target.files[0]; if (!file) return;
      var me = (await sb.auth.getUser()).data.user; if (!me) return;
      $('fMsg').className = 'bz-msg'; $('fMsg').textContent = 'Uploading…';
      try {
        var p = await upload(me.id, file, id === 'fLogoFile' ? 600 : 1600);
        if (id === 'fHFile') { st.header.photo = p; st.header.style = 'own'; drawHeader(); }
        else if (id === 'fLogoFile') { st.logo = p; drawLogo(); drawHeader(); }
        else { st.photos.push(p); drawPics(); }
        $('fMsg').textContent = '';
      } catch (err) { $('fMsg').className = 'bz-msg bad'; $('fMsg').textContent = 'That photo didn’t upload. Try a JPG or PNG photo.'; }
    });
    $('fPics').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawPics(); } };
    $('fSave').onclick = function () { doSave(false); };
    async function doSave(quiet) {
      var name = $('fName').value.trim(), phone = $('fPhone').value.trim(), msg = $('fMsg');
      msg.className = 'bz-msg bad';
      for (var cs = 0; cs < 4; cs++) { if (!checkStep(cs)) { goStep(cs); return false; } }
      var since = parseInt($('fSince').value, 10);
      if ($('fSince').value && !(since >= 1900 && since <= new Date().getFullYear())) { msg.textContent = 'Please type the year you started, like 2014.'; goStep(6); return false; }
      var hs = st.header, header = { style: hs.style === 'legacy' ? 'legacy' : hs.style };
      if (hs.style === 'color') { header.pattern = hs.pattern; header.c1 = hs.c1; header.c2 = hs.c2; }
      if (hs.style === 'own') { if (!hs.photo) { msg.textContent = 'Choose a photo for your header, or pick another header option.'; goStep(4); return false; } header.photo = hs.photo; }
      var social = {}; SOCIAL.forEach(function (x) { var u = socialUrl(x[0], $('fS_' + x[0]).value); if (u) social[x[0]] = u; });
      var row = { name: name, kind: st.kind, address: $('fAddr').value.trim() || null, city: $('fCity').value.trim(), phone: phone, website: $('fWeb').value.trim() || null,
        hours: $('fHours').value.trim() || null, about: $('fAbout').value.trim() || null, offer: $('fOffer').value.trim() || null, photos: st.photos, header: header, logo: st.logo,
        social: Object.keys(social).length ? social : null,
        legal_name: $('fLegal').value.trim() || null, state: $('fRegState').value.trim() || null, control_no: $('fCtrl').value.trim() || null, owner_role: $('fRole').value, since_year: since || null };
      // Map spot for "Deals near you": from the name search, else look the address up (OpenStreetMap).
      var addrKey = [row.address || '', row.city].join('|');
      if (st.spot && st.spot.key === addrKey) { row.lat = st.spot.lat; row.lon = st.spot.lon; }
      else if (addrKey !== [b.address || '', b.city || ''].join('|') || b.lat == null) {
        try { var gq = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' + encodeURIComponent([row.address, row.city].filter(Boolean).join(', '))); var gj = (await gq.json())[0]; if (gj) { row.lat = +gj.lat; row.lon = +gj.lon; } } catch (err) { /* the spot is a bonus */ }
      }
      var list = st.svcs.map(function (s) { var n = String(s.name || '').trim(); var pr = String(s.price || '').replace(/[^\d.]/g, ''); return n ? { name: n, price_from: pr ? Number(pr) : null, minutes: +s.minutes || null } : null; }).filter(Boolean);
      $('fSave').disabled = true; $('fNext').disabled = true; msg.className = 'bz-msg'; msg.textContent = 'Saving…';
      var okSave = true;
      try { await onSave(row, list, quiet); if (!b.id) { try { localStorage.removeItem(DKEY); } catch (err) { /* fine */ } } } catch (err) { okSave = false; msg.className = 'bz-msg bad'; msg.textContent = (err && err.message && /up to 3/.test(err.message)) ? 'You can have up to 3 business pages.' : (err && err.message && /social_ok/.test(err.message)) ? 'One of your social links didn’t look right. Check step 4.' : 'That didn’t save. Please try again.'; }
      $('fSave').disabled = false; $('fNext').disabled = false;
      return okSave;
    }
    goStep(stepNow);
  }
  async function saveServices(id, svcs) {
    var d = await sb.from('business_services').delete().eq('business_id', id); if (d.error) throw d.error;
    if (svcs.length) { var r = await sb.from('business_services').insert(svcs.map(function (s, i) { return { business_id: id, name: s.name, price_from: s.price_from, minutes: s.minutes || null, sort: i }; })); if (r.error) throw r.error; }
  }


  // ---------- Reviews (picture 269–271): stars, the write form and the report box ----------
  var REASONS = [['fake', 'Fake or not a real customer'], ['not_a_visit', 'Not about a visit to this business'], ['paid', 'Paid for or given for a discount'], ['insult', 'Insults, hate or threats'], ['private_info', 'Private information (phone, address, plate)'], ['off_topic', 'Off-topic'], ['other', 'Something else']];
  var starRow = function (n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '">★</i>'; return '<span class="rv-stars" aria-label="' + n + ' out of 5 stars">' + s + '</span>'; };
  var ago = function (d) { var t = new Date(d); return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: t.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }); };
  function reportBox(host, reviewId, done) {
    host.innerHTML = '<div class="rv-report"><b>Report this review</b><p>We check it against our <a href="/business/review-rules/" target="_blank">Review Rules</a>. We never remove a review because it’s negative.</p>' +
      REASONS.map(function (r, i) { return '<label class="bz-ck" style="font-weight:600;margin:6px 0"><input type="radio" name="rr" value="' + r[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + r[1] + '</span></label>'; }).join('') +
      '<label class="bz-f"><span>Anything we should know? (optional)</span><input id="rrN" maxlength="300"></label><div class="bz-row"><button type="button" class="bz-btn bz-small" id="rrGo">Send report</button><button type="button" class="bz-btn soft bz-small" id="rrX">Cancel</button></div><div class="bz-msg" id="rrM" role="status"></div></div>';
    host.querySelector('#rrX').onclick = function () { host.innerHTML = ''; };
    host.querySelector('#rrGo').onclick = async function () {
      var m = host.querySelector('#rrM'), reason = (host.querySelector('input[name=rr]:checked') || {}).value;
      var x = await sb.from('business_review_reports').insert({ review_id: reviewId, reason: reason, note: host.querySelector('#rrN').value.trim() || null });
      if (x.error && !/duplicate|unique/i.test(x.error.message)) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t send. Please try again.'; return; }
      host.innerHTML = '<div class="bz-msg good">Thanks. We’ll check it against our Review Rules.</div>'; if (done) done();
    };
  }
  function reviewForm(host, b, mine, onDone) {
    var st = { stars: mine ? mine.stars : 0, photos: mine ? (mine.photos || []).slice() : [] };
    host.innerHTML = '<div class="rv-form"><h3>' + (mine ? 'Edit your review' : 'Write a review') + '</h3><p class="rv-fine">Only your first name shows. Write about a real visit.</p>' +
      '<div class="rv-pick" id="rS" role="radiogroup" aria-label="Your stars"></div>' +
      '<label class="bz-f"><span>What happened? (optional)</span><textarea id="rB" maxlength="1000" placeholder="What did they fix, how long did it take, did the price match?">' + esc(mine ? mine.body : '') + '</textarea></label>' +
      '<div class="bz-f"><span>Photos (optional, up to 4)</span><div class="bz-pics" id="rP"></div><small>About your visit only. No faces of other people and no license plates. Photos show after our check.</small></div>' +
      '<label class="bz-ck"><input type="checkbox" id="rOk"' + (mine ? ' checked' : '') + '><span>This is about my own visit. Nobody paid me or gave me a discount or gift for this review.</span></label>' +
      '<div class="bz-row"><button type="button" class="bz-btn" id="rGo">' + (mine ? 'Save my review' : 'Post my review') + '</button><button type="button" class="bz-btn soft" id="rX">Cancel</button></div><div class="bz-msg" id="rM" role="status"></div></div>';
    var $ = function (id) { return host.querySelector('#' + id); };
    var LBL = ['', 'Bad', 'Not good', 'OK', 'Good', 'Great'];
    function drawS() { var h = ''; for (var i = 1; i <= 5; i++) h += '<button type="button" role="radio" aria-checked="' + (i === st.stars) + '" data-s="' + i + '" class="' + (i <= st.stars ? 'on' : '') + '" aria-label="' + i + ' star' + (i > 1 ? 's' : '') + '">★</button>'; $('rS').innerHTML = h + '<span>' + (LBL[st.stars] || 'Tap the stars') + '</span>'; }
    function drawP() { $('rP').innerHTML = st.photos.map(function (p, i) { return '<div class="p"><img src="' + photoUrl(p) + '" alt="Photo ' + (i + 1) + '"><button type="button" data-rm="' + i + '" aria-label="Remove photo">✕</button></div>'; }).join('') + (st.photos.length < 4 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="rF" hidden></label>' : ''); }
    drawS(); drawP();
    $('rS').onclick = function (e) { var n = e.target.getAttribute('data-s'); if (n) { st.stars = +n; drawS(); } };
    $('rP').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawP(); } };
    host.addEventListener('change', async function (e) {
      if (e.target.id !== 'rF') return; var f = e.target.files && e.target.files[0]; if (!f) return;
      var me = (await sb.auth.getUser()).data.user; if (!me) return;
      $('rM').className = 'bz-msg'; $('rM').textContent = 'Uploading…';
      try { st.photos.push(await upload(me.id, f, 1400)); drawP(); $('rM').textContent = ''; } catch (err) { $('rM').className = 'bz-msg bad'; $('rM').textContent = 'That photo didn’t upload. Try a JPG or PNG photo.'; }
    });
    $('rX').onclick = function () { host.innerHTML = ''; };
    $('rGo').onclick = async function () {
      var m = $('rM'); m.className = 'bz-msg bad';
      if (!st.stars) { m.textContent = 'Tap 1 to 5 stars.'; return; }
      if (!$('rOk').checked) { m.textContent = 'Please tick the box: reviews must be about your own visit, with no payment or discount.'; return; }
      var row = { stars: st.stars, body: $('rB').value.trim() || null, photos: st.photos };
      $('rGo').disabled = true; m.className = 'bz-msg'; m.textContent = 'Saving…';
      var x = mine ? await sb.from('business_reviews').update(row).eq('id', mine.id) : await sb.from('business_reviews').insert(Object.assign({ business_id: b.id }, row));
      $('rGo').disabled = false;
      if (x.error) { m.className = 'bz-msg bad'; m.textContent = /own business/.test(x.error.message) ? 'You can’t review your own business.' : /duplicate|unique/i.test(x.error.message) ? 'You already reviewed this business. You can edit your review.' : /isn.t taking/.test(x.error.message) ? 'This business isn’t taking reviews yet.' : 'That didn’t save. Please try again.'; return; }
      onDone();
    };
  }


  // ---------- Messages + quote requests (step 4): one chat thread, used by drivers and by the business ----------
  var QUOTE_KINDS = { repair: 1, tires: 1, body: 1, detail: 1, tow: 1, insurance: 1, other: 1 };
  var when = function (d) { var t = new Date(d), n = new Date(); return t.toDateString() === n.toDateString() ? t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
  // ---------- Offers in the chat (picture 293 part 2): a price card the driver can accept. Pay at the shop. ----------
  function offerCard(m, asBusiness) {
    var o = m.offer || {}, ended = o.until && o.until < today(), stt = m.offer_status || 'open';
    var tag = stt === 'accepted' ? '<span class="of-tag ok">✓ Accepted</span>' : stt === 'declined' ? '<span class="of-tag">No thanks</span>' : ended ? '<span class="of-tag">Ended</span>' : '<span class="of-tag new">Good until ' + new Date(o.until + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>';
    return '<div class="of-card"><div class="of-k">OFFER ' + tag + '</div><b class="of-t">' + esc(o.title || 'Offer') + '</b>' +
      (o.lines || []).map(function (l) { return '<div class="of-l"><span>' + esc(l.t) + '</span><span>' + money(l.p) + '</span></div>'; }).join('') +
      '<div class="of-l of-tot"><span>Total before tax</span><span>' + money(o.total) + '</span></div>' + (o.warranty || o.earliest ? '<div class="of-we">' + (o.warranty ? '<span>' + icon('shield', 14) + 'Warranty: ' + esc(o.warranty) + '</span>' : '') + (o.earliest ? '<span>' + icon('bell', 14) + 'Earliest: ' + esc(o.earliest) + '</span>' : '') + '</div>' : '') + (o.note ? '<p class="of-n">' + esc(o.note) + '</p>' : '') +
      '<small class="of-f">Price set by the business. You pay at the shop. Carvessa doesn’t take payments.</small>' +
      (!asBusiness && stt === 'open' && !ended ? '<div class="of-b"><button type="button" class="bz-btn green" data-ofa="accept" data-of="' + m.id + '">Accept</button><button type="button" class="bz-btn soft" data-ofa="ask" data-of="' + m.id + '">Ask a question</button><button type="button" class="bz-btn soft" data-ofa="decline" data-of="' + m.id + '">No thanks</button></div>' : '') + '</div>';
  }
  function offerBuilder(host, send, opts) {
    opts = opts || {};
    var d7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), max = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
    var line = function () { return '<div class="of-row"><input class="of-in-t" maxlength="80" placeholder="What (e.g. Brake pads)"><label class="of-in-p">$<input inputmode="decimal" placeholder="0"></label><button type="button" class="of-x" aria-label="Remove line">✕</button></div>'; };
    host.innerHTML = '<div class="of-ed"><b>Offer with a price</b><label class="bz-f"><span>Title</span><input id="ofT" maxlength="80" placeholder="Front brake pads + rotors"></label>' +
      '<div class="of-rows">' + line() + line() + '</div><button type="button" class="bz-btn soft bz-small" id="ofAdd">＋ Add a line</button>' +
      '<div class="of-l of-tot"><span>Total before tax</span><span id="ofSum">$0</span></div>' +
      '<div class="bz-two"><label class="bz-f"><span>Warranty (optional)</span><input id="ofW" maxlength="60" placeholder="12 months / 12,000 miles"></label><label class="bz-f"><span>Earliest time (optional)</span><input id="ofE" maxlength="60" placeholder="Tomorrow 8 AM"></label></div>' +
      '<div class="bz-two"><label class="bz-f"><span>Good until</span><input type="date" id="ofU" value="' + d7 + '" min="' + today() + '" max="' + max + '"></label><label class="bz-f"><span>Note (optional)</span><input id="ofN" maxlength="160" placeholder="Includes old parts back"></label></div>' +
      '<p class="rv-fine">Real prices only. The driver can accept, ask or say no thanks. They pay at your shop.</p>' +
      '<div class="bz-row"><button type="button" class="bz-btn" id="ofGo">' + (opts.button || 'Send offer') + '</button>' + (opts.noCancel ? '' : '<button type="button" class="bz-btn soft" id="ofX">Cancel</button>') + '</div><div class="bz-msg" id="ofM" role="status"></div></div>';
    var $ = function (q) { return host.querySelector(q); };
    var lines = function () { return [].map.call(host.querySelectorAll('.of-row'), function (r) { return { t: r.querySelector('.of-in-t').value.trim(), p: parseFloat((r.querySelector('.of-in-p input').value || '').replace(/[^\d.]/g, '')) }; }).filter(function (l) { return l.t && !isNaN(l.p); }); };
    var sum = function () { $('#ofSum').textContent = money(lines().reduce(function (a, l) { return a + l.p; }, 0)); };
    host.addEventListener('input', sum);
    host.addEventListener('click', function (e) { if (e.target.classList.contains('of-x')) { var r = e.target.closest('.of-row'); if (host.querySelectorAll('.of-row').length > 1) r.remove(); sum(); } });
    $('#ofAdd').onclick = function () { if (host.querySelectorAll('.of-row').length < 8) $('.of-rows').insertAdjacentHTML('beforeend', line()); };
    if ($('#ofX')) $('#ofX').onclick = function () { host.hidden = true; host.innerHTML = ''; };
    if (opts.title) $('#ofT').value = opts.title;
    $('#ofGo').onclick = async function () {
      var L = lines(), m = $('#ofM'); m.className = 'bz-msg bad';
      if (!L.length) { m.textContent = 'Add at least one line with a price.'; return; }
      this.disabled = true; m.className = 'bz-msg'; m.textContent = 'Sending…';
      var err = await send({ title: $('#ofT').value.trim() || L[0].t, lines: L, until: $('#ofU').value, note: $('#ofN').value.trim(), warranty: $('#ofW').value.trim(), earliest: $('#ofE').value.trim() });
      if (err) { this.disabled = false; m.className = 'bz-msg bad'; m.textContent = err; }
    };
    return { lines: lines, extra: function () { return { warranty: $('#ofW').value.trim(), earliest: $('#ofE').value.trim(), until: $('#ofU').value, note: $('#ofN').value.trim(), title: $('#ofT').value.trim() }; } };
  }
  var videoUrl = function (p) { return C.url + '/storage/v1/object/public/request-videos/' + p.split('/').map(encodeURIComponent).join('/'); };
  function mediaHtml(x) {
    var ph = x.photos || [];
    if (!ph.length && !x.video) return '';
    return '<div class="rq-media">' + ph.map(function (p, i) { return '<a href="' + photoUrl(p) + '" target="_blank" rel="noopener"><img src="' + photoUrl(p) + '" alt="Photo ' + (i + 1) + ' from the driver" loading="lazy"></a>'; }).join('') +
      (x.video ? '<video src="' + videoUrl(x.video) + '" controls preload="metadata" playsinline aria-label="Video from the driver"></video>' : '') + '</div>';
  }
  var PARTS_SHOP = { yes: 'Installs parts you bring', no: 'Uses its own parts', ask: 'Ask about your own parts' };
  function chatThread(host, chat, asBusiness, title) {
    var st = { photos: [], timer: null, seen: 0 };
    host.innerHTML = '<div class="ch"><div class="ch-head"><b>' + esc(title) + '</b>' + (chat.kind === 'quote' ? '<span class="hq-tag">Quote request</span>' : '') + '</div>' +
      (chat.kind === 'quote' || chat.car ? '<div class="ch-quote">' + (chat.car ? '<b>' + esc(chat.car) + '</b>' : '') + (chat.miles != null ? ' · ' + Number(chat.miles).toLocaleString('en-US') + ' mi' : '') + (chat.topic ? '<div>' + esc(chat.topic) + '</div>' : '') + '</div>' : '') +
      '<div class="ch-list" aria-live="polite"></div>' +
      (chat.status === 'blocked' && !asBusiness ? '<div class="bz-msg bad">This business isn’t taking messages from you.</div>' :
      '<div class="ch-pics"></div><div class="of-build" hidden></div>' + (asBusiness && chat.kind === 'quote' ? '<div class="ch-price"><label>Price $<input id="chP" inputmode="decimal" placeholder="129"></label><input id="chPN" maxlength="120" placeholder="What it covers / when (e.g. Today before 4 PM)"></div>' : '') +
      '<div class="ch-box"><label class="ch-add" aria-label="Add a photo">+<input type="file" accept="image/*" id="chF" hidden></label><textarea id="chT" maxlength="1000" rows="2" placeholder="' + (asBusiness ? 'Write a reply…' : 'Write a message…') + '"></textarea><button type="button" class="bz-btn" id="chGo">Send</button></div>' +
      (asBusiness ? '<div class="bz-row"><button type="button" class="bz-btn soft bz-small" id="chOf">＋ Offer with a price</button></div>' : '') +
      (asBusiness && chat.driver_stop ? '<div class="bz-msg bad">This driver stopped messages from your business. They can still write to you.</div>' : '') +
      '<p class="rv-fine">' + (asBusiness ? 'The driver’s phone and email stay private unless they share them.' : 'Only your first name shows. Don’t share card numbers or passwords.') + '</p>' +
      (!asBusiness ? '<p class="rv-fine ch-stop">' + (chat.driver_stop ? 'You stopped messages from this business. Writing to them turns messages back on.' : '<button type="button" class="linkish" id="chStop">Stop messages from this business</button> · <button type="button" class="linkish" id="chRep">Report</button>') + '</p>' : '')) +
      '<div class="bz-msg" id="chM" role="status"></div></div>';
    var $ = function (s) { return host.querySelector(s); };
    async function load() {
      var r = await sb.from('biz_messages').select('*').eq('chat_id', chat.id).order('created_at').limit(300);
      var list = r.data || []; if (list.length === st.seen && st.seen) return; st.seen = list.length;
      $('.ch-list').innerHTML = list.length ? list.map(function (m) {
        var mine = m.from_business === asBusiness;
        return '<div class="ch-m ' + (mine ? 'me' : 'them') + (m.offer ? ' has-of' : '') + '">' + (m.offer ? offerCard(m, asBusiness) : '') + (m.price != null ? '<div class="ch-pr">Price: ' + money(m.price) + (m.price_note ? ' · ' + esc(m.price_note) : '') + '<small>Set by the business. Ask for a written quote.</small></div>' : '') + (m.body ? '<div>' + esc(m.body).replace(/\n/g, '<br>') + '</div>' : '') +
          ((m.photos || []).length ? '<div class="rv-pics">' + m.photos.map(function (p) { return '<a href="' + photoUrl(p) + '" target="_blank" rel="noopener"><img src="' + photoUrl(p) + '" alt="Photo" loading="lazy"></a>'; }).join('') + '</div>' : '') + '<small>' + when(m.created_at) + '</small></div>';
      }).join('') : '<p class="rv-fine">No messages yet.</p>';
      var L = $('.ch-list'); L.scrollTop = L.scrollHeight;
      sb.from('biz_chats').update(asBusiness ? { biz_seen_at: new Date().toISOString() } : { driver_seen_at: new Date().toISOString() }).eq('id', chat.id).then(function () {});
    }
    host.addEventListener('click', async function (e) {
      var a = e.target.closest('[data-ofa]'); if (!a) return;
      var id = a.getAttribute('data-of'), v = a.getAttribute('data-ofa'), m = $('#chM');
      if (v === 'ask') { var t = $('#chT'); if (t) { t.value = 'About your offer: '; t.focus(); } return; }
      if (v === 'accept' && !confirm('Accept this offer? The shop gets a message. You pay at the shop, not here.')) return;
      a.disabled = true;
      var x = await sb.rpc('biz_offer_answer', { m: id, answer: v });
      if (x.error) { a.disabled = false; m.className = 'bz-msg bad'; m.textContent = /ended/.test(x.error.message) ? 'This offer has ended. Ask the shop for a new one.' : /already/.test(x.error.message) ? 'You already answered this offer.' : 'That didn’t go through. Please try again.'; return; }
      m.className = 'bz-msg good'; m.textContent = v === 'accept' ? 'Done. The shop knows you accepted. You pay at the shop.' : 'Done. We told the shop “no thanks”.'; st.seen = 0; load();
    });
    if ($('#chStop')) $('#chStop').onclick = async function () {
      if (!confirm('Stop messages from this business? They won’t be able to write to you. You can still write to them.')) return;
      var x = await sb.from('biz_chats').update({ driver_stop: true }).eq('id', chat.id);
      if (x.error) { $('#chM').className = 'bz-msg bad'; $('#chM').textContent = 'That didn’t save. Please try again.'; return; }
      chat.driver_stop = true; this.closest('.ch-stop').textContent = 'Done. This business can’t write to you anymore. Writing to them turns messages back on.';
    };
    if ($('#chRep')) $('#chRep').onclick = async function () {
      var why = prompt('What’s wrong? (spam, pushy selling, rude, something else)'); if (!why) return;
      await sb.from('feedback').insert({ mood: 'confused', message: ('[Chat report] chat=' + chat.id + ' | ' + why).slice(0, 1000), screen: 'messages' });
      $('#chM').className = 'bz-msg good'; $('#chM').textContent = 'Thanks. A person on our team will look at it. You can also stop messages from this business.';
    };
    if ($('#chOf')) $('#chOf').onclick = function () {
      var b = $('.of-build'); if (!b.hidden) { b.hidden = true; b.innerHTML = ''; return; }
      b.hidden = false; offerBuilder(b, async function (offer) {
        var x = await sb.from('biz_messages').insert({ chat_id: chat.id, body: $('#chT').value.trim() || null, offer: offer });
        if (x.error) return /stopped/.test(x.error.message) ? 'This driver stopped messages from your business.' : /60 days/.test(x.error.message) ? 'Good until must be within the next 60 days.' : 'That didn’t send. Check the prices and try again.';
        $('#chT').value = ''; b.hidden = true; b.innerHTML = ''; st.seen = 0; load(); return null;
      });
    };
    function drawPics() { var b = $('.ch-pics'); if (b) b.innerHTML = st.photos.map(function (p, i) { return '<span class="p"><img src="' + photoUrl(p) + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Remove">✕</button></span>'; }).join(''); }
    load();
    st.timer = setInterval(function () { if (!document.body.contains(host.querySelector('.ch'))) { clearInterval(st.timer); return; } if (!document.hidden) load(); }, 12000);
    if (!$('#chGo')) return;
    host.querySelector('.ch-pics').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawPics(); } };
    $('#chF').onchange = async function (e) {
      var f = e.target.files && e.target.files[0]; if (!f || st.photos.length >= 3) return;
      var me = (await sb.auth.getUser()).data.user; if (!me) return;
      $('#chM').className = 'bz-msg'; $('#chM').textContent = 'Uploading…';
      try { st.photos.push(await upload(me.id, f, 1400)); drawPics(); $('#chM').textContent = ''; } catch (err) { $('#chM').className = 'bz-msg bad'; $('#chM').textContent = 'That photo didn’t upload.'; }
      e.target.value = '';
    };
    $('#chGo').onclick = async function () {
      var body = $('#chT').value.trim(), pr = $('#chP') ? $('#chP').value.replace(/[^\d.]/g, '') : '', m = $('#chM');
      if (!body && !pr && !st.photos.length) return;
      var row = { chat_id: chat.id, body: body || null, photos: st.photos };
      if (pr) { row.price = Number(pr); row.price_note = $('#chPN').value.trim() || null; }
      $('#chGo').disabled = true;
      var x = await sb.from('biz_messages').insert(row); $('#chGo').disabled = false;
      if (x.error) { m.className = 'bz-msg bad'; m.textContent = /lot of messages/.test(x.error.message) ? 'You’re sending a lot of messages. Please wait a few minutes.' : /isn.t taking/.test(x.error.message) ? 'This business isn’t taking messages from you.' : 'That didn’t send. Please try again.'; return; }
      $('#chT').value = ''; if ($('#chP')) { $('#chP').value = ''; $('#chPN').value = ''; } st.photos = []; drawPics(); m.textContent = ''; st.seen = 0; load();
    };
  }
  // A driver starts a chat or a quote request with one business.
  function startChat(host, b, kind, onOpen, pre) {
    var st = { photos: [] }, q = kind === 'quote';
    host.innerHTML = '<div class="rv-form"><h3>' + (q ? 'Get a quote from ' : 'Message ') + esc(b.name) + '</h3><p class="rv-fine">' + (q ? 'Tell them about your car and the problem. They answer with a price here.' : 'They answer right here. Only your first name shows.') + '</p>' +
      (q ? '<div class="bz-two"><label class="bz-f"><span>Your car</span><input id="sCar" maxlength="80" placeholder="2016 Toyota Corolla"></label><label class="bz-f"><span>Miles (optional)</span><input id="sMi" inputmode="numeric" placeholder="84,000"></label></div>' : '') +
      '<label class="bz-f"><span>' + (q ? 'What’s going on?' : 'Your message') + '</span><textarea id="sB" maxlength="1000" placeholder="' + (q ? 'Tire light is on, air looks fine (35 PSI). Light stays steady.' : 'Hi! Are you open Saturday?') + '"></textarea><small>' + (q ? 'Used Carvessa’s car help? Paste your “What do I tell the mechanic?” note here.' : 'Don’t share card numbers or passwords.') + '</small></label>' +
      (q ? '<div class="bz-f"><span>Photos (optional, up to 3)</span><div class="bz-pics" id="sP"></div></div>' : '') +
      '<div class="bz-row"><button type="button" class="bz-btn" id="sGo">' + (q ? 'Send quote request' : 'Send') + '</button><button type="button" class="bz-btn soft" id="sX">Cancel</button></div><div class="bz-msg" id="sM" role="status"></div></div>';
    var $ = function (s) { return host.querySelector(s); };
    if (pre) { if (pre.car && $('#sCar')) $('#sCar').value = pre.car; if (pre.body) { $('#sB').value = pre.body; setTimeout(function () { var t = $('#sB'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 50); } }
    function drawP() { if ($('#sP')) $('#sP').innerHTML = st.photos.map(function (p, i) { return '<div class="p"><img src="' + photoUrl(p) + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Remove">✕</button></div>'; }).join('') + (st.photos.length < 3 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="sF" hidden></label>' : ''); }
    drawP();
    if ($('#sP')) $('#sP').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawP(); } };
    host.addEventListener('change', async function (e) {
      if (e.target.id !== 'sF') return; var f = e.target.files && e.target.files[0]; if (!f) return;
      var me = (await sb.auth.getUser()).data.user; if (!me) return;
      try { st.photos.push(await upload(me.id, f, 1400)); drawP(); } catch (err) { $('#sM').className = 'bz-msg bad'; $('#sM').textContent = 'That photo didn’t upload.'; }
    });
    $('#sX').onclick = function () { host.innerHTML = ''; };
    $('#sGo').onclick = async function () {
      var body = $('#sB').value.trim(), m = $('#sM'); m.className = 'bz-msg bad';
      if (q && !$('#sCar').value.trim()) { m.textContent = 'Please type your car (year, make, model).'; return; }
      if (body.length < 2) { m.textContent = q ? 'Please tell them what’s going on.' : 'Please type your message.'; return; }
      $('#sGo').disabled = true; m.className = 'bz-msg'; m.textContent = 'Sending…';
      var c = await sb.from('biz_chats').insert({ business_id: b.id, kind: kind, car: q ? $('#sCar').value.trim() : null, miles: q && $('#sMi').value ? parseInt($('#sMi').value.replace(/\D/g, ''), 10) || null : null, topic: q ? body.slice(0, 120) : null }).select('*').single();
      if (c.error) { $('#sGo').disabled = false; m.className = 'bz-msg bad'; m.textContent = /own business/.test(c.error.message) ? 'You can’t message your own business.' : /Too many/.test(c.error.message) ? 'Too many new chats today. Please try again tomorrow.' : /isn.t taking/.test(c.error.message) ? 'This business isn’t taking messages yet.' : 'That didn’t send. Please try again.'; return; }
      var x = await sb.from('biz_messages').insert({ chat_id: c.data.id, body: body, photos: st.photos });
      if (x.error) { $('#sGo').disabled = false; m.className = 'bz-msg bad'; m.textContent = 'That didn’t send. Please try again.'; return; }
      onOpen(c.data);
    };
  }

  // ---------- Sign in / create account ----------
  function account(next, boxEl) {
    var box = boxEl || root.querySelector('#bzAcct');
    sb.auth.getSession().then(function (r) {
      var u = r.data.session && r.data.session.user;
      if (u) {
        if (mode === 'edit' || mode === 'inbox' || mode === 'ask' || mode === 'following' || mode === 'appts' || mode === 'shop') { next(u); return; }
        box.innerHTML = '<div class="bz-sec">Signed in as <b>' + esc(u.email) + '</b>. <a href="#" id="aOut">Not you?</a></div><div class="bz-row"><button class="bz-btn" id="aGo">Continue</button></div>';
        box.querySelector('#aGo').onclick = function () { next(u); };
        box.querySelector('#aOut').onclick = function (e) { e.preventDefault(); sb.auth.signOut().then(function () { account(next, boxEl); }); };
        return;
      }
      var tab = mode === 'join' ? 'join' : 'login';
      // Google works where Supabase allows the return link (/business/, /shops/ and /messages/, added Nov 19).
      var googleOk = /^\/(business|shops|messages)\//.test(location.pathname);
      function google() {
        sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname + location.search } });
      }
      // Forgot password: a 6-digit code by email, then a new password (same as the app).
      function reset(email) {
        box.innerHTML = '<h3 style="margin:4px 0">Reset your password</h3><p class="lead" style="font-size:15px">We’ll email you a 6-digit code.</p>' +
          '<label class="bz-f"><span>Email</span><input id="rsE" type="email" autocomplete="email" inputmode="email" value="' + esc(email || '') + '"></label>' +
          '<div class="bz-row"><button class="bz-btn" id="rsGo">Send me a code</button><button type="button" class="bz-btn soft" id="rsBack">Back to log in</button></div><div class="bz-msg" id="rsM" role="status"></div>';
        box.querySelector('#rsBack').onclick = function () { tab = 'login'; draw(); };
        box.querySelector('#rsGo').onclick = async function () {
          var em = box.querySelector('#rsE').value.trim().toLowerCase(), m = box.querySelector('#rsM'); m.className = 'bz-msg bad';
          if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(em)) { m.textContent = 'Please type your email.'; return; }
          m.className = 'bz-msg'; m.textContent = 'Sending…';
          var r = await sb.auth.resetPasswordForEmail(em);
          if (r.error && /rate|seconds|limit/i.test(r.error.message)) { m.className = 'bz-msg bad'; m.textContent = 'Please wait a minute before asking for another code.'; return; }
          code(em);
        };
      }
      function code(em) {
        box.innerHTML = '<h3 style="margin:4px 0">Check your email</h3><p class="lead" style="font-size:15px">If <b>' + esc(em) + '</b> has a Carvessa account, we sent a 6-digit code. It can take a minute. Check spam too.</p>' +
          '<label class="bz-f"><span>6-digit code</span><input id="rsC" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="letter-spacing:6px;font-size:22px;font-weight:800"></label>' +
          '<label class="bz-f"><span>New password (8 or more characters)</span><input id="rsP" type="password" autocomplete="new-password"></label>' +
          '<label class="bz-ck" style="font-weight:600"><input type="checkbox" id="rsS"><span>Show password</span></label>' +
          '<div class="bz-row"><button class="bz-btn" id="rsOk">Save new password</button><button type="button" class="bz-btn soft" id="rsAgain">Send a new code</button></div><div class="bz-msg" id="rsM" role="status"></div>';
        box.querySelector('#rsS').onchange = function () { box.querySelector('#rsP').type = this.checked ? 'text' : 'password'; };
        box.querySelector('#rsAgain').onclick = function () { reset(em); };
        box.querySelector('#rsOk').onclick = async function () {
          var c = box.querySelector('#rsC').value.replace(/\D/g, ''), pw = box.querySelector('#rsP').value, m = box.querySelector('#rsM'); m.className = 'bz-msg bad';
          if (c.length !== 6) { m.textContent = 'Type the 6-digit code from the email.'; return; }
          if (pw.length < 8) { m.textContent = 'Your new password needs 8 or more characters.'; return; }
          m.className = 'bz-msg'; m.textContent = 'Checking…';
          var v = await sb.auth.verifyOtp({ email: em, token: c, type: 'recovery' });
          if (v.error) { m.className = 'bz-msg bad'; m.textContent = 'That code didn’t work or expired. Tap “Send a new code”.'; return; }
          var u2 = await sb.auth.updateUser({ password: pw });
          if (u2.error) { m.className = 'bz-msg bad'; m.textContent = /different|same/i.test(u2.error.message) ? 'Pick a password you haven’t used before.' : 'That didn’t save. Please try again.'; return; }
          m.className = 'bz-msg good'; m.textContent = 'Password changed. You’re logged in.';
          setTimeout(function () { next(v.data.user || u2.data.user); }, 700);
        };
      }
      function draw() {
        box.innerHTML = '<div class="bz-tabs"><button type="button" data-tab="join" class="' + (tab === 'join' ? 'on' : '') + '">Create account</button><button type="button" data-tab="login" class="' + (tab === 'login' ? 'on' : '') + '">Log in</button></div>' +
          '<p class="lead" style="font-size:15px">' + (tab === 'join' ? 'Your page belongs to this account. Use an email you check.' : 'Use the email and password of your Carvessa account.') + '</p>' +
          (googleOk ? '<button type="button" class="bz-google" id="aG"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</button><div class="bz-or"><span>or use your email (Gmail, Yahoo, Outlook, any email)</span></div>' : '') +
          '<label class="bz-f"><span>Email</span><input id="aEmail" type="email" autocomplete="email" inputmode="email"></label>' +
          '<label class="bz-f"><span>Password' + (tab === 'join' ? ' (8 or more characters)' : '') + '</span><input id="aPw" type="password" autocomplete="' + (tab === 'join' ? 'new-password' : 'current-password') + '"></label>' +
          '<div class="bz-row"><button class="bz-btn" id="aDo">' + (tab === 'join' ? 'Create account' : 'Log in') + '</button>' + (tab === 'login' ? '<button type="button" class="bz-link" id="aForgot">Forgot password?</button>' : '') + '</div><div class="bz-msg" id="aMsg" role="status"></div>';
        if (box.querySelector('#aG')) box.querySelector('#aG').onclick = google;
        if (box.querySelector('#aForgot')) box.querySelector('#aForgot').onclick = function () { reset(box.querySelector('#aEmail').value.trim()); };
        box.querySelector('.bz-tabs').onclick = function (e) { var t = e.target.getAttribute('data-tab'); if (t) { tab = t; draw(); } };
        box.querySelector('#aDo').onclick = async function () {
          var em = box.querySelector('#aEmail').value.trim().toLowerCase(), pw = box.querySelector('#aPw').value, m = box.querySelector('#aMsg');
          m.className = 'bz-msg bad';
          if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(em)) { m.textContent = 'Please type a real email.'; return; }
          if (pw.length < 8) { m.textContent = 'Your password needs 8 or more characters.'; return; }
          m.className = 'bz-msg'; m.textContent = tab === 'join' ? 'Creating your account…' : 'Logging in…';
          var r = tab === 'join' ? await sb.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: location.origin + location.pathname + location.search } }) : await sb.auth.signInWithPassword({ email: em, password: pw });
          if (r.error) { m.className = 'bz-msg bad'; m.textContent = /registered|exists/i.test(r.error.message) ? 'That email already has an account. Tap Log in.' : /invalid/i.test(r.error.message) ? 'Email or password is wrong.' : 'That didn’t work. Please try again.'; return; }
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
    go1.onclick = function () {
      agreedAt = new Date().toISOString(); show(1);
      account(function () {
        show(2);
        var pk = q.get('kind'), pre = { name: (q.get('name') || '').slice(0, 80), offer: (q.get('offer') || '').slice(0, 120), kind: KINDS.some(function (k) { return k[0] === pk; }) ? pk : undefined };
        form(pre, [], async function (row, svcs) {
          row.agreed_at = agreedAt; row.terms_version = C.terms; row.source = (q.get('src') || 'website').slice(0, 60);
          row.hq_look = 'racing';
          var r = await sb.from('businesses').insert(row).select('id, slug').single(); if (r.error) throw r.error;
          await saveServices(r.data.id, svcs);
          root.querySelector('#bzDoneLink').href = '/shops/?b=' + encodeURIComponent(r.data.slug);
          show(3);
        });
      });
    };
    return;
  }

  // ---------- Business HQ: the owner's private dashboard ----------
  if (mode === 'edit') {
    var STATUS = { pending: 'Waiting for our check', live: 'Live', hidden: 'Hidden', rejected: 'Not approved', blocked: 'Blocked' };
    var NAV = [['overview', 'Home', 'home'], ['messages', 'Messages', 'msg'], ['requests', 'Requests', 'inbox'], ['customers', 'Customers', 'users'], ['reviews', 'Reviews', 'star'], ['appointments', 'Appointments', 'cal'], ['page', 'My page', 'wrench'], ['posts', 'Deals and posts', 'tag'], ['sales', 'Sales', 'cash'], ['account', 'Settings', 'gear']];
    account(async function (u) {
      root.querySelector('#bzAcct').hidden = true;
      var r = await sb.from('businesses').select(MINE).eq('owner', u.id).order('created_at');
      var pages = r.data || [];
      if (!pages.length) { root.querySelector('#bzAcct').hidden = false; root.querySelector('#bzAcct').innerHTML = '<div class="bz-sec">Signed in as <b>' + esc(u.email) + '</b>. You don’t have a business page yet. <a href="/business/join/">Create your free page</a></div>'; return; }
      var cur = pages[0], tab = NAV.some(function (n) { return n[0] === q.get('tab'); }) ? q.get('tab') : 'overview';
      var shell = document.createElement('div'); shell.className = 'hq'; root.innerHTML = ''; root.appendChild(shell); root.classList.add('hq-wrap');
      function look() {
        shell.setAttribute('data-look', cur.hq_dark ? 'dark' : 'racing');
        var br = brandOf(cur), acc = cur.hq_dark ? br : readable(br);
        if (cur.hq_dark && contrast(acc, '#16181C') < 4.5) { var c2 = acc, n = 0; while (contrast(c2, '#16181C') < 4.5 && n++ < 12) c2 = toHex(rgb(c2).map(function (v) { return v + (255 - v) * 0.15; })); acc = c2; }
        shell.style.setProperty('--acc', acc); shell.style.setProperty('--onAcc', onColor(acc)); shell.style.setProperty('--sideOnInk', acc);
        shell.style.setProperty('--sideOn', cur.hq_dark ? 'rgba(255,255,255,.08)' : 'color-mix(in srgb, ' + acc + ' 12%, #fff)');
        shell.style.setProperty('--soft', cur.hq_dark ? 'rgba(255,255,255,.08)' : 'color-mix(in srgb, ' + acc + ' 12%, #fff)');
        shell.style.setProperty('--heroA', shade(br, 0.55)); shell.style.setProperty('--heroB', shade(br, 0.1));
      }
      var counts = { msg: 0, rev: 0, req: 0, appt: 0 };
      function go(t, extra) { tab = t; frame(extra); }
      function frame(extra) {
        look();
        var badge = function (k) { var n = k === 'messages' ? counts.msg : k === 'reviews' ? counts.rev : k === 'requests' ? counts.req : k === 'appointments' ? counts.appt : 0; return '<span class="hq-badge" data-b="' + k + '"' + (n ? '' : ' hidden') + '>' + (n || '') + '</span>'; };
        var pub = '/shops/?b=' + encodeURIComponent(cur.slug);
        shell.innerHTML = '<header class="hq-top"><a class="hq-logo" href="/business/edit/" aria-label="Business HQ home">CAR<i>V</i>essa <span>BUSINESS HQ</span></a>' +
          (pages.length > 1 ? '<select class="hq-pick" id="hqPick" aria-label="Your pages">' + pages.map(function (p, i) { return '<option value="' + i + '"' + (p === cur ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>' : '<a class="hq-pick" href="' + pub + '" target="_blank" rel="noopener">' + esc(cur.name) + icon('chev', 14) + '</a>') +
          '<div class="hq-tr"><button type="button" class="hq-bell" id="hqBell" aria-label="What needs you">' + icon('bell') + '<em id="hqBellN" hidden></em></button>' +
          '<button type="button" class="hq-me" id="hqMe" aria-label="Account menu" aria-expanded="false">' + esc(initials(cur.name).slice(0, 1)) + '</button>' +
          '<div class="hq-menu" id="hqMenu" hidden><a href="' + pub + '" target="_blank" rel="noopener">' + icon('globe', 18) + 'View my page</a><button type="button" data-go="account">' + icon('gear', 18) + 'Settings</button><button type="button" data-go="account:hqIdea">' + icon('msg', 18) + 'Send us an idea</button><button type="button" id="hqOut">' + icon('out', 18) + 'Log out</button></div></div></header>' +
          '<div class="hq-body"><aside class="hq-side"><nav class="hq-nav" aria-label="Business HQ">' + NAV.map(function (n) { return '<button type="button" data-tab="' + n[0] + '" class="' + (tab === n[0] ? 'on' : '') + '"' + (tab === n[0] ? ' aria-current="page"' : '') + '>' + icon(n[2], 18) + '<span>' + n[1] + '</span>' + badge(n[0]) + '</button>'; }).join('') + '</nav>' +
          '<div class="hq-status"><span class="hq-st ' + esc(cur.status) + '">' + (STATUS[cur.status] || cur.status) + '</span><small>' + esc(kindName(cur.kind)) + '</small></div>' +
          '<div class="hq-pro"><b>Pro coming later</b><small>Business network and deeper reports. Your page stays free.</small></div></aside>' +
          '<main class="hq-main" id="hqBody"></main></div>' +
          '<nav class="hq-tabs" aria-label="Business HQ">' + [['overview', 'Home', 'home'], ['messages', 'Messages', 'msg'], ['requests', 'Requests', 'inbox'], ['posts', 'Deals', 'tag'], ['more', 'More', 'gear']].map(function (n) { var on = n[0] === tab || (n[0] === 'more' && ['page', 'sales', 'account', 'reviews', 'customers', 'appointments'].indexOf(tab) >= 0); return '<button type="button" data-tab="' + n[0] + '" class="' + (on ? 'on' : '') + '">' + icon(n[2], 20) + '<span>' + n[1] + '</span>' + badge(n[0]) + '</button>'; }).join('') + '</nav>' +
          '<div class="hq-more" id="hqMore" hidden>' + [['appointments', 'Appointments', 'cal'], ['customers', 'Customers', 'users'], ['reviews', 'Reviews', 'star'], ['page', 'My page', 'wrench'], ['sales', 'Sales', 'cash'], ['account', 'Settings', 'gear'], ['account:hqIdea', 'Send us an idea', 'msg']].map(function (n) { return '<button type="button" data-tab="' + n[0] + '">' + icon(n[2], 18) + n[1] + '</button>'; }).join('') + '<a href="' + pub + '" target="_blank" rel="noopener">' + icon('globe', 18) + 'View my page</a></div>';
        var navClick = function (e) {
          var b = e.target.closest('[data-tab],[data-go]'); if (!b) return;
          var t = b.getAttribute('data-tab') || b.getAttribute('data-go');
          if (t === 'more') { var mo = shell.querySelector('#hqMore'); mo.hidden = !mo.hidden; return; }
          var tp = t.split(':'); go(tp[0], tp[1]);
        };
        shell.querySelector('.hq-nav').onclick = navClick; shell.querySelector('.hq-tabs').onclick = navClick; shell.querySelector('#hqMore').onclick = navClick; shell.querySelector('#hqMenu').onclick = navClick;
        shell.querySelector('#hqOut').onclick = function () { sb.auth.signOut().then(function () { location.reload(); }); };
        var me = shell.querySelector('#hqMe'), menu = shell.querySelector('#hqMenu');
        me.onclick = function () { menu.hidden = !menu.hidden; me.setAttribute('aria-expanded', String(!menu.hidden)); };
        shell.querySelector('#hqBell').onclick = function () { go(counts.appt ? 'appointments' : counts.req ? 'requests' : counts.msg ? 'messages' : counts.rev ? 'reviews' : 'overview'); };
        var pk = shell.querySelector('#hqPick'); if (pk && pk.tagName === 'SELECT') pk.onchange = function () { cur = pages[+pk.value]; tab = 'overview'; frame(); };
        Promise.all([
          sb.from('biz_chats').select('last_at, biz_seen_at').eq('business_id', cur.id).limit(200),
          sb.from('business_reviews').select('id', { count: 'exact', head: true }).eq('business_id', cur.id).eq('status', 'visible').is('reply', null),
          sb.rpc('biz_requests_near', { b: cur.id }),
          sb.from('appointments').select('id', { count: 'exact', head: true }).eq('business_id', cur.id).eq('status', 'requested')
        ]).then(function (r) {
          counts.appt = r[3].count || 0;
          counts.msg = (r[0].data || []).filter(function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; }).length; counts.rev = r[1].count || 0;
          counts.req = (r[2].data || []).filter(function (x) { return !x.chat_id; }).length;
          [].forEach.call(shell.querySelectorAll('[data-b]'), function (el) { var k = el.getAttribute('data-b'), n = k === 'messages' ? counts.msg : k === 'reviews' ? counts.rev : k === 'requests' ? counts.req : k === 'appointments' ? counts.appt : 0; el.hidden = !n; el.textContent = n || ''; });
          var bn = shell.querySelector('#hqBellN'), n = counts.msg + counts.rev + counts.req + counts.appt; bn.hidden = !n; bn.textContent = n;
        });
        var body = shell.querySelector('#hqBody');
        if (tab === 'messages') messages(body, extra); else ({ overview: overview, page: myPage, posts: posts, sales: sales, reviews: reviews, account: settings, requests: requests, customers: customers, appointments: function (el) { hqAppts(el, cur, head, go); } })[tab](body, extra);
        var y = shell.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
      }
      function head(k, title, badge) { return '<small class="hq-k">' + k + '</small><h2 class="hq-h">' + title + (badge ? ' <em>' + badge + '</em>' : '') + '</h2>'; }
      var sparkline = function (pts) {
        var m = Math.max.apply(null, pts.concat([1])), w = 100;
        return '<svg class="hq-spark" viewBox="0 0 ' + w + ' 30" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="2.2" vector-effect="non-scaling-stroke" points="' + pts.map(function (v, i) { return (i * w / Math.max(1, pts.length - 1)).toFixed(1) + ',' + (28 - 24 * v / m).toFixed(1); }).join(' ') + '"/></svg>';
      };
      var CITY = '<svg class="hq-city" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V60h20V40h14v20h12V30h18v30h10V50h16v40h12V45h20v45h8V35h22v55h10V55h16v35h14V25h20v65h10V50h18v40h12V40h24v50h16V58h20v32z" fill="rgba(255,255,255,.08)"/></svg>';
      async function sharePage() {
        var url = shortUrl(cur.slug);
        if (navigator.share) { try { await navigator.share({ title: cur.name, text: cur.name + ' on Carvessa', url: url }); return; } catch (e) { return; } }
        try { await navigator.clipboard.writeText(url); alert('Link copied: ' + url); } catch (e) { prompt('Copy your page link:', url); }
      }
      async function overview(el) {
        el.innerHTML = '<div class="hq-load">Loading…</div>';
        var since = addDays(-29), days = []; for (var i = 29; i >= 0; i--) days.push(addDays(-i));
        var [s, ps, sl, svc, rvs, chs, fol, rv] = await Promise.all([
          sb.from('business_stats').select('kind, n, day').eq('business_id', cur.id).gte('day', since),
          sb.from('business_posts').select('id, kind').eq('business_id', cur.id).limit(50),
          sb.from('business_sales').select('amount, day').eq('business_id', cur.id).gte('day', since),
          sb.from('business_services').select('id', { count: 'exact', head: true }).eq('business_id', cur.id),
          sb.from('business_reviews').select('id', { count: 'exact', head: true }).eq('business_id', cur.id).eq('status', 'visible').is('reply', null),
          sb.from('biz_chats').select('id, driver_name, car, topic, kind, last_at, biz_seen_at').eq('business_id', cur.id).order('last_at', { ascending: false }).limit(50),
          sb.rpc('business_followers', { b: cur.id }),
          sb.from('business_reviews').select('stars').eq('business_id', cur.id).eq('status', 'visible')
        ]);
        var t = { view: 0, call: 0, directions: 0, website: 0 }, per = { view: {}, call: {}, directions: {}, sales: {} };
        (s.data || []).forEach(function (x) { t[x.kind] = (t[x.kind] || 0) + x.n; if (per[x.kind]) per[x.kind][x.day] = (per[x.kind][x.day] || 0) + x.n; });
        var sales = sl.data || [], total = sales.reduce(function (a, x) { per.sales[x.day] = (per.sales[x.day] || 0) + (Number(x.amount) || 0); return a + (Number(x.amount) || 0); }, 0);
        var chats = chs.data || [], newMsg = chats.filter(function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; }).length;
        var stars = (rv.data || []).map(function (x) { return x.stars; }), avg = stars.length ? stars.reduce(function (a, x) { return a + x; }, 0) / stars.length : 0;
        var hasSpecial = (ps.data || []).some(function (p) { return p.kind === 'special'; });
        var hr = new Date().getHours(), hello = hr < 12 ? 'GOOD MORNING' : hr < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
        var checks = [['Add your hours', !!cur.hours, 'fHours'], ['Add services and prices', svc.count > 0, 'fSvcLab'], ['Add a logo', !!cur.logo, 'fLogo'], ['Add 3 photos', (cur.photos || []).length >= 3, 'fPics'], ['Say what makes you different', !!cur.about, 'fAbout'], ['Post your first special', hasSpecial, 'posts']];
        var done = checks.filter(function (c) { return c[1]; }).length, pct = Math.round(done / checks.length * 100);
        var KPI = [['view', 'eye', 'Views', t.view, 'Drivers who opened your page'], ['call', 'phone', 'Calls', t.call, 'Taps on Call'], ['directions', 'pin', 'Directions', t.directions, 'Taps on Directions'], ['sales', 'cash', 'Sales you marked', money(total || 0), sales.length + ' customer' + (sales.length === 1 ? '' : 's')]];
        el.innerHTML =
          '<section class="hq-hero"><div><small>' + hello + '</small><h2>' + esc(cur.name) + '</h2><div class="hq-chips"><span class="hq-c ' + (cur.status === 'live' ? 'live' : 'wait') + '">' + (cur.status === 'live' ? '● Live' : STATUS[cur.status] || cur.status) + '</span>' + (cur.status === 'live' ? '<span class="hq-c">Verified by Carvessa</span>' : '') + (stars.length ? '<span class="hq-c">' + avg.toFixed(1) + ' stars · ' + stars.length + ' review' + (stars.length > 1 ? 's' : '') + '</span>' : '') + '<span class="hq-c">' + (fol.data || 0) + ' follower' + (fol.data === 1 ? '' : 's') + '</span></div></div>' +
          '<div class="hq-hb"><button type="button" class="hq-w ghost hq-link2" data-go="account:hqLink" title="Your page link">carvessa.app/b/' + esc(cur.slug) + '</button><a class="hq-w" href="/shops/?b=' + encodeURIComponent(cur.slug) + '" target="_blank" rel="noopener">' + icon('globe', 16) + 'View my page</a><button type="button" class="hq-w ghost" id="hqShare">' + icon('share', 16) + 'Share my page</button></div>' + CITY + '</section>' +
          (cur.status !== 'live' ? '<div class="hq-note">' + (cur.status === 'pending' ? 'Your page is waiting for our check. Only you can see it. We’ll call or text you at ' + esc(cur.phone || 'your number') + ' to confirm you’re the owner. Counts start when it’s live.' : 'Your page isn’t showing to drivers right now. Questions? Write to hello@carvessa.app.') + '</div>' : '') +
          '<div class="hq-kpis">' + KPI.map(function (k) { return '<button type="button" class="hq-kpi" data-kpi="' + k[0] + '"><span class="kh">' + icon(k[1], 18) + k[2] + icon('chev', 16) + '</span><b>' + k[3] + '</b><small>' + (k[0] === 'sales' ? k[4] : 'last 30 days') + '</small>' + sparkline(days.map(function (d) { return per[k[0]][d] || 0; })) + '</button>'; }).join('') + '</div>' +
          '<div id="hqKpiD"></div>' +
          '<h3 class="hq-sec">Quick actions</h3><div class="hq-qas">' +
            [['messages', 'msg', 'blue', 'Answer messages', newMsg ? newMsg + ' waiting for you' : 'All caught up', newMsg], ['posts', 'tag', 'green', 'Post a special', 'Your followers get an alert', 0], ['page:fSvcLab', 'wrench', 'orange', 'Edit services and prices', svc.count ? svc.count + ' service' + (svc.count > 1 ? 's' : '') : 'Add your first one', 0], ['reviews', 'star', 'gold', 'Reply to reviews', rvs.count ? rvs.count + ' need' + (rvs.count > 1 ? '' : 's') + ' a reply' : 'All replied', rvs.count]].map(function (q) {
              return '<button type="button" class="hq-qa" data-go="' + q[0] + '"><span class="qi ' + q[2] + '">' + icon(q[1], 22) + '</span><b>' + q[3] + '</b><small>' + q[4] + '</small>' + (q[5] ? '<em>' + q[5] + '</em>' : '') + '</button>';
            }).join('') + '</div>' +
          '<div class="hq-two"><div class="hq-card"><div class="hq-ch"><b>Latest messages</b><button type="button" class="hq-lk" data-go="messages">See all</button></div>' +
            (chats.length ? chats.slice(0, 4).map(function (c) { var un = !c.biz_seen_at || c.last_at > c.biz_seen_at; return '<button type="button" class="hq-mrow' + (un ? ' new' : '') + '" data-chat="' + c.id + '"><span class="av">' + esc((c.driver_name || '?')[0]) + '</span><span class="tx"><b>' + esc(c.driver_name || 'Driver') + (c.car ? ' · ' + esc(c.car) : '') + '</b><small>' + (c.kind === 'quote' ? 'Quote · ' : '') + esc(c.topic || 'Message') + '</small></span><span class="tm">' + when(c.last_at) + '</span>' + icon('chev', 16) + '</button>'; }).join('') : '<p class="hq-fine">No messages yet. When drivers tap Message or Get a quote on your page, it shows up here.</p>') + '</div>' +
          '<div class="hq-card"><div class="hq-ch"><b>Make your page great</b><span class="hq-pct">' + pct + '%</span></div><div class="hq-prog"><i style="width:' + pct + '%"></i></div>' +
            checks.map(function (c) { return c[1] ? '<div class="hq-ck done"><i>' + icon('check', 12) + '</i>' + c[0] + '</div>' : '<button type="button" class="hq-ck" data-go="' + (c[2] === 'posts' ? 'posts' : 'page:' + c[2]) + '"><i></i>' + c[0] + icon('chev', 14) + '</button>'; }).join('') + '</div></div>' +
          '<div class="hq-card"><b>Your plan</b><p class="hq-fine" style="margin:4px 0 0">Free during our launch. Your page, deals, reviews and messages stay free. We’ll tell you in writing before any paid option, and you can always say no.</p></div>';
        el.querySelector('#hqShare').onclick = sharePage;
        el.onclick = function (e) {
          var c = e.target.closest('[data-chat]'); if (c) { go('messages', c.getAttribute('data-chat')); return; }
          var k = e.target.closest('[data-kpi]');
          if (k) {
            var key = k.getAttribute('data-kpi'); if (key === 'sales') { go('sales'); return; }
            var d = el.querySelector('#hqKpiD'), m = Math.max.apply(null, days.map(function (x) { return per[key][x] || 0; }).concat([1]));
            if (d.getAttribute('data-k') === key) { d.innerHTML = ''; d.removeAttribute('data-k'); return; }
            d.setAttribute('data-k', key);
            d.innerHTML = '<div class="hq-card"><div class="hq-ch"><b>' + ({ view: 'Views', call: 'Calls', directions: 'Directions' })[key] + ' · last 30 days</b><button type="button" class="hq-lk" data-close>Close</button></div><div class="hq-bars">' + days.map(function (x) { var v = per[key][x] || 0; return '<i title="' + shortDay(x) + ': ' + v + '" style="height:' + Math.max(3, Math.round(v / m * 100)) + '%"></i>'; }).join('') + '</div><div class="hq-bx"><span>' + shortDay(days[0]) + '</span><span>Today</span></div><p class="hq-fine">Counts only, never names. Your own visits never count.</p></div>';
            return;
          }
          if (e.target.closest('[data-close]')) { var d2 = el.querySelector('#hqKpiD'); d2.innerHTML = ''; d2.removeAttribute('data-k'); return; }
          var g = e.target.closest('[data-go]'); if (!g) return;
          var v = g.getAttribute('data-go').split(':'); go(v[0], v[1]);
        };
      }
      // One box for every code a driver shows: deal codes (TONY-4821) and loyalty cards (TONY-C123).
      function codeBox(id) {
        return '<div class="hq-card" id="' + id + '"><h4>CHECK A CODE</h4><div class="cc-row"><input class="ccIn" maxlength="14" placeholder="TONY-4821" autocapitalize="characters" aria-label="Code from the driver’s phone"><button type="button" class="bz-btn ccGo">Check</button></div><div class="bz-msg ccM" role="status"></div><p class="hq-fine">Deal codes get marked used. Loyalty card codes get a stamp (and the reward when the card is full).</p></div>';
      }
      function wireCode(box) {
        var inp = box.querySelector('.ccIn'), m = box.querySelector('.ccM');
        box.onclick = async function (e) {
          var give = e.target.closest('[data-give]');
          if (!e.target.closest('.ccGo') && !give) return;
          var c = give ? give.getAttribute('data-give') : inp.value.trim(); m.className = 'bz-msg bad';
          if (c.length < 4) { m.textContent = 'Type the code from the driver’s phone.'; return; }
          if (/-C[0-9A-Z]{3,5}$/i.test(c)) {
            var y = await sb.rpc('loyalty_stamp', { b: cur.id, c: c, give: !!give });
            if (y.error) { m.textContent = 'That didn’t work. Please try again.'; return; }
            var l = y.data;
            if (l.ok && l.gave) { m.className = 'bz-msg good'; m.textContent = '✓ Reward given to ' + l.name + ': ' + l.reward + '. Their card starts over.'; inp.value = ''; return; }
            if (l.ok) { m.className = 'bz-msg good'; m.textContent = '✓ Stamp added for ' + l.name + ': ' + l.stamps + ' of ' + l.of + (l.full ? '. Card full: next visit gets “' + l.reward + '”.' : '.'); inp.value = ''; return; }
            if (l.why === 'reward_ready') { m.className = 'bz-msg good'; m.innerHTML = esc(l.name) + '’s card is full. <button type="button" class="bz-btn bz-small" data-give="' + esc(c.toUpperCase()) + '">Give the reward: ' + esc(l.reward) + '</button>'; return; }
            m.textContent = l.why === 'today' ? 'Already stamped today for ' + l.name + ' (' + l.stamps + ' of ' + l.of + ').' : l.why === 'off' ? 'Turn on your loyalty card in Customers first.' : 'We can’t find that card code.';
            return;
          }
          var x = await sb.rpc('deal_code_use', { b: cur.id, c: c });
          if (x.error) { m.textContent = 'That didn’t work. Please try again.'; return; }
          var d = x.data;
          if (d.ok) { m.className = 'bz-msg good'; m.textContent = '✓ Good code for “' + d.title + '”. Marked used.' + (d.expired ? ' Note: this deal has ended, so it’s your call.' : ''); inp.value = ''; }
          else m.textContent = d.why === 'used' ? 'This code was already used on ' + new Date(d.used_at).toLocaleDateString('en-US') + ' (“' + d.title + '”).' : 'We can’t find that code. Check the letters and numbers.';
        };
      }
      // Loyalty card + Remind my customers (picture 292 ideas 2 + 3).
      async function customers(el) {
        el.innerHTML = '<div class="hq-load">Loading…</div>';
        var [lr, cr] = await Promise.all([sb.from('business_loyalty').select('*').eq('business_id', cur.id).maybeSingle(), sb.from('loyalty_cards').select('code, stamps, rewards, remind, car, first_name, last_visit, last_reminded, created_at').eq('business_id', cur.id).order('last_visit', { ascending: false, nullsFirst: false }).limit(500)]);
        var L = lr.data || { active: false, stamps: 5, reward: TPL_KIND[cur.kind] && cur.kind === 'tires' ? 'Free tire rotation' : 'Free oil change' }, cards = cr.data || [];
        var month = Date.now() - 30 * 864e5, ok = cards.filter(function (c) { return c.remind && (!c.last_reminded || new Date(c.last_reminded).getTime() < month); });
        var due = function (c) { return c.last_visit && Date.now() - new Date(c.last_visit).getTime() > 90 * 864e5; };
        el.innerHTML = head('CUSTOMERS', 'Bring them back', cards.length ? cards.length + ' card' + (cards.length > 1 ? 's' : '') : '') +
          codeBox('cuCode') +
          '<div class="hq-card"><h4>LOYALTY CARD</h4><label class="bz-ck" style="margin:4px 0"><input type="checkbox" id="lyOn"' + (L.active ? ' checked' : '') + '><span>Give drivers a stamp card on my page</span></label>' +
            '<div class="bz-two"><label class="bz-f"><span>Visits to fill the card</span><select id="lyN">' + [3, 4, 5, 6, 8, 10, 12].map(function (n) { return '<option' + (n === L.stamps ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label><label class="bz-f"><span>The reward</span><input id="lyR" maxlength="80" value="' + esc(L.reward) + '"></label></div>' +
            '<div class="ly-prev">' + Array.from({ length: L.stamps }, function (_, i) { return '<i class="' + (i < 2 ? 'f' : '') + '">' + (i < 2 ? icon('check', 14) : i + 1) + '</i>'; }).join('') + '<span>' + esc(L.reward) + '</span></div>' +
            '<div class="bz-row"><button type="button" class="bz-btn" id="lyGo">Save</button></div><div class="bz-msg" id="lyM" role="status"></div><p class="hq-fine">Each visit = one stamp: type the driver’s card code in “Check a code”. A used deal code adds a stamp too. One stamp per visit (12 hours).</p></div>' +
          '<div class="hq-card"><h4>REMIND MY CUSTOMERS</h4><p class="hq-fine" style="margin-top:0">Only drivers who said yes on their card. At most one reminder a month each, by phone and email, never at night.</p>' +
            '<div class="bz-chips" id="rmW">' + ['an oil change', 'a tire rotation', 'a brake check', 'new wipers', 'a state inspection'].map(function (w, i) { return '<button type="button" data-w="' + w + '" class="' + (i === 0 ? 'on' : '') + '">' + w.replace(/^an? /, '').replace(/^./, function (x) { return x.toUpperCase(); }) + '</button>'; }).join('') + '</div>' +
            '<div class="bz-row"><button type="button" class="bz-btn" id="rmGo"' + (ok.length ? '' : ' disabled') + '>Send to ' + ok.length + ' customer' + (ok.length === 1 ? '' : 's') + '</button></div><div class="bz-msg" id="rmM" role="status"></div>' +
            (cards.filter(due).length ? '<p class="hq-fine">' + cards.filter(due).length + ' haven’t been back in 3+ months.</p>' : '') + '</div>' +
          '<h3 class="hq-sec">Your customers</h3>' + (cards.length ? '<div class="hq-card" style="padding:4px 12px">' + cards.map(function (c) {
            return '<div class="cu-row"><span class="av">' + esc((c.first_name || '?')[0]) + '</span><div class="tx"><b>' + esc(c.first_name) + (c.car ? ' · ' + esc(c.car) : '') + '</b><small>' + c.stamps + ' of ' + L.stamps + ' stamps' + (c.rewards ? ' · ' + c.rewards + ' reward' + (c.rewards > 1 ? 's' : '') : '') + ' · ' + (c.last_visit ? 'last visit ' + shortDay(c.last_visit.slice(0, 10)) : 'no visit yet') + '</small></div><span class="hq-c ' + (c.remind ? 'live' : '') + '" style="' + (c.remind ? '' : 'background:var(--bg);color:var(--mut)') + '">' + (c.remind ? 'Reminders on' : 'No reminders') + '</span></div>';
          }).join('') + '</div>' : '<p class="hq-fine">No cards yet. Turn on the loyalty card; drivers get one on your page.</p>');
        wireCode(el.querySelector('#cuCode'));
        var what = 'an oil change';
        el.querySelector('#rmW').onclick = function (e) { var w = e.target.getAttribute('data-w'); if (w) { what = w; [].forEach.call(this.children, function (b) { b.className = b.getAttribute('data-w') === w ? 'on' : ''; }); } };
        el.querySelector('#lyGo').onclick = async function () {
          var m = el.querySelector('#lyM'), rw = el.querySelector('#lyR').value.trim(); m.className = 'bz-msg bad';
          if (rw.length < 3) { m.textContent = 'Please say what the reward is.'; return; }
          var x = await sb.from('business_loyalty').upsert({ business_id: cur.id, active: el.querySelector('#lyOn').checked, stamps: +el.querySelector('#lyN').value, reward: rw, updated_at: new Date().toISOString() });
          if (x.error) { m.textContent = 'That didn’t save. Please try again.'; return; }
          customers(el);
        };
        el.querySelector('#rmGo').onclick = async function () {
          var m = el.querySelector('#rmM'); if (!confirm('Send “Time for ' + what + '?” to ' + ok.length + ' customer' + (ok.length === 1 ? '' : 's') + '?')) return;
          var x = await sb.rpc('shop_remind', { b: cur.id, what: what });
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = /live/.test(x.error.message) ? 'Your page must be live first.' : 'That didn’t send. Please try again.'; return; }
          m.className = 'bz-msg good'; m.textContent = 'Sent to ' + x.data + ' customer' + (x.data === 1 ? '' : 's') + ' (at night they wait until 8 AM).';
          this.disabled = true;
        };
      }
      // Drivers ask, shops answer (Nov 20, 2026): open price requests near this page.
      async function requests(el) {
        el.innerHTML = '<div class="hq-load">Loading…</div>';
        var KW = { repair: 'repair', tires: 'tire', body: 'body shop', detail: 'detailing', tow: 'towing', insurance: 'insurance', dealer: 'car' };
        if (cur.status !== 'live') { el.innerHTML = head('PRICE REQUESTS', 'Drivers asking for a price') + '<div class="hq-note">Requests show here once your page is live.</div>'; return; }
        if (cur.lat == null) { el.innerHTML = head('PRICE REQUESTS', 'Drivers asking for a price') + '<div class="hq-note">Add your street address in My page so we can show you requests near you.</div>'; return; }
        var r = await sb.rpc('biz_requests_near', { b: cur.id }), list = r.data || [];
        el.innerHTML = head('PRICE REQUESTS', 'Drivers asking for a price', list.length ? list.length + ' near you' : '') +
          '<p class="hq-fine">Drivers near you who need ' + (KW[cur.kind] || 'car') + ' help. You see their first name, car and area, never their phone or email. Answer with a price; the first good answer often wins. Requests stay open 3 days.</p>' +
          (list.length ? list.map(function (x) {
            var hi = 'Hi ' + (x.driver_name === 'Carvessa member' ? 'there' : esc(x.driver_name.split(' ')[0])) + '! ';
            return '<div class="hq-card rq" data-r="' + x.id + '"><div class="hq-ch"><b>' + esc(x.car || 'Car not given') + '</b><small class="hq-fine" style="margin:0">' + esc(x.place || '') + ' · ' + (x.dist < 1 ? 'under 1' : Math.round(x.dist)) + ' mi · ' + when(x.created_at) + '</small></div>' +
              '<div class="rq-tags">' + (x.miles ? '<span>' + Number(x.miles).toLocaleString('en-US') + ' mi</span>' : '') + (x.vin ? '<span>VIN ' + esc(x.vin) + '</span>' : '') + (x.own_parts ? '<span class="own">May bring their own parts</span>' : '') + '</div>' +
              '<p style="margin:4px 0 6px">' + esc(x.need) + '</p>' + mediaHtml(x) + '<small class="hq-fine">' + esc(x.driver_name) + (x.answers ? ' · ' + x.answers + ' shop' + (x.answers > 1 ? 's' : '') + ' answered' : ' · no answers yet') + ' · sent to the closest shops only</small>' +
              (x.chat_id ? '<div class="bz-row"><button type="button" class="bz-btn soft bz-small" data-chat="' + x.chat_id + '">' + icon('check', 16) + 'You answered · open the chat</button></div>' :
                '<div class="rq-f"><label class="bz-f"><span>Message</span><textarea class="rqB" maxlength="1000">' + hi + 'We can help with this. </textarea></label>' +
                '<div class="bz-chips rq-how"><button type="button" class="on" data-how="est">Send a written estimate</button><button type="button" data-how="msg">Message only (need to see it first)</button></div>' +
                '<div class="rq-of"></div><div class="rq-only" hidden><div class="bz-row"><button type="button" class="bz-btn" data-send="' + x.id + '">Send my message</button></div></div><div class="bz-msg rq-m" role="status"></div></div>') + '</div>';
          }).join('') : '<div class="hq-card"><b>No open requests near you right now.</b><p class="hq-fine" style="margin:4px 0 0">We email you when a driver nearby asks. Keep your services and prices up to date so drivers pick you.</p></div>');
        var fail = function (x) { return /isn.t open/.test(x.error.message) ? 'This request just closed.' : /short answer/.test(x.error.message) ? 'Please write a short answer or a price.' : /line/.test(x.error.message) ? x.error.message : 'That didn’t send. Please try again.'; };
        [].forEach.call(el.querySelectorAll('.rq-of'), function (host) {
          var card = host.closest('.rq'), rid = card.getAttribute('data-r'), it = list.filter(function (y) { return y.id === rid; })[0];
          offerBuilder(host, async function (offer) {
            var x = await sb.rpc('biz_request_answer', { r: rid, b: cur.id, body: card.querySelector('.rqB').value, price: null, note: null, offer: offer });
            if (x.error) return fail(x);
            go('messages', x.data);
          }, { button: 'Send my estimate', noCancel: true });
        });
        el.onclick = async function (e) {
          var c = e.target.closest('[data-chat]'); if (c) { go('messages', c.getAttribute('data-chat')); return; }
          var hw = e.target.closest('[data-how]');
          if (hw) { var cd = hw.closest('.rq'), est = hw.getAttribute('data-how') === 'est'; [].forEach.call(hw.parentNode.children, function (z) { z.className = z === hw ? 'on' : ''; }); cd.querySelector('.rq-of').hidden = !est; cd.querySelector('.rq-only').hidden = est; return; }
          var sbtn = e.target.closest('[data-send]'); if (!sbtn) return;
          var card = sbtn.closest('.rq'), m = card.querySelector('.rq-m');
          m.className = 'bz-msg'; m.textContent = 'Sending…'; sbtn.disabled = true;
          var x = await sb.rpc('biz_request_answer', { r: sbtn.getAttribute('data-send'), b: cur.id, body: card.querySelector('.rqB').value, price: null, note: null, offer: null });
          sbtn.disabled = false;
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = fail(x); return; }
          go('messages', x.data);
        };
      }
      async function myPage(el, focus) {
        el.innerHTML = head('MY PAGE', 'What drivers see') + '<p class="hq-fine">Changing your name, address or phone sends your page to us for a quick check.</p><div id="hqForm"></div>';
        var s = await sb.from('business_services').select('*').eq('business_id', cur.id).order('sort');
        form(cur, s.data || [], async function (row, svcs) {
          var x = await sb.from('businesses').update(row).eq('id', cur.id).select(MINE).single(); if (x.error) throw x.error;
          await saveServices(cur.id, svcs);
          var was = cur.status; Object.assign(cur, x.data);
          var m = el.querySelector('#fMsg'); m.className = 'bz-msg good';
          m.textContent = cur.status === 'pending' && was === 'live' ? 'Saved. You changed your name, address or phone, so we’ll check it again before it shows.' : 'Saved.';
          if (arguments[2]) setTimeout(function () { if (m.textContent === 'Saved.') m.textContent = ''; }, 1800);
          var pkEl = shell.querySelector('a.hq-pick'); if (pkEl) pkEl.firstChild.textContent = cur.name;
        }, el.querySelector('#hqForm'));
        if (focus) setTimeout(function () { var fh = el.querySelector('#hqForm'), f = fh && fh._go ? fh._go(focus === 'fHours' ? 'fWeek' : focus) : el.querySelector('#' + focus); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (f.focus && /INPUT|TEXTAREA/.test(f.tagName)) f.focus(); } }, 200);
      }
      async function posts(el, justPosted) {
        var [r, cd, fol] = await Promise.all([
          sb.from('business_posts').select('*').eq('business_id', cur.id).order('created_at', { ascending: false }),
          sb.from('deal_codes').select('post_id, used_at').eq('business_id', cur.id).limit(5000),
          sb.rpc('business_followers', { b: cur.id })
        ]);
        var list = r.data || [], nFol = fol.data || 0, codes = {};
        (cd.data || []).forEach(function (c) { var x = codes[c.post_id] = codes[c.post_id] || { given: 0, used: 0 }; x.given++; if (c.used_at) x.used++; });
        var ex = TPL_KIND[cur.kind] || {}, lend = cur.kind === 'dealer' || cur.kind === 'credit_union';
        var st = { tpl: 'price' };
        var startWords = function (k) { var t = TPL[k], o = ex[k]; return { title: o ? o[0] : t.title, body: o ? o[1] : t.body }; };
        el.innerHTML = head('DEALS AND POSTS', 'Post a special') +
          '<p class="hq-fine">Pick a template, change the words, post. It shows on your page, in “Deals near you” in the app, and your followers get an alert.' + (cur.status !== 'live' ? ' Drivers see it once your page is live.' : '') + '</p>' +
          '<div id="pDone"></div>' +
          codeBox('dlCode') +
          '<div class="pe"><div class="pe-l"><div class="tpl-grid" id="pTpl">' + Object.keys(TPL).map(function (k) { var t = TPL[k]; return '<button type="button" data-tpl="' + k + '" class="tpl-b' + (k === st.tpl ? ' on' : '') + '" style="--a:' + t.bg[0] + ';--b:' + t.bg[1] + '">' + icon(t.ic, 16) + '<span>' + t.name + '</span></button>'; }).join('') + '</div>' +
          '<label class="bz-f"><span>What is it?</span><input id="pT" maxlength="80"></label>' +
          '<div class="bz-two"><label class="bz-f" id="pPw"><span>Your price (optional)</span><input id="pP" inputmode="decimal" placeholder="$39.99"></label><label class="bz-f"><span>Ends on</span><input id="pU" type="date" min="' + today() + '" max="' + addDays(365) + '"></label></div>' +
          '<label class="bz-f"><span>Details (optional)</span><textarea id="pB" maxlength="300"></textarea></label>' +
          '<label class="bz-f"><span>Small print (optional)</span><input id="pF" maxlength="160" placeholder="Most cars. One per customer."></label>' +
          '<div class="bz-f"><span>Who can use it</span><div class="bz-chips" id="pW"><button type="button" data-w="everyone" class="on">Everyone</button><button type="button" data-w="new">New customers</button></div></div>' +
          '<label class="bz-ck"><input type="checkbox" id="pC" checked><span>Give drivers a counter code (so you see who came from Carvessa)</span></label>' +
          '<label class="bz-ck"><input type="checkbox" id="pA" checked><span>Tell my followers (' + nFol + ' follower' + (nFol === 1 ? '' : 's') + ')</span></label>' +
          (lend ? '<p class="hq-warn">No loan or payment terms in deals (rates, APR, monthly payments, down payments). Federal ad rules need full details for those.</p>' : '') +
          '<p class="hq-fine">Real prices only. Say “was $X” only if you really charged it. Posted at night? Phone alerts wait until 8 AM.</p>' +
          '<div class="bz-row"><button type="button" class="bz-btn" id="pGo">' + (nFol ? 'Post it and tell my followers' : 'Post it') + '</button></div><div class="bz-msg" id="pM" role="status"></div></div>' +
          '<div class="pe-r"><small class="hq-k">PREVIEW</small><div id="pPrev"></div><p class="hq-fine">This is how drivers see it on your page and in the app.</p></div></div>' +
          '<h3 class="hq-sec">Your deals and posts</h3><div id="pL">' + (list.length ? list.map(function (p) {
            var old = p.until && p.until < today(), c = codes[p.id] || { given: 0, used: 0 };
            return '<div class="pr' + (old ? ' old' : '') + '"><div class="pr-card">' + dealCard(p, cur, 'sm') + '</div><div class="pr-info"><b>' + esc(p.title) + '</b><small>' + (old ? 'Ended ' + shortDay(p.until) : p.until ? 'Ends ' + shortDay(p.until) : 'No end date') + ' · posted ' + shortDay(p.created_at.slice(0, 10)) + '</small>' +
              '<div class="pr-n"><span><b>' + (p.alerted || 0) + '</b>followers alerted</span>' + (p.codes ? '<span><b>' + c.given + '</b>codes given</span><span><b>' + c.used + '</b>used at the counter</span>' : '') + '</div>' +
              '<div class="bz-row">' + (old ? '' : '<button type="button" class="bz-btn soft bz-small" data-share="' + p.id + '">' + icon('share', 16) + 'Share</button>') + '<button type="button" class="bz-btn red bz-small" data-del="' + p.id + '">Delete</button></div><div class="pr-sk"></div></div></div>';
          }).join('') : '<p class="hq-fine">No deals yet. Your first one takes about 30 seconds.</p>') + '</div>';
        var $ = function (id) { return el.querySelector('#' + id); };
        function fill(k) {
          st.tpl = k; var t = TPL[k], w = startWords(k);
          $('pT').value = w.title; $('pB').value = w.body; $('pP').value = ''; $('pPw').hidden = !t.price && k !== 'new_customer' && k !== 'sale';
          $('pT').placeholder = w.title; $('pU').value = t.news ? '' : addDays(14);
          setWho(t.who || 'everyone'); $('pC').checked = !t.news; $('pC').disabled = !!t.news;
          [].forEach.call($('pTpl').children, function (b) { b.classList.toggle('on', b.getAttribute('data-tpl') === k); });
          prev();
        }
        function setWho(w) { st.who = w; [].forEach.call($('pW').children, function (b) { b.className = b.getAttribute('data-w') === w ? 'on' : ''; }); }
        function row() {
          var pr = $('pP').value.replace(/[^\d.]/g, '');
          return { business_id: cur.id, kind: TPL[st.tpl].news ? 'news' : 'special', template: st.tpl, title: $('pT').value.trim(), body: $('pB').value.trim() || null, price: pr ? Number(pr) : null, fine: $('pF').value.trim() || null, who: st.who, until: $('pU').value || null, codes: $('pC').checked && !TPL[st.tpl].news, alert: $('pA').checked };
        }
        function prev() { var p = row(); p.title = p.title || TPL[st.tpl].title; $('pPrev').innerHTML = dealCard(p, cur); }
        fill('price');
        $('pTpl').onclick = function (e) { var b = e.target.closest('[data-tpl]'); if (b) fill(b.getAttribute('data-tpl')); };
        $('pW').onclick = function (e) { var w = e.target.getAttribute('data-w'); if (w) { setWho(w); prev(); } };
        el.querySelector('.pe-l').addEventListener('input', prev);
        $('pGo').onclick = async function () {
          var p = row(), m = $('pM'); m.className = 'bz-msg bad';
          if (p.title.length < 2) { m.textContent = 'Please say what the deal is.'; return; }
          if (p.kind === 'special' && !p.until) { m.textContent = 'Every deal needs an end date.'; return; }
          if (lend && LENDING.test([p.title, p.body, p.fine].join(' '))) { m.textContent = 'Please take out loan or payment words (rate, APR, monthly, down payment, financing). Federal ad rules need full details for those.'; return; }
          $('pGo').disabled = true; m.className = 'bz-msg'; m.textContent = 'Posting…';
          var x = await sb.from('business_posts').insert(p).select('*').single();
          $('pGo').disabled = false;
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = /20 posts/.test(x.error.message) ? 'You can keep up to 20 live posts. Delete an old one first.' : /5 posts a day/.test(x.error.message) ? 'You can post up to 5 times a day.' : 'That didn’t post. Please try again.'; return; }
          posts(el, x.data);
        };
        wireCode(el.querySelector('#dlCode'));
        $('pL').onclick = async function (e) {
          var id = e.target.closest('[data-del]'); id = id && id.getAttribute('data-del');
          if (id && confirm('Delete this post? Codes already given stop working.')) { await sb.from('business_posts').delete().eq('id', id); posts(el); return; }
          var sh = e.target.closest('[data-share]'); if (!sh) return;
          var p = list.filter(function (x) { return x.id === sh.getAttribute('data-share'); })[0];
          shareKit(sh.closest('.pr-info').querySelector('.pr-sk'), p, cur);
        };
        if (justPosted) {
          var d = $('pDone');
          d.innerHTML = '<div class="hq-card good"><b>Posted!</b><p class="hq-fine" style="margin:4px 0 0" id="pDn">' + (justPosted.alert && nFol ? 'Sending alerts to your followers…' : cur.status === 'live' ? 'It’s on your page and in “Deals near you”.' : 'Drivers see it once your page is live.') + '</p></div><div id="pDk"></div>';
          shareKit(d.querySelector('#pDk'), justPosted, cur);
          if (justPosted.alert && nFol) setTimeout(async function () { var a = await sb.from('business_posts').select('alerted').eq('id', justPosted.id).single(); var n = (a.data && a.data.alerted) || 0; var t = d.querySelector('#pDn'); if (t) t.textContent = n ? n + ' follower' + (n > 1 ? 's' : '') + ' get an alert (phone alerts wait until 8 AM at night). It’s also on your page and in “Deals near you”.' : 'None of your followers asked for this kind of alert. It’s on your page and in “Deals near you”.'; }, 1500);
          d.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      async function sales(el) {
        var r = await sb.from('business_sales').select('*').eq('business_id', cur.id).order('day', { ascending: false }).limit(100);
        var list = r.data || [], month = new Date().toISOString().slice(0, 7);
        var mon = list.filter(function (x) { return String(x.day).slice(0, 7) === month; }), sum = mon.reduce(function (a, x) { return a + (Number(x.amount) || 0); }, 0);
        var withAmt = mon.filter(function (x) { return x.amount != null; });
        el.innerHTML = head('SALES FROM CARVESSA · ' + new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase(), money(sum) || '$0', 'you reported') +
          '<div class="hq-laps"><div><small>CUSTOMERS FROM CARVESSA</small><b>' + mon.length + '</b></div><div><small>AVERAGE TICKET</small><b>' + (withAmt.length ? money(Math.round(sum / withAmt.length)) : '–') + '</b></div><div><small>WHAT CARVESSA COST YOU</small><b>$0</b></div></div>' +
          '<div class="hq-card"><h4>MARK A CUSTOMER WHO CAME FROM CARVESSA</h4><div class="bz-two"><label class="bz-f"><span>Amount (optional)</span><input id="sA" inputmode="decimal" placeholder="$140"></label><label class="bz-f"><span>What for (optional)</span><input id="sN" maxlength="120" placeholder="Brake pads"></label></div><div class="bz-row"><button type="button" class="bz-btn" id="sGo">✓ Became a customer</button></div><div class="bz-msg" id="sM" role="status"></div><p class="hq-fine">Only you see this. We never see your register. It’s how you know Carvessa is worth it.</p></div>' +
          '<div id="sL">' + list.map(function (x) { return '<div class="hq-row"><span>' + esc(x.day) + '</span><span>' + esc(x.note || 'Customer') + '</span><b>' + (x.amount != null ? money(x.amount) : '–') + '</b><button type="button" class="bz-btn red bz-small" data-del="' + x.id + '" aria-label="Delete">✕</button></div>'; }).join('') + '</div>';
        el.querySelector('#sGo').onclick = async function () {
          var a = el.querySelector('#sA').value.replace(/[^\d.]/g, ''), m = el.querySelector('#sM');
          var x = await sb.from('business_sales').insert({ business_id: cur.id, amount: a ? Number(a) : null, note: el.querySelector('#sN').value.trim() || null });
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
          sales(el);
        };
        el.querySelector('#sL').onclick = async function (e) { var id = e.target.getAttribute('data-del'); if (id && confirm('Delete this sale?')) { await sb.from('business_sales').delete().eq('id', id); sales(el); } };
      }

      async function reviews(el, filter) {
        filter = filter || 'all';
        var r = await sb.from('business_reviews').select('*').eq('business_id', cur.id).order('created_at', { ascending: false });
        var all = r.data || [], vis = all.filter(function (x) { return x.status === 'visible'; });
        var avg = vis.length ? (vis.reduce(function (a, x) { return a + x.stars; }, 0) / vis.length) : 0;
        var need = vis.filter(function (x) { return !x.reply; });
        var list = filter === 'need' ? need : filter === 'low' ? vis.filter(function (x) { return x.stars <= 3; }) : all;
        el.innerHTML = head('FROM THE STANDS', 'Reviews', vis.length ? '★ ' + avg.toFixed(1) + ' · ' + vis.length : 'none yet') +
          '<p class="hq-fine">From Carvessa members. You can reply in public and report a review that breaks our <a href="/business/review-rules/" target="_blank">Review Rules</a>. Nobody can edit, hide or buy reviews.</p>' +
          '<div class="bz-chips" id="rvF">' + [['all', 'All ' + all.length], ['need', 'Need a reply · ' + need.length], ['low', '1–3 stars · ' + vis.filter(function (x) { return x.stars <= 3; }).length]].map(function (f) { return '<button type="button" data-f="' + f[0] + '" class="' + (filter === f[0] ? 'on' : '') + '">' + f[1] + '</button>'; }).join('') + '</div>' +
          (list.length ? list.map(function (x) {
            var pics = (x.photos || []);
            return '<div class="hq-card rv-item" data-id="' + x.id + '"><div class="rv-top">' + starRow(x.stars) + '<b>' + esc(x.first_name) + '</b><small>' + ago(x.created_at) + (x.updated_at && x.updated_at.slice(0, 16) !== x.created_at.slice(0, 16) ? ' · edited' : '') + '</small></div>' +
              (x.status !== 'visible' ? '<div class="hq-note">Hidden by Carvessa' + (x.removed_reason ? ': ' + esc(x.removed_reason) : '') + '</div>' : '') +
              (x.body ? '<p>' + esc(x.body) + '</p>' : '') +
              (pics.length ? (x.photos_ok ? '<div class="rv-pics">' + pics.map(function (p) { return '<img src="' + photoUrl(p) + '" alt="Review photo" loading="lazy">'; }).join('') + '</div>' : '<p class="hq-fine">' + pics.length + ' photo' + (pics.length > 1 ? 's' : '') + ' waiting for our check.</p>') : '') +
              '<label class="bz-f"><span>' + (x.reply ? 'Your public reply' : 'Reply in public') + '</span><textarea data-r="' + x.id + '" maxlength="600" placeholder="Thank you, ' + esc(x.first_name) + '! …">' + esc(x.reply || '') + '</textarea></label>' +
              '<div class="bz-row"><button type="button" class="bz-btn bz-small" data-save="' + x.id + '">' + (x.reply ? 'Update reply' : 'Post reply') + '</button>' + (x.reply ? '<button type="button" class="bz-btn soft bz-small" data-clear="' + x.id + '">Delete reply</button>' : '') + '<button type="button" class="bz-btn red bz-small" data-rep="' + x.id + '">Report</button></div><div class="rv-rep-box"></div><div class="bz-msg" role="status"></div></div>';
          }).join('') : '<div class="hq-card">' + (all.length ? 'Nothing here.' : 'No reviews yet. Tip: give your customers your page link or QR code and ask them to review you.') + '</div>');
        el.querySelector('#rvF').onclick = function (e) { var f = e.target.getAttribute('data-f'); if (f) reviews(el, f); };
        el.onclick = async function (e) {
          var id = e.target.getAttribute('data-save') || e.target.getAttribute('data-clear'), rep = e.target.getAttribute('data-rep');
          if (rep) { reportBox(e.target.closest('.rv-item').querySelector('.rv-rep-box'), rep); return; }
          if (!id) return;
          var card = e.target.closest('.rv-item'), m = card.querySelector('.bz-msg'), txt = e.target.getAttribute('data-clear') ? '' : card.querySelector('textarea').value.trim();
          var x = await sb.from('business_reviews').update({ reply: txt || null }).eq('id', id);
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
          reviews(el, filter);
        };
      }

      async function messages(el, openId) {
        var r = await sb.from('biz_chats').select('*').eq('business_id', cur.id).order('last_at', { ascending: false }).limit(100);
        var chats = r.data || [], unread = function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; };
        el.innerHTML = head('TEAM RADIO', 'Messages', chats.filter(unread).length ? chats.filter(unread).length + ' new' : '') +
          '<p class="hq-fine">Drivers who wrote to you from Carvessa. Quote requests come with their car and problem. Answer fast: the first good answer often wins the job.</p>' +
          '<div class="bz-row"><button type="button" class="bz-btn" id="nmGo">＋ New message</button></div><div id="nmBox"></div>' +
          (chats.length ? '<div class="ch-wrap"><div class="ch-side">' + chats.map(function (c) { return '<button type="button" data-chat="' + c.id + '" class="' + (c.id === openId ? 'on ' : '') + (unread(c) ? 'new' : '') + '"><b>' + esc(c.driver_name) + (c.car ? ' · ' + esc(c.car) : '') + '</b><small>' + (c.kind === 'quote' ? 'Quote · ' : '') + esc(c.topic || 'Message') + '</small><small>' + when(c.last_at) + (c.status !== 'open' ? ' · ' + c.status : '') + '</small></button>'; }).join('') + '</div><div class="ch-main" id="chMain"><p class="hq-fine">Pick a chat.</p></div></div>'
          : '<div class="hq-card">No messages yet. When your page is live, drivers can message you or ask for a quote from it.</div>');
        function open(id) {
          var c = chats.filter(function (x) { return x.id === id; })[0]; if (!c) return;
          [].forEach.call(el.querySelectorAll('[data-chat]'), function (b) { b.classList.toggle('on', b.getAttribute('data-chat') === id); if (b.getAttribute('data-chat') === id) b.classList.remove('new'); });
          var left = el.querySelectorAll('[data-chat].new').length, bd = shell.querySelector('#hqMsgN'), hm = el.querySelector('.hq-h em');
          if (bd) { bd.hidden = !left; bd.textContent = left; } if (hm) hm.textContent = left ? left + ' new' : 'all read';
          var main = el.querySelector('#chMain'); main.innerHTML = '<div id="chT1"></div><div class="bz-row">' + (c.status === 'open' ? '<button type="button" class="bz-btn soft bz-small" data-st="closed">Mark done</button>' : '<button type="button" class="bz-btn soft bz-small" data-st="open">Reopen</button>') + (c.status !== 'blocked' ? '<button type="button" class="bz-btn red bz-small" data-st="blocked">Block this driver</button>' : '') + '</div>';
          chatThread(main.querySelector('#chT1'), c, true, c.driver_name + (c.car ? ' · ' + c.car : ''));
          main.onclick = async function (e) {
            var v = e.target.getAttribute('data-st'); if (!v) return;
            if (v === 'blocked' && !confirm('Block this driver? They won’t be able to message you.')) return;
            await sb.from('biz_chats').update({ status: v }).eq('id', c.id); messages(el, c.id);
          };
        }
        el.onclick = function (e) { var b = e.target.closest('[data-chat]'); if (b) open(b.getAttribute('data-chat')); };
        el.querySelector('#nmGo').onclick = function () { var bx = el.querySelector('#nmBox'); if (bx.innerHTML) { bx.innerHTML = ''; return; } writeFirst(bx, function (id) { messages(el, id); }); };
        if (openId) open(openId);
      }
      // A shop writes first (picture 293 part 1): only to people who wrote to it or follow it with messages on.
      async function writeFirst(bx, done) {
        if (cur.status !== 'live') { bx.innerHTML = '<div class="hq-card">You can write to customers once your page is live.</div>'; return; }
        bx.innerHTML = '<div class="hq-card">Loading your customers…</div>';
        var r = await sb.rpc('biz_customers', { b: cur.id }), list = r.data || [], pick = null;
        if (r.error || !list.length) { bx.innerHTML = '<div class="hq-card nm"><b>No customers to write to yet</b><p class="hq-fine">You can write to people who messaged you, asked you for a quote, or follow you with “Messages from this shop” turned on. Never strangers.</p></div>'; return; }
        var QS = ['Your car is ready for pickup.', 'Time for an oil change? Want me to save you a spot?', 'Thanks for coming in! Let us know how everything runs.', 'Here’s the price for what you asked about.'];
        bx.innerHTML = '<div class="hq-card nm"><b>New message</b><p class="hq-fine">Your customers: ' + list.length + ' (wrote to you or follow you with messages on).</p>' +
          '<label class="bz-f"><span>To</span><select id="nmTo"><option value="">Pick a customer</option>' + list.map(function (c, i) { return '<option value="' + i + '">' + esc(c.name) + (c.car ? ' · ' + esc(c.car) : '') + ' · ' + (c.how === 'follower' ? 'follows you' : c.how === 'both' ? 'wrote to you + follows you' : 'wrote to you') + '</option>'; }).join('') + '</select></label>' +
          '<div class="nm-qs">' + QS.map(function (q) { return '<button type="button" class="bz-chip" data-q="' + esc(q) + '">' + esc(q.split(/[.?!]/)[0]) + '</button>'; }).join('') + '</div>' +
          '<label class="bz-f"><span>Message</span><textarea id="nmT" maxlength="1000" rows="3" placeholder="Hi! …"></textarea></label>' +
          '<div class="bz-row"><button type="button" class="bz-btn soft bz-small" id="nmOf">＋ Add an offer with a price</button></div><div class="of-build" hidden></div>' +
          '<div class="bz-row"><button type="button" class="bz-btn" id="nmSend">Send</button></div><div class="bz-msg" id="nmM" role="status"></div>' +
          '<p class="hq-fine">They can reply, stop messages from you or report it. Up to 20 new chats a day, 8 AM–9 PM. Their phone and email stay private.</p></div>';
        var q = function (s) { return bx.querySelector(s); }, ob = null;
        bx.querySelector('.nm-qs').onclick = function (e) { var t = e.target.getAttribute('data-q'); if (t) { q('#nmT').value = t; q('#nmT').focus(); } };
        q('#nmOf').onclick = function () {
          var b = q('.of-build'); if (!b.hidden) { b.hidden = true; b.innerHTML = ''; ob = null; return; }
          b.hidden = false; ob = offerBuilder(b, function () { return 'Tap Send below to send the message with this offer.'; });
          var go = b.querySelector('#ofGo'); if (go) go.remove();
        };
        q('#nmSend').onclick = async function () {
          var m = q('#nmM'), i = q('#nmTo').value, body = q('#nmT').value.trim(), L = ob ? ob.lines() : [], OX = ob ? ob.extra() : {};
          m.className = 'bz-msg bad';
          if (i === '') { m.textContent = 'Pick a customer.'; return; }
          if (!body && !L.length) { m.textContent = 'Write a message or add an offer.'; return; }
          var offer = L.length ? { title: (q('#ofT') && q('#ofT').value.trim()) || L[0].t, lines: L, until: q('#ofU') ? q('#ofU').value : null, note: q('#ofN') ? q('#ofN').value.trim() : '', warranty: OX.warranty || '', earliest: OX.earliest || '' } : null;
          this.disabled = true; m.className = 'bz-msg'; m.textContent = 'Sending…';
          var x = await sb.rpc('biz_write_first', { b: cur.id, d: list[+i].driver, body: body, offer: offer });
          this.disabled = false;
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = /8 AM/.test(x.error.message) ? 'You can write first between 8 AM and 9 PM (Atlanta time).' : /20 new/.test(x.error.message) ? 'Up to 20 new chats a day. Try again tomorrow.' : /isn.t taking/.test(x.error.message) ? 'This driver isn’t taking messages from you.' : /live/.test(x.error.message) ? 'Your page must be live to write to customers.' : 'That didn’t send. Please try again.'; return; }
          done(x.data);
        };
      }
      function soon(el) {
        var rv = tab === 'reviews';
        el.innerHTML = head(rv ? 'FROM THE STANDS' : 'TEAM RADIO', rv ? 'Reviews' : 'Messages', 'Coming next') +
          '<div class="hq-card">' + (rv ? 'Reviews from Carvessa members, with photos, are coming next. You’ll reply in public and can report a review that breaks our <a href="/business/review-rules/" target="_blank">Review Rules</a>. Nobody can buy or hide reviews.' : 'Drivers will message you right here, with their car and their mechanic note from Carvessa’s help. Their phone and email stay private unless they share them. Quote requests come here too.') + '</div>';
      }
      function settings(el, focus) {
        if (focus) setTimeout(function () { var f = el.querySelector('#' + focus); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
        var sug = SUGGEST[cur.kind];
        el.innerHTML = head('ACCOUNT', 'Look and settings') +
          '<div class="hq-card" id="hqLink"><h4>YOUR PAGE LINK</h4><p class="hq-fine" style="margin-top:0">Put it on Instagram, Facebook, Google, your receipts and business cards.</p>' +
            '<div class="lk-show"><b id="lkNow">carvessa.app/b/' + esc(cur.slug) + '</b><button type="button" class="bz-btn bz-small" id="lkCopy">' + icon('copy', 16) + 'Copy</button>' + (navigator.share ? '<button type="button" class="bz-btn soft bz-small" id="lkShare">' + icon('share', 16) + 'Share</button>' : '') + '</div>' +
            '<label class="bz-f"><span>Change it (letters, numbers and dashes)</span><div class="lk-edit"><em>carvessa.app/b/</em><input id="lkIn" maxlength="40" value="' + esc(cur.slug) + '" autocapitalize="none" spellcheck="false"></div></label><div class="bz-row"><button type="button" class="bz-btn soft bz-small" id="lkSave">Save my new link</button></div><div class="bz-msg" id="lkM" role="status"></div><p class="hq-fine">Your old link keeps working too.</p></div>' +
          '<div class="hq-card" id="hqParts"><h4>PARTS CUSTOMERS BRING</h4><p class="hq-fine" style="margin-top:0">Some drivers buy their own parts. Tell them what you do. It shows on your page and next to your quotes.</p><div class="bz-chips" id="cpK">' + [['yes', 'We install them'], ['no', 'We use our own parts'], ['ask', 'Ask us']].map(function (o) { return '<button type="button" data-cp="' + o[0] + '" class="' + (cur.customer_parts === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div><div class="bz-msg" id="cpM" role="status"></div></div>' +
          '<div class="hq-card" id="hqColor"><h4>YOUR COLOR AND PAGE LOOK</h4><p class="hq-fine">One color for your page and Business HQ. We keep button text easy to read.</p>' +
            '<div class="cl-logo">' + logoHtml(cur, 'cl-lg') + '<div><b>' + (cur.logo ? 'Match my logo' : 'No logo yet') + '</b><small>' + (cur.logo ? 'We find the colors in your logo.' : 'Add a logo in My page, then we can match it.') + '</small></div>' + (cur.logo ? '<button type="button" class="bz-btn soft bz-small" id="clMatch">Match my logo</button>' : '') + '</div><div id="clSug"></div>' +
            '<div class="cl-sw">' + SWATCH.map(function (w) { return '<button type="button" data-c="' + w[0] + '" style="background:' + w[0] + '" aria-label="' + w[1] + '" class="' + (brandOf(cur).toLowerCase() === w[0].toLowerCase() ? 'on' : '') + '"></button>'; }).join('') + '<label class="cl-any">Any color <input type="color" id="clAny" value="' + brandOf(cur) + '"></label></div>' +
            '<h4 style="margin-top:14px">YOUR PAGE</h4><div class="cl-th" id="clTh">' + [['bold', 'Bold', 'Big color block with your name'], ['clean', 'Clean', 'White, color on buttons'], ['night', 'Night', 'Dark page, bright color']].map(function (t) { return '<button type="button" data-t2="' + t[0] + '" class="' + ((cur.page_theme || 'bold') === t[0] ? 'on' : '') + '"><i class="th-' + t[0] + '"></i><b>' + t[1] + '</b><small>' + t[2] + '</small></button>'; }).join('') + '</div>' +
            '<h4 style="margin-top:14px">BUSINESS HQ</h4><div class="bz-chips" id="clHq"><button type="button" data-d="0" class="' + (cur.hq_dark ? '' : 'on') + '">Light</button><button type="button" data-d="1" class="' + (cur.hq_dark ? 'on' : '') + '">Dark</button></div>' +
            '<div class="bz-row"><a class="bz-btn soft bz-small" href="/shops/?b=' + encodeURIComponent(cur.slug) + '" target="_blank" rel="noopener">See my page</a></div><div class="bz-msg" id="lM" role="status"></div></div>' +
          LOOKS.map(function (l) { return '<button type="button" data-l="' + l[0] + '" class="' + ((cur.hq_look || 'racing') === l[0] ? 'on' : '') + '"><span class="sp"><i style="background:' + l[3] + '"></i><i style="background:' + l[4] + '"></i><i style="background:' + l[5] + '"></i><i style="background:' + l[6] + '"></i></span><b>' + l[1] + '</b><small>' + (l[0] === 'racing' ? 'Default' : l[0] === sug ? 'Suggested for you' : l[2]) + '</small></button>'; }).join('') + '</div><div class="bz-msg" id="lM" role="status"></div></div>' +
          '<div class="hq-card"><h4>EMAIL ALERTS</h4><label class="bz-ck" style="margin:4px 0"><input type="checkbox" id="nE"' + (cur.notify_email !== false ? ' checked' : '') + '><span>Email me at <b>' + esc(u.email) + '</b> when a driver messages me, asks for a quote or writes a review.</span></label><p class="hq-fine">At most one email per chat every 15 minutes while you haven’t read it. Drivers get an email when you answer.</p><div class="bz-msg" id="nM" role="status"></div></div>' +
          '<div class="hq-card" id="hqIdea"><h4>SEND US AN IDEA OR A TIP</h4><p class="hq-fine">A feature you want, something that isn’t working, or a tip you’d like to share with other shops. We read every one.</p><div class="bz-chips idea-kinds" id="iK"><button type="button" data-ik="new" class="on">A feature I want</button><button type="button" data-ik="broken">Something isn’t working</button><button type="button" data-ik="tip">A tip to share</button></div><label class="bz-f"><span>Your idea</span><textarea id="iT" maxlength="1000" placeholder="I’d like to post a deal for one day only."></textarea></label><div class="bz-row"><button type="button" class="bz-btn" id="iGo">Send</button></div><div class="bz-msg" id="iM" role="status"></div></div>' +
          '<div class="hq-card"><h4>LOGIN</h4>Signed in as <b>' + esc(u.email) + '</b>.<div class="bz-row"><a class="bz-btn soft bz-small" href="/business/terms/" target="_blank">Partner Terms</a><a class="bz-btn soft bz-small" href="mailto:hello@carvessa.app?subject=' + encodeURIComponent('Question about ' + cur.name) + '">Ask Carvessa a question</a></div><p class="hq-fine">You agreed to the Partner Terms version ' + esc(cur.terms_version || '') + (cur.agreed_at ? ' on ' + esc(new Date(cur.agreed_at).toLocaleDateString('en-US')) : '') + '.</p></div>' +
          '<div class="hq-card hq-red"><h4>RED FLAG ZONE</h4><b>Delete this page</b><p class="hq-fine">Removes your page, services, posts and sales. Type DELETE to confirm.</p><div class="bz-two"><label class="bz-f"><span>Type DELETE</span><input id="dT" autocomplete="off"></label><div class="bz-row" style="align-self:end"><button type="button" class="bz-btn red" id="dGo">Delete page</button></div></div><div class="bz-msg" id="dM" role="status"></div><p class="hq-fine">Want to hide your page for a while instead? Write to hello@carvessa.app.</p></div>';
        var ik = 'new';
        el.querySelector('#iK').onclick = function (e) { var k = e.target.getAttribute('data-ik'); if (k) { ik = k; [].forEach.call(this.children, function (b) { b.className = b.getAttribute('data-ik') === k ? 'on' : ''; }); } };
        el.querySelector('#iGo').onclick = async function () {
          var t = el.querySelector('#iT').value.trim(), m = el.querySelector('#iM'); m.className = 'bz-msg bad';
          if (t.length < 3) { m.textContent = 'Please type your idea.'; return; }
          var x = await sb.from('feedback').insert({ mood: ik === 'broken' ? 'confused' : 'ok', message: ('[Business idea: ' + ik + '] ' + t + ' — ' + cur.name).slice(0, 1200), screen: 'biz-hq', platform: 'web' });
          if (x.error) { m.textContent = 'That didn’t send. Please try again.'; return; }
          el.querySelector('#iT').value = ''; m.className = 'bz-msg good'; m.textContent = 'Sent. Thank you! We read every idea.';
        };
        el.querySelector('#nE').onchange = async function () {
          var v = this.checked, x = await sb.from('businesses').update({ notify_email: v }).eq('id', cur.id), m = el.querySelector('#nM');
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save.'; this.checked = !v; return; }
          cur.notify_email = v; m.className = 'bz-msg good'; m.textContent = v ? 'Email alerts are on.' : 'Email alerts are off.';
        };
        var lkM = el.querySelector('#lkM'), lkIn = el.querySelector('#lkIn'), lkT;
        el.querySelector('#lkCopy').onclick = async function () { try { await navigator.clipboard.writeText(shortUrl(cur.slug)); lkM.className = 'bz-msg good'; lkM.textContent = 'Copied. Paste it anywhere.'; } catch (e) { prompt('Copy your link:', shortUrl(cur.slug)); } };
        if (el.querySelector('#lkShare')) el.querySelector('#lkShare').onclick = function () { navigator.share({ title: cur.name, url: shortUrl(cur.slug) }).catch(function () {}); };
        lkIn.oninput = function () {
          var v = lkIn.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'); if (v !== lkIn.value) lkIn.value = v;
          clearTimeout(lkT); if (v === cur.slug) { lkM.textContent = ''; return; }
          lkT = setTimeout(async function () { var r = await sb.rpc('business_link_free', { s: v }); lkM.className = 'bz-msg ' + (r.data ? 'good' : 'bad'); lkM.textContent = r.data ? '✓ carvessa.app/b/' + v + ' is free' : (v.length < 3 ? 'At least 3 letters or numbers.' : 'That link is taken or not allowed. Try another.'); }, 350);
        };
        el.querySelector('#lkSave').onclick = async function () {
          var v = lkIn.value.replace(/^-+|-+$/g, ''); if (v === cur.slug) return;
          var r = await sb.rpc('set_business_link', { b: cur.id, s: v });
          if (r.error) { lkM.className = 'bz-msg bad'; lkM.textContent = 'That link isn’t available. Try another.'; return; }
          cur.slug = r.data; el.querySelector('#lkNow').textContent = 'carvessa.app/b/' + cur.slug; lkM.className = 'bz-msg good'; lkM.textContent = 'Saved. Your new link is carvessa.app/b/' + cur.slug + '. Old links still work.';
        };
        el.querySelector('#cpK').onclick = async function (e) {
          var v = e.target.getAttribute('data-cp'); if (!v) return;
          var x = await sb.from('businesses').update({ customer_parts: v }).eq('id', cur.id), m = el.querySelector('#cpM');
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
          cur.customer_parts = v; [].forEach.call(this.children, function (z) { z.className = z.getAttribute('data-cp') === v ? 'on' : ''; }); m.className = 'bz-msg good'; m.textContent = 'Saved. It shows on your page.';
        };
        async function saveLook(up, msg) {
          var x = await sb.from('businesses').update(up).eq('id', cur.id), m = el.querySelector('#lM');
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = 'That didn’t save. Please try again.'; return; }
          Object.assign(cur, up); look(); m.className = 'bz-msg good'; m.textContent = msg || 'Saved.';
          [].forEach.call(el.querySelectorAll('.cl-sw button'), function (b) { b.classList.toggle('on', b.getAttribute('data-c').toLowerCase() === brandOf(cur).toLowerCase()); });
          [].forEach.call(el.querySelectorAll('#clTh button'), function (b) { b.classList.toggle('on', b.getAttribute('data-t2') === (cur.page_theme || 'bold')); });
          [].forEach.call(el.querySelectorAll('#clHq button'), function (b) { b.classList.toggle('on', (b.getAttribute('data-d') === '1') === !!cur.hq_dark); });
        }
        var colorEl = el.querySelector('#hqColor');
        colorEl.onclick = async function (e) {
          var c = e.target.closest('[data-c]'), t = e.target.closest('[data-t2]'), d = e.target.closest('[data-d]');
          if (c) return saveLook({ brand_color: c.getAttribute('data-c') }, 'Saved. Your page and Business HQ use this color.');
          if (t) return saveLook({ page_theme: t.getAttribute('data-t2') }, 'Saved. Tap “See my page” to look.');
          if (d) return saveLook({ hq_dark: d.getAttribute('data-d') === '1' });
          if (e.target.id === 'clMatch') {
            var box = el.querySelector('#clSug'); box.innerHTML = '<p class="hq-fine">Looking at your logo…</p>';
            var cols = await logoColors(photoUrl(cur.logo));
            box.innerHTML = cols.length ? '<p class="hq-fine" style="margin:6px 0 4px">We found these colors. Tap one:</p><div class="cl-sw">' + cols.map(function (h) { return '<button type="button" data-c="' + h + '" style="background:' + h + '" aria-label="Color ' + h + '"></button>'; }).join('') + '</div>' : '<p class="hq-fine">We couldn’t read colors from this logo. Pick one below.</p>';
          }
        };
        el.querySelector('#clAny').onchange = function () { saveLook({ brand_color: this.value }, 'Saved your color.'); };
        el.querySelector('#dGo').onclick = async function () {
          var m = el.querySelector('#dM'); m.className = 'bz-msg bad';
          if (el.querySelector('#dT').value.trim() !== 'DELETE') { m.textContent = 'Type DELETE in capital letters to confirm.'; return; }
          var x = await sb.from('businesses').delete().eq('id', cur.id);
          if (x.error) { m.textContent = 'That didn’t work. Please write to hello@carvessa.app.'; return; }
          location.reload();
        };
      }
      frame();
    });
    return;
  }


  // ---------- My messages (drivers) ----------
  if (mode === 'inbox') {
    account(async function (u) {
      root.querySelector('#bzAcct').innerHTML = '<p class="rv-fine">Signed in as <b>' + esc(u.email) + '</b>.</p>';
      var r = await sb.from('biz_chats').select('*, businesses(name, slug)').eq('driver', u.id).order('last_at', { ascending: false }).limit(100);
      var chats = r.data || [], list = root.querySelector('#bzInbox');
      if (!chats.length) { list.innerHTML = '<div class="bz-sec">No messages yet. Open a business page on Carvessa and tap Message or Get a quote.</div>'; return; }
      var unread = function (c) { return c.last_at > c.driver_seen_at; };
      list.innerHTML = '<div class="ch-wrap"><div class="ch-side">' + chats.map(function (c) { var n = (c.businesses && c.businesses.name) || 'Business'; return '<button type="button" data-chat="' + c.id + '" class="' + (unread(c) ? 'new' : '') + '"><b>' + esc(n) + '</b><small>' + (c.kind === 'quote' ? 'Quote · ' : '') + esc(c.car || c.topic || 'Message') + '</small><small>' + when(c.last_at) + '</small></button>'; }).join('') + '</div><div class="ch-main" id="chMain"><p class="rv-fine">Pick a chat.</p></div></div>';
      list.onclick = function (e) {
        var b = e.target.closest('[data-chat]'); if (!b) return;
        var c = chats.filter(function (x) { return x.id === b.getAttribute('data-chat'); })[0];
        [].forEach.call(list.querySelectorAll('[data-chat]'), function (x) { x.classList.toggle('on', x === b); }); b.classList.remove('new');
        var main = list.querySelector('#chMain'); main.innerHTML = '<div id="chT1"></div>' + (c.businesses ? '<p class="rv-fine"><a href="/shops/?b=' + encodeURIComponent(c.businesses.slug) + '">Open their page ›</a></p>' : '');
        chatThread(main.querySelector('#chT1'), c, false, (c.businesses && c.businesses.name) || 'Business');
      };
      var want = q.get('chat') && list.querySelector('[data-chat="' + CSS.escape(q.get('chat')) + '"]'); if (want) want.click();
    });
    return;
  }

  // ---------- Drivers ask, shops answer (Nov 20, 2026): ask once, shops near you send a price ----------
  var ASK_KINDS = [['tires', 'Tires'], ['repair', 'Repair'], ['body', 'Body work'], ['detail', 'Detailing'], ['tow', 'Towing'], ['insurance', 'Insurance'], ['dealer', 'Buying a car']];
  var ASK_HINT = { tires: 'Price for 4 tires, size 225/65R17, installed.', repair: 'Brakes squeal when I stop. Front pads?', body: 'Dent on the back door, about the size of a fist.', detail: 'Full detail inside and out, dog hair.', tow: 'Car won’t start in my driveway, need a tow to a shop.', insurance: 'Quote for a 2019 RAV4, one driver, clean record.', dealer: 'Looking for a 2019–2021 RAV4 under $22,000 out the door.' };
  async function placeFor(zip) {
    try { var r = await fetch('https://api.zippopotam.us/us/' + encodeURIComponent(zip)); var j = await r.json(); var p = j.places && j.places[0]; if (!p) return null; return { lat: +p.latitude, lon: +p.longitude, place: p['place name'] + ', ' + p['state abbreviation'] }; } catch (e) { return null; }
  }
  if (mode === 'ask') {
    account(async function (u) {
      root.querySelector('#bzAcct').innerHTML = '<p class="rv-fine">Signed in as <b>' + esc(u.email) + '</b>.</p>';
      var box = root.querySelector('#bzAsk'), st = { kind: ASK_KINDS.some(function (k) { return k[0] === q.get('kind'); }) ? q.get('kind') : 'repair', spot: null, photos: [], video: null, own: false };
      var cars = (u.user_metadata && (u.user_metadata.my_cars || (u.user_metadata.my_car ? [u.user_metadata.my_car] : []))) || [];
      var KN = function (k) { return (ASK_KINDS.filter(function (z) { return z[0] === k; })[0] || [0, ''])[1]; };
      async function mine() {
        var r = await sb.from('biz_requests').select('*').eq('driver', u.id).order('created_at', { ascending: false }).limit(20);
        var reqs = r.data || [], ids = reqs.map(function (x) { return x.id; });
        var chats = ids.length ? (await sb.from('biz_chats').select('id, request_id').in('request_id', ids)).data || [] : [];
        var host = root.querySelector('#bzMine');
        host.innerHTML = reqs.length ? '<h2 style="margin:22px 0 8px">My requests</h2>' + reqs.map(function (x) {
          var n = chats.filter(function (c) { return c.request_id === x.id; }).length, open = x.status === 'open' && x.expires_at > new Date().toISOString();
          return '<div class="bz-sec ask-r"><div class="hq-ch" style="display:flex;justify-content:space-between;gap:8px"><b>' + esc(x.car || '') + (x.car ? ' · ' : '') + esc(KN(x.kind)) + '</b><span class="bz-pill ' + (open ? 'live' : 'hidden') + '">' + (open ? 'Open' : 'Closed') + '</span></div><p style="margin:4px 0">' + esc(x.need) + '</p>' + mediaHtml(x) +
            (n ? '<button type="button" class="bz-btn" data-cmp="' + x.id + '">' + (n > 1 ? 'Compare ' + n + ' quotes' : 'See 1 quote') + '</button>' : '<p class="rv-fine">' + (open ? 'Sent to the closest shops near ' + esc(x.place || 'you') + '. We email you when one answers.' : 'No answers.') + '</p>') +
            '<div class="ask-cmp" id="cmp-' + x.id + '"></div>' +
            (open ? '<button type="button" class="bz-link" data-close="' + x.id + '">Close this request</button>' : '') + '</div>';
        }).join('') : '';
        host.onclick = async function (e) {
          var id = e.target.getAttribute('data-close'); if (id && confirm('Close this request? Shops can’t answer anymore.')) { await sb.from('biz_requests').update({ status: 'closed' }).eq('id', id); mine(); return; }
          var cb = e.target.closest('[data-cmp]'); if (cb) { compare(cb.getAttribute('data-cmp')); return; }
          var pk = e.target.closest('[data-pick]');
          if (pk) {
            var rq = pk.getAttribute('data-req');
            if (confirm('Close the request so other shops stop sending prices? (Your chats stay.)')) await sb.from('biz_requests').update({ status: 'closed' }).eq('id', rq);
            location.href = '/messages/?chat=' + pk.getAttribute('data-pick');
          }
        };
        if (q.get('compare') && reqs.some(function (x) { return x.id === q.get('compare'); })) { compare(q.get('compare')); setTimeout(function () { var el = root.querySelector('#cmp-' + q.get('compare')); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400); }
      }
      // Picture 299 step 4: every quote side by side, the best on each line in green.
      async function compare(rid) {
        var host = root.querySelector('#cmp-' + rid); if (!host) return;
        if (host.innerHTML) { host.innerHTML = ''; return; }
        host.innerHTML = '<p class="rv-fine">Loading…</p>';
        var r = await sb.rpc('biz_request_quotes', { r: rid }), L = r.data || [];
        if (!L.length) { host.innerHTML = '<p class="rv-fine">No quotes yet.</p>'; return; }
        var tot = function (x) { return x.offer ? Number(x.offer.total) : x.price != null ? Number(x.price) : null; };
        var best = function (vals, low) { var v = vals.filter(function (z) { return z != null; }); if (v.length < 2) return null; return low ? Math.min.apply(null, v) : Math.max.apply(null, v); };
        var T = L.map(tot), D = L.map(function (x) { return x.dist; }), S = L.map(function (x) { return x.reviews ? Number(x.stars) : null; });
        var bT = best(T, true), bD = best(D, true), bS = best(S, false);
        var cell = function (v, b2, txt) { return '<td' + (v != null && b2 != null && v === b2 ? ' class="best"' : '') + '>' + txt + '</td>'; };
        var rows = [
          ['Total', L.map(function (x, i) { return cell(T[i], bT, T[i] != null ? '<b>' + money(T[i]) + '</b>' + (x.offer ? '<small>before tax</small>' : x.price_note ? '<small>' + esc(x.price_note) + '</small>' : '') : '<small>No price yet</small>'); })],
          ['What’s in it', L.map(function (x) { return '<td>' + (x.offer ? (x.offer.lines || []).map(function (l) { return '<div class="cl">' + esc(l.t) + ' <span>' + money(l.p) + '</span></div>'; }).join('') : x.body ? '<small>' + esc(x.body.slice(0, 120)) + '</small>' : '—') + '</td>'; })],
          ['Warranty', L.map(function (x) { return '<td>' + (x.offer && x.offer.warranty ? esc(x.offer.warranty) : '<small>Ask</small>') + '</td>'; })],
          ['Earliest', L.map(function (x) { return '<td>' + (x.offer && x.offer.earliest ? esc(x.offer.earliest) : '<small>Ask</small>') + '</td>'; })],
          ['Distance', L.map(function (x, i) { return cell(D[i], bD, D[i] != null ? (D[i] < 1 ? 'Under 1 mi' : D[i].toFixed(1) + ' mi') : '—'); })],
          ['Rating', L.map(function (x, i) { return cell(S[i], bS, x.reviews ? '★ ' + Number(x.stars).toFixed(1) + ' <small>(' + x.reviews + ')</small>' : '<small>No reviews yet</small>'); })],
          ['Your own parts', L.map(function (x) { return '<td>' + (x.customer_parts ? PARTS_SHOP[x.customer_parts] : '<small>Ask</small>') + '</td>'; })],
          ['Good until', L.map(function (x) { return '<td>' + (x.offer && x.offer.until ? shortDay(x.offer.until) : '—') + (x.offer_status === 'accepted' ? '<small class="ok">You accepted</small>' : '') + '</td>'; })]
        ];
        host.innerHTML = '<div class="cmp-wrap"><table class="cmp"><thead><tr><th></th>' + L.map(function (x) { return '<th>' + logoHtml(x, 'cmp-lo') + '<a href="/b/' + encodeURIComponent(x.slug) + '" target="_blank" rel="noopener">' + esc(x.name) + '</a></th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r2) { return '<tr><th>' + r2[0] + '</th>' + r2[1].join('') + '</tr>'; }).join('') +
          '<tr><th></th>' + L.map(function (x) { return '<td><button type="button" class="bz-btn bz-small" data-pick="' + x.chat_id + '" data-req="' + rid + '">Pick this shop</button><a class="bz-link" href="/messages/?chat=' + x.chat_id + '">Open chat</a></td>'; }).join('') + '</tr></tbody></table></div>' +
          '<p class="rv-fine">Green = best on that line. The cheapest isn’t always best: check what each price includes. Prices are set by each shop; you pay at the shop.</p>';
      }
      function draw() {
        var c0 = cars[0] || {};
        var carTxt = c0.year ? [c0.year, c0.make, c0.model, c0.trim].filter(Boolean).join(' ') : '';
        box.innerHTML = '<div class="bz-f"><span>What do you need?</span><div class="bz-chips" id="akK">' + ASK_KINDS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" class="' + (st.kind === k[0] ? 'on' : '') + '">' + k[1] + '</button>'; }).join('') + '</div></div>' +
          (cars.length ? '<div class="ask-fill"><small>✓ FROM YOUR CAR IN MY GARAGE</small>' + (cars.length > 1 ? '<select id="akPick" aria-label="Which car">' + cars.map(function (c, i) { return '<option value="' + i + '">' + esc(c.nick || [c.year, c.make, c.model].filter(Boolean).join(' ')) + '</option>'; }).join('') + '</select>' : '') + '<span>Edit below if anything changed.</span></div>' : '') +
          '<label class="bz-f"><span>Your car</span><input id="akCar" maxlength="80" placeholder="2019 Toyota RAV4" value="' + esc(carTxt) + '"></label>' +
          '<div class="bz-two"><label class="bz-f"><span>Miles (optional)</span><input id="akMi" inputmode="numeric" maxlength="7" placeholder="61,400" value="' + (c0.miles ? esc(String(c0.miles)) : '') + '"></label><label class="bz-f"><span>VIN (optional, for the right parts)</span><input id="akVin" maxlength="17" autocapitalize="characters" spellcheck="false" placeholder="17 letters and numbers" value="' + esc(c0.vin || '') + '"></label></div>' +
          '<label class="bz-f"><span>Tell shops what’s going on</span><textarea id="akNeed" maxlength="600" placeholder="' + esc(ASK_HINT[st.kind]) + '">' + esc((q.get('need') || '').slice(0, 600)) + '</textarea></label>' +
          '<div class="bz-f"><span>Photos or a short video (optional)</span><div class="bz-pics" id="akP"></div><small class="rv-fine">Up to 4 photos and 1 video (20 seconds, sound on helps for noises). Only when parked. No faces or license plates up close.</small></div>' +
          '<div class="bz-f"><span>Parts</span><div class="bz-chips" id="akParts"><button type="button" data-o="0" class="on">Shop’s parts</button><button type="button" data-o="1">I may bring my own</button></div></div>' +
          '<div class="bz-two"><label class="bz-f"><span>Your ZIP code</span><input id="akZip" inputmode="numeric" maxlength="5" placeholder="30030"></label><label class="bz-f"><span>How far</span><select id="akRad"><option value="5">5 miles</option><option value="10" selected>10 miles</option><option value="15">15 miles</option><option value="25">25 miles</option></select></label></div>' +
          '<button type="button" class="bz-link" id="akLoc">Use my location instead</button><div class="rv-fine" id="akSpot"></div>' +
          '<p class="rv-fine">It goes to the 10 closest shops of that kind. Each answer is a private chat. Shops see your first name, your car, what you wrote, your photos and your area (about 1 km). Never your phone, email or exact spot. Up to 3 requests a day; each stays open 3 days.</p>' +
          '<div class="bz-row"><button type="button" class="bz-btn" id="akGo">Send to shops near me</button></div><div class="bz-msg" id="akM" role="status"></div>';
        var $ = function (id) { return box.querySelector('#' + id); };
        function drawP() {
          $('akP').innerHTML = st.photos.map(function (p, i) { return '<div class="p"><img src="' + photoUrl(p) + '" alt="Photo ' + (i + 1) + '"><button type="button" data-rm="' + i + '" aria-label="Remove photo">✕</button></div>'; }).join('') +
            (st.video ? '<div class="p v"><video src="' + videoUrl(st.video) + '" muted playsinline></video><span>Video</span><button type="button" data-rmv="1" aria-label="Remove video">✕</button></div>' : '') +
            (st.photos.length < 4 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="akF" hidden></label>' : '') +
            (!st.video ? '<label class="vid" aria-label="Add a short video">' + icon('bolt', 18) + '<small>Video</small><input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" id="akV" hidden></label>' : '');
        }
        drawP();
        if ($('akPick')) $('akPick').onchange = function () { var c = cars[+this.value] || {}; $('akCar').value = [c.year, c.make, c.model, c.trim].filter(Boolean).join(' '); $('akMi').value = c.miles || ''; $('akVin').value = c.vin || ''; };
        $('akP').onclick = function (e) { var i = e.target.getAttribute('data-rm'); if (i != null) { st.photos.splice(+i, 1); drawP(); } if (e.target.getAttribute('data-rmv')) { st.video = null; drawP(); } };
        $('akParts').onclick = function (e) { var o = e.target.getAttribute('data-o'); if (o != null) { st.own = o === '1'; [].forEach.call(this.children, function (z) { z.className = z === e.target ? 'on' : ''; }); } };
        box.addEventListener('change', async function (e) {
          var m = $('akM');
          if (e.target.id === 'akF' && e.target.files[0]) {
            m.className = 'bz-msg'; m.textContent = 'Adding your photo…';
            try { st.photos.push(await upload(u.id, e.target.files[0], 1600)); m.textContent = ''; } catch (err) { m.className = 'bz-msg bad'; m.textContent = 'That photo didn’t upload. Try a JPG or PNG.'; }
            drawP();
          }
          if (e.target.id === 'akV' && e.target.files[0]) {
            var f = e.target.files[0];
            if (f.size > 15 * 1024 * 1024) { m.className = 'bz-msg bad'; m.textContent = 'That video is too big (15 MB most). Record about 10 seconds.'; return; }
            var secs = await new Promise(function (ok) { var v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = function () { ok(v.duration); URL.revokeObjectURL(v.src); }; v.onerror = function () { ok(0); }; v.src = URL.createObjectURL(f); });
            if (secs > 21) { m.className = 'bz-msg bad'; m.textContent = 'Please keep the video to 20 seconds.'; return; }
            m.className = 'bz-msg'; m.textContent = 'Adding your video…';
            var ext = (f.type.split('/')[1] || 'mp4').replace('quicktime', 'mov');
            var path = u.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
            var up = await sb.storage.from('request-videos').upload(path, f, { contentType: f.type || 'video/mp4', upsert: false });
            if (up.error) { m.className = 'bz-msg bad'; m.textContent = 'That video didn’t upload. Try an MP4 under 15 MB.'; return; }
            st.video = path; m.textContent = ''; drawP();
          }
        });
        $('akK').onclick = function (e) { var k = e.target.getAttribute('data-k'); if (k) { st.kind = k; [].forEach.call(this.children, function (b) { b.className = b.getAttribute('data-k') === k ? 'on' : ''; }); $('akNeed').placeholder = ASK_HINT[k]; } };
        $('akLoc').onclick = function () {
          var sp = $('akSpot'); sp.textContent = 'Finding you…';
          if (!navigator.geolocation) { sp.textContent = 'Your browser can’t share a location. Type your ZIP.'; return; }
          navigator.geolocation.getCurrentPosition(function (p) { st.spot = { lat: p.coords.latitude, lon: p.coords.longitude, place: 'near you' }; sp.textContent = '✓ Using your location (shops see the area only).'; }, function () { sp.textContent = 'Location is off. Type your ZIP instead.'; }, { timeout: 15000, maximumAge: 600000 });
        };
        $('akGo').onclick = async function () {
          var m = $('akM'), need = $('akNeed').value.trim(), zip = $('akZip').value.trim(); m.className = 'bz-msg bad';
          if (need.length < 5) { m.textContent = 'Please tell shops what’s going on.'; return; }
          var vin = $('akVin').value.trim().toUpperCase(), mi = $('akMi').value.replace(/[^\d]/g, '');
          if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) { m.textContent = 'The VIN should be 17 letters and numbers (no I, O or Q), or leave it empty.'; return; }
          var spot = st.spot;
          if (!spot) { if (!/^\d{5}$/.test(zip)) { m.textContent = 'Please type your 5-digit ZIP code.'; return; } m.className = 'bz-msg'; m.textContent = 'Finding your area…'; spot = await placeFor(zip); if (!spot) { m.className = 'bz-msg bad'; m.textContent = 'We couldn’t find that ZIP code.'; return; } }
          m.className = 'bz-msg'; m.textContent = 'Sending…';
          var x = await sb.from('biz_requests').insert({ kind: st.kind, car: $('akCar').value.trim() || null, need: need, lat: spot.lat, lon: spot.lon, place: spot.place, radius: +$('akRad').value, photos: st.photos, video: st.video, miles: mi ? Math.min(999999, +mi) : null, vin: vin || null, own_parts: st.own }).select('id').single();
          if (x.error) { m.className = 'bz-msg bad'; m.textContent = /3 requests/.test(x.error.message) ? 'You can ask up to 3 times a day.' : 'That didn’t send. Please try again.'; return; }
          m.className = 'bz-msg good'; m.textContent = 'Sent to the closest shops! We email you when one answers. Compare the quotes below.';
          $('akNeed').value = ''; st.photos = []; st.video = null; drawP(); mine();
        };
      }
      draw(); mine();
    });
    return;
  }

  // ---------- Shops I follow (drivers) + one-tap stop links from follower emails ----------

  // ---------- Picture 304: one bar on the driver's own pages ----------
  var MYPAGES = [['appts', '/appointments/', 'Appointments'], ['inbox', '/messages/', 'Messages'], ['following', '/following/', 'Shops I follow'], ['ask', '/ask/', 'Ask for a price']];
  if (MYPAGES.some(function (x) { return x[0] === mode; })) {
    var myBar = document.createElement('nav'); myBar.className = 'my-bar'; myBar.setAttribute('aria-label', 'My Carvessa');
    myBar.innerHTML = MYPAGES.map(function (x) { return '<a href="' + x[1] + '"' + (x[0] === mode ? ' class="on" aria-current="page"' : '') + ' data-my="' + x[0] + '">' + x[2] + '<em hidden></em></a>'; }).join('');
    root.insertBefore(myBar, root.firstChild);
    sb.auth.getSession().then(async function (r) {
      var u = r.data.session && r.data.session.user; if (!u) return;
      var put = function (k, n) { var em = myBar.querySelector('[data-my="' + k + '"] em'); if (em && n) { em.hidden = false; em.textContent = n; } };
      var ch = await sb.from('biz_chats').select('last_at, driver_seen_at').eq('driver', u.id).limit(200);
      put('inbox', (ch.data || []).filter(function (c) { return c.last_at > c.driver_seen_at; }).length);
      var ap = await sb.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'offered');
      put('appts', ap.count || 0);
    });
  }

  if (mode === 'appts') {
    account(async function (u) {
      var box = root.querySelector('#bzAp');
      root.querySelector('#bzAcct').innerHTML = '<p class="rv-fine">Signed in as <b>' + esc(u.email) + '</b>.</p>';
      async function load() {
        var r = await sb.from('appointments').select(APCOLS).order('starts_at', { ascending: false }).limit(60);
        var list = r.data || [], ids = list.map(function (a) { return a.business_id; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
        var bs = ids.length ? (await sb.from('businesses').select('id, name, slug, address, city, phone, hours').in('id', ids)).data || [] : [];
        var ks = ids.length ? (await sb.from('business_booking').select('*').in('business_id', ids)).data || [] : [];
        var bOf = function (id) { return bs.filter(function (x) { return x.id === id; })[0] || { name: 'A business', id: id }; }, kOf = function (id) { return ks.filter(function (x) { return x.business_id === id; })[0] || { tz: 'America/New_York', slot_min: 30, capacity: 1, blocks: [] }; };
        var now = Date.now(), up = list.filter(function (a) { return ['requested', 'confirmed', 'offered'].indexOf(a.status) >= 0 && new Date(a.starts_at).getTime() > now - 3600e3; }).reverse();
        var past = list.filter(function (a) { return up.indexOf(a) < 0; }).slice(0, 12);
        var CH = { requested: ['Waiting for the shop', 'wait'], confirmed: ['Confirmed', 'ok'], offered: ['New time offered', 'off'], declined: ['Not available', 'no'], cancelled: ['Cancelled', 'no'], came: ['Done', 'done'], noshow: ['Missed', 'no'] };
        var one = function (a) {
          var b = bOf(a.business_id), k = kOf(a.business_id), ch = CH[a.status] || [a.status, ''], soon = new Date(a.starts_at).getTime() - now < 2 * 3600e3;
          var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.name, b.address, b.city].filter(Boolean).join(', '));
          var acts = '';
          if (a.status === 'offered' && a.offered_at) acts = '<button type="button" class="bz-btn bz-small" data-x="accept">Yes, ' + esc(whenText(a.offered_at, k.tz, true)) + '</button><button type="button" class="bz-btn soft bz-small" data-x="change">Pick another time</button><button type="button" class="bz-btn soft bz-small" data-x="decline_offer">No thanks</button>';
          else if (a.status === 'requested' || a.status === 'confirmed') acts = '<a class="bz-btn soft bz-small" href="' + maps + '" target="_blank" rel="noopener">Directions</a>' + '<button type="button" class="bz-btn soft bz-small" data-x="chat">Message</button>' + '<button type="button" class="bz-btn soft bz-small" data-x="ics">Add to calendar</button>' + (soon ? '' : '<button type="button" class="bz-btn soft bz-small" data-x="change">Change time</button><button type="button" class="bz-btn soft bz-small" data-x="cancel">Cancel</button>');
          else if (a.status === 'declined' && b.slug) acts = '<a class="bz-btn soft bz-small" href="/shops/?b=' + encodeURIComponent(b.slug) + '&book=1">Pick another time</a>';
          return '<div class="ap-c ap-mine" data-a="' + a.id + '"><span class="ap-st ' + ch[1] + '">' + ch[0] + '</span><div class="ap-t"><b>' + esc(whenText(a.starts_at, k.tz)) + '</b></div>' +
            '<div class="ap-w"><b>' + esc(a.service) + (a.car ? ' · ' + esc(a.car) : '') + '</b><span>' + (b.slug ? '<a class="ap-lk" href="/shops/?b=' + encodeURIComponent(b.slug) + '">' + esc(b.name) + '</a>' : esc(b.name)) + (b.address ? ' · <a class="ap-lk" href="' + maps + '" target="_blank" rel="noopener">' + esc(b.address) + '</a>' : '') + '</span>' + (a.shop_note ? '<q>' + esc(a.shop_note) + '</q>' : '') + (a.status === 'offered' && a.offered_at ? '<span class="ap-off">' + esc(b.name) + ' offered ' + esc(whenText(a.offered_at, k.tz)) + ' instead.</span>' : '') + (a.status === 'requested' ? '<span class="hq-fine">Most shops answer within a few hours. We email you.</span>' : '') + (soon && (a.status === 'requested' || a.status === 'confirmed') ? '<span class="hq-fine">Less than 2 hours away: to change it, call or message the shop.</span>' : '') + '</div>' +
            '<div class="ap-b">' + acts + '</div><div class="bz-msg" role="status"></div></div>';
        };
        box.innerHTML = (up.length ? up.map(one).join('') : '<div class="bz-sec">No upcoming appointments. Book a time on any shop page that shows “Book a time”.</div>') + (past.length ? '<h3 class="ap-h">Earlier</h3>' + past.map(one).join('') : '');
        box.onclick = async function (e) {
          var bt = e.target.closest('[data-x]'); if (!bt) return;
          var c = bt.closest('.ap-c'), a = list.filter(function (x) { return x.id === c.getAttribute('data-a'); })[0], b = bOf(a.business_id), k = kOf(a.business_id), m = c.querySelector('.bz-msg'), x = bt.getAttribute('data-x');
          if (x === 'ics') { icsFile(a, b, k.tz); return; }
          if (x === 'chat') { bt.disabled = true; var ch = await sb.rpc('appt_chat', { a: a.id }); bt.disabled = false; if (ch.error) { m.className = 'bz-msg bad'; m.textContent = (ch.error.message || '').replace(/^.*?:\s*/, ''); return; } location.href = '/messages/?chat=' + ch.data; return; }
          if (x === 'change') { bookFlow(b, k, { change: a, onDone: load }); return; }
          if (x === 'cancel' && !confirm('Cancel ' + a.service + ' at ' + b.name + '?')) return;
          bt.disabled = true; m.className = 'bz-msg'; m.textContent = 'Saving…';
          var res = await sb.rpc('appt_driver', { a: a.id, action: x });
          if (res.error) { bt.disabled = false; m.className = 'bz-msg bad'; m.textContent = (res.error.message || '').replace(/^.*?:\s*/, ''); return; }
          load();
        };
      }
      load();
    });
    return;
  }

  if (mode === 'following') {
    var box = root.querySelector('#bzFol');
    if (q.get('stop') && q.get('u') && q.get('t')) {
      box.innerHTML = '<div class="bz-sec">One moment…</div>';
      fetch(C.url + '/functions/v1/biz-alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stop: ['unfollow', 'remind'].indexOf(q.get('stop')) >= 0 ? q.get('stop') : 'email', u: q.get('u'), b: q.get('b'), t: q.get('t') }) })
        .then(function (r) { return r.json(); }).then(function (d) {
          box.innerHTML = d.ok ? '<div class="bz-sec"><h3>Done</h3>' + (q.get('stop') === 'unfollow' ? 'You don’t follow ' + esc(d.name) + ' anymore.' : q.get('stop') === 'remind' ? 'No more reminders from ' + esc(d.name) + '. Your loyalty card stays.' : 'No more emails from ' + esc(d.name) + '. You still follow them in the app.') + '</div><div class="bz-row"><a class="bz-btn soft" href="/following/">See all shops I follow</a></div>' : '<div class="bz-sec">' + esc(d.why || 'This link is not valid') + '. Log in below to change your settings.</div>';
        }).catch(function () { box.innerHTML = '<div class="bz-sec">That didn’t work. Please try again.</div>'; });
      return;
    }
    account(async function (u) {
      root.querySelector('#bzAcct').innerHTML = '<p class="rv-fine">Signed in as <b>' + esc(u.email) + '</b>.</p>';
      var r = await sb.from('business_follows').select('*, businesses(id, name, slug, kind, city, logo)').eq('user_id', u.id).order('created_at', { ascending: false });
      var list = (r.data || []).filter(function (f) { return f.businesses; }), alerts = (u.user_metadata && u.user_metadata.alerts) || {};
      var ids = list.map(function (f) { return f.business_id; });
      var dl = ids.length ? (await sb.from('business_posts').select('id, business_id, kind, template, title, body, price, fine, who, until, codes, created_at').in('business_id', ids).order('created_at', { ascending: false }).limit(20)).data || [] : [];
      var by = {}; list.forEach(function (f) { by[f.business_id] = f.businesses; });
      var sum = function (f) { var muted = f.muted_until && f.muted_until > new Date().toISOString(); return muted ? 'Muted until ' + new Date(f.muted_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : [f.deals ? 'Deals' : null, f.news ? 'news' : null, f.messages ? 'messages' : null].filter(Boolean).join(' + ') + ' · ' + [f.push ? 'phone' : null, f.email ? 'email' : null].filter(Boolean).join(' + ') || 'In the app only'; };
      function draw() {
        box.innerHTML = (list.length ? '<div class="fl-list">' + list.map(function (f, i) { var b = f.businesses; return '<div class="fl-it"><div class="fl-row">' + logoHtml(b, 'fl-lo') + '<div class="fl-tx"><a href="/shops/?b=' + encodeURIComponent(b.slug) + '"><b>' + esc(b.name) + '</b></a><small>' + esc(sum(f)) + '</small></div><button type="button" class="bz-btn soft bz-small" data-i="' + i + '">' + icon('bell', 16) + 'Settings</button></div><div class="fl-sheet"></div></div>'; }).join('') + '</div>' : '<div class="bz-sec">You don’t follow any shops yet. Open a shop page on Carvessa and tap Follow to get its deals first.</div>') +
          '<div class="bz-sec"><h3>Quiet hours</h3><label class="bz-ck" style="margin:6px 0"><input type="checkbox" id="flQ"' + (alerts.quiet !== false ? ' checked' : '') + '><span>No phone alerts from shops between 9 PM and 8 AM (Atlanta time)</span></label><div class="bz-msg" id="flM" role="status"></div><p class="rv-fine">Safety recalls still show in the app.</p></div>' +
          (dl.length ? '<h2 style="margin:20px 0 8px">Latest from shops you follow</h2><div class="fl-deals">' + dl.filter(function (p) { return !p.until || p.until >= today(); }).map(function (p) { var b = by[p.business_id]; return '<a class="fl-deal" href="/shops/?b=' + encodeURIComponent(b.slug) + '&deal=' + p.id + '">' + dealCard(p, b, 'sm') + '</a>'; }).join('') + '</div>' : '');
        box.onclick = function (e) {
          var b = e.target.closest('[data-i]'); if (!b) return;
          var f = list[+b.getAttribute('data-i')], host = b.closest('.fl-it').querySelector('.fl-sheet');
          if (host.innerHTML) { host.innerHTML = ''; return; }
          followSheet(host, f.businesses, f, function (nf) { if (!nf) list.splice(list.indexOf(f), 1); draw(); });
        };
        box.querySelector('#flQ').onchange = async function () {
          var v = this.checked, a = Object.assign({}, alerts, { quiet: v }), x = await sb.auth.updateUser({ data: { alerts: a } }), m = box.querySelector('#flM');
          if (x.error) { this.checked = !v; m.className = 'bz-msg bad'; m.textContent = 'That didn’t save.'; return; }
          alerts = a; m.className = 'bz-msg good'; m.textContent = v ? 'Quiet hours are on.' : 'Quiet hours are off.';
        };
      }
      draw();
    });
    return;
  }

  // ---------- Printable flyer with a QR code (share kit, picture 284) ----------
  if (mode === 'flyer') {
    (async function () {
      var p = (await sb.from('business_posts').select('*').eq('id', q.get('p') || '').maybeSingle()).data;
      var b = p && (await sb.from('businesses').select(PUB).eq('id', p.business_id).maybeSingle()).data;
      if (!p || !b) { root.innerHTML = '<div class="bz"><h1>This flyer isn’t available</h1><p class="lead">Log in to Business HQ first, or the deal has ended.</p><a class="bz-btn" href="/business/edit/">Open Business HQ</a></div>'; return; }
      var url = dealUrl(p, b), qr = window.qrcode ? window.qrcode(0, 'M') : null;
      if (qr) { qr.addData(url); qr.make(); }
      var t = tplOf(p);
      root.innerHTML = '<div class="fy-tools"><button type="button" class="bz-btn" onclick="window.print()">' + icon('print', 18) + 'Print</button><a class="bz-btn soft" href="/business/edit/">Back to Business HQ</a><p class="rv-fine">Letter size. Put it at the counter or in the window.</p></div>' +
        '<div class="fy"><div class="fy-band" style="background:linear-gradient(150deg,' + t.bg[0] + ',' + t.bg[1] + ')"><div class="dl-k">' + icon(t.ic, 16) + t.k + '</div><h1>' + esc(p.title) + '</h1>' + (p.price != null ? '<div class="fy-p">' + money(p.price) + '</div>' : '') + (p.body ? '<p>' + esc(p.body) + '</p>' : '') + '</div>' +
        '<div class="fy-b"><div class="fy-who"><b>' + esc(b.name) + '</b><span>' + esc([b.address, b.city].filter(Boolean).join(', ')) + '</span><span>' + endText(p) + (p.who === 'new' ? ' · New customers' : '') + '</span>' + (p.fine ? '<small>' + esc(p.fine) + '</small>' : '') + '</div>' +
        '<div class="fy-qr">' + (qr ? qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true }) : '') + '<b>Scan for the deal and directions</b></div></div>' +
        '<div class="fy-foot"><span class="fy-logo">CAR<i>V</i>essa</span><span>Car trouble? Free help in English and Spanish.</span><span>carvessa.app/b/' + esc(b.slug) + '</span></div></div>';
    })();
    return;
  }

  // ---------- Public page (picture 283 look, 284 deals, 285 follow) ----------
  if (mode === 'shop') {
    // Picture 298: the page is the shop's own site (no Carvessa menu or big footer; one line at the bottom).
    document.documentElement.classList.add('bz-shoppage');
    (async function () {
      var slug = q.get('b') || '';
      var r = slug ? await sb.from('businesses').select(PUB).eq('slug', slug).maybeSingle() : { data: null };
      var b = r.data;
      if (!b && slug) { var old = (await sb.from('businesses').select('slug').contains('old_slugs', [slug]).maybeSingle()).data; if (old) { location.replace('/shops/?b=' + encodeURIComponent(old.slug) + (q.get('deal') ? '&deal=' + encodeURIComponent(q.get('deal')) : '')); return; } }
      if (!b) { root.innerHTML = '<div class="bz"><h1>This page isn’t available</h1><p class="lead">It may be waiting for our check, or the link is wrong.</p><a class="bz-btn" href="/partners/">For businesses</a></div>'; return; }
      var [s, ps, rv, me, fc, ly] = await Promise.all([
        sb.from('business_services').select('name, price_from, note').eq('business_id', b.id).order('sort'),
        sb.from('business_posts').select('id, kind, template, title, body, price, fine, who, until, codes, created_at').eq('business_id', b.id).order('created_at', { ascending: false }).limit(20),
        sb.rpc('business_reviews_public', { b: b.id }),
        sb.auth.getSession(),
        sb.rpc('business_followers', { b: b.id }),
        sb.from('business_loyalty').select('active, stamps, reward').eq('business_id', b.id).maybeSingle()
      ]);
      var reviews = rv.data || [], user = me.data.session && me.data.session.user, isOwner = user && user.id === b.owner;
      var avg = reviews.length ? reviews.reduce(function (a, x) { return a + x.stars; }, 0) / reviews.length : 0;
      var svcs = s.data || [], posts = (ps.data || []).filter(function (p) { return !p.until || p.until >= today(); });
      var deals = posts.filter(function (p) { return p.kind === 'special'; }), news = posts.filter(function (p) { return p.kind !== 'special'; });
      var nFol = fc.data || 0, myFollow = null, LY = ly.data && ly.data.active ? ly.data : null, myCard = null;
      if (LY && user && !isOwner) myCard = (await sb.from('loyalty_cards').select('code, stamps, rewards, remind, car').eq('business_id', b.id).maybeSingle()).data;
      var lyHtml = function () {
        if (!LY) return '';
        var n = myCard ? myCard.stamps : 0;
        return '<div class="shop-card sp-ly" id="loyalty"><h2>' + icon('star', 18) + ' Loyalty card</h2><p class="rv-fine" style="margin:0 0 8px">' + LY.stamps + ' visits = <b>' + esc(LY.reward) + '</b></p><div class="ly-prev">' + Array.from({ length: LY.stamps }, function (_, i) { return '<i class="' + (i < n ? 'f' : '') + '">' + (i < n ? icon('check', 14) : i + 1) + '</i>'; }).join('') + '</div>' +
          (myCard ? '<div class="sp-cp" style="margin-top:10px"><small>MY CARD · SHOW AT THE COUNTER</small><div class="code">' + esc(myCard.code) + '</div><small>' + (n >= LY.stamps ? 'Card full! Your next visit gets “' + esc(LY.reward) + '”.' : n + ' of ' + LY.stamps + ' stamps') + '</small></div><label class="bz-ck" style="font-weight:600"><input type="checkbox" id="lyRem"' + (myCard.remind ? ' checked' : '') + '><span>Remind me when service is due (at most once a month)</span></label>'
            : talk ? '<label class="bz-ck" style="font-weight:600"><input type="checkbox" id="lyRem"><span>Let ' + esc(b.name) + ' remind me when service is due (at most once a month, by phone or email)</span></label><button type="button" class="sp-btn sp-wide" id="lyJoin">' + icon('qr', 18) + 'Get my card</button>' : '<p class="sp-own">Drivers get a card with a code here.</p>') + '<div class="bz-msg" id="lyM" role="status"></div></div>';
      };
      if (user && !isOwner) myFollow = (await sb.from('business_follows').select('*').eq('business_id', b.id).eq('user_id', user.id).maybeSingle()).data;
      var info = KINFO[b.kind] || KINFO.other, hv = headerOf(b), openState = openNow(b.hours);
      document.title = b.name + (b.city ? ' · ' + b.city : '');
      var count = function (k) { if (b.status === 'live') sb.rpc('business_count', { b: b.id, k: k }).then(function () {}, function () {}); };
      count('view');
      var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.name, b.address, b.city].filter(Boolean).join(', '));
      var tel = (b.phone || '').replace(/[^\d+]/g, '');
      var web = b.website ? (/^https?:/i.test(b.website) ? b.website : 'https://' + b.website) : '';
      var live = b.status === 'live', talk = live && !isOwner;
      var msgWord = b.kind === 'dealer' ? 'Ask about a car' : b.kind === 'credit_union' || b.kind === 'insurance' ? 'Ask a question' : 'Message';
      var bars = [5, 4, 3, 2, 1].map(function (n) { var c = reviews.filter(function (x) { return x.stars === n; }).length; return '<div><span>' + n + '</span><i><em style="width:' + (reviews.length ? Math.round(c / reviews.length * 100) : 0) + '%"></em></i><small>' + c + '</small></div>'; }).join('');
      var followBtn = function () { return myFollow ? '<button type="button" class="sp-btn soft" data-follow>' + icon('check', 16) + 'Following</button>' : '<button type="button" class="sp-btn" data-follow>' + icon('plus', 16) + 'Follow</button>'; };
      var dealHtml = function (p) { return '<div class="sp-deal" id="deal-' + p.id + '">' + dealCard(p, b) + '<div class="bz-row">' + (p.codes && talk ? '<button type="button" class="sp-btn" data-code="' + p.id + '">' + icon('qr', 16) + 'Get my counter code</button>' : '') + '<button type="button" class="sp-btn soft" data-dshare="' + p.id + '">' + icon('share', 16) + 'Share</button></div><div class="sp-code"></div></div>'; };
      var KP = { special: 'Special', news: 'News', event: 'Event', hours: 'Hours change' };
      var theme = b.page_theme || 'bold', br = brandOf(b), brText = readable(br, theme === 'night' ? '#0E1116' : '#FFFFFF');
      if (theme === 'night') { var nb = br, nn = 0; while (contrast(nb, '#0E1116') < 4.5 && nn++ < 12) nb = toHex(rgb(nb).map(function (v) { return v + (255 - v) * 0.15; })); brText = nb; }
      var idHtml = logoHtml(b, 'sp-lo') + '<div><h1>' + esc(b.name) + '</h1><span>' + esc(kindName(b.kind)) + (b.city ? ' · ' + esc(b.city) : '') + '</span></div>';
      // Picture 291: the tool each kind of business needs most, at the top. Uses messages and quotes that already work.
      var KH = {
        repair: ['wrench', 'Something wrong with your car?', 'Tell them what’s going on and get a price here. Used Carvessa’s car help? Paste your mechanic note.', 'Get a quote', 'quote', 'repair'],
        tires: ['search', 'Find tires for my car', 'Type your car and, if you know it, the tire size on the side of the tire.', 'Get tire prices', 'quote', 'tires'],
        dealer: ['tag', 'Ask for the out-the-door price', 'The total with tax and fees, in writing, before you go.', 'Ask for my price', 'message', 'dealer'],
        credit_union: ['cash', 'Free car loan check-up', 'Bring your current loan. They tell you if they can lower your payment. Rates are set by the credit union.', 'Ask for a check-up', 'message', 'credit_union'],
        insurance: ['shield', 'Quote for a car you’re looking at', 'Tell them the car. Your agent answers here; your phone and email stay private until you share them.', 'Ask for a quote', 'quote', 'insurance'],
        body: ['wrench', 'Estimate from 3 photos', 'Close, middle and far away. They answer with a price here.', 'Send photos', 'quote', 'body'],
        detail: ['star', 'Book a detail', 'Tell them your car and when you’d like to come.', 'Ask for a time', 'message', 'detail'],
        tow: ['phone', 'Need a tow now?', 'Tell them where you are and what happened. On a highway, stay in the car with your belt on.', 'Call now', 'call', 'tow']
      }[b.kind];
      var kindHtml = KH ? '<section class="sp-kind"><div class="sp-kh">' + icon(KH[0], 20) + '<b>' + KH[1] + '</b></div><p>' + KH[2] + '</p>' +
        (b.kind === 'tires' && talk ? '<div class="bz-two"><label class="bz-f"><span>Your car</span><input id="kCar" maxlength="80" placeholder="2019 Toyota RAV4"></label><label class="bz-f"><span>Tire size (optional)</span><input id="kSize" maxlength="20" placeholder="225/65R17"></label></div>' : '') +
        (KH[4] === 'call' ? (tel ? '<a class="sp-btn sp-wide" href="tel:' + esc(tel) + '" data-c="call">' + icon('phone', 18) + 'Call now</a>' : '') : talk ? '<button type="button" class="sp-btn sp-wide" data-chat-kind="' + KH[4] + '" data-pre="' + KH[5] + '">' + icon('msg', 18) + KH[3] + '</button>' : '<p class="sp-own">Drivers see a “' + KH[3] + '” button here.</p>') + '</section>' : '';
      var tabsList = [(b.photos || []).length ? ['photos', 'Photos'] : null, deals.length ? ['deals', 'Deals · ' + deals.length] : null, svcs.length ? ['svc', 'Services'] : null, ['reviews', 'Reviews'], ['ov', 'Hours & contact']].filter(Boolean);
      var mainBtn = talk ? (QUOTE_KINDS[b.kind] ? '<button type="button" class="sp-btn" data-chat-kind="quote">' + icon('msg', 16) + 'Get a quote</button>' : '<button type="button" class="sp-btn" data-chat-kind="message">' + icon('msg', 16) + msgWord + '</button>') : '';
      var PARTS = { yes: 'We install parts you bring', no: 'We use our own parts', ask: 'Bringing your own parts? Ask us' };
      var hoursCard = b.hours ? '<div class="shop-card sp-hours" id="hours"><h2>Hours' + (openState ? ' <span class="' + (openState.open ? 'open' : 'closed') + '">' + esc(openState.text) + '</span>' : '') + '</h2>' + b.hours.split(/\s*·\s*|\s*;\s*|\n/).filter(Boolean).map(function (h) { return '<div class="sp-hr">' + esc(h) + '</div>'; }).join('') + '<div class="shop-note">Hours set by the business. Holidays can change them.</div></div>' : '';
      var contactCard = '<div class="shop-card"><h2>Find us</h2><div class="shop-kv">' + (b.address ? '<span>Address</span><div>' + esc(b.address) + (b.city ? ', ' + esc(b.city) : '') + '</div>' : b.city ? '<span>Area</span><div>' + esc(b.city) + '</div>' : '') + (b.phone ? '<span>Phone</span><div><a href="tel:' + esc(tel) + '" data-c="call">' + esc(b.phone) + '</a></div>' : '') + (web ? '<span>Website</span><div><a href="' + esc(web) + '" target="_blank" rel="noopener nofollow" data-c="website">' + esc(b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a></div>' : '') + '</div>' +
        socialRow(b.social) + '<a class="sp-btn soft sp-wide" style="margin-top:10px" href="' + maps + '" target="_blank" rel="noopener" data-c="directions">' + icon('pin', 16) + 'Directions</a></div>';
      root.innerHTML =
        '<header class="s2-top"><div class="s2-in"><a class="s2-brand" href="#top">' + logoHtml(b, 's2-lo') + '<b>' + esc(b.name) + '</b></a>' +
          '<nav class="s2-menu" aria-label="Sections">' + tabsList.map(function (t) { return '<a href="#' + t[0] + '">' + t[1].replace(/ · \d+$/, '') + '</a>'; }).join('') + '</nav>' +
          '<div class="s2-cta">' + (tel ? '<a class="sp-btn soft s2-call" href="tel:' + esc(tel) + '" data-c="call">' + icon('phone', 16) + '<span>' + esc(b.phone) + '</span></a>' : '') + mainBtn + (isOwner ? '<a class="sp-btn" href="/business/edit/">' + icon('wrench', 16) + 'Edit</a>' : '') + '</div></div></header>' +
        '<section class="s2-hero" id="top" style="background:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.25) 70%),' + hv.css.replace(/"/g, "'") + '"><div class="s2-in"><div class="s2-hid">' +
          logoHtml(b, 's2-hlo') + '<h1>' + esc(b.name) + '</h1>' +
          '<p class="s2-line">' + esc(kindName(b.kind)) + (b.city ? ' · ' + esc(b.city) : '') + '</p>' +
          '<div class="s2-chips">' + (openState ? '<a href="#ov" class="' + (openState.open ? 'open' : 'closed') + '">' + esc(openState.text) + '</a>' : '') + (reviews.length ? '<a href="#reviews">★ ' + avg.toFixed(1) + ' (' + reviews.length + ')</a>' : '') + (live ? '<span class="v">' + icon('check', 13) + 'Verified by Carvessa</span>' : '') + '</div>' +
          '<div class="s2-acts">' + mainBtn + (tel ? '<a class="sp-btn s2-glass" href="tel:' + esc(tel) + '" data-c="call">' + icon('phone', 16) + (b.kind === 'tow' ? 'Call now' : 'Call') + '</a>' : '') + '<a class="sp-btn s2-glass" href="' + maps + '" target="_blank" rel="noopener" data-c="directions">' + icon('pin', 16) + 'Directions</a>' + (talk ? followBtn() : '') + '<button type="button" class="sp-btn s2-glass" id="spShare" aria-label="Share this page">' + icon('share', 16) + '<span class="s2-sh">Share</span></button></div>' +
        '</div></div>' + (hv.credit ? '<a class="shop-credit" href="' + esc(hv.credit[1]) + '" target="_blank" rel="noopener nofollow">Photo: ' + esc(hv.credit[0]) + ' · CC BY</a>' : '') + '</section>' +
        '<div class="s2-in s2-body">' +
          (!live ? '<div class="shop-pre">Preview: only you can see this page. It goes live after we confirm you’re the owner (we’ll call or text you).</div>' : '') +
          (isOwner ? '<p class="sp-own">This is your page. Drivers also see Follow, Message and Get a quote. Add photos, posts and prices in <a href="/business/edit/?tab=page">Business HQ</a>.</p>' : '') +
          (live ? '<p class="sp-fol" id="spFol">' + nFol + ' driver' + (nFol === 1 ? '' : 's') + ' follow' + (nFol === 1 ? 's' : '') + ' this shop' + (myFollow ? ' · you get their deals first' : ' · follow to get their deals first') + '</p>' : '') +
          '<div id="fwBox"></div>' + kindHtml + '<div id="chBox"></div>' +
          '<nav class="sp-tabs" aria-label="Sections">' + tabsList.map(function (t, i) { return '<a href="#' + t[0] + '" class="' + (i === 0 ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</nav>' +
          '<div class="s2-grid"><div class="s2-main">' +
            ((b.photos || []).length ? '<section id="photos" class="s2-o1"><div class="shop-card"><h2>Photos <span class="rv-sum">' + b.photos.length + '</span></h2><div class="s2-gal' + (b.photos.length === 1 ? ' one' : '') + '">' + b.photos.slice(0, 24).map(function (p, i) { return '<a href="' + photoUrl(p) + '" target="_blank" rel="noopener"' + (i >= 5 ? ' class="more"' : '') + '><img src="' + photoUrl(p) + '" alt="' + esc(b.name) + ' photo ' + (i + 1) + '" loading="lazy"></a>'; }).join('') + '</div>' + (b.photos.length > 5 ? '<button type="button" class="bz-btn soft bz-small" id="s2All" style="margin-top:10px">See all ' + b.photos.length + ' photos</button>' : '') + '</div></section>' : '') +
            (b.offer || deals[0] ? '<div class="s2-o2">' + (b.offer ? '<div class="sp-offer"><small>OFFER</small><b>' + esc(b.offer) + '</b><span>Show this page at the counter</span></div>' : '') + '</div>' : '') +
            (deals.length ? '<section id="deals" class="s2-o2"><h2 class="sp-h">Deals</h2>' + deals.map(dealHtml).join('') + '<p class="shop-note">Deals are set by the business. Ask for a written quote.</p></section>' : '') +
            (news.length ? '<section class="s2-o3"><h2 class="sp-h">News</h2>' + news.map(function (p) { return '<div class="shop-card shop-post"><span class="hq-tag">' + (KP[p.kind] || 'News') + '</span><h2>' + esc(p.title) + '</h2>' + (p.body ? esc(p.body) : '') + (p.until ? '<div class="shop-note">Until ' + shortDay(p.until) + '</div>' : '') + '</div>'; }).join('') + '</section>' : '') +
            '<section id="reviews" class="s2-o6"><div class="shop-card"><h2>Reviews' + (reviews.length ? ' <span class="rv-sum">' + avg.toFixed(1) + ' · ' + reviews.length + '</span>' : '') + '</h2>' + (reviews.length ? '<div class="sp-bars">' + bars + '</div>' : '') + '<p class="rv-fine">From Carvessa members. Only first names show. <a href="/business/review-rules/" target="_blank">Review Rules</a></p>' +
              (talk ? '<div class="bz-row" style="margin:6px 0 10px"><button type="button" class="bz-btn bz-small" id="rvWrite">Write a review</button></div><div id="rvBox"></div>' : '') +
              (reviews.length ? reviews.slice(0, 20).map(function (x) {
                return '<div class="rv-item" data-id="' + x.id + '"><div class="rv-top">' + starRow(x.stars) + '<b>' + esc(x.first_name) + '</b><small>' + ago(x.created_at) + '</small></div>' + (x.body ? '<p>' + esc(x.body) + '</p>' : '') +
                  ((x.photos || []).length ? '<div class="rv-pics">' + x.photos.map(function (p) { return '<img src="' + photoUrl(p) + '" alt="Photo from ' + esc(x.first_name) + '" loading="lazy">'; }).join('') + '</div>' : '') +
                  (x.reply ? '<div class="rv-reply"><b>Reply from ' + esc(b.name) + '</b>' + esc(x.reply) + '</div>' : '') +
                  '<button type="button" class="rv-flag" data-flag="' + x.id + '">Report</button><div class="rv-rep-box"></div></div>';
              }).join('') : '<p>' + (live ? 'No reviews yet. Been here? Be the first.' : 'Reviews start when the page is live.') + '</p>') + '</div></section>' +
          '</div><aside class="s2-side">' +
            (svcs.length || b.customer_parts ? '<section id="svc" class="s2-o4"><div class="shop-card"><h2>' + info.svc + '</h2>' + svcs.map(function (x) { return '<div class="shop-svc"><span>' + esc(x.name) + '</span><b>' + (x.price_from != null ? 'from ' + money(x.price_from) : 'Ask') + '</b></div>'; }).join('') + (b.customer_parts ? '<div class="shop-svc"><span>Customer parts</span><b>' + PARTS[b.customer_parts] + '</b></div>' : '') + '<div class="shop-note">' + (b.kind === 'credit_union' ? 'Set by the credit union. Not an offer from Carvessa.' : 'Prices set by the business. Ask for a written quote.') + '</div></div></section>' : '') +
            '<section id="ov" class="s2-o7">' + hoursCard + contactCard + (b.about ? '<div class="shop-card"><h2>About</h2>' + esc(b.about) + '</div>' : '') + '</section>' +
            '<div class="s2-o5">' + lyHtml() + '</div>' +
            (info.tip ? '<div class="shop-card shop-tip s2-o8"><h2>' + info.tip[0] + '</h2>' + info.tip[1] + '</div>' : '') +
          '</aside></div></div>' +
        '<footer class="s2-foot"><span>© ' + new Date().getFullYear() + ' ' + esc(b.name) + '</span><span><a href="/" class="s2-by">Page on <span class="fy-logo">CAR<i>V</i>essa</span></a> · <a href="/business/terms/">Terms</a> · <a href="/privacy/">Privacy</a> · <button type="button" class="linkish" id="s2Rep">Report this page</button></span>' +
          '<small>Carvessa doesn’t rank businesses by who pays. Reviews are never removed for being negative or because a business pays. <a href="/business/edit/">Is this your business?</a></small></footer>' +
        '<div class="sp-bar">' + (live ? '<button type="button" class="sp-b pr" data-chat-kind="' + (QUOTE_KINDS[b.kind] ? 'quote' : 'message') + '">' + icon('msg', 18) + (QUOTE_KINDS[b.kind] ? 'Quote' : 'Message') + '</button>' : '') + (tel ? '<a class="sp-b" href="tel:' + esc(tel) + '" data-c="call">' + icon('phone', 18) + (b.kind === 'tow' ? 'Call now' : 'Call') + '</a>' : '') + '<a class="sp-b" href="' + maps + '" target="_blank" rel="noopener" data-c="directions">' + icon('pin', 18) + 'Go</a></div>';
      if (root.querySelector('#s2All')) root.querySelector('#s2All').onclick = function () { root.querySelector('.s2-gal').classList.add('all'); this.remove(); };
      root.querySelector('#s2Rep').onclick = async function () {
        var why = prompt('What’s wrong with this page? (fake business, wrong information, scam, something else)'); if (!why) return;
        await sb.from('feedback').insert({ mood: 'confused', message: ('[Page report] business=' + b.slug + ' | ' + why).slice(0, 1000), screen: 'shops' });
        this.textContent = 'Thanks, we’ll look at it';
      };
      root.classList.add('sp-has-bar', 'sp-t-' + theme);
      root.style.setProperty('--brand', br); root.style.setProperty('--brandInk', onColor(br)); root.style.setProperty('--brandText', brText);
      root.addEventListener('click', function (e) { var a = e.target.closest('[data-c]'); if (a) count(a.getAttribute('data-c')); });
      // Tabs follow the scroll.
      var tabs = root.querySelector('.sp-tabs');
      var secs = tabsList.map(function (t) { return root.querySelector('#' + t[0]); });
      window.addEventListener('scroll', function () { var y = tabs.getBoundingClientRect().bottom + 10, on = 0; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) on = i; }); [].forEach.call(tabs.children, function (a, i) { a.classList.toggle('on', i === on); }); }, { passive: true });
      root.querySelector('#spShare').onclick = async function () {
        var url = shortUrl(b.slug);
        if (navigator.share) { try { await navigator.share({ title: b.name, url: url }); } catch (err) { /* closed */ } return; }
        try { await navigator.clipboard.writeText(url); this.querySelector('.s2-sh').textContent = 'Link copied'; } catch (err) { prompt('Copy this link:', url); }
      };
      // Write / edit a review, report one, follow, message, get a code: members only (free account).
      function signedIn(host, then, why) {
        sb.auth.getSession().then(function (r) {
          var u = r.data.session && r.data.session.user; if (u) { then(u); return; }
          host.innerHTML = '<div class="rv-form"><h3>Log in or create a free account</h3><p class="rv-fine">' + (why || 'Reviews come only from Carvessa members, one per person per business.') + '</p><div class="rv-acct"></div></div>';
          host.scrollIntoView({ behavior: 'smooth', block: 'center' });
          account(function (u2) { host.innerHTML = ''; then(u2); }, host.querySelector('.rv-acct'));
        });
      }
      function drawFollow() {
        var bt = root.querySelector('[data-follow]'); if (bt) bt.outerHTML = followBtn();
        var fl = root.querySelector('#spFol'); if (fl) fl.textContent = nFol + ' driver' + (nFol === 1 ? '' : 's') + ' follow' + (nFol === 1 ? 's' : '') + ' this shop' + (myFollow ? ' · you get their deals first' : ' · follow to get their deals first');
      }
      root.addEventListener('click', function (e) {
        if (!e.target.closest('[data-follow]')) return;
        var host = root.querySelector('#fwBox');
        signedIn(host, async function (u) {
          if (u.id === b.owner) { host.innerHTML = '<div class="bz-msg bad">You can’t follow your own business.</div>'; return; }
          if (!myFollow) {
            myFollow = (await sb.from('business_follows').select('*').eq('business_id', b.id).eq('user_id', u.id).maybeSingle()).data;
            if (!myFollow) {
              var x = await sb.from('business_follows').insert({ business_id: b.id }).select('*').single();
              if (x.error) { host.innerHTML = '<div class="bz-msg bad">' + (/live/.test(x.error.message) ? 'You can follow this page once it’s live.' : /a lot of shops/.test(x.error.message) ? 'You follow a lot of shops already. Unfollow one first.' : 'That didn’t work. Please try again.') + '</div>'; return; }
              myFollow = x.data; nFol++;
            }
            drawFollow();
          }
          if (host.innerHTML && host.querySelector('.fw-sheet')) { host.innerHTML = ''; return; }
          followSheet(host, b, myFollow, function (f) { if (!f) { myFollow = null; nFol = Math.max(0, nFol - 1); } drawFollow(); });
          host.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 'Follow ' + b.name + ' with a free account to get their deals first. You choose what you get.');
      });
      root.addEventListener('click', function (e) {
        var c = e.target.closest('[data-code]'), sh = e.target.closest('[data-dshare]');
        if (sh) {
          var p0 = deals.filter(function (x) { return x.id === sh.getAttribute('data-dshare'); })[0], url = dealUrl(p0, b);
          if (navigator.share) navigator.share({ title: b.name, text: p0.title, url: url }).catch(function () {});
          else navigator.clipboard.writeText(url).then(function () { sh.lastChild.textContent = 'Link copied'; }, function () { prompt('Copy this link:', url); });
          return;
        }
        if (!c) return;
        var id = c.getAttribute('data-code'), host = c.closest('.sp-deal').querySelector('.sp-code'), p = deals.filter(function (x) { return x.id === id; })[0];
        signedIn(host, async function () {
          var x = await sb.from('deal_codes').insert({ post_id: id }).select('code, used_at').single();
          if (x.error && x.error.code === '23505') x = await sb.from('deal_codes').select('code, used_at').eq('post_id', id).single();
          if (x.error || !x.data) { host.innerHTML = '<div class="bz-msg bad">' + (x.error && /own deal/.test(x.error.message) ? 'You can’t use your own deal.' : x.error && /Too many/.test(x.error.message) ? 'Too many codes today. Please try again tomorrow.' : 'That didn’t work. Please try again.') + '</div>'; return; }
          host.innerHTML = '<div class="sp-cp"><small>SHOW THIS AT THE COUNTER</small><b>' + esc(p.title) + '</b><span>' + esc(b.name) + ' · ' + endText(p) + '</span><div class="code">' + esc(x.data.code) + '</div><small>' + (x.data.used_at ? 'Already used on ' + new Date(x.data.used_at).toLocaleDateString('en-US') + '.' : 'Your code. The shop marks it used. Find it here any time.') + '</small></div>';
        }, 'Get your counter code with a free Carvessa account. The shop never sees your name, email or phone.');
      });
      root.addEventListener('click', function (e) {
        var kEl = e.target.closest('[data-chat-kind]'); if (!kEl) return; var k = kEl.getAttribute('data-chat-kind'), preKey = kEl.getAttribute('data-pre');
        var car0 = root.querySelector('#kCar') ? root.querySelector('#kCar').value.trim() : '', size0 = root.querySelector('#kSize') ? root.querySelector('#kSize').value.trim() : '';
        var PRE = { tires: { car: car0, body: 'Price for 4 tires' + (size0 ? ', size ' + size0 : '') + ', installed and balanced, please.' }, dealer: { body: 'Hi! What’s the out-the-door price (with tax and fees, in writing) for ' }, credit_union: { body: 'Hi! I’d like a free car loan check-up. My current payment is about $' }, body: { body: 'Estimate please. I added photos: close, middle and far away.' }, insurance: { body: 'Hi! Could I get a quote for this car? ' }, detail: { body: 'Hi! I’d like to book a detail for my ' } };
        var pre = preKey ? PRE[preKey] : null;
        var box = root.querySelector('#chBox');
        signedIn(box, async function (u) {
          if (u.id === b.owner) { box.innerHTML = '<div class="bz-msg bad">You can’t message your own business.</div>'; return; }
          var open = (await sb.from('biz_chats').select('*').eq('business_id', b.id).eq('driver', u.id).neq('status', 'blocked').order('last_at', { ascending: false }).limit(1)).data;
          var show = function (c) { chatThread(box, c, false, b.name); var a = document.createElement('p'); a.className = 'rv-fine'; a.innerHTML = '<a href="/messages/">See all my messages ›</a>'; box.appendChild(a); };
          if (open && open.length && k === 'message' && !pre) show(open[0]); else startChat(box, b, k, show, pre);
          box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 'Message ' + b.name + ' with a free account. Only your first name shows; your phone and email stay private.');
      });
      var wr = root.querySelector('#rvWrite');
      if (wr) wr.onclick = function () {
        var box = root.querySelector('#rvBox');
        signedIn(box, async function (u) {
          if (u.id === b.owner) { box.innerHTML = '<div class="bz-msg bad">You can’t review your own business.</div>'; return; }
          var mine = (await sb.from('business_reviews').select('id, stars, body, photos').eq('business_id', b.id).eq('author', u.id).maybeSingle()).data;
          reviewForm(box, b, mine, function () { box.innerHTML = '<div class="bz-msg good">Thanks! Your review is up' + ' (photos show after our check). You can edit or delete it any time here.</div>'; setTimeout(function () { location.reload(); }, 2500); });
          if (mine) { var d = document.createElement('div'); d.className = 'bz-row'; d.innerHTML = '<button type="button" class="bz-btn red bz-small">Delete my review</button>'; box.appendChild(d); d.firstChild.onclick = async function () { if (!confirm('Delete your review?')) return; await sb.from('business_reviews').delete().eq('id', mine.id); location.reload(); }; }
        });
      };
      root.addEventListener('click', function (e) {
        var id = e.target.getAttribute('data-flag'); if (!id) return;
        var host = e.target.parentNode.querySelector('.rv-rep-box');
        signedIn(host, function () { reportBox(host, id); });
      });
      // Loyalty card: get my card, change my reminder choice.
      root.addEventListener('click', function (e) {
        if (e.target.id !== 'lyJoin') return;
        var host = root.querySelector('#loyalty');
        signedIn(root.querySelector('#fwBox'), async function () {
          var x = await sb.rpc('loyalty_join', { b: b.id, rem: !!(root.querySelector('#lyRem') && root.querySelector('#lyRem').checked), car_text: null });
          if (x.error) { var mm = host.querySelector('#lyM'); mm.className = 'bz-msg bad'; mm.textContent = /own card/.test(x.error.message) ? 'You can’t join your own card.' : 'That didn’t work. Please try again.'; return; }
          myCard = x.data; host.outerHTML = lyHtml();
        }, 'Get ' + b.name + '’s loyalty card with a free account. The shop sees your first name, never your phone or email.');
      });
      root.addEventListener('change', async function (e) {
        if (e.target.id !== 'lyRem' || !myCard) return;
        var v = e.target.checked, x = await sb.from('loyalty_cards').update({ remind: v }).eq('business_id', b.id).eq('code', myCard.code), mm = root.querySelector('#lyM');
        if (x.error) { e.target.checked = !v; mm.className = 'bz-msg bad'; mm.textContent = 'That didn’t save.'; return; }
        myCard.remind = v; mm.className = 'bz-msg good'; mm.textContent = v ? 'Reminders on. At most once a month.' : 'Reminders off.';
      });
      // Picture 295: "Book a time" when the shop turned booking on.
      var bk = (await sb.from('business_booking').select('*').eq('business_id', b.id).maybeSingle()).data;
      // Picture 304: "You're booked" on the shop's page when the driver has a time here.
      async function drawBooked() {
        var old = root.querySelector('.bk-strip'); if (old) old.remove();
        var uu = user || (await sb.auth.getUser()).data.user; if (!uu || isOwner) return;
        var r2 = await sb.from('appointments').select(APCOLS).eq('business_id', b.id).in('status', ['requested', 'confirmed', 'offered']).gte('starts_at', new Date(Date.now() - 3600e3).toISOString()).order('starts_at').limit(1);
        var a = (r2.data || [])[0]; if (!a) return;
        var tz = (bk && bk.tz) || 'America/New_York';
        var txt = a.status === 'confirmed' ? 'You’re booked: ' + whenText(a.starts_at, tz) : a.status === 'offered' ? b.name + ' offered a new time. Tap to answer.' : 'Waiting for ' + b.name + ' to confirm: ' + whenText(a.starts_at, tz);
        var el = document.createElement('a'); el.className = 'bk-strip ' + a.status; el.href = '/appointments/';
        el.innerHTML = '<i>' + icon(a.status === 'confirmed' ? 'check' : 'cal', 16) + '</i><div><b>' + esc(txt) + '</b><span>' + esc(a.service) + ' · See or change ›</span></div>';
        var hero = root.querySelector('.s2-hero'); if (hero) hero.insertAdjacentElement('afterend', el); else root.insertBefore(el, root.firstChild);
      }
      drawBooked();
      if (bk && bk.active && live) {
        var bkBtn = function (cls) { return '<button type="button" class="sp-btn ' + (cls || '') + '" data-book>' + icon('cal', 16) + 'Book a time</button>'; };
        var acts = root.querySelector('.s2-acts'); if (acts) acts.insertAdjacentHTML('afterbegin', bkBtn());
        var cta = root.querySelector('.s2-cta'); if (cta && !isOwner) cta.insertAdjacentHTML('afterbegin', bkBtn('s2-book'));
        root.addEventListener('click', function (e) { if (e.target.closest('[data-book]')) { if (isOwner) { alert('This is your page. Drivers book here; you see them in Business HQ › Appointments.'); return; } bookFlow(b, bk, { onDone: drawBooked }); } });
        if (q.get('book') === '1' && !isOwner) bookFlow(b, bk, { onDone: drawBooked });
      }
      // A shared deal link (?deal=…) jumps to that deal.
      var dq = q.get('deal'), dEl = dq && root.querySelector('#deal-' + CSS.escape(dq));
      if (dEl) setTimeout(function () { dEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); dEl.classList.add('hl'); }, 300);
    })();
  }
})();
