/* =========================================================
   LANGUAGE ENGINE
   Loads after translations.js. Exposes window.coopLang:
     t(key, vars)  — the text for key in the current language
     set(code)     — switch language (saved in localStorage)
     onChange(fn)  — run fn after every switch, so code that
                     builds its own HTML can re-render
========================================================= */
(function(){
  const DEFAULT_LANG = "en";
  const LANGS = window.COOP_LANGUAGES || {};

  if (!LANGS[DEFAULT_LANG]){
    console.error("translations.js is missing or has an error — check it for a missing quote, comma or brace.");
  }

  let current = DEFAULT_LANG;
  try {
    const saved = localStorage.getItem("coopLang");
    if (LANGS[saved]) current = saved;
  } catch(e){ }

  function get(){ return current; }

  function info(code){ return LANGS[code || current] || {}; }

  function list(){
    return Object.keys(LANGS).map(code => Object.assign({ code }, LANGS[code]));
  }

  function t(key, vars, lang){
    const code = lang || current;
    const mine = (LANGS[code] && LANGS[code].strings) || {};
    const english = (LANGS[DEFAULT_LANG] && LANGS[DEFAULT_LANG].strings) || {};
    let s = mine[key];
    if (s === undefined) s = english[key];
    if (s === undefined) s = key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  const ATTRS = [
    ["i18nPlaceholder", "placeholder"],
    ["i18nTitle",       "title"],
    ["i18nAriaLabel",   "aria-label"]
  ];

  function setHtmlLang(){
    document.documentElement.lang = info().htmlLang || current;
  }

  function apply(scope){
    scope = scope || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    ATTRS.forEach(([dataKey, attr]) => {
      const sel = "[data-" + dataKey.replace(/[A-Z]/g, c => "-" + c.toLowerCase()) + "]";
      scope.querySelectorAll(sel).forEach(el => el.setAttribute(attr, t(el.dataset[dataKey])));
    });
    setHtmlLang();
  }

  const listeners = [];
  function onChange(fn){ listeners.push(fn); }

  function set(code){
    if (!LANGS[code] || code === current) return;
    current = code;
    try { localStorage.setItem("coopLang", code); } catch(e){ }
    apply();
    listeners.forEach(fn => fn(code));
  }

  window.coopLang = { DEFAULT_LANG, get, set, t, apply, info, list, onChange };

  setHtmlLang();
  document.addEventListener("DOMContentLoaded", () => apply());
})();
