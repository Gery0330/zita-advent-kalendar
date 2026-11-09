/*
  A szerkesztő beállításai.
  A jelszót NEM tartalmazza, csak az ellenőrző lenyomatát (PBKDF2-SHA256).
  Jelszócsere: a szerkesztőben a "Jelszó módosítása" gomb letölti az új admin-config.js-t,
  azt kell ide bemásolni a régi helyére.
*/
const ADMIN_CONFIG = {
  salt: "3f4c6965df9c675fb8d7b8ead1c15fbd",
  iterations: 200000,
  hash: "e24b1b3333ff52e05a2257adb7194f7f7241fc8267e5dda395998bab52f38203",
  shortcutLabel: "Alt + Shift + A"
};
