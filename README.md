# Zita adventi kalendáriuma

Statikus oldal (HTML/CSS/JS), bármilyen tárhelyen futtatható (pl. GitHub Pages).

## Szerkesztő felület
- **Előhívás:** `Alt + Shift + A` (vagy az oldal címének végére írt `#admin`, pl. telefonon). Jelszóval védett.
- **Mit lehet benne:** az oldal szövegei (cím, bevezető, lábléc, aláírás…), és minden nap címe, üzenete, fotói, felirata, linkje.
- **Fotók:** tedd a képeket a `fotok/` mappába, a szerkesztőben a „+ Fotók a fotok mappából…” gombbal vedd fel, majd kattintással jelöld ki naponta. Az üzenet alatt jelennek meg, a kijelölés sorrendjében.
- **Mentés:** a változások azonnal látszanak, de csak abban a böngészőben. Véglegesítés: „Mentés fájlba” → a letöltött `gifts.js` cseréje az oldal mappájában (és a tárhelyen).
- **Jelszó:** lásd a szerkesztőben a „Jelszó módosítása” gombot (új `admin-config.js` töltődik le).

## Egyéb
- **Tesztelés:** `index.html?preview=12` – úgy látod, mintha december 12. lenne.
- Az ajtók éjfélkor (bécsi idő szerint) nyílnak, a megnyitott napokat a böngésző megjegyzi.

## Telepítés a telefonra (kezdőképernyős ikon)
Az oldal telepíthető alkalmazásként is működik, a Zita-logóval. https:// címen kell futnia (pl. GitHub Pages).
- **Android (Chrome):** az oldal alján megjelenik a „Telepítés a telefonra” gomb, vagy: menü (⋮) → „Alkalmazás telepítése” / „Hozzáadás a kezdőképernyőhöz”.
- **iPhone (Safari):** Megosztás gomb → „Főképernyőhöz adás”.
