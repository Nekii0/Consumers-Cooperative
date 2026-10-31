/* =========================================================
   THEME ENGINE
   Loads in <head> so the saved background color is applied
   before the page paints (no flash of the default green).
   Exposes window.coopTheme with get / save / reset / PRESETS.

   Changing the background also recolors the text: light
   backgrounds get dark "chalk", dark backgrounds get light.
   --chalk-rgb is the same color as r,g,b so styles.css can
   draw see-through lines with rgba(var(--chalk-rgb), 0.2).
========================================================= */
(function(){
  const DEFAULT_BG = "#1F2E1B";
  const root = document.documentElement;

  const PRESETS = [
    { name: "Chalkboard Green", hex: "#1F2E1B" },
    { name: "Deep Navy",        hex: "#1B2A41" },
    { name: "Charcoal",         hex: "#262626" },
    { name: "Warm Brown",       hex: "#3B2A1E" },
    { name: "Soft Cream",       hex: "#F5EFDC" },
    { name: "Pale Sky Blue",    hex: "#E3ECF5" },
    { name: "Light Sage",       hex: "#E6EDDF" }
  ];

  function hexToRgb(hex){
    const h = hex.replace("#", "");
    return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
  }
  function rgbToHex(rgb){
    return "#" + rgb.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  }
  // blend hex toward targetHex by amt (0 = unchanged, 1 = target)
  function mix(hex, targetHex, amt){
    const a = hexToRgb(hex), b = hexToRgb(targetHex);
    return rgbToHex(a.map((v, i) => v + (b[i] - v) * amt));
  }
  // relative luminance (WCAG formula)
  function luminance(hex){
    const [r, g, b] = hexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function isLight(hex){ return luminance(hex) > 0.4; }

  function isValid(hex){ return /^#[0-9a-f]{6}$/i.test(hex || ""); }

  function apply(hex){
    if (!isValid(hex)) hex = DEFAULT_BG;
    const chalk = isLight(hex) ? "#2B2620" : "#F1EAD9";
    root.style.setProperty("--board", hex);
    root.style.setProperty("--board-2", mix(hex, "#FFFFFF", isLight(hex) ? 0.55 : 0.07));
    root.style.setProperty("--chalk", chalk);
    root.style.setProperty("--chalk-dim", isLight(hex) ? "#4E4637" : "#C8C2AE");
    root.style.setProperty("--chalk-rgb", hexToRgb(chalk).join(","));
  }

  function get(){
    try {
      const saved = localStorage.getItem("coopTheme");
      return isValid(saved) ? saved : DEFAULT_BG;
    } catch(e){ return DEFAULT_BG; }
  }

  function save(hex){
    try { localStorage.setItem("coopTheme", hex); } catch(e){ }
    apply(hex);
  }

  function reset(){
    try { localStorage.removeItem("coopTheme"); } catch(e){ }
    apply(DEFAULT_BG);
  }

  window.coopTheme = { DEFAULT_BG, PRESETS, get, save, reset, apply, isLight };
  apply(get());
})();
