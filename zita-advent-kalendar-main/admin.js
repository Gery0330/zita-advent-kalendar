/*
  Szerkesztő felület – Alt + Shift + A (vagy az oldal címéhez írt #admin) hívja elő.
  Jelszóval védett. A módosítások azonnal látszanak az oldalon (csak ebben a böngészőben),
  a végleges mentés a "Mentés fájlba" gombbal letöltött gifts.js cseréjével történik.
*/
(() => {
  "use strict";
  if (typeof ADMIN_CONFIG === "undefined" || typeof gifts === "undefined") return;

  const CFG = ADMIN_CONFIG, DAYS = 24;
  const SESSION_KEY = "zita-admin-session", DRAFT_KEY = "zita-admin-draft-v1";
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rd = (kind, key) => { try { return window[kind].getItem(key); } catch { return null; } };
  const wr = (kind, key, val) => { try { window[kind].setItem(key, val); return true; } catch { return false; } };
  const rm = (kind, key) => { try { window[kind].removeItem(key); } catch {} };

  const SITE_FIELDS = [
    ["eyebrow", "Kis felirat a cím felett", 1],
    ["h1a", "Cím – első sor", 1],
    ["h1b", "Cím – második sor (arany, dőlt)", 1],
    ["intro", "Bevezető szöveg", 3],
    ["hint", "Megjegyzés a kalendárium alatt", 3],
    ["footer", "Lábléc szövege", 1],
    ["signoff", "Aláírás a felugró ablakok alján", 1]
  ];

  // ---------- adatmodell ----------
  const imgsOf = g => Array.isArray(g.images) ? g.images.filter(Boolean) : (g.image ? [g.image] : []);
  const clean = g => ({ title: g.title || "", message: g.message || "", images: imgsOf(g), caption: g.caption || "", link: g.link || "", linkText: g.linkText || "" });
  const clone = o => JSON.parse(JSON.stringify(o));
  const fileSite = Object.assign({}, SITE_DEFAULTS, typeof siteTexts !== "undefined" ? siteTexts : {});
  const original = {
    gifts: Array.from({ length: DAYS }, (_, i) => clean(gifts[i] || { title: "Meglepetés", message: "❤️" })),
    site: fileSite,
    photos: typeof photoList !== "undefined" ? [...photoList] : []
  };

  let state = clone(original), exported = true, current = "site";
  const blobs = window.photoBlobs;                       // frissen kiválasztott fotók helyi előnézete
  let dirScanned = false;

  function loadDraft() {
    const raw = rd("localStorage", DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (Array.isArray(d.gifts) && d.gifts.length === DAYS) {
        state = { gifts: d.gifts.map(clean), site: Object.assign({}, original.site, d.site), photos: Array.isArray(d.photos) ? d.photos : [] };
        exported = !!d.exported;
      }
    } catch {}
  }
  let saveTimer;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => wr("localStorage", DRAFT_KEY, JSON.stringify({ ...state, exported })), 250);
  }
  function applyState() {
    gifts.splice(0, gifts.length, ...state.gifts.map(g => ({ ...g })));
    applySiteTexts(state.site);
  }
  function changed() { exported = false; applyState(); saveDraft(); setStatus(); }

  const isLocal = p => !/^(https?:|data:|blob:)/.test(p);
  const allPhotos = () => {
    const set = new Set([...state.photos, ...state.gifts.flatMap(g => g.images)].filter(isLocal));
    return [...set].sort((a, b) => a.localeCompare(b, "hu", { numeric: true }));
  };

  // ---------- jelszó ----------
  const hexToBytes = h => Uint8Array.from(h.match(/../g).map(x => parseInt(x, 16)));
  const bytesToHex = b => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
  async function derive(pw, saltHex, iterations) {
    if (!(window.crypto && crypto.subtle)) throw new Error("nocrypto");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(saltHex), iterations }, key, 256);
    return bytesToHex(new Uint8Array(bits));
  }
  const sameHex = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
  const checkPassword = async pw => sameHex(await derive(pw, CFG.salt, CFG.iterations), CFG.hash);

  // ---------- felület ----------
  const root = document.createElement("div");
  root.className = "zadm"; root.id = "zadm"; root.hidden = true;
  root.innerHTML = `
    <section class="zadm-login" id="zLogin" role="dialog" aria-modal="true" aria-labelledby="zLoginT" hidden>
      <div class="zadm-eyebrow">SZERKESZTŐ</div>
      <h2 id="zLoginT">Belépés</h2>
      <form id="zLoginForm" autocomplete="off">
        <input type="password" id="zPw" placeholder="Jelszó" aria-label="Jelszó" autocomplete="off" required>
        <button class="zadm-btn primary" type="submit" id="zLoginBtn">Belépés</button>
        <p class="zadm-err" id="zLoginErr" role="alert"></p>
      </form>
      <button class="zadm-link" type="button" id="zLoginClose">Mégse</button>
    </section>

    <section class="zadm-editor" id="zEditor" role="dialog" aria-modal="true" aria-label="Szerkesztő" hidden>
      <header class="zadm-head">
        <div><div class="zadm-eyebrow">SZERKESZTŐ</div><div class="zadm-status" id="zStatus"></div></div>
        <div class="zadm-head-actions">
          <button class="zadm-btn primary" type="button" id="zExport">Mentés fájlba (gifts.js)</button>
          <button class="zadm-btn" type="button" id="zPwBtn">Jelszó módosítása</button>
          <button class="zadm-btn" type="button" id="zDiscard">Piszkozat eldobása</button>
          <button class="zadm-btn" type="button" id="zLogout">Kilépés</button>
          <button class="zadm-x" type="button" id="zClose" aria-label="Bezárás (a változások megmaradnak)">×</button>
        </div>
      </header>
      <div class="zadm-body">
        <nav class="zadm-list" id="zList" aria-label="Ablakok"></nav>
        <div class="zadm-main" id="zMain"></div>
      </div>
      <div class="zadm-sub" id="zSub" hidden>
        <form class="zadm-sub-card" id="zPwForm" autocomplete="off">
          <h3>Jelszó módosítása</h3>
          <input type="password" id="zPwOld" placeholder="Jelenlegi jelszó" autocomplete="off" required>
          <input type="password" id="zPwNew" placeholder="Új jelszó (legalább 8 karakter)" minlength="8" autocomplete="off" required>
          <input type="password" id="zPwNew2" placeholder="Új jelszó még egyszer" minlength="8" autocomplete="off" required>
          <p class="zadm-err" id="zPwErr" role="alert"></p>
          <p class="zadm-note">Az új jelszóhoz tartozó <b>admin-config.js</b> letöltődik. Cseréld ki vele a régit az oldal mappájában (és tárhelyén) – addig a régi jelszó él.</p>
          <div class="zadm-row-actions"><button class="zadm-btn primary" type="submit">Új admin-config.js letöltése</button><button class="zadm-btn" type="button" id="zPwCancel">Mégse</button></div>
        </form>
      </div>
      <input type="file" id="zFiles" accept="image/*" multiple hidden>
    </section>`;
  document.body.appendChild(root);
  const el = { login: $("zLogin"), editor: $("zEditor"), list: $("zList"), main: $("zMain"), status: $("zStatus"), sub: $("zSub") };

  const isUnlocked = () => rd("sessionStorage", SESSION_KEY) === "1";
  const visible = () => !root.hidden;
  function show(view) {
    root.hidden = false; document.body.style.overflow = "hidden";
    el.login.hidden = view !== "login"; el.editor.hidden = view !== "editor";
  }
  function hide() { root.hidden = true; el.sub.hidden = true; document.body.style.overflow = ""; if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search); }
  function open() {
    if (isUnlocked()) { show("editor"); buildEditor(); }
    else { show("login"); $("zPw").value = ""; $("zLoginErr").textContent = ""; setTimeout(() => $("zPw").focus(), 30); }
  }

  // ---------- belépés ----------
  let fails = 0, lockUntil = 0, lockTimer;
  $("zLoginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("zLoginErr"), btn = $("zLoginBtn"), pw = $("zPw").value;
    if (Date.now() < lockUntil) return;
    btn.disabled = true; err.textContent = "Ellenőrzés…";
    try {
      if (await checkPassword(pw)) {
        fails = 0; wr("sessionStorage", SESSION_KEY, "1"); loadDraft(); applyState(); show("editor"); buildEditor(); return;
      }
    } catch {
      err.textContent = "A jelszó-ellenőrzéshez biztonságos kapcsolat kell (https:// vagy localhost).";
      btn.disabled = false; return;
    }
    fails++; $("zPw").value = ""; $("zPw").focus();
    if (fails >= 3) {
      lockUntil = Date.now() + 10000 * (fails - 2);
      clearTimeout(lockTimer);
      const tick = () => {
        const s = Math.ceil((lockUntil - Date.now()) / 1000);
        if (s > 0) { err.textContent = `Hibás jelszó. Próbáld újra ${s} mp múlva.`; btn.disabled = true; lockTimer = setTimeout(tick, 500); }
        else { err.textContent = "Hibás jelszó."; btn.disabled = false; }
      };
      tick();
    } else { err.textContent = "Hibás jelszó."; btn.disabled = false; }
  });
  $("zLoginClose").addEventListener("click", hide);

  // ---------- szerkesztő ----------
  function setStatus() {
    el.status.textContent = exported
      ? "Nincs mentetlen változás."
      : "A változások látszanak az oldalon, de csak ebben a böngészőben. Zitának a „Mentés fájlba” után cserélt gifts.js-sel jelennek meg.";
    el.status.classList.toggle("warn", !exported);
  }
  const dayLabel = i => `${i + 1}. nap`;
  function buildList() {
    el.list.innerHTML = `<button type="button" data-k="site" class="${current === "site" ? "on" : ""}">Az oldal szövegei</button>` +
      state.gifts.map((g, i) => `<button type="button" data-k="${i}" class="${String(i) === String(current) ? "on" : ""}"><b>${i + 1}.</b> <span>${esc(g.title || "–")}</span>${g.images.length ? `<i title="${g.images.length} fotó">📷${g.images.length}</i>` : ""}</button>`).join("");
  }
  function buildEditor() { setStatus(); buildList(); buildMain(); if (!dirScanned) scanDir(); }
  el.list.addEventListener("click", e => { const b = e.target.closest("button[data-k]"); if (!b) return; current = b.dataset.k; buildList(); buildMain(); el.main.scrollTop = 0; });

  const field = (f, label, v, rows, ph = "") => rows > 1
    ? `<label class="zadm-f"><span>${label}</span><textarea data-f="${f}" rows="${rows}" placeholder="${esc(ph)}">${esc(v)}</textarea></label>`
    : `<label class="zadm-f"><span>${label}</span><input data-f="${f}" value="${esc(v)}" placeholder="${esc(ph)}"></label>`;

  function buildMain() {
    if (current === "site") {
      el.main.innerHTML = `<h3>Az oldal szövegei</h3><p class="zadm-note">A főoldal és a felugró ablakok fix szövegei. A változás azonnal látszik a háttérben.</p>` +
        SITE_FIELDS.map(([k, label, rows]) => field("site:" + k, label, state.site[k] ?? "", rows)).join("") +
        `<div class="zadm-row-actions"><button class="zadm-btn" type="button" data-act="resetSite">Visszaállítás a fájlban lévőre</button></div>`;
      return;
    }
    const i = +current, g = state.gifts[i];
    el.main.innerHTML = `<div class="zadm-day">DECEMBER ${i + 1}.</div>
      ${field("title", "Cím", g.title)}
      ${field("message", "Üzenet", g.message, 7)}
      <div class="zadm-photos-head"><span>Fotók <small>(az üzenet alatt jelennek meg, a kijelölés sorrendjében)</small></span>
        <button class="zadm-btn" type="button" data-act="pick">+ Fotók a fotok mappából…</button></div>
      <div class="zadm-grid" id="zGrid"></div>
      ${field("caption", "Felirat a fotók alatt", g.caption, 1, "pl. Balatonon, 2024 nyarán")}
      <div class="zadm-two">${field("link", "Link (pl. dal vagy videó)", g.link, 1, "https://…")}${field("linkText", "A link gombjának felirata", g.linkText, 1, "Megnyitom ↗")}</div>
      <div class="zadm-row-actions"><button class="zadm-btn primary" type="button" data-act="preview">Előnézet – így fog kinézni</button>
        <button class="zadm-btn" type="button" data-act="resetDay">Ez a nap vissza a fájlban lévőre</button></div>`;
    buildGrid();
  }

  function buildGrid() {
    const grid = $("zGrid"); if (!grid || current === "site") return;
    const sel = state.gifts[+current].images, photos = allPhotos();
    if (!photos.length) { grid.innerHTML = `<p class="zadm-empty">Még nincs fotó a listában. Tedd a képeket a <b>fotok</b> mappába, majd nyomd meg a „+ Fotók a fotok mappából…” gombot, és jelöld ki őket (Ctrl + A az összeshez).</p>`; return; }
    grid.innerHTML = photos.map(p => {
      const n = sel.indexOf(p) + 1;
      return `<button type="button" class="zadm-ph${n ? " on" : ""}" data-p="${esc(p)}" title="${esc(p)}" aria-pressed="${!!n}"><img src="${esc(blobs[p] || photoSrc(p))}" alt="" loading="lazy"><span class="zadm-n">${n || ""}</span><small>${esc(p.replace(/^.*\//, ""))}</small></button>`;
    }).join("");
  }
  $("zMain").addEventListener("error", e => { if (e.target.tagName === "IMG") e.target.closest(".zadm-ph")?.classList.add("missing"); }, true);

  el.main.addEventListener("input", e => {
    const f = e.target.dataset && e.target.dataset.f; if (!f) return;
    if (f.startsWith("site:")) state.site[f.slice(5)] = e.target.value;
    else state.gifts[+current][f] = e.target.value;
    changed(); if (f === "title") buildList();
  });
  el.main.addEventListener("click", e => {
    const ph = e.target.closest(".zadm-ph");
    if (ph) {
      const imgs = state.gifts[+current].images, p = ph.dataset.p, k = imgs.indexOf(p);
      if (k >= 0) imgs.splice(k, 1); else imgs.push(p);
      changed(); buildGrid(); buildList(); return;
    }
    const act = e.target.closest("[data-act]")?.dataset.act; if (!act) return;
    if (act === "pick") $("zFiles").click();
    else if (act === "preview") openGift(+current + 1, null, true);
    else if (act === "resetDay") { state.gifts[+current] = clone(original.gifts[+current]); changed(); buildList(); buildMain(); }
    else if (act === "resetSite") { state.site = clone(original.site); changed(); buildMain(); }
  });
  $("zFiles").addEventListener("change", e => {
    for (const f of e.target.files) {
      const p = "fotok/" + f.name;
      if (!state.photos.includes(p)) state.photos.push(p);
      if (blobs[p]) URL.revokeObjectURL(blobs[p]);
      blobs[p] = URL.createObjectURL(f);
    }
    e.target.value = ""; changed(); buildGrid();
  });

  // Ha a szerver listázza a fotok mappát (pl. helyi fejlesztői szerver), onnan is felveszi a képeket.
  async function scanDir() {
    dirScanned = true;
    try {
      const r = await fetch("fotok/", { cache: "no-store" }); if (!r.ok) return;
      const html = await r.text(); let add = 0;
      for (const m of html.matchAll(/href="([^"?#]+\.(?:jpe?g|png|gif|webp|avif))"/gi)) {
        const p = "fotok/" + decodeURIComponent(m[1].split("/").pop());
        if (!state.photos.includes(p)) { state.photos.push(p); add++; }
      }
      if (add) { saveDraft(); buildGrid(); }
    } catch {}
  }

  // ---------- mentés fájlba ----------
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function buildGiftsJs() {
    const rows = state.gifts.map(g => {
      const o = { title: g.title, message: g.message };
      if (g.images.length) o.images = g.images;
      if (g.caption) o.caption = g.caption;
      if (g.link) { o.link = g.link; if (g.linkText) o.linkText = g.linkText; }
      return "  " + JSON.stringify(o);
    });
    return `/*
  AUTOMATIKUSAN GENERÁLVA a szerkesztőből – ezt a fájlt cseréld ki az oldal mappájában (és a tárhelyen).
  Fotók: tedd a fotok mappába, a szerkesztőben válaszd ki naponta.
  Kézzel is szerkesztheted: gifts (ablakok), siteTexts (oldal szövegei), photoList (a fotók listája).
*/
const gifts = [
${rows.join(",\n")}
];

const siteTexts = ${JSON.stringify(state.site, null, 2)};

const photoList = ${JSON.stringify(allPhotos(), null, 2)};
`;
  }
  $("zExport").addEventListener("click", () => {
    download("gifts.js", buildGiftsJs()); exported = true; saveDraft(); setStatus();
    el.status.textContent = "✓ A gifts.js letöltődött. Cseréld ki vele a régit az oldal mappájában, és töltsd fel a tárhelyre.";
  });
  $("zDiscard").addEventListener("click", () => {
    if (!confirm("Eldobod az összes, fájlba még nem mentett változtatást ezen a gépen?")) return;
    rm("localStorage", DRAFT_KEY); state = clone(original); exported = true; applyState(); buildEditor();
  });
  $("zClose").addEventListener("click", hide);
  $("zLogout").addEventListener("click", () => { rm("sessionStorage", SESSION_KEY); hide(); location.reload(); });

  // ---------- jelszó módosítása ----------
  $("zPwBtn").addEventListener("click", () => { $("zPwForm").reset(); $("zPwErr").textContent = ""; el.sub.hidden = false; $("zPwOld").focus(); });
  $("zPwCancel").addEventListener("click", () => { el.sub.hidden = true; });
  $("zPwForm").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("zPwErr"), a = $("zPwOld").value, b = $("zPwNew").value, c = $("zPwNew2").value;
    if (b.length < 8) { err.textContent = "Az új jelszó legalább 8 karakter legyen."; return; }
    if (b !== c) { err.textContent = "A két új jelszó nem egyezik."; return; }
    try {
      if (!(await checkPassword(a))) { err.textContent = "A jelenlegi jelszó hibás."; return; }
      const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await derive(b, salt, CFG.iterations);
      download("admin-config.js", `/*
  A szerkesztő beállításai.
  A jelszót NEM tartalmazza, csak az ellenőrző lenyomatát (PBKDF2-SHA256).
  Jelszócsere: a szerkesztőben a "Jelszó módosítása" gomb letölti az új admin-config.js-t,
  azt kell ide bemásolni a régi helyére.
*/
const ADMIN_CONFIG = {
  salt: "${salt}",
  iterations: ${CFG.iterations},
  hash: "${hash}",
  shortcutLabel: ${JSON.stringify(CFG.shortcutLabel || "Alt + Shift + A")}
};
`);
      el.sub.hidden = true;
      el.status.textContent = "✓ Az új admin-config.js letöltődött. Cseréld ki vele a régit – addig a régi jelszó érvényes.";
    } catch { err.textContent = "A művelethez biztonságos kapcsolat kell (https:// vagy localhost)."; }
  });

  // ---------- billentyűk ----------
  window.addEventListener("keydown", e => {
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyA") { e.preventDefault(); visible() ? hide() : open(); return; }
    if (e.key === "Escape" && visible() && !$("modal").classList.contains("show")) {
      if (!el.sub.hidden) el.sub.hidden = true; else hide();
    }
  }, true);
  window.addEventListener("beforeunload", e => { if (isUnlocked() && !exported) { e.preventDefault(); e.returnValue = ""; } });
  const hashOpen = () => { if (location.hash === "#admin") open(); };
  window.addEventListener("hashchange", hashOpen);

  // Belépett munkamenetben a piszkozat azonnal látszik az oldalon (újratöltés után is).
  if (isUnlocked()) { loadDraft(); applyState(); }
  hashOpen();
})();
