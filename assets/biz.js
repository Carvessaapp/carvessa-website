// Business pages (pictures 269–281, Nov 18–19, 2026): join (agree → account → page), Business HQ (the owner's
// private dashboard) and the public page. Talks to Supabase with the public key; the database rules decide what
// each person may read or change (migrations 026–028: pages start 'pending', only Carvessa makes them live).
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
    ['racing', 'Carvessa Racing', 'Today’s design', '#0F1B33', '#F4F6FA', '#1F5FBF', '#E63B2E'],
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
  var MINE = PUB + ', legal_name, control_no, owner_role, since_year, hq_look';
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
            var p = hits[+btn.getAttribute('data-i')].properties; box.hidden = true; st.picked = p.name;
            var info = { name: p.name, address: [p.housenumber, p.street].filter(Boolean).join(' '), city: [p.city || p.county, STATES[(p.state || '').toLowerCase()] || p.state].filter(Boolean).join(', '), kind: OSMKIND[p.osm_value] };
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
      function draw() {
        box.innerHTML = '<div class="bz-tabs"><button type="button" data-tab="join" class="' + (tab === 'join' ? 'on' : '') + '">Create account</button><button type="button" data-tab="login" class="' + (tab === 'login' ? 'on' : '') + '">Log in</button></div>' +
          '<p class="lead" style="font-size:15px">' + (tab === 'join' ? 'Your page belongs to this account. Use an email you check.' : 'Use the email and password of your Carvessa account.') + '</p>' +
          '<label class="bz-f"><span>Email</span><input id="aEmail" type="email" autocomplete="email" inputmode="email"></label>' +
          '<label class="bz-f"><span>Password' + (tab === 'join' ? ' (8 or more characters)' : '') + '</span><input id="aPw" type="password" autocomplete="' + (tab === 'join' ? 'new-password' : 'current-password') + '"></label>' +
          '<div class="bz-row"><button class="bz-btn" id="aDo">' + (tab === 'join' ? 'Create account' : 'Log in') + '</button></div><div class="bz-msg" id="aMsg" role="status"></div>';
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
    var NAV = [['overview', 'Overview', 'Lap report'], ['page', 'My page', 'Garage setup'], ['posts', 'Posts', 'Bulletin'], ['sales', 'Sales', 'From Carvessa'], ['reviews', 'Reviews', 'From the stands'], ['messages', 'Messages', 'Team radio'], ['account', 'Account', 'Look and settings']];
    account(async function (u) {
      root.querySelector('#bzAcct').hidden = true;
      var r = await sb.from('businesses').select(MINE).eq('owner', u.id).order('created_at');
      var pages = r.data || [];
      if (!pages.length) { root.querySelector('#bzAcct').hidden = false; root.querySelector('#bzAcct').innerHTML = '<div class="bz-sec">Signed in as <b>' + esc(u.email) + '</b>. You don’t have a business page yet. <a href="/business/join/">Create your free page</a></div>'; return; }
      var cur = pages[0], tab = 'overview';
      var shell = document.createElement('div'); shell.className = 'hq'; root.innerHTML = ''; root.appendChild(shell); root.classList.add('hq-wrap');
      function look() { var l = cur.hq_look || 'racing'; shell.setAttribute('data-look', LOOKS.some(function (x) { return x[0] === l; }) ? l : 'racing'); }
      function frame() {
        look();
        shell.innerHTML = '<aside class="hq-side"><div class="hq-brand"><i class="hq-flag"></i><span>CAR<b>V</b>essa</span></div><div class="hq-sub">BUSINESS HQ</div>' +
          (pages.length > 1 ? '<select class="hq-pick" id="hqPick" aria-label="Your pages">' + pages.map(function (p, i) { return '<option value="' + i + '"' + (p === cur ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>' : '') +
          '<div class="hq-biz"><b>' + esc(cur.name) + '</b><small>' + esc(kindName(cur.kind)) + '</small><span class="hq-st ' + esc(cur.status) + '">' + (STATUS[cur.status] || cur.status) + '</span></div>' +
          '<nav class="hq-nav">' + NAV.map(function (n) { return '<button type="button" data-tab="' + n[0] + '" class="' + (tab === n[0] ? 'on' : '') + '">' + n[1] + (n[0] === 'messages' ? '<span class="hq-badge" id="hqMsgN" hidden></span>' : '') + '<small>' + n[2] + '</small></button>'; }).join('') + '</nav>' +
          '<a class="hq-link" href="/shops/?b=' + encodeURIComponent(cur.slug) + '" target="_blank" rel="noopener">View my public page ↗</a><button type="button" class="hq-link" id="hqOut">Log out</button></aside>' +
          '<main class="hq-main"><div class="hq-band"></div><div id="hqBody"></div></main>';
        shell.querySelector('.hq-nav').onclick = function (e) { var b = e.target.closest('button[data-tab]'); if (b) { tab = b.getAttribute('data-tab'); frame(); } };
        shell.querySelector('#hqOut').onclick = function () { sb.auth.signOut().then(function () { location.reload(); }); };
        var pk = shell.querySelector('#hqPick'); if (pk) pk.onchange = function () { cur = pages[+pk.value]; tab = 'overview'; frame(); };
        sb.from('biz_chats').select('last_at, biz_seen_at').eq('business_id', cur.id).limit(200).then(function (r) { var n = (r.data || []).filter(function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; }).length, bd = shell.querySelector('#hqMsgN'); if (bd && n) { bd.hidden = false; bd.textContent = n; } });
        ({ overview: overview, page: myPage, posts: posts, sales: sales, reviews: reviews, messages: messages, account: settings })[tab](shell.querySelector('#hqBody'));
        var y = shell.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
      }
      function head(k, title, badge) { return '<small class="hq-k">' + k + '</small><h2 class="hq-h">' + title + (badge ? ' <em>' + badge + '</em>' : '') + '</h2>'; }
      async function overview(el) {
        var since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
        var [s, ps, sl] = await Promise.all([
          sb.from('business_stats').select('kind, n, day').eq('business_id', cur.id).gte('day', since),
          sb.from('business_posts').select('title, until').eq('business_id', cur.id).order('created_at', { ascending: false }).limit(1),
          sb.from('business_sales').select('amount').eq('business_id', cur.id).gte('day', since)
        ]);
        var t = { view: 0, call: 0, directions: 0, website: 0 }; (s.data || []).forEach(function (x) { t[x.kind] = (t[x.kind] || 0) + x.n; });
        var sales = sl.data || [], total = sales.reduce(function (a, x) { return a + (Number(x.amount) || 0); }, 0);
        var svc = await sb.from('business_services').select('id', { count: 'exact', head: true }).eq('business_id', cur.id);
        var rvs = await sb.from('business_reviews').select('id', { count: 'exact', head: true }).eq('business_id', cur.id).eq('status', 'visible').is('reply', null);
        var chs = await sb.from('biz_chats').select('last_at, biz_seen_at').eq('business_id', cur.id).limit(200);
        var newMsg = (chs.data || []).filter(function (c) { return !c.biz_seen_at || c.last_at > c.biz_seen_at; }).length;
        var todo = [];
        if (newMsg) todo.push(['Answer ' + newMsg + ' message' + (newMsg > 1 ? 's' : ''), 'Drivers are waiting on you.', 'messages']);
        if (rvs.count > 0) todo.push(['Reply to ' + rvs.count + ' review' + (rvs.count > 1 ? 's' : ''), 'A short thank-you shows drivers you care.', 'reviews']);
        if (cur.status === 'pending') todo.push(['Answer our call or text', 'We confirm you’re the owner, then your page goes live.']);
        if (!cur.hours) todo.push(['Add your hours', 'Drivers check if you’re open before they come.']);
        if (!(svc.count > 0)) todo.push(['Add services and prices', 'Pages with prices get more calls.']);
        if (!(cur.photos || []).length) todo.push(['Add a photo', 'Your shop, your work or your team.']);
        if (!cur.offer) todo.push(['Add one offer', 'Like “Free tire check”. It shows at the top of your page.']);
        if (!(ps.data || []).length) todo.push(['Post a special or news', 'Tell drivers what’s new this week.']);
        el.innerHTML = head('LAP REPORT · LAST 30 DAYS', esc(cur.name), STATUS[cur.status] || cur.status) +
          (cur.status !== 'live' ? '<div class="hq-note">' + (cur.status === 'pending' ? 'Your page is waiting for our check. Only you can see it. We’ll call or text you at ' + esc(cur.phone || 'your number') + ' to confirm you’re the owner.' : 'Your page isn’t showing to drivers right now. Questions? Write to hello@carvessa.app.') + '</div>' : '') +
          '<div class="hq-laps">' + [['VIEWS', t.view], ['CALLS', t.call], ['DIRECTIONS', t.directions], ['WEBSITE', t.website]].map(function (x) { return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
          (cur.status !== 'live' ? '<p class="hq-fine">Counts start when your page is live. Your own visits never count.</p>' : '<p class="hq-fine">Counts only, never names. Your own visits never count.</p>') +
          '<div class="hq-two"><div class="hq-card"><h4>PIT STOP · TO DO</h4>' + (todo.length ? todo.slice(0, 5).map(function (x, i) { return '<div class="hq-pit"' + (x[2] ? ' data-go="' + x[2] + '" style="cursor:pointer"' : '') + '><b>' + String(i + 1).padStart(2, '0') + '</b><div>' + x[0] + '<small>' + x[1] + '</small></div></div>'; }).join('') : '<p>All set. Nice work.</p>') + '</div>' +
          '<div class="hq-card"><h4>SALES FROM CARVESSA</h4><div class="hq-big">' + money(total || 0) + '</div><small>' + sales.length + ' customer' + (sales.length === 1 ? '' : 's') + ' you marked in the last 30 days · you reported</small><div class="bz-row"><button type="button" class="bz-btn bz-small" data-go="sales">Mark a customer</button></div></div></div>' +
          '<div class="hq-card"><h4>YOUR PLAN</h4>Free during our launch. Your page, reviews and messages stay free. We’ll tell you in writing before any paid option, and you can always say no.</div>';
        el.onclick = function (e) { var t = e.target.closest('[data-go]'); if (t) { tab = t.getAttribute('data-go'); frame(); } };
      }
      async function myPage(el) {
        el.innerHTML = head('GARAGE SETUP', 'My page') + '<p class="hq-fine">Changing your name, address or phone sends your page to us for a quick check.</p><div id="hqForm"></div>';
        var s = await sb.from('business_services').select('*').eq('business_id', cur.id).order('sort');
        form(cur, s.data || [], async function (row, svcs) {
          var x = await sb.from('businesses').update(row).eq('id', cur.id).select(MINE).single(); if (x.error) throw x.error;
          await saveServices(cur.id, svcs);
          var was = cur.status; Object.assign(cur, x.data);
          var m = el.querySelector('#fMsg'); m.className = 'bz-msg good';
          m.textContent = cur.status === 'pending' && was === 'live' ? 'Saved. You changed your name, address or phone, so we’ll check it again before it shows.' : 'Saved. Box box!';
          shell.querySelector('.hq-biz b').textContent = cur.name;
        }, el.querySelector('#hqForm'));
      }
      async function posts(el) {
        var r = await sb.from('business_posts').select('*').eq('business_id', cur.id).order('created_at', { ascending: false });
        var list = r.data || [], KN = { special: 'Special', news: 'News', event: 'Event', hours: 'Hours change' }, kind = 'special';
        el.innerHTML = head('BULLETIN BOARD', 'Posts') + '<p class="hq-fine">Specials, news, events or hours changes show on your page.' + (cur.status !== 'live' ? ' Drivers see them once your page is live.' : '') + '</p>' +
          '<div class="hq-card"><div class="bz-chips" id="pK">' + Object.keys(KN).map(function (k) { return '<button type="button" data-k="' + k + '" class="' + (k === kind ? 'on' : '') + '">' + KN[k] + '</button>'; }).join('') + '</div>' +
          '<label class="bz-f"><span>Title</span><input id="pT" maxlength="80" placeholder="Winter tire check: free this week"></label><label class="bz-f"><span>Details (optional)</span><textarea id="pB" maxlength="300" placeholder="Cold nights drop tire pressure. Stop by for a free check, no appointment."></textarea></label>' +
          '<label class="bz-f"><span>Show until (optional)</span><input id="pU" type="date"></label><div class="bz-row"><button type="button" class="bz-btn" id="pGo">Post it</button></div><div class="bz-msg" id="pM" role="status"></div></div>' +
          '<div id="pL">' + (list.length ? list.map(function (p) { var old = p.until && p.until < new Date().toISOString().slice(0, 10); return '<div class="hq-post' + (old ? ' old' : '') + '"><span class="hq-tag">' + (KN[p.kind] || 'Post') + '</span><b>' + esc(p.title) + '</b>' + (p.body ? '<p>' + esc(p.body) + '</p>' : '') + '<small>' + (p.until ? (old ? 'Ended ' : 'Until ') + esc(p.until) : 'No end date') + '</small><button type="button" class="bz-btn red bz-small" data-del="' + p.id + '">Delete</button></div>'; }).join('') : '<p class="hq-fine">No posts yet.</p>') + '</div>';
        el.querySelector('#pK').onclick = function (e) { var k = e.target.getAttribute('data-k'); if (k) { kind = k; [].forEach.call(this.children, function (b) { b.className = b.getAttribute('data-k') === k ? 'on' : ''; }); } };
        el.querySelector('#pGo').onclick = async function () {
          var t = el.querySelector('#pT').value.trim(), m = el.querySelector('#pM'); m.className = 'bz-msg bad';
          if (t.length < 2) { m.textContent = 'Please type a title.'; return; }
          var x = await sb.from('business_posts').insert({ business_id: cur.id, kind: kind, title: t, body: el.querySelector('#pB').value.trim() || null, until: el.querySelector('#pU').value || null });
          if (x.error) { m.textContent = /20 posts/.test(x.error.message) ? 'You can keep up to 20 posts. Delete an old one first.' : 'That didn’t post. Please try again.'; return; }
          posts(el);
        };
        el.querySelector('#pL').onclick = async function (e) { var id = e.target.getAttribute('data-del'); if (id && confirm('Delete this post?')) { await sb.from('business_posts').delete().eq('id', id); posts(el); } };
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
      function settings(el) {
        var sug = SUGGEST[cur.kind];
        el.innerHTML = head('ACCOUNT', 'Look and settings') +
          '<div class="hq-card"><h4>PICK HOW BUSINESS HQ LOOKS</h4><p class="hq-fine">Only changes what you see here. Your public page keeps its own header and logo.</p><div class="hq-looks">' +
          LOOKS.map(function (l) { return '<button type="button" data-l="' + l[0] + '" class="' + ((cur.hq_look || 'racing') === l[0] ? 'on' : '') + '"><span class="sp"><i style="background:' + l[3] + '"></i><i style="background:' + l[4] + '"></i><i style="background:' + l[5] + '"></i><i style="background:' + l[6] + '"></i></span><b>' + l[1] + '</b><small>' + (l[0] === 'racing' ? 'Default' : l[0] === sug ? 'Suggested for you' : l[2]) + '</small></button>'; }).join('') + '</div><div class="bz-msg" id="lM" role="status"></div></div>' +
          '<div class="hq-card"><h4>LOGIN</h4>Signed in as <b>' + esc(u.email) + '</b>.<div class="bz-row"><a class="bz-btn soft bz-small" href="/business/terms/" target="_blank">Partner Terms</a><a class="bz-btn soft bz-small" href="mailto:hello@carvessa.app?subject=' + encodeURIComponent('Question about ' + cur.name) + '">Ask Carvessa a question</a></div><p class="hq-fine">You agreed to the Partner Terms version ' + esc(cur.terms_version || '') + (cur.agreed_at ? ' on ' + esc(new Date(cur.agreed_at).toLocaleDateString('en-US')) : '') + '.</p></div>' +
          '<div class="hq-card hq-red"><h4>RED FLAG ZONE</h4><b>Delete this page</b><p class="hq-fine">Removes your page, services, posts and sales. Type DELETE to confirm.</p><div class="bz-two"><label class="bz-f"><span>Type DELETE</span><input id="dT" autocomplete="off"></label><div class="bz-row" style="align-self:end"><button type="button" class="bz-btn red" id="dGo">Delete page</button></div></div><div class="bz-msg" id="dM" role="status"></div><p class="hq-fine">Want to hide your page for a while instead? Write to hello@carvessa.app.</p></div>';
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

  // ---------- Public page ----------
  if (mode === 'shop') {
    (async function () {
      var slug = q.get('b') || '';
      var r = slug ? await sb.from('businesses').select(PUB).eq('slug', slug).maybeSingle() : { data: null };
      var b = r.data;
      if (!b) { root.innerHTML = '<div class="bz"><h1>This page isn’t available</h1><p class="lead">It may be waiting for our check, or the link is wrong.</p><a class="bz-btn" href="/partners/">For businesses</a></div>'; return; }
      var [s, ps, rv, me] = await Promise.all([
        sb.from('business_services').select('name, price_from, note').eq('business_id', b.id).order('sort'),
        sb.from('business_posts').select('kind, title, body, until').eq('business_id', b.id).order('created_at', { ascending: false }).limit(3),
        sb.rpc('business_reviews_public', { b: b.id }),
        sb.auth.getSession()
      ]);
      var reviews = rv.data || [], user = me.data.session && me.data.session.user, isOwner = user && user.id === b.owner;
      var avg = reviews.length ? reviews.reduce(function (a, x) { return a + x.stars; }, 0) / reviews.length : 0;
      var svcs = s.data || [], today = new Date().toISOString().slice(0, 10);
      var posts = (ps.data || []).filter(function (p) { return !p.until || p.until >= today; });
      var info = KINFO[b.kind] || KINFO.other, hv = headerOf(b);
      document.title = b.name + ' · Carvessa';
      var count = function (k) { if (b.status === 'live') sb.rpc('business_count', { b: b.id, k: k }).then(function () {}, function () {}); };
      count('view');
      var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.name, b.address, b.city].filter(Boolean).join(', '));
      var tel = (b.phone || '').replace(/[^\d+]/g, '');
      var web = b.website ? (/^https?:/i.test(b.website) ? b.website : 'https://' + b.website) : '';
      var callBtn = tel ? '<a class="bz-btn" data-c="call" href="tel:' + esc(tel) + '">' + (b.kind === 'tow' ? 'Call now' : 'Call') + '</a>' : '';
      var dirBtn = '<a class="bz-btn soft" data-c="directions" href="' + maps + '" target="_blank" rel="noopener">Directions</a>';
      var KP = { special: 'Special', news: 'News', event: 'Event', hours: 'Hours change' };
      root.innerHTML =
        '<div class="shop-cover" style="background:' + hv.css + '">' + logoHtml(b, 'shop-logo') + (hv.credit ? '<a class="shop-credit" href="' + esc(hv.credit[1]) + '" target="_blank" rel="noopener nofollow">Photo: ' + esc(hv.credit[0]) + ' · CC BY</a>' : '') + '</div>' +
        (b.status !== 'live' ? '<div class="shop-pre">Preview: only you can see this page. It goes live after we confirm you’re the owner (we’ll call or text you).</div>' : '') +
        '<div class="shop-head"><h1>' + esc(b.name) + '</h1><div class="k">' + esc(kindName(b.kind)) + (b.city ? ' · ' + esc(b.city) : '') + '</div>' + (b.status === 'live' ? '<span class="shop-badge">✓ Verified by Carvessa</span>' : '') + (reviews.length ? '<a class="shop-rating" href="#reviews">' + starRow(Math.round(avg)) + ' <b>' + avg.toFixed(1) + '</b> · ' + reviews.length + ' review' + (reviews.length > 1 ? 's' : '') + '</a>' : '') + '</div>' +
        '<div class="bz-row shop-cta">' + (info.first === 'directions' ? dirBtn + callBtn : callBtn + dirBtn) + (web ? '<a class="bz-btn soft" data-c="website" href="' + esc(web) + '" target="_blank" rel="noopener nofollow">Website</a>' : '') + '</div>' +
        (b.status === 'live' && !isOwner ? '<div class="bz-row shop-cta">' + (QUOTE_KINDS[b.kind] ? '<button type="button" class="bz-btn" data-chat-kind="quote">Get a quote</button>' : '') + '<button type="button" class="bz-btn soft" data-chat-kind="message">' + (b.kind === 'dealer' ? 'Ask about a car' : b.kind === 'credit_union' || b.kind === 'insurance' ? 'Ask a question' : 'Message') + '</button></div><div id="chBox"></div>' : '') +
        (b.offer ? '<div class="shop-card shop-offer"><h2>' + esc(b.offer) + '</h2>Show this page at the counter.</div>' : '') +
        posts.map(function (p) { return '<div class="shop-card shop-post"><span class="hq-tag">' + (KP[p.kind] || 'News') + '</span><h2>' + esc(p.title) + '</h2>' + (p.body ? esc(p.body) : '') + (p.until ? '<div class="shop-note">Until ' + esc(new Date(p.until + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) + '</div>' : '') + '</div>'; }).join('') +
        (svcs.length ? '<div class="shop-card"><h2>' + info.svc + '</h2>' + svcs.map(function (x) { return '<div class="shop-svc"><span>' + esc(x.name) + '</span><b>' + (x.price_from != null ? 'from ' + money(x.price_from) : 'Ask') + '</b></div>'; }).join('') + '<div class="shop-note">' + (b.kind === 'credit_union' ? 'Set by the credit union. Not an offer from Carvessa.' : 'Prices set by the business. Ask for a written quote.') + '</div></div>' : '') +
        (info.tip ? '<div class="shop-card shop-tip"><h2>' + info.tip[0] + '</h2>' + info.tip[1] + '</div>' : '') +
        (b.about ? '<div class="shop-card"><h2>About</h2>' + esc(b.about) + '</div>' : '') +
        ((b.photos || []).length ? '<div class="shop-card"><h2>Photos</h2><div class="shop-pics">' + b.photos.map(function (p, i) { return '<img src="' + photoUrl(p) + '" alt="' + esc(b.name) + ' photo ' + (i + 1) + '" loading="lazy">'; }).join('') + '</div></div>' : '') +
        '<div class="shop-card"><div class="shop-kv">' + (b.address ? '<span>Address</span><div>' + esc(b.address) + (b.city ? ', ' + esc(b.city) : '') + '</div>' : '') + (b.phone ? '<span>Phone</span><div>' + esc(b.phone) + '</div>' : '') + (b.hours ? '<span>Hours</span><div>' + esc(b.hours) + '</div>' : '') + '</div></div>' +
        '<div class="shop-card" id="reviews"><h2>Reviews' + (reviews.length ? ' <span class="rv-sum">★ ' + avg.toFixed(1) + ' · ' + reviews.length + '</span>' : '') + '</h2><p class="rv-fine">From Carvessa members. Only first names show. <a href="/business/review-rules/" target="_blank">Review Rules</a></p>' +
          (b.status === 'live' && !isOwner ? '<div class="bz-row" style="margin:6px 0 10px"><button type="button" class="bz-btn bz-small" id="rvWrite">Write a review</button></div><div id="rvBox"></div>' : '') +
          (reviews.length ? reviews.slice(0, 20).map(function (x) {
            return '<div class="rv-item" data-id="' + x.id + '"><div class="rv-top">' + starRow(x.stars) + '<b>' + esc(x.first_name) + '</b><small>' + ago(x.created_at) + '</small></div>' + (x.body ? '<p>' + esc(x.body) + '</p>' : '') +
              ((x.photos || []).length ? '<div class="rv-pics">' + x.photos.map(function (p) { return '<img src="' + photoUrl(p) + '" alt="Photo from ' + esc(x.first_name) + '" loading="lazy">'; }).join('') + '</div>' : '') +
              (x.reply ? '<div class="rv-reply"><b>Reply from ' + esc(b.name) + '</b>' + esc(x.reply) + '</div>' : '') +
              '<button type="button" class="rv-flag" data-flag="' + x.id + '">Report</button><div class="rv-rep-box"></div></div>';
          }).join('') : '<p>' + (b.status === 'live' ? 'No reviews yet. Been here? Be the first.' : 'Reviews start when the page is live.') + '</p>') + '</div>' +
        '<p class="shop-note" style="margin-top:14px">Carvessa doesn’t rank businesses by who pays. Reviews are never removed for being negative or because a business pays. Paid spots in the app are always labeled. Is this your business? <a href="/business/edit/">Open Business HQ</a></p>';
      root.addEventListener('click', function (e) { var a = e.target.closest('[data-c]'); if (a) count(a.getAttribute('data-c')); });
      // Write / edit a review, or report one: members only (free account).
      function signedIn(host, then) {
        sb.auth.getSession().then(function (r) {
          var u = r.data.session && r.data.session.user; if (u) { then(u); return; }
          host.innerHTML = '<div class="rv-form"><h3>Log in or create a free account</h3><p class="rv-fine">Reviews come only from Carvessa members, one per person per business.</p><div class="rv-acct"></div></div>';
          account(function (u2) { then(u2); }, host.querySelector('.rv-acct'));
        });
      }
      root.addEventListener('click', function (e) {
        var k = e.target.getAttribute('data-chat-kind'); if (!k) return;
        var box = root.querySelector('#chBox');
        signedIn(box, async function (u) {
          if (u.id === b.owner) { box.innerHTML = '<div class="bz-msg bad">You can’t message your own business.</div>'; return; }
          var open = (await sb.from('biz_chats').select('*').eq('business_id', b.id).eq('driver', u.id).neq('status', 'blocked').order('last_at', { ascending: false }).limit(1)).data;
          var show = function (c) { chatThread(box, c, false, b.name); var a = document.createElement('p'); a.className = 'rv-fine'; a.innerHTML = '<a href="/messages/">See all my messages ›</a>'; box.appendChild(a); };
          if (open && open.length && k === 'message') show(open[0]); else startChat(box, b, k, show);
          box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      var wr = root.querySelector('#rvWrite');
      if (wr) wr.onclick = function () {
        var box = root.querySelector('#rvBox');
        signedIn(box, async function (u) {
          if (u.id === b.owner) { box.innerHTML = '<div class="bz-msg bad">You can’t review your own business.</div>'; return; }
          var mine = (await sb.from('business_reviews').select('id, stars, body, photos').eq('business_id', b.id).eq('author', u.id).maybeSingle()).data;
          reviewForm(box, b, mine, function () { box.innerHTML = '<div class="bz-msg good">Thanks! Your review is up' + ' (photos show after our check). You can edit or delete it any time here.</div><div class="bz-row"><button type="button" class="bz-btn soft bz-small" id="rvDel">Delete my review</button></div>'; setTimeout(function () { location.reload(); }, 2500);
          });
          if (mine) { var d = document.createElement('div'); d.className = 'bz-row'; d.innerHTML = '<button type="button" class="bz-btn red bz-small">Delete my review</button>'; box.appendChild(d); d.firstChild.onclick = async function () { if (!confirm('Delete your review?')) return; await sb.from('business_reviews').delete().eq('id', mine.id); location.reload(); }; }
        });
      };
      root.addEventListener('click', function (e) {
        var id = e.target.getAttribute('data-flag'); if (!id) return;
        var host = e.target.parentNode.querySelector('.rv-rep-box');
        signedIn(host, function () { reportBox(host, id); });
      });
    })();
  }
})();
