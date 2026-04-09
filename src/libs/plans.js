/*
 * Single source of truth for plan configuration.
 * Used by: pricing page, dashboard, API routes, feature gates.
 *
 * To add a new plan: add entry here, add STRIPE_PRICE_<NAME> env var, done.
 * To add a new feature gate: add to `gates` object below.
 */

export const PLAN_ORDER = ['free', 'starter', 'pro', 'business'];

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Try it out',
    monthlyPrice: 0,
    yearlyPrice: 0,
    videosPerMonth: 3,
    maxVideoLengthMin: 5,
    exportResolution: '720p',
    cta: 'Get started',
    popular: false,
    features: [
      '3 videos per month',
      'Auto-transcription',
      'Basic caption styles',
      '720p export',
      '5 min max video length',
    ],
    limitations: [
      'No SRT/VTT export',
      'FramePhase watermark',
      'No priority processing',
    ],
  },
  starter: {
    name: 'Starter',
    description: 'For creators getting started',
    monthlyPrice: 9,
    yearlyPrice: 7,
    videosPerMonth: 15,
    maxVideoLengthMin: 30,
    exportResolution: '1080p',
    cta: 'Start with Starter',
    popular: false,
    features: [
      '15 videos per month',
      'Auto-transcription',
      'Custom caption styles',
      '1080p export',
      'SRT & VTT export',
      'No watermark',
      '30 min max video length',
      'Email support',
    ],
    limitations: [],
  },
  pro: {
    name: 'Pro',
    description: 'For professional creators',
    monthlyPrice: 29,
    yearlyPrice: 24,
    videosPerMonth: 50,
    maxVideoLengthMin: 120,
    exportResolution: '4K',
    cta: 'Go Pro',
    popular: true,
    features: [
      '50 videos per month',
      'Everything in Starter',
      'Premium caption fonts',
      '4K export',
      'SRT & VTT export',
      'AI text summarization',
      '120 min max video length',
      'Multi-language support',
      'Keyboard shortcuts',
      'Priority processing',
      'Priority support',
    ],
    limitations: [],
  },
  business: {
    name: 'Business',
    description: 'For agencies & teams',
    monthlyPrice: 79,
    yearlyPrice: 63,
    videosPerMonth: 200,
    maxVideoLengthMin: null, // unlimited
    exportResolution: '4K',
    cta: 'Contact Sales',
    popular: false,
    features: [
      '200 videos per month',
      'Everything in Pro',
      'Team collaboration (5 seats)',
      'API access',
      'Custom branding',
      'Dedicated account manager',
      '99.9% uptime SLA',
    ],
    limitations: [],
  },
};

/*
 * Feature gates — check if a plan has access to a feature.
 * Usage: canAccess('pro', 'srtExport') → true
 */
export const FEATURE_GATES = {
  srtExport: ['starter', 'pro', 'business', 'admin'],
  vttExport: ['starter', 'pro', 'business', 'admin'],
  // assExport: ['pro', 'business', 'admin'], // TODO: implement ASS export before re-enabling
  customStyles: ['starter', 'pro', 'business', 'admin'],
  premiumFonts: ['pro', 'business', 'admin'],
  aiSummarize: ['pro', 'business', 'admin'],
  priorityProcessing: ['pro', 'business', 'admin'],
  multiLanguage: ['pro', 'business', 'admin'],
  keyboardShortcuts: ['pro', 'business', 'admin'],
  noWatermark: ['starter', 'pro', 'business', 'admin'],
  teamFeatures: ['business', 'admin'],
  apiAccess: ['business', 'admin'],
  customBranding: ['business', 'admin'],
  highResExport: ['starter', 'pro', 'business', 'admin'], // 1080p+
  fourKExport: ['pro', 'business', 'admin'],
};

export function canAccess(plan, feature) {
  if (!plan || !feature) return false;
  const allowed = FEATURE_GATES[feature];
  if (!allowed) return false;
  return allowed.includes(plan.toLowerCase());
}

