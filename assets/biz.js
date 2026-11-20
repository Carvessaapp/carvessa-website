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
  var PUB = 'id, owner, slug, name, kind, address, city, state, phone, website, hours, about, offer, wallpaper, photos, logo, header, status, founding, created_at, updated_at';
  var MINE = PUB + ', lat, lon, legal_name, control_no, owner_role, since_year, hq_look, notify_email';
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
    home: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>', msg: '<path d="M4 5h16v11H8l-4 4z"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    wrench: '<path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 1-2-2z"/>', post: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>', cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    phone: '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/>', pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', check: '<path d="M5 12l5 5 9-10"/>', tag: '<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.5"/>', share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/>',
    snow: '<path d="M12 2v20M4 6l16 12M20 6L4 18"/>', gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>', heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    down: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/>', moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>', out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'
  };
  var icon = function (n, s) { return '<svg class="ic" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; };
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
  function dealUrl(p, b) { return 'https://carvessa.app/shops/?b=' + encodeURIComponent(b.slug) + '&deal=' + p.id; }
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
      row('push', 'Phone alert', 'In the Carvessa app, signed in with this account') + row('email', 'Email too', 'One email, never more than 1 a week per shop') +
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

  // ---------- The business form (join step 3 and My page) ----------
  function form(b, svcs, onSave, host) {
    host = host || root.querySelector('#bzForm');
    var h = b.header || { style: b.id && WALLS[b.wallpaper] && !b.header ? 'legacy' : 'photo' };
    var st = { kind: b.kind || 'repair', header: { style: h.style || 'photo', pattern: h.pattern || 'fade', c1: hex(h.c1, '#1F3F9F'), c2: hex(h.c2, '#5B8DEF'), photo: h.photo || null }, logo: b.logo || null, photos: (b.photos || []).slice(), svcs: svcs.length ? svcs.map(function (s) { return { name: s.name, price: s.price_from == null ? '' : s.price_from }; }) : [{ name: '', price: '' }] };
    var f = function (id, label, val, extra) { return '<label class="bz-f"><span>' + label + '</span><input id="' + id + '" value="' + esc(val) + '" ' + (extra || '') + '></label>'; };
    host.innerHTML =
      '<div class="bz-f bz-namebox"><span>Business name</span><input id="fName" maxlength="80" value="' + esc(b.name) + '" placeholder="Start typing, we’ll look you up"><div class="bz-sug" id="fSug" hidden></div></div>' +
      '<div class="bz-found" id="fFound" hidden></div>' +
      '<div class="bz-f"><span>What kind of business?</span><div class="bz-chips" id="fKind"></div></div>' +
      f('fAddr', 'Address', b.address, 'maxlength="160" autocomplete="street-address"') +
      f('fCity', 'City and state', b.city, 'maxlength="60" placeholder="Atlanta, GA"') +
      f('fPhone', 'Phone', b.phone, 'maxlength="30" inputmode="tel" autocomplete="tel"') +
      f('fWeb', 'Website (optional)', b.website, 'maxlength="200" inputmode="url"') +
      f('fHours', 'Hours', b.hours, 'maxlength="160" placeholder="Mon–Sat 8 AM–6 PM · Closed Sunday"') +
      '<label class="bz-f"><span>About your business</span><textarea id="fAbout" maxlength="600" placeholder="Family shop since 2009. Tires, brakes and oil changes, most same day.">' + esc(b.about) + '</textarea></label>' +
      '<label class="bz-f"><span>One offer (optional)</span><input id="fOffer" maxlength="120" value="' + esc(b.offer) + '" placeholder="Free tire check"><small>Shown at the top of your page.</small></label>' +
      '<div class="bz-f"><span id="fSvcLab">Services and prices (you set them)</span><div id="fSvcs"></div><button type="button" class="bz-btn soft bz-small" id="fAddSvc">+ Add a service or item</button><small>Prices show as "from $X". Leave the price empty if it depends.</small></div>' +
      '<div class="bz-f"><span>Header (optional)</span><div class="bz-hopts" id="fHopt"></div><div id="fHpanel"></div><div class="bz-hprev" id="fHprev"></div></div>' +
      '<div class="bz-f"><span>Logo (optional)</span><div class="bz-logo-row" id="fLogo"></div></div>' +
      '<div class="bz-f"><span>Photos (optional, up to 3)</span><div class="bz-pics" id="fPics"></div><small>Your shop, your work, your team. No customers’ license plates please.</small></div>' +
      '<div class="bz-check"><h3>For our check (drivers never see this)</h3><p>We confirm every business before its page goes live. These help us find your business record fast.</p>' +
      f('fLegal', 'Legal name, as registered with your state', b.legal_name, 'maxlength="120" placeholder="Tony’s Auto Shop LLC"') +
      '<div class="bz-two">' + f('fRegState', 'State where it’s registered', b.state || '', 'maxlength="30" placeholder="Georgia"') + f('fCtrl', 'State control or file number (optional)', b.control_no, 'maxlength="30" placeholder="Helps us find you"') + '</div>' +
      '<div class="bz-two"><label class="bz-f"><span>Your role</span><select id="fRole">' + ['Owner', 'Co-owner', 'Manager', 'Other'].map(function (r) { return '<option' + (b.owner_role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></label>' + f('fSince', 'In business since (year)', b.since_year || '', 'inputmode="numeric" maxlength="4" placeholder="2014"') + '</div></div>' +
      '<div class="bz-row"><button class="bz-btn" id="fSave">' + (b.id ? 'Save changes' : 'Create my page') + '</button></div><div class="bz-msg" id="fMsg" role="status"></div>';
    var $ = function (id) { return host.querySelector('#' + id); };
    function drawKinds() {
      $('fKind').innerHTML = KINDS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" class="' + (st.kind === k[0] ? 'on' : '') + '">' + k[1] + '</button>'; }).join('');
      $('fSvcLab').textContent = (KINFO[st.kind] || KINFO.other).svc + ' (you set them)';
    }
    function drawSvcs() {
      $('fSvcs').innerHTML = st.svcs.map(function (s, i) { return '<div class="bz-svc"><input data-i="' + i + '" data-f="name" maxlength="80" placeholder="Oil change" value="' + esc(s.name) + '" aria-label="Service name"><input data-i="' + i + '" data-f="price" inputmode="decimal" placeholder="From $" value="' + esc(s.price) + '" aria-label="Price from"><button type="button" data-del="' + i + '" aria-label="Remove">✕</button></div>'; }).join('');
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
        (st.photos.length < 3 ? '<label aria-label="Add a photo">+<input type="file" accept="image/*" id="fPicFile" hidden></label>' : '');
    }
    drawKinds(); drawSvcs(); drawHeader(); drawLogo(); drawPics();
    nameSearch(st, $, function (info) {
      var put = function (id, v) { if (v && !$(id).value.trim()) { $(id).value = v; return 1; } return 0; };
      var n = 0;
      $('fName').value = info.name; n += put('fAddr', info.address) + put('fCity', info.city) + put('fPhone', info.phone) + put('fWeb', info.website) + put('fHours', info.hours);
      if (info.kind) { st.kind = info.kind; drawKinds(); n++; }
      if (!$('fRegState').value && /, GA$/.test(info.city || '')) $('fRegState').value = 'Georgia';
      if (info.lat != null) st.spot = { lat: info.lat, lon: info.lon, key: [$('fAddr').value.trim(), $('fCity').value.trim()].join('|') };
      $('fFound').hidden = false;
      $('fFound').textContent = n ? '✓ We filled in ' + n + ' thing' + (n > 1 ? 's' : '') + ' from OpenStreetMap (© OpenStreetMap contributors). Check them and fix anything that’s off.' : 'Found you on the map, but there were no extra details. Please fill in the rest.';
      drawHeader(); drawLogo();
    });
    $('fKind').onclick = function (e) { var k = e.target.getAttribute('data-k'); if (k) { st.kind = k; drawKinds(); drawHeader(); } };
    $('fSvcs').oninput = function (e) { var i = e.target.getAttribute('data-i'); if (i != null) st.svcs[+i][e.target.getAttribute('data-f')] = e.target.value; };
    $('fSvcs').onclick = function (e) { var i = e.target.getAttribute('data-del'); if (i != null) { st.svcs.splice(+i, 1); if (!st.svcs.length) st.svcs.push({ name: '', price: '' }); drawSvcs(); } };
    $('fAddSvc').onclick = function () { if (st.svcs.length < 30) { st.svcs.push({ name: '', price: '' }); drawSvcs(); } };
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
    $('fSave').onclick = async function () {
      var name = $('fName').value.trim(), phone = $('fPhone').value.trim(), msg = $('fMsg');
      msg.className = 'bz-msg bad';
      if (name.length < 2) { msg.textContent = 'Please type your business name.'; return; }
      if ($('fCity').value.trim().length < 2) { msg.textContent = 'Please type your city and state.'; return; }
      if (!/\d{7,}/.test(phone.replace(/\D/g, ''))) { msg.textContent = 'Please type a phone number we can call to confirm you’re the owner.'; return; }
      var since = parseInt($('fSince').value, 10);
      if ($('fSince').value && !(since >= 1900 && since <= new Date().getFullYear())) { msg.textContent = 'Please type the year you started, like 2014.'; return; }
      var hs = st.header, header = { style: hs.style === 'legacy' ? 'legacy' : hs.style };
      if (hs.style === 'color') { header.pattern = hs.pattern; header.c1 = hs.c1; header.c2 = hs.c2; }
      if (hs.style === 'own') { if (!hs.photo) { msg.textContent = 'Choose a photo for your header, or pick another header option.'; return; } header.photo = hs.photo; }
      var row = { name: name, kind: st.kind, address: $('fAddr').value.trim() || null, city: $('fCity').value.trim(), phone: phone, website: $('fWeb').value.trim() || null,
        hours: $('fHours').value.trim() || null, about: $('fAbout').value.trim() || null, offer: $('fOffer').value.trim() || null, photos: st.photos, header: header, logo: st.logo,
        legal_name: $('fLegal').value.trim() || null, state: $('fRegState').value.trim() || null, control_no: $('fCtrl').value.trim() || null, owner_role: $('fRole').value, since_year: since || null };
      // Map spot for "Deals near you": from the name search, else look the address up (OpenStreetMap).
      var addrKey = [row.address || '', row.city].join('|');
      if (st.spot && st.spot.key === addrKey) { row.lat = st.spot.lat; row.lon = st.spot.lon; }
      else if (addrKey !== [b.address || '', b.city || ''].join('|') || b.lat == null) {
        try { var gq = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' + encodeURIComponent([row.address, row.city].filter(Boolean).join(', '))); var gj = (await gq.json())[0]; if (gj) { row.lat = +gj.lat; row.lon = +gj.lon; } } catch (err) { /* the spot is a bonus */ }
      }
      var list = st.svcs.map(function (s) { var n = String(s.name || '').trim(); var pr = String(s.price || '').replace(/[^\d.]/g, ''); return n ? { name: n, price_from: pr ? Number(pr) : null } : null; }).filter(Boolean);
      $('fSave').disabled = true; msg.className = 'bz-msg'; msg.textContent = 'Saving…';
      try { await onSave(row, list); } catch (err) { msg.className = 'bz-msg bad'; msg.textContent = (err && err.message && /up to 3/.test(err.message)) ? 'You can have up to 3 business pages.' : 'That didn’t save. Please try again.'; }
      $('fSave').disabled = false;
    };
  }
  async function saveServices(id, svcs) {
    var d = await sb.from('business_services').delete().eq('business_id', id); if (d.error) throw d.error;
    if (svcs.length) { var r = await sb.from('business_services').insert(svcs.map(function (s, i) { return { business_id: id, name: s.name, price_from: s.price_from, sort: i }; })); if (r.error) throw r.error; }
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
  function chatThread(host, chat, asBusiness, title) {
    var st = { photos: [], timer: null, seen: 0 };
    host.innerHTML = '<div class="ch"><div class="ch-head"><b>' + esc(title) + '</b>' + (chat.kind === 'quote' ? '<span class="hq-tag">Quote request</span>' : '') + '</div>' +
      (chat.kind === 'quote' || chat.car ? '<div class="ch-quote">' + (chat.car ? '<b>' + esc(chat.car) + '</b>' : '') + (chat.miles != null ? ' · ' + Number(chat.miles).toLocaleString('en-US') + ' mi' : '') + (chat.topic ? '<div>' + esc(chat.topic) + '</div>' : '') + '</div>' : '') +
      '<div class="ch-list" aria-live="polite"></div>' +
      (chat.status === 'blocked' && !asBusiness ? '<div class="bz-msg bad">This business isn’t taking messages from you.</div>' :
      '<div class="ch-pics"></div>' + (asBusiness && chat.kind === 'quote' ? '<div class="ch-price"><label>Price $<input id="chP" inputmode="decimal" placeholder="129"></label><input id="chPN" maxlength="120" placeholder="What it covers / when (e.g. Today before 4 PM)"></div>' : '') +
      '<div class="ch-box"><label class="ch-add" aria-label="Add a photo">+<input type="file" accept="image/*" id="chF" hidden></label><textarea id="chT" maxlength="1000" rows="2" placeholder="' + (asBusiness ? 'Write a reply…' : 'Write a message…') + '"></textarea><button type="button" class="bz-btn" id="chGo">Send</button></div>' +
      '<p class="rv-fine">' + (asBusiness ? 'The driver’s phone and email stay private unless they share them.' : 'Only your first name shows. Don’t share card numbers or passwords.') + '</p>') +
      '<div class="bz-msg" id="chM" role="status"></div></div>';
    var $ = function (s) { return host.querySelector(s); };
    async function load() {
      var r = await sb.from('biz_messages').select('*').eq('chat_id', chat.id).order('created_at').limit(300);
      var list = r.data || []; if (list.length === st.seen && st.seen) return; st.seen = list.length;
      $('.ch-list').innerHTML = list.length ? list.map(function (m) {
        var mine = m.from_business === asBusiness;
        return '<div class="ch-m ' + (mine ? 'me' : 'them') + '">' + (m.price != null ? '<div class="ch-pr">Price: ' + money(m.price) + (m.price_note ? ' · ' + esc(m.price_note) : '') + '<small>Set by the business. Ask for a written quote.</small></div>' : '') + (m.body ? '<div>' + esc(m.body).replace(/\n/g, '<br>') + '</div>' : '') +
          ((m.photos || []).length ? '<div class="rv-pics">' + m.photos.map(function (p) { return '<a href="' + photoUrl(p) + '" target="_blank" rel="noopener"><img src="' + photoUrl(p) + '" alt="Photo" loading="lazy"></a>'; }).join('') + '</div>' : '') + '<small>' + when(m.created_at) + '</small></div>';
      }).join('') : '<p class="rv-fine">No messages yet.</p>';
      var L = $('.ch-list'); L.scrollTop = L.scrollHeight;
      sb.from('biz_chats').update(asBusiness ? { biz_seen_at: new Date().toISOString() } : { driver_seen_at: new Date().toISOString() }).eq('id', chat.id).then(function () {});
    }
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
  function startChat(host, b, kind, onOpen) {
    var st = { photos: [] }, q = kind === 'quote';
    host.innerHTML = '<div class="rv-form"><h3>' + (q ? 'Get a quote from ' : 'Message ') + esc(b.name) + '</h3><p class="rv-fine">' + (q ? 'Tell them about your car and the problem. They answer with a price here.' : 'They answer right here. Only your first name shows.') + '</p>' +
      (q ? '<div class="bz-two"><label class="bz-f"><span>Your car</span><input id="sCar" maxlength="80" placeholder="2016 Toyota Corolla"></label><label class="bz-f"><span>Miles (optional)</span><input id="sMi" inputmode="numeric" placeholder="84,000"></label></div>' : '') +
      '<label class="bz-f"><span>' + (q ? 'What’s going on?' : 'Your message') + '</span><textarea id="sB" maxlength="1000" placeholder="' + (q ? 'Tire light is on, air looks fine (35 PSI). Light stays steady.' : 'Hi! Are you open Saturday?') + '"></textarea><small>' + (q ? 'Used Carvessa’s car help? Paste your “What do I tell the mechanic?” note here.' : 'Don’t share card numbers or passwords.') + '</small></label>' +
      (q ? '<div class="bz-f"><span>Photos (optional, up to 3)</span><div class="bz-pics" id="sP"></div></div>' : '') +
      '<div class="bz-row"><button type="button" class="bz-btn" id="sGo">' + (q ? 'Send quote request' : 'Send') + '</button><button type="button" class="bz-btn soft" id="sX">Cancel</button></div><div class="bz-msg" id="sM" role="status"></div></div>';
    var $ = function (s) { return host.querySelector(s); };
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
        if (mode === 'edit' || mode === 'inbox') { next(u); return; }
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
    var NAV = [['overview', 'Home', 'home'], ['messages', 'Messages', 'msg'], ['reviews', 'Reviews', 'star'], ['page', 'My page', 'wrench'], ['posts', 'Deals and posts', 'tag'], ['sales', 'Sales', 'cash'], ['account', 'Settings', 'gear']];
    account(async function (u) {
      root.querySelector('#bzAcct').hidden = true;
      var r = await sb.from('businesses').select(MINE).eq('owner', u.id).order('created_at');
      var pages = r.data || [];
      if (!pages.length) { root.querySelector('#bzAcct').hidden = false; root.querySelector('#bzAcct').innerHTML = '<div class="bz-sec">Signed in as <b>' + esc(u.email) + '</b>. You don’t have a business page yet. <a href="/business/join/">Create your free page</a></div>'; return; }
      var cur = pages[0], tab = 'overview';
      var shell = document.createElement('div'); shell.className = 'hq'; root.innerHTML = ''; root.appendChild(shell); root.classList.add('hq-wrap');
      function look() { var l = cur.hq_look || 'racing'; shell.setAttribute('data-look', LOOKS.some(function (x) { return x[0] === l; }) ? l : 'racing'); }
      var counts = { msg: 0, rev: 0 };
      function go(t, extra) { tab = t; frame(extra); }
      function frame(extra) {
        look();
        var badge = function (k) { var n = k === 'messages' ? counts.msg : k === 'reviews' ? counts.rev : 0; return '<span class="hq-badge" data-b="' + k + '"' + (n ? '' : ' hidden') + '>' + (n || '') + '</span>'; };
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
          '<nav class="hq-tabs" aria-label="Business HQ">' + [['overview', 'Home', 'home'], ['messages', 'Messages', 'msg'], ['posts', 'Deals', 'tag'], ['reviews', 'Reviews', 'star'], ['more', 'More', 'gear']].map(function (n) { var on = n[0] === tab || (n[0] === 'more' && ['page', 'sales', 'account'].indexOf(tab) >= 0); return '<button type="button" data-tab="' + n[0] + '" class="' + (on ? 'on' : '') + '">' + icon(n[2], 20) + '<span>' + n[1] + '</span>' + badge(n[0]) + '</button>'; }).join('') + '</nav>' +
          '<div class="hq-more" id="hqMore" hidden>' + [['page', 'My page', 'wrench'], ['sales', 'Sales', 'cash'], ['account', 'Settings', 'gear'], ['account:hqIdea', 'Send us an idea', 'msg']].map(function (n) { return '<button type="button" data-tab="' + n[0] + '">' + icon(n[2], 18) + n[1] + '</button>'; }).join('') + '<a href="' + pub + '" target="_blank" rel="noopener">' + icon('globe', 18) + 'View my page</a></div>';
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
        shell.querySelector('#hqBell').onclick = function () { go(counts.msg ? 'messages' : counts.rev ? 'reviews' : 'overview'); };
        var pk = shell.querySelector('#hqPick'); if (pk && pk.tagName === 'SELECT') pk.onchange = function () { cur = pages[+pk.value]; tab = 'overview'; frame(); };
        Promise.all([
          sb.from('biz_chats').select('last_at, biz_seen_at').eq('business_id', cur.id).limit(200),
          sb.from('business_reviews').select('id', { count: 'exact', head: true }).eq('business_id', cur.id).eq('status', 'visible').is('reply', null)
        ]).then(function (r) {
          counts.msg = (r[0].data || []).filter(function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; }).length; counts.rev = r[1].count || 0;
          [].forEach.call(shell.querySelectorAll('[data-b]'), function (el) { var n = el.getAttribute('data-b') === 'messages' ? counts.msg : el.getAttribute('data-b') === 'reviews' ? counts.rev : 0; el.hidden = !n; el.textContent = n || ''; });
          var bn = shell.querySelector('#hqBellN'), n = counts.msg + counts.rev; bn.hidden = !n; bn.textContent = n;
        });
        var body = shell.querySelector('#hqBody');
        if (tab === 'messages') messages(body, extra); else ({ overview: overview, page: myPage, posts: posts, sales: sales, reviews: reviews, account: settings })[tab](body, extra);
        var y = shell.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
      }
      function head(k, title, badge) { return '<small class="hq-k">' + k + '</small><h2 class="hq-h">' + title + (badge ? ' <em>' + badge + '</em>' : '') + '</h2>'; }
      var sparkline = function (pts) {
        var m = Math.max.apply(null, pts.concat([1])), w = 100;
        return '<svg class="hq-spark" viewBox="0 0 ' + w + ' 30" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="2.2" vector-effect="non-scaling-stroke" points="' + pts.map(function (v, i) { return (i * w / Math.max(1, pts.length - 1)).toFixed(1) + ',' + (28 - 24 * v / m).toFixed(1); }).join(' ') + '"/></svg>';
      };
      var CITY = '<svg class="hq-city" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V60h20V40h14v20h12V30h18v30h10V50h16v40h12V45h20v45h8V35h22v55h10V55h16v35h14V25h20v65h10V50h18v40h12V40h24v50h16V58h20v32z" fill="rgba(255,255,255,.08)"/></svg>';
      async function sharePage() {
        var url = 'https://carvessa.app/shops/?b=' + encodeURIComponent(cur.slug);
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
          '<div class="hq-hb"><a class="hq-w" href="/shops/?b=' + encodeURIComponent(cur.slug) + '" target="_blank" rel="noopener">' + icon('globe', 16) + 'View my page</a><button type="button" class="hq-w ghost" id="hqShare">' + icon('share', 16) + 'Share my page</button></div>' + CITY + '</section>' +
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
      async function myPage(el, focus) {
        el.innerHTML = head('MY PAGE', 'What drivers see') + '<p class="hq-fine">Changing your name, address or phone sends your page to us for a quick check.</p><div id="hqForm"></div>';
        var s = await sb.from('business_services').select('*').eq('business_id', cur.id).order('sort');
        form(cur, s.data || [], async function (row, svcs) {
          var x = await sb.from('businesses').update(row).eq('id', cur.id).select(MINE).single(); if (x.error) throw x.error;
          await saveServices(cur.id, svcs);
          var was = cur.status; Object.assign(cur, x.data);
          var m = el.querySelector('#fMsg'); m.className = 'bz-msg good';
          m.textContent = cur.status === 'pending' && was === 'live' ? 'Saved. You changed your name, address or phone, so we’ll check it again before it shows.' : 'Saved.';
          var pkEl = shell.querySelector('a.hq-pick'); if (pkEl) pkEl.firstChild.textContent = cur.name;
        }, el.querySelector('#hqForm'));
        if (focus) setTimeout(function () { var f = el.querySelector('#' + focus); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (f.focus && /INPUT|TEXTAREA/.test(f.tagName)) f.focus(); } }, 200);
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
          '<div class="hq-card"><h4>CHECK A COUNTER CODE</h4><div class="cc-row"><input id="ccIn" maxlength="14" placeholder="TONY-4821" autocapitalize="characters" aria-label="Counter code"><button type="button" class="bz-btn" id="ccGo">Mark used</button></div><div class="bz-msg" id="ccM" role="status"></div><p class="hq-fine">A driver shows a code on their phone. Type it here so you know the customer came from Carvessa.</p></div>' +
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
        $('ccGo').onclick = async function () {
          var c = $('ccIn').value.trim(), m = $('ccM'); m.className = 'bz-msg bad';
          if (c.length < 4) { m.textContent = 'Type the code from the driver’s phone.'; return; }
          var x = await sb.rpc('deal_code_use', { b: cur.id, c: c });
          if (x.error) { m.textContent = 'That didn’t work. Please try again.'; return; }
          var d = x.data;
          if (d.ok) { m.className = 'bz-msg good'; m.textContent = '✓ Good code for “' + d.title + '”. Marked used.' + (d.expired ? ' Note: this deal has ended, so it’s your call.' : ''); $('ccIn').value = ''; }
          else m.textContent = d.why === 'used' ? 'This code was already used on ' + new Date(d.used_at).toLocaleDateString('en-US') + ' (“' + d.title + '”).' : 'We can’t find that code. Check the letters and numbers.';
        };
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
        if (openId) open(openId);
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
          '<div class="hq-card"><h4>PICK HOW BUSINESS HQ LOOKS</h4><p class="hq-fine">Only changes what you see here. Your public page keeps its own header and logo.</p><div class="hq-looks">' +
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
        el.querySelector('.hq-looks').onclick = async function (e) {
          var b = e.target.closest('button[data-l]'); if (!b) return;
          var l = b.getAttribute('data-l'), x = await sb.from('businesses').update({ hq_look: l }).eq('id', cur.id);
          if (x.error) { el.querySelector('#lM').className = 'bz-msg bad'; el.querySelector('#lM').textContent = 'That didn’t save.'; return; }
          cur.hq_look = l; frame();
        };
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
    });
    return;
  }

  // ---------- Shops I follow (drivers) + one-tap stop links from follower emails ----------
  if (mode === 'following') {
    var box = root.querySelector('#bzFol');
    if (q.get('stop') && q.get('u') && q.get('t')) {
      box.innerHTML = '<div class="bz-sec">One moment…</div>';
      fetch(C.url + '/functions/v1/biz-alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stop: q.get('stop') === 'unfollow' ? 'unfollow' : 'email', u: q.get('u'), b: q.get('b'), t: q.get('t') }) })
        .then(function (r) { return r.json(); }).then(function (d) {
          box.innerHTML = d.ok ? '<div class="bz-sec"><h3>Done</h3>' + (q.get('stop') === 'unfollow' ? 'You don’t follow ' + esc(d.name) + ' anymore.' : 'No more emails from ' + esc(d.name) + '. You still follow them in the app.') + '</div><div class="bz-row"><a class="bz-btn soft" href="/following/">See all shops I follow</a></div>' : '<div class="bz-sec">' + esc(d.why || 'This link is not valid') + '. Log in below to change your settings.</div>';
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
      var sum = function (f) { var muted = f.muted_until && f.muted_until > new Date().toISOString(); return muted ? 'Muted until ' + new Date(f.muted_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : [f.deals ? 'Deals' : null, f.news ? 'news' : null].filter(Boolean).join(' + ') + ' · ' + [f.push ? 'phone' : null, f.email ? 'email' : null].filter(Boolean).join(' + ') || 'In the app only'; };
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
        '<div class="fy-foot"><span class="fy-logo">CAR<i>V</i>essa</span><span>Car trouble? Free help in English and Spanish.</span><span>carvessa.app/shops/?b=' + esc(b.slug) + '</span></div></div>';
    })();
    return;
  }

  // ---------- Public page (picture 283 look, 284 deals, 285 follow) ----------
  if (mode === 'shop') {
    (async function () {
      var slug = q.get('b') || '';
      var r = slug ? await sb.from('businesses').select(PUB).eq('slug', slug).maybeSingle() : { data: null };
      var b = r.data;
      if (!b) { root.innerHTML = '<div class="bz"><h1>This page isn’t available</h1><p class="lead">It may be waiting for our check, or the link is wrong.</p><a class="bz-btn" href="/partners/">For businesses</a></div>'; return; }
      var [s, ps, rv, me, fc] = await Promise.all([
        sb.from('business_services').select('name, price_from, note').eq('business_id', b.id).order('sort'),
        sb.from('business_posts').select('id, kind, template, title, body, price, fine, who, until, codes, created_at').eq('business_id', b.id).order('created_at', { ascending: false }).limit(20),
        sb.rpc('business_reviews_public', { b: b.id }),
        sb.auth.getSession(),
        sb.rpc('business_followers', { b: b.id })
      ]);
      var reviews = rv.data || [], user = me.data.session && me.data.session.user, isOwner = user && user.id === b.owner;
      var avg = reviews.length ? reviews.reduce(function (a, x) { return a + x.stars; }, 0) / reviews.length : 0;
      var svcs = s.data || [], posts = (ps.data || []).filter(function (p) { return !p.until || p.until >= today(); });
      var deals = posts.filter(function (p) { return p.kind === 'special'; }), news = posts.filter(function (p) { return p.kind !== 'special'; });
      var nFol = fc.data || 0, myFollow = null;
      if (user && !isOwner) myFollow = (await sb.from('business_follows').select('*').eq('business_id', b.id).eq('user_id', user.id).maybeSingle()).data;
      var info = KINFO[b.kind] || KINFO.other, hv = headerOf(b), openState = openNow(b.hours);
      document.title = b.name + ' · Carvessa';
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
      var tabsList = [['ov', 'Overview'], deals.length ? ['deals', 'Deals · ' + deals.length] : null, svcs.length ? ['svc', 'Services'] : null, ['reviews', 'Reviews'], (b.photos || []).length ? ['photos', 'Photos'] : null].filter(Boolean);
      root.innerHTML =
        '<div class="sp-hero" style="background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(0,0,0,.62)),' + hv.css.replace(/"/g, "'") + '"><div class="sp-id">' + logoHtml(b, 'sp-lo') + '<div><h1>' + esc(b.name) + '</h1><span>' + esc(kindName(b.kind)) + (b.city ? ' · ' + esc(b.city) : '') + '</span></div></div>' + (hv.credit ? '<a class="shop-credit" href="' + esc(hv.credit[1]) + '" target="_blank" rel="noopener nofollow">Photo: ' + esc(hv.credit[0]) + ' · CC BY</a>' : '') + '</div>' +
        (!live ? '<div class="shop-pre">Preview: only you can see this page. It goes live after we confirm you’re the owner (we’ll call or text you).</div>' : '') +
        '<div class="sp-acts">' + (talk ? followBtn() + (QUOTE_KINDS[b.kind] ? '<button type="button" class="sp-btn soft" data-chat-kind="quote">' + icon('msg', 16) + 'Get a quote</button>' : '<button type="button" class="sp-btn soft" data-chat-kind="message">' + icon('msg', 16) + msgWord + '</button>') : '') + (isOwner ? '<a class="sp-btn" href="/business/edit/">' + icon('wrench', 16) + 'Edit my page</a>' : '') + '<button type="button" class="sp-btn soft" id="spShare" aria-label="Share this page">' + icon('share', 16) + '<span>Share</span></button></div>' +
        (isOwner ? '<p class="sp-own">This is your page. Drivers also see Follow, Message and Get a quote here.</p>' : '') +
        (live ? '<p class="sp-fol" id="spFol">' + nFol + ' driver' + (nFol === 1 ? '' : 's') + ' follow' + (nFol === 1 ? 's' : '') + ' this shop' + (myFollow ? ' · you get their deals first' : ' · follow to get their deals first') + '</p>' : '') +
        '<div class="sp-chips">' + (live ? '<span class="v">' + icon('check', 14) + 'Verified by Carvessa</span>' : '') + (reviews.length ? '<a href="#reviews">' + starRow(Math.round(avg)) + ' ' + avg.toFixed(1) + ' (' + reviews.length + ')</a>' : '') + (openState ? '<a href="#hours" class="' + (openState.open ? 'open' : 'closed') + '">' + icon('home', 14) + esc(openState.text) + '</a>' : b.hours ? '<a href="#hours">' + icon('home', 14) + 'See hours</a>' : '') + '</div>' +
        '<div id="fwBox"></div><div id="chBox"></div>' +
        '<nav class="sp-tabs" aria-label="Sections">' + tabsList.map(function (t, i) { return '<a href="#' + t[0] + '" class="' + (i === 0 ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</nav>' +
        '<section id="ov">' +
          (b.hours ? '<div class="shop-card sp-hours" id="hours"><h2>Hours' + (openState ? ' <span class="' + (openState.open ? 'open' : 'closed') + '">' + esc(openState.text) + '</span>' : '') + '</h2>' + b.hours.split(/\s*·\s*|\s*;\s*|\n/).filter(Boolean).map(function (h) { return '<div class="sp-hr">' + esc(h) + '</div>'; }).join('') + '<div class="shop-note">Hours set by the business. Holidays can change them.</div></div>' : '') +
          (b.offer ? '<div class="sp-offer"><small>OFFER</small><b>' + esc(b.offer) + '</b><span>Show this page at the counter</span></div>' : '') +
          (deals[0] ? '<a class="sp-offer deal" href="#deal-' + deals[0].id + '"><small>' + tplOf(deals[0]).k + ' · ' + endText(deals[0]).toUpperCase() + '</small><b>' + esc(deals[0].title) + (deals[0].price != null ? ' · ' + money(deals[0].price) : '') + '</b><span>' + (deals[0].codes ? 'Get your counter code below' : 'See the deal below') + '</span></a>' : '') +
          news.map(function (p) { return '<div class="shop-card shop-post"><span class="hq-tag">' + (KP[p.kind] || 'News') + '</span><h2>' + esc(p.title) + '</h2>' + (p.body ? esc(p.body) : '') + (p.until ? '<div class="shop-note">Until ' + shortDay(p.until) + '</div>' : '') + '</div>'; }).join('') +
          (info.tip ? '<div class="shop-card shop-tip"><h2>' + info.tip[0] + '</h2>' + info.tip[1] + '</div>' : '') +
          (b.about ? '<div class="shop-card"><h2>About</h2>' + esc(b.about) + '</div>' : '') +
          '<div class="shop-card"><div class="shop-kv">' + (b.address ? '<span>Address</span><div>' + esc(b.address) + (b.city ? ', ' + esc(b.city) : '') + ' · <a href="' + maps + '" target="_blank" rel="noopener" data-c="directions">Directions</a></div>' : '') + (b.phone ? '<span>Phone</span><div><a href="tel:' + esc(tel) + '" data-c="call">' + esc(b.phone) + '</a></div>' : '') + (b.hours ? '<span>Hours</span><div>' + esc(b.hours) + '</div>' : '') + (web ? '<span>Website</span><div><a href="' + esc(web) + '" target="_blank" rel="noopener nofollow" data-c="website">' + esc(b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a></div>' : '') + '</div></div>' +
        '</section>' +
        (deals.length ? '<section id="deals"><h2 class="sp-h">Deals</h2>' + deals.map(dealHtml).join('') + '<p class="shop-note">Deals are set by the business. Ask for a written quote.</p></section>' : '') +
        (svcs.length ? '<section id="svc"><div class="shop-card"><h2>' + info.svc + '</h2>' + svcs.map(function (x) { return '<div class="shop-svc"><span>' + esc(x.name) + '</span><b>' + (x.price_from != null ? 'from ' + money(x.price_from) : 'Ask') + '</b></div>'; }).join('') + '<div class="shop-note">' + (b.kind === 'credit_union' ? 'Set by the credit union. Not an offer from Carvessa.' : 'Prices set by the business. Ask for a written quote.') + '</div></div></section>' : '') +
        '<section id="reviews"><div class="shop-card"><h2>Reviews' + (reviews.length ? ' <span class="rv-sum">' + avg.toFixed(1) + ' · ' + reviews.length + '</span>' : '') + '</h2>' + (reviews.length ? '<div class="sp-bars">' + bars + '</div>' : '') + '<p class="rv-fine">From Carvessa members. Only first names show. <a href="/business/review-rules/" target="_blank">Review Rules</a></p>' +
          (talk ? '<div class="bz-row" style="margin:6px 0 10px"><button type="button" class="bz-btn bz-small" id="rvWrite">Write a review</button></div><div id="rvBox"></div>' : '') +
          (reviews.length ? reviews.slice(0, 20).map(function (x) {
            return '<div class="rv-item" data-id="' + x.id + '"><div class="rv-top">' + starRow(x.stars) + '<b>' + esc(x.first_name) + '</b><small>' + ago(x.created_at) + '</small></div>' + (x.body ? '<p>' + esc(x.body) + '</p>' : '') +
              ((x.photos || []).length ? '<div class="rv-pics">' + x.photos.map(function (p) { return '<img src="' + photoUrl(p) + '" alt="Photo from ' + esc(x.first_name) + '" loading="lazy">'; }).join('') + '</div>' : '') +
              (x.reply ? '<div class="rv-reply"><b>Reply from ' + esc(b.name) + '</b>' + esc(x.reply) + '</div>' : '') +
              '<button type="button" class="rv-flag" data-flag="' + x.id + '">Report</button><div class="rv-rep-box"></div></div>';
          }).join('') : '<p>' + (live ? 'No reviews yet. Been here? Be the first.' : 'Reviews start when the page is live.') + '</p>') + '</div></section>' +
        ((b.photos || []).length ? '<section id="photos"><div class="shop-card"><h2>Photos</h2><div class="shop-pics">' + b.photos.map(function (p, i) { return '<img src="' + photoUrl(p) + '" alt="' + esc(b.name) + ' photo ' + (i + 1) + '" loading="lazy">'; }).join('') + '</div></div></section>' : '') +
        '<p class="shop-note" style="margin-top:14px">Carvessa doesn’t rank businesses by who pays. Reviews are never removed for being negative or because a business pays. Paid spots in the app are always labeled. Is this your business? <a href="/business/edit/">Open Business HQ</a></p>' +
        '<div class="sp-bar">' + (live ? '<button type="button" class="sp-b pr" data-chat-kind="message">' + icon('msg', 18) + 'Message</button>' : '') + (tel ? '<a class="sp-b" href="tel:' + esc(tel) + '" data-c="call">' + icon('phone', 18) + (b.kind === 'tow' ? 'Call now' : 'Call') + '</a>' : '') + '<a class="sp-b" href="' + maps + '" target="_blank" rel="noopener" data-c="directions">' + icon('pin', 18) + 'Go</a></div>';
      root.classList.add('sp-has-bar');
      root.addEventListener('click', function (e) { var a = e.target.closest('[data-c]'); if (a) count(a.getAttribute('data-c')); });
      // Tabs follow the scroll.
      var tabs = root.querySelector('.sp-tabs');
      var secs = tabsList.map(function (t) { return root.querySelector('#' + t[0]); });
      window.addEventListener('scroll', function () { var y = tabs.getBoundingClientRect().bottom + 10, on = 0; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) on = i; }); [].forEach.call(tabs.children, function (a, i) { a.classList.toggle('on', i === on); }); }, { passive: true });
      root.querySelector('#spShare').onclick = async function () {
        var url = 'https://carvessa.app/shops/?b=' + encodeURIComponent(b.slug);
        if (navigator.share) { try { await navigator.share({ title: b.name, url: url }); } catch (err) { /* closed */ } return; }
        try { await navigator.clipboard.writeText(url); this.querySelector('.sp-hide').textContent = 'Link copied'; } catch (err) { prompt('Copy this link:', url); }
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
        var k = e.target.closest('[data-chat-kind]'); if (!k) return; k = k.getAttribute('data-chat-kind');
        var box = root.querySelector('#chBox');
        signedIn(box, async function (u) {
          if (u.id === b.owner) { box.innerHTML = '<div class="bz-msg bad">You can’t message your own business.</div>'; return; }
          var open = (await sb.from('biz_chats').select('*').eq('business_id', b.id).eq('driver', u.id).neq('status', 'blocked').order('last_at', { ascending: false }).limit(1)).data;
          var show = function (c) { chatThread(box, c, false, b.name); var a = document.createElement('p'); a.className = 'rv-fine'; a.innerHTML = '<a href="/messages/">See all my messages ›</a>'; box.appendChild(a); };
          if (open && open.length && k === 'message') show(open[0]); else startChat(box, b, k, show);
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
      // A shared deal link (?deal=…) jumps to that deal.
      var dq = q.get('deal'), dEl = dq && root.querySelector('#deal-' + CSS.escape(dq));
      if (dEl) setTimeout(function () { dEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); dEl.classList.add('hl'); }, 300);
    })();
  }
})();
