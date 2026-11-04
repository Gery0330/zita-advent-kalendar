/*
  ITT TUDOD SZEMÉLYRE SZABNI A MEGLEPETÉSEKET.
  Minden naphoz add meg a címet, az üzenetet és opcionálisan egy képet.
  A képeket tedd az images mappába, például: images/nap-01.jpg
  Ha nincs kép, az image mező maradjon üres: "".
*/
const gifts = [
  { title: "Egy kis mosoly", message: "Kezdődjön a december egy nagy mosollyal! Örülök, hogy vagy nekem. ❤️", image: "" },
  { title: "Egy kedves emlék", message: "Ma idézz fel egy olyan közös pillanatot, amitől mindig mosolyogni kezdesz. Nekem rengeteg ilyen van veled.", image: "" },
  { title: "Csak egy üzenet", message: "Szeretném, ha tudnád: különleges vagy, és minden nap hálás vagyok érted.", image: "" },
  { title: "A kedvenc képed", message: "Ide kerülhet egy közös fotótok és a hozzá tartozó történet.", image: "" },
  { title: "Egy ölelés", message: "A mai ajándék egy hosszú, meleg ölelés. Ezt személyesen kell átvenned. 🤗", image: "" },
  { title: "Egy közös terv", message: "Válasszunk ki egy napot, amikor csak egymásra figyelünk, és csinálunk valami szépet.", image: "" },
  { title: "Amiért szeretlek", message: "Szeretem benned a mosolyodat, a kedvességedet és azt, ahogyan szebbé teszed a hétköznapokat.", image: "" },
  { title: "Egy kis meglepetés", message: "Ez a nap tartogasson neked valami finomat és sok-sok nevetést!", image: "" },
  { title: "Egy közös emlék", message: "Ide írd be a kedvenc közös emléketeket, és akár tegyél mellé egy fotót is.", image: "" },
  { title: "Te és én", message: "A legjobb programokban az a közös, hogy veled lehetek.", image: "" },
  { title: "Egy bók", message: "Ma csak annyit szeretnék mondani, hogy gyönyörű vagy – kívül-belül.", image: "" },
  { title: "Félúton karácsonyig", message: "Már majdnem félúton vagyunk! Remélem, minden napodba jut egy kis varázslat.", image: "" },
  { title: "Egy dal neked", message: "Ide írd be azt a dalt, ami rólatok jut eszedbe, vagy illeszd be a linkjét.", image: "" },
  { title: "Közös kaland", message: "A következő közös kalandunk még előttünk áll. Alig várom!", image: "" },
  { title: "Egy apró kupon", message: "Kupon egy általad választott randira – a programot te találod ki, én állom a meglepetést.", image: "" },
  { title: "A kedvenc pillanatom", message: "Ide írd le azt a pillanatot, amikor különösen boldog voltál vele.", image: "" },
  { title: "Köszönöm", message: "Köszönöm, hogy mellettem vagy, hogy nevetsz velem, és hogy önmagad vagy.", image: "" },
  { title: "Egy fotó", message: "Ide tegyél egy olyan képet, amitől biztosan elmosolyodik.", image: "" },
  { title: "Egy kívánság", message: "Ma kívánj valamit – én pedig megpróbálom valóra váltani, ha rajtam múlik.", image: "" },
  { title: "Még egy ölelés", message: "Ezt az ajtót egy újabb, legalább húsz másodperces ölelésre válthatod be.", image: "" },
  { title: "A mi történetünk", message: "Minden közös napunk egy újabb szép fejezet. És még mennyi van hátra!", image: "" },
  { title: "Karácsonyi hangulat", message: "Ma legyen forró csoki, puha takaró, karácsonyi film és összebújás.", image: "" },
  { title: "Már csak egy nap", message: "Holnap karácsony! Remélem, érzed, mennyire szeretlek és mennyire fontos vagy nekem.", image: "" },
  { title: "Boldog karácsonyt, Zita!", message: "Ez az utolsó ajtó, de a meglepetéseknek nincs vége. Köszönöm, hogy vagy nekem. Nagyon szeretlek! ❤️", image: "" }
];