export function getPlanByName(name) {
  return PLANS[name?.toLowerCase()] || PLANS.free;
}

export function getNextPlan(currentPlan) {
  const idx = PLAN_ORDER.indexOf(currentPlan);
  if (idx < 0 || idx >= PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

/*
 * Supported languages for transcription.
 * Full AWS Transcribe language catalogue (100+).
 * See: https://docs.aws.amazon.com/transcribe/latest/dg/supported-languages.html
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },

  // ── Popular (sorted by global usage) ──
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'en-ZA', name: 'English (South Africa)', flag: '🇿🇦' },
  { code: 'en-NZ', name: 'English (New Zealand)', flag: '🇳🇿' },
  { code: 'en-IE', name: 'English (Ireland)', flag: '🇮🇪' },
  { code: 'en-WL', name: 'English (Wales)', flag: '🏴' },
  { code: 'en-AB', name: 'English (Scotland)', flag: '🏴' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-US', name: 'Spanish (US)', flag: '🇲🇽' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic (Saudi)', flag: '🇸🇦' },
  { code: 'ar-AE', name: 'Arabic (UAE)', flag: '🇦🇪' },
  { code: 'ar-MA', name: 'Arabic (Morocco)', flag: '🇲🇦' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
  { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦' },
  { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  { code: 'de-CH', name: 'German (Switzerland)', flag: '🇨🇭' },
  { code: 'de-AT', name: 'German (Austria)', flag: '🇦🇹' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },

  // ── European ──
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'da-DK', name: 'Danish', flag: '🇩🇰' },
  { code: 'nb-NO', name: 'Norwegian (Bokmål)', flag: '🇳🇴' },
  { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el-GR', name: 'Greek', flag: '🇬🇷' },
  { code: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro-RO', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu-HU', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sk-SK', name: 'Slovak', flag: '🇸🇰' },
  { code: 'bg-BG', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr-HR', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sl-SI', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'sr-RS', name: 'Serbian', flag: '🇷🇸' },
  { code: 'bs-BA', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'lt-LT', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lv-LV', name: 'Latvian', flag: '🇱🇻' },
  { code: 'et-ET', name: 'Estonian', flag: '🇪🇪' },
  { code: 'uk-UA', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'be-BY', name: 'Belarusian', flag: '🇧🇾' },
  { code: 'is-IS', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'mk-MK', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'sq-AL', name: 'Albanian', flag: '🇦🇱' },
  { code: 'mt-MT', name: 'Maltese', flag: '🇲🇹' },
  { code: 'cy-WL', name: 'Welsh', flag: '🏴' },
  { code: 'ga-IE', name: 'Irish', flag: '🇮🇪' },
  { code: 'gl-ES', name: 'Galician', flag: '🇪🇸' },
  { code: 'eu-ES', name: 'Basque', flag: '🇪🇸' },
  { code: 'ca-ES', name: 'Catalan', flag: '🇪🇸' },

  // ── South & Southeast Asian ──
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
  { code: 'si-LK', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'ne-NP', name: 'Nepali', flag: '🇳🇵' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl-PH', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { code: 'my-MM', name: 'Burmese', flag: '🇲🇲' },
  { code: 'km-KH', name: 'Khmer', flag: '🇰🇭' },
  { code: 'lo-LA', name: 'Lao', flag: '🇱🇦' },

  // ── East Asian ──
  { code: 'mn-MN', name: 'Mongolian', flag: '🇲🇳' },

  // ── Central Asian & Caucasus ──
  { code: 'ka-GE', name: 'Georgian', flag: '🇬🇪' },
  { code: 'hy-AM', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az-AZ', name: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'kk-KZ', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'uz-UZ', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'tg-TJ', name: 'Tajik', flag: '🇹🇯' },
  { code: 'ky-KG', name: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'tk-TM', name: 'Turkmen', flag: '🇹🇲' },
  { code: 'ps-AF', name: 'Pashto', flag: '🇦🇫' },
  { code: 'fa-IR', name: 'Persian (Farsi)', flag: '🇮🇷' },

  // ── Middle East & Africa ──
  { code: 'he-IL', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
  { code: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
  { code: 'so-SO', name: 'Somali', flag: '🇸🇴' },
  { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬' },
  { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦' },
  { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'rw-RW', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'wo-SN', name: 'Wolof', flag: '🇸🇳' },
  { code: 'sn-ZW', name: 'Shona', flag: '🇿🇼' },
  { code: 'lg-UG', name: 'Luganda', flag: '🇺🇬' },
  { code: 'ln-CD', name: 'Lingala', flag: '🇨🇩' },
  { code: 'ny-MW', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'xh-ZA', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'st-ZA', name: 'Sesotho', flag: '🇿🇦' },
  { code: 'tn-BW', name: 'Setswana', flag: '🇧🇼' },

  // ── Americas (indigenous) ──
  { code: 'qu-PE', name: 'Quechua', flag: '🇵🇪' },
  { code: 'gn-PY', name: 'Guarani', flag: '🇵🇾' },
  { code: 'ay-BO', name: 'Aymara', flag: '🇧🇴' },
];

/*
 * Caption style presets — available per plan tier.
 */
export const CAPTION_PRESETS = {
  // Available to all plans
  basic: [
    { id: 'classic', name: 'Classic', primary: '#FFFFFF', outline: '#000000', font: 'Poppins Bold', fontSize: 30 },
    { id: 'yellow', name: 'Yellow Pop', primary: '#FFFF00', outline: '#000000', font: 'Poppins Bold', fontSize: 30 },
    { id: 'bold-red', name: 'Bold Red', primary: '#FFFFFF', outline: '#FF0000', font: 'Poppins Bold', fontSize: 30 },
  ],
  // Available to Starter+
  custom: [
    { id: 'neon', name: 'Neon Glow', primary: '#00D4FF', outline: '#001133', font: 'Poppins Bold', fontSize: 32 },
    { id: 'soft', name: 'Soft', primary: '#E0E0E0', outline: '#333333', font: 'Poppins', fontSize: 28 },
    { id: 'sunset', name: 'Sunset', primary: '#FF6B35', outline: '#1A0000', font: 'Poppins Bold', fontSize: 30 },
    { id: 'mint', name: 'Mint Fresh', primary: '#A8E6CF', outline: '#1B3A2D', font: 'Poppins', fontSize: 28 },
    { id: 'fire', name: 'Fire', primary: '#FF4444', outline: '#FFFFFF', font: 'Poppins Bold', fontSize: 34 },
  ],
  // Available to Pro+
  premium: [
    { id: 'gradient-pop', name: 'Gradient Pop', primary: '#FF00FF', outline: '#000033', font: 'Poppins Bold', fontSize: 36 },
    { id: 'cinematic', name: 'Cinematic', primary: '#F5F5DC', outline: '#2C2C2C', font: 'Poppins', fontSize: 26 },
    { id: 'minimal-white', name: 'Minimal', primary: '#FFFFFF', outline: '#FFFFFF', font: 'Poppins', fontSize: 24 },
    { id: 'tiktok', name: 'TikTok Style', primary: '#FFFFFF', outline: '#000000', font: 'Poppins Bold', fontSize: 38 },
    { id: 'news', name: 'News Ticker', primary: '#FFFFFF', outline: '#003366', font: 'Poppins', fontSize: 28 },
  ],
};

export function getAvailablePresets(plan) {
  const p = plan?.toLowerCase() || 'free';
  let presets = [...CAPTION_PRESETS.basic];
  if (['starter', 'pro', 'business', 'admin'].includes(p)) {
    presets = [...presets, ...CAPTION_PRESETS.custom];
  }
  if (['pro', 'business', 'admin'].includes(p)) {
    presets = [...presets, ...CAPTION_PRESETS.premium];
  }
  return presets;
}
