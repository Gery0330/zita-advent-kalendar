const $ = id => document.getElementById(id);
const calendar = $("calendar"), modal = $("modal"), closeBtn = $("closeModal");
const dateLine = $("dateLine"), countdown = $("countdown"), toast = $("toast");
const TZ = "Europe/Vienna", KEY = "zita-advent-opened";
const params = new URLSearchParams(location.search);

// Az oldal szerkeszthető szövegei (a gifts.js-ben lévő siteTexts felülírja őket)
const SITE_DEFAULTS = {
  eyebrow: "EGY KIS MEGLEPETÉS NEKED",
  h1a: "Zita adventi",
  h1b: "kalendáriuma",
  intro: "Minden napra egy apró meglepetés, emlék vagy üzenet. ❤️",
  hint: "Keresd meg a számokat a mozaikban! Mindegyik a saját napján, éjfélkor nyílik ki. ✨",
  footer: "Csak neked készítettem, Zita.",
  signoff: "Szeretettel, neked. ❤️"
};
function applySiteTexts(t) {
  const s = Object.assign({}, SITE_DEFAULTS, t || {});
  $("siteEyebrow").textContent = s.eyebrow;
  const h1 = $("siteTitle"), em = document.createElement("em");
  em.textContent = s.h1b; h1.replaceChildren(document.createTextNode(s.h1a), document.createElement("br"), em);
  $("siteIntro").textContent = s.intro;
  $("siteHint").textContent = s.hint;
  const heart = document.createElement("span"); heart.textContent = "♥";
  $("siteFooter").replaceChildren(document.createTextNode(s.footer + " "), heart);
  $("siteSignoff").textContent = s.signoff;
}

// Fotók: a szerkesztőben frissen kiválasztott képek helyi előnézete (blob) elsőbbséget élvez
window.photoBlobs = {};
const photoSrc = p => window.photoBlobs[p] || (/^(https?:|data:|blob:)/.test(p) ? p : p.split("/").map(encodeURIComponent).join("/"));
const imagesOf = g => Array.isArray(g.images) ? g.images.filter(Boolean) : (g.image ? [g.image] : []);

// Tesztelés: index.html?preview=12  → úgy látod az oldalt, mintha december 12. lenne
function today() {
  const pv = params.get("preview");
  if (pv && /^\d{1,2}$/.test(pv)) return { year: new Date().getFullYear(), month: 12, day: Math.min(+pv, 31) };
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day };
}
const daysUntil = (now, d) => Math.ceil((Date.UTC(now.year, 11, d) - Date.UTC(now.year, now.month - 1, now.day)) / 86400000);

const loadOpened = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); } };
const saveOpened = set => { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch {} };
const opened = loadOpened();

