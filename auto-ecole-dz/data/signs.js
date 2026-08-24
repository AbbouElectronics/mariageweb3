/*
 * مكتبة رموز إشارات المرور (رسومات SVG مبسّطة من تصميمنا الخاص)
 * كل مفتاح يقابل رمز SVG يمثل شكل ومعنى إشارة مرور عامة (اتفاقية فيينا / النمط المستعمل في الجزائر)
 */
const SIGNS = {
  stop: `<svg viewBox="0 0 100 100"><polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#d21f28" stroke="#7a0f14" stroke-width="3"/><text x="50" y="63" font-size="30" font-family="Arial,sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">STOP</text></svg>`,

  cedez: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,92 4,92" fill="#fff" stroke="#d21f28" stroke-width="8"/><polygon points="50,26 82,84 18,84" fill="#fff" stroke="#d21f28" stroke-width="3"/></svg>`,

  sensInterdit: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#d21f28" stroke="#7a0f14" stroke-width="3"/><rect x="18" y="42" width="64" height="16" fill="#fff"/></svg>`,

  interdictionDepasser: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#d21f28" stroke-width="6"/><g transform="translate(50,50)"><ellipse cx="-13" cy="0" rx="9" ry="16" fill="#d21f28"/><ellipse cx="13" cy="-8" rx="9" ry="16" fill="#111"/></g></svg>`,

  limitVitesse50: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#d21f28" stroke-width="8"/><text x="50" y="63" font-size="34" font-family="Arial,sans-serif" font-weight="bold" fill="#111" text-anchor="middle">50</text></svg>`,

  finLimitVitesse: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#eee" stroke="#888" stroke-width="4" stroke-dasharray="8 6"/><text x="50" y="63" font-size="30" font-family="Arial,sans-serif" font-weight="bold" fill="#555" text-anchor="middle">50</text></svg>`,

  obligationDroite: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1e5fbf" stroke="#123a75" stroke-width="3"/><path d="M35 65 L35 40 L50 40 L50 28 L72 50 L50 72 L50 60 L35 60 Z" fill="#fff"/></svg>`,

  passagePietons: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,50 50,96 4,50" fill="#1e5fbf" stroke="#123a75" stroke-width="3"/><g fill="#fff"><rect x="30" y="34" width="8" height="32"/><rect x="46" y="34" width="8" height="32"/><rect x="62" y="34" width="8" height="32"/></g></svg>`,

  sensUnique: `<svg viewBox="0 0 100 100"><rect x="6" y="34" width="88" height="32" rx="3" fill="#1e5fbf"/><polygon points="55,38 82,50 55,62" fill="#fff"/><rect x="18" y="46" width="38" height="8" fill="#fff"/></svg>`,

  parking: `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="8" fill="#1e5fbf"/><text x="50" y="70" font-size="52" font-family="Arial,sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">P</text></svg>`,

  stationnementInterdit: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1e5fbf" stroke="#123a75" stroke-width="3"/><line x1="18" y1="82" x2="82" y2="18" stroke="#d21f28" stroke-width="10"/></svg>`,

  routePrioritaire: `<svg viewBox="0 0 100 100"><rect x="28" y="28" width="44" height="44" fill="#ffd400" stroke="#fff" stroke-width="6" transform="rotate(45 50 50)"/></svg>`,

  finPriorite: `<svg viewBox="0 0 100 100"><rect x="28" y="28" width="44" height="44" fill="#ffd400" stroke="#888" stroke-width="4" stroke-dasharray="6 5" transform="rotate(45 50 50)"/></svg>`,

  dangerGeneral: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,92 4,92" fill="#fff" stroke="#d21f28" stroke-width="8"/><rect x="45" y="34" width="10" height="34" fill="#111"/><rect x="45" y="72" width="10" height="10" fill="#111"/></svg>`,

  virageDangereux: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,92 4,92" fill="#fff" stroke="#d21f28" stroke-width="8"/><path d="M30 76 Q30 34 70 34" fill="none" stroke="#111" stroke-width="8"/></svg>`,

  chausseeGlissante: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,92 4,92" fill="#fff" stroke="#d21f28" stroke-width="8"/><path d="M22 60 Q40 44 58 60 T78 58" fill="none" stroke="#111" stroke-width="6"/></svg>`,

  ecoleProximite: `<svg viewBox="0 0 100 100"><polygon points="50,6 96,92 4,92" fill="#fff" stroke="#d21f28" stroke-width="8"/><circle cx="50" cy="48" r="9" fill="#111"/><path d="M32 78 Q50 54 68 78" fill="none" stroke="#111" stroke-width="7"/></svg>`,

  feuTricolore: `<svg viewBox="0 0 100 100"><rect x="36" y="6" width="28" height="88" rx="8" fill="#222"/><circle cx="50" cy="24" r="9" fill="#d21f28"/><circle cx="50" cy="50" r="9" fill="#ffd400"/><circle cx="50" cy="76" r="9" fill="#2ea043"/></svg>`,

  rondPoint: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1e5fbf" stroke="#123a75" stroke-width="3"/><g fill="none" stroke="#fff" stroke-width="7"><circle cx="50" cy="50" r="18"/><path d="M50 32 L60 24" marker-end="url(#a)"/></g><polygon points="58,20 68,24 60,30" fill="#fff"/></svg>`,

  autoroute: `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="8" fill="#2ea043"/><path d="M20 70 L38 30 L50 30 L62 70 M27 55 L61 55" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>`,

  finAutoroute: `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="8" fill="#888"/><line x1="14" y1="86" x2="86" y2="14" stroke="#d21f28" stroke-width="8"/><path d="M20 70 L38 30 L50 30 L62 70 M27 55 L61 55" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>`,

  interdictionKlaxon: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#d21f28" stroke-width="6"/><path d="M30 40 L30 60 L42 60 L58 74 L58 26 L42 40 Z" fill="#111"/><line x1="18" y1="82" x2="82" y2="18" stroke="#d21f28" stroke-width="8"/></svg>`,

  ceinture: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1e5fbf" stroke="#123a75" stroke-width="3"/><path d="M28 24 Q52 44 30 78" fill="none" stroke="#fff" stroke-width="8"/><circle cx="30" cy="78" r="6" fill="#fff"/><circle cx="28" cy="24" r="6" fill="#fff"/></svg>`
};

if (typeof module !== 'undefined') module.exports = SIGNS;
