/*
  ITT TUDOD SZEMÉLYRE SZABNI A MEGLEPETÉSEKET.
  Ezt a fájlt a szerkesztő (Alt + Shift + A) automatikusan újragenerálja a „Mentés fájlba” gombbal.
  Kézzel is szerkesztheted. Mezők naponta:
    title, message
    images: ["fotok/nap-04.jpg", "fotok/nap-04b.jpg"]  (az üzenet alatt jelennek meg)
    caption: "fotók alatti kis felirat"
    link: "https://..." (pl. dal, videó) és linkText: "Meghallgatom ↗"
*/
const gifts = [
  { title: "Egy kis mosoly", message: "Kezdődjön a december egy nagy mosollyal! Örülök, hogy vagy nekem. ❤️" },
  { title: "Egy kedves emlék", message: "Ma idézz fel egy olyan közös pillanatot, amitől mindig mosolyogni kezdesz. Nekem rengeteg ilyen van veled." },
  { title: "Csak egy üzenet", message: "Szeretném, ha tudnád: különleges vagy, és minden nap hálás vagyok érted." },
  { title: "A kedvenc képed", message: "Ide kerülhet egy közös fotótok és a hozzá tartozó történet." },
  { title: "Egy ölelés", message: "A mai ajándék egy hosszú, meleg ölelés. Ezt személyesen kell átvenned. 🤗" },
  { title: "Egy közös terv", message: "Válasszunk ki egy napot, amikor csak egymásra figyelünk, és csinálunk valami szépet." },
  { title: "Amiért szeretlek", message: "Szeretem benned a mosolyodat, a kedvességedet és azt, ahogyan szebbé teszed a hétköznapokat." },
  { title: "Egy kis meglepetés", message: "Ez a nap tartogasson neked valami finomat és sok-sok nevetést!" },
  { title: "Egy közös emlék", message: "Ide írd be a kedvenc közös emléketeket, és akár tegyél mellé egy fotót is." },
  { title: "Te és én", message: "A legjobb programokban az a közös, hogy veled lehetek." },
  { title: "Egy bók", message: "Ma csak annyit szeretnék mondani, hogy gyönyörű vagy – kívül-belül." },
  { title: "Félúton karácsonyig", message: "Már majdnem félúton vagyunk! Remélem, minden napodba jut egy kis varázslat." },
  { title: "Egy dal neked", message: "Ide írd be azt a dalt, ami rólatok jut eszedbe, vagy illeszd be a linkjét." },
  { title: "Közös kaland", message: "A következő közös kalandunk még előttünk áll. Alig várom!" },
  { title: "Egy apró kupon", message: "Kupon egy általad választott randira – a programot te találod ki, én állom a meglepetést." },
  { title: "A kedvenc pillanatom", message: "Ide írd le azt a pillanatot, amikor különösen boldog voltál vele." },
  { title: "Köszönöm", message: "Köszönöm, hogy mellettem vagy, hogy nevetsz velem, és hogy önmagad vagy." },
  { title: "Egy fotó", message: "Ide tegyél egy olyan képet, amitől biztosan elmosolyodik." },
  { title: "Egy kívánság", message: "Ma kívánj valamit – én pedig megpróbálom valóra váltani, ha rajtam múlik." },
  { title: "Még egy ölelés", message: "Ezt az ajtót egy újabb, legalább húsz másodperces ölelésre válthatod be." },
  { title: "A mi történetünk", message: "Minden közös napunk egy újabb szép fejezet. És még mennyi van hátra!" },
  { title: "Karácsonyi hangulat", message: "Ma legyen forró csoki, puha takaró, karácsonyi film és összebújás." },
  { title: "Már csak egy nap", message: "Holnap karácsony! Remélem, érzed, mennyire szeretlek és mennyire fontos vagy nekem." },
  { title: "Boldog karácsonyt, Zita!", message: "Ez az utolsó ajtó, de a meglepetéseknek nincs vége. Köszönöm, hogy vagy nekem. Nagyon szeretlek! ❤️" }
];
const siteTexts = {};

const photoList = [];
