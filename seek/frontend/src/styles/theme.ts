// Light paper-inspired design tokens for Seek Crawler
export const tokens = {
  // Backgrounds — warm paper tones
  bgApp:     '#f5f3ef',   // warm off-white, like aged paper
  bgSurface: '#ffffff',   // pure white cards
  bgElevated:'#faf9f7',  // slightly warm white
  bgHover:   '#f0ede8',   // warm hover
  bgActive:  '#e8e4dc',   // pressed state

  // Borders
  borderDefault: '#e0dbd4',  // warm light gray
  borderMuted:   '#ede9e2',  // subtle warm
  borderFocus:  '#b8a99a',  // warm brown focus

  // Text
  textPrimary:   '#2c2416',  // dark warm brown
  textSecondary: '#7a6e60',  // medium warm
  textMuted:     '#a89f92',  // light warm
  textDisabled:  '#ccc5ba',

  // Accent — muted terracotta/rust
  accent:      '#c4704b',
  accentHover: '#a85c38',
  accentMuted: '#c4704b22',

  // Status
  success: '#5a9a6e',
  warning: '#c49a3c',
  error:   '#c45c5c',

  // Node type colors — vivid against light paper
  nodeColors: {
    '起始URL':    { bg: '#eaf4ed', border: '#3d8b55', text: '#2d6e42', shadow: '#3d8b5522' },
    'HTTP请求':   { bg: '#eaf0f8', border: '#3b6fa8', text: '#295a85', shadow: '#3b6fa822' },
    'API请求':    { bg: '#eeecf8', border: '#5f52c0', text: '#4a40a0', shadow: '#5f52c022' },
    '浏览器执行':  { bg: '#f5ecf8', border: '#8f5bc0', text: '#7347a0', shadow: '#8f5bc022' },
    '循环':       { bg: '#f8f3e8', border: '#b8882a', text: '#9a6f20', shadow: '#b8882a22' },
    '条件分支':   { bg: '#f8ece8', border: '#b86c38', text: '#9a5530', shadow: '#b86c3822' },
    'HTML解析':   { bg: '#e8f6f5', border: '#2a9898', text: '#1f7a7a', shadow: '#2a989822' },
    'JSON解析':   { bg: '#e8f2f8', border: '#2a78b8', text: '#1f6298', shadow: '#2a78b822' },
    '正则清洗':   { bg: '#f2f0ed', border: '#7a7068', text: '#5e564e', shadow: '#7a706822' },
    '字段映射':   { bg: '#f8e8e8', border: '#b85050', text: '#983c3c', shadow: '#b8505022' },
    '保存到文件':  { bg: '#f8eaf0', border: '#b85098', text: '#9a3c80', shadow: '#b8509822' },
    '人机验证':   { bg: '#f8ecf0', border: '#b850b8', text: '#983c98', shadow: '#b850b822' },
  } as Record<string, { bg: string; border: string; text: string; shadow: string }>,

  // Spacing
  sp: 4,
  sp1: 8,
  sp2: 12,
  sp3: 16,
  sp4: 24,
  sp5: 32,

  // Radii — slightly rounded, friendly
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,

  // Typography
  fontMono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Shadows — soft, paper-like
  shadowSm: '0 1px 3px rgba(60,50,40,0.08)',
  shadowMd: '0 4px 12px rgba(60,50,40,0.10)',
  shadowLg: '0 8px 24px rgba(60,50,40,0.12)',
  shadowNode: '0 2px 8px rgba(60,50,40,0.10)',
} as const;