let toastTimer;
function showToast(msg) {
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function render() {
  const now = today();
  dateLine.textContent = new Intl.DateTimeFormat("hu-HU", { timeZone: TZ, year: "numeric", month: "long", day: "numeric" }).format(new Date(now.year, now.month - 1, now.day));
  if (now.month < 12) {
    const n = daysUntil(now, 1);
    countdown.textContent = `Még ${n} nap az első meglepetésig`;
  } else if (now.day <= 24) {
    
    countdown.textContent = now.day === 24 ? "Ma van a nagy nap – az utolsó ajtó is kinyílt! ✨" : "Minden nap egy újabb meglepetés vár rád. ✨";
  } else countdown.textContent = "A kalendárium minden ajtaja kinyílt. Boldog karácsonyt! ❤️";

  calendar.innerHTML = "";
  DECOR.forEach(([x, y, w, h, c, i]) => {
    const t = document.createElement("div");
    t.className = `tile c${c}`; t.style.cssText = geo(x, y, w, h); t.setAttribute("aria-hidden", "true");
    t.innerHTML = i < 0 ? '<div class="label"><em>Zita</em><span>ADVENT</span></div>' : ICONS[i];
    calendar.appendChild(t);
  });
  [...DOORS].sort((p, q) => p[5] - q[5]).forEach(([x, y, w, h, c, day, a]) => {
    const unlocked = now.month === 12 && now.day >= day;
    const isOpened = unlocked && opened.has(day);
    const btn = document.createElement("button");
    btn.type = "button"; btn.dataset.day = day;
    btn.className = `door c${c} ${ALIGN[a]}` + (isOpened ? " opened" : "") + (unlocked && now.day === day ? " today" : "");
    btn.style.cssText = geo(x, y, w, h);
    btn.setAttribute("aria-disabled", String(!unlocked));
    btn.setAttribute("aria-label", unlocked ? `${day}. nap megnyitása` : `${day}. nap – még zárva`);
    btn.innerHTML = `<span class="number">${String(day).padStart(2, "0")}</span>`;
    btn.addEventListener("click", () => {
      if (unlocked) return openGift(day, btn);
      const n = daysUntil(now, day);
      showToast(n === 1 ? "Ez az ajtó holnap nyílik ki 🤫" : `Még ${n} napot várnod kell erre az ajtóra 🤫`);
      btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
    });
    calendar.appendChild(btn);
  });
}

// Mozaik-elrendezés (12×15 egységes rács, 4:5 arány), előre legenerálva.
// DOORS: [x, y, szélesség, magasság, szín, nap, számigazítás]   DECOR: [x, y, sz, m, szín, ikon (-1 = címke)]
const DOORS = [[0,0,2,3,1,14,0],[0,3,2,2,0,10,0],[0,10,2,2,2,24,4],[0,12,2,3,1,11,4],[2,0,2,2,0,18,0],[4,2,2,2,2,15,2],[2,4,2,3,2,7,4],[4,6,2,2,1,16,3],[4,8,2,2,0,9,2],[2,10,2,2,0,2,1],[4,10,2,2,3,12,0],[6,0,2,3,4,21,0],[8,0,2,3,2,4,2],[6,3,2,2,3,5,4],[6,5,2,2,4,13,2],[8,5,2,2,1,17,1],[6,7,2,2,2,19,4],[8,7,2,2,3,6,0],[8,9,2,3,2,22,4],[6,12,4,3,3,20,4],[10,2,2,2,0,23,0],[10,4,2,2,3,1,3],[10,8,2,3,4,8,2],[10,11,2,2,1,3,3]];
const DECOR = [[2,12,4,3,2,-1],[4,0,2,2,3,0],[0,7,2,3,0,6],[10,6,2,2,0,1],[2,2,2,2,4,3],[8,3,2,2,4,7],[4,4,2,2,0,2],[6,9,2,3,4,5],[10,0,2,2,3,4],[10,13,2,2,2,0],[0,5,2,2,4,6],[2,7,2,3,4,1]];
const ALIGN = ["", "a-tl", "a-tr", "a-bl", "a-br"];
const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS = [
  svg('<path d="M12 2.5 7 9h3l-4 6h4.5v6h3v-6H18l-4-6h3z"/>'),
  svg('<path d="m12 2.5 2.8 6.2 6.7.7-5 4.5 1.5 6.6-6-3.4-6 3.4 1.5-6.6-5-4.5 6.7-.7z"/>'),
  svg('<circle cx="12" cy="14" r="6.5"/><path d="M10 7.5h4V5h-4zM12 5V3M8 12a5 5 0 0 1 3-3"/>'),
  svg('<rect x="4" y="10" width="16" height="10"/><rect x="3" y="7" width="18" height="3"/><path d="M12 7v13M12 7c-2-4-6-3-4.5-.5M12 7c2-4 6-3 4.5-.5"/>'),
  svg('<path d="M12 3v2M6 17c1.5-1.5 2-4 2-7a4 4 0 0 1 8 0c0 3 .5 5.5 2 7zM10 19.5a2 2 0 0 0 4 0"/>'),
  svg('<path d="M9 21V8a4 4 0 0 1 8 0v1M9 18l4-2M9 14l4-2"/>'),
  svg('<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9.5 3.8 12 6l2.5-2.2M9.5 20.2 12 18l2.5 2.2"/>'),
  svg('<path d="M12 20s-8-5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20z"/>')
];
const geo = (x, y, w, h) => `left:${(x / 12 * 100).toFixed(3)}%;top:${(y / 15 * 100).toFixed(3)}%;width:${(w / 12 * 100).toFixed(3)}%;height:${(h / 15 * 100).toFixed(3)}%;--m:${Math.min(w, h)}`;

let lastFocus = null;
function openGift(day, btn, preview) {
  const gift = gifts[day - 1] || { title: "Meglepetés", message: "❤️" };
  $("modalDay").textContent = `DECEMBER ${day}.`;
  $("modalTitle").textContent = gift.title;
  $("modalMessage").textContent = gift.message;
  const wrap = $("imageWrap"), cap = $("giftCaption"), link = $("giftLink"), imgs = imagesOf(gift);
  wrap.replaceChildren(...imgs.map(p => {
    const im = document.createElement("img");
    im.alt = gift.caption || "Fotó"; im.loading = "lazy"; im.src = photoSrc(p);
    im.addEventListener("error", () => im.remove());
    return im;
  }));
  wrap.hidden = !imgs.length; wrap.classList.toggle("multi", imgs.length > 1);
  cap.hidden = !(imgs.length && gift.caption); cap.textContent = gift.caption || "";
  if (gift.link) { link.href = gift.link; link.textContent = gift.linkText || "Megnyitom ↗"; link.hidden = false; } else link.hidden = true;
  lastFocus = preview ? null : btn;
  modal.scrollTop = 0; modal.querySelector(".modal-card").scrollTop = 0;
  modal.classList.add("show"); modal.setAttribute("aria-hidden", "false"); closeBtn.focus();
  if (!preview && !opened.has(day)) { opened.add(day); saveOpened(opened); render(); }
}
function hideModal() {
  modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true");
  const d = lastFocus && lastFocus.dataset.day;
  if (d) calendar.querySelector(`[data-day="${d}"]`)?.focus();
}
closeBtn.addEventListener("click", hideModal);
modal.addEventListener("click", e => { if (e.target === modal) hideModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("show")) hideModal(); });

// Éjfélkor magától frissül, nem kell újratölteni az oldalt
let lastKey = JSON.stringify(today());
setInterval(() => { const k = JSON.stringify(today()); if (k !== lastKey) { lastKey = k; render(); } }, 30000);
applySiteTexts(typeof siteTexts !== "undefined" ? siteTexts : null);
render();

// Telepíthető alkalmazás (PWA): szolgáltatás-háttér + "Telepítés" gomb (Androidon / Chrome-ban)
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
let installEvt = null;
const installBtn = $("installBtn");
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; installBtn.hidden = false; });
installBtn.addEventListener("click", async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; installBtn.hidden = true; });
window.addEventListener("appinstalled", () => { installBtn.hidden = true; });
