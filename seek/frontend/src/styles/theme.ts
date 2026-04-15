// Light theme with Spotify-inspired node cards for Seek Crawler
export const tokens = {
  // Backgrounds — light yellow/beige
  bgApp:      '#faf5e8',   // light cream yellow
  bgSurface:  '#fffdf5',   // near white with warmth
  bgElevated: '#fff9f0',   // warm white
  bgHover:    '#f5edd8',   // yellow hover
  bgActive:   '#ece5d0',   // pressed state

  // Borders
  borderDefault: '#e0d5b8',  // warm tan
  borderMuted:   '#ede5d5',  // subtle warm
  borderFocus:   '#c9a84c',  // golden focus

  // Accent — Spotify Green (#1ed760) as functional highlight
  accent:       '#1ed760',
  accentHover:  '#1db954',
  accentMuted:  '#1ed76022',

  // Status (semantic)
  success: '#3d8b55',
  warning: '#b8882a',
  error:   '#c45c5c',

  // Text
  textPrimary:   '#2c2416',
  textSecondary: '#7a6e60',
  textMuted:     '#a89f92',
  textDisabled:  '#ccc5ba',

  // Node type colors — vivid, functional against light
  nodeColors: {
    '起始URL':    { bg: '#eaf4ed', border: '#3d8b55', text: '#2d6e42', shadow: 'rgba(61,139,85,0.15)' },
    'HTTP请求':   { bg: '#eaf0f8', border: '#3b6fa8', text: '#295a85', shadow: 'rgba(59,111,168,0.15)' },
    'API请求':    { bg: '#eeecf8', border: '#5f52c0', text: '#4a40a0', shadow: 'rgba(95,82,192,0.15)' },
    '浏览器执行':  { bg: '#f5ecf8', border: '#8f5bc0', text: '#7347a0', shadow: 'rgba(143,91,192,0.15)' },
    '循环':       { bg: '#f8f3e8', border: '#b8882a', text: '#9a6f20', shadow: 'rgba(184,136,42,0.15)' },
    '条件分支':   { bg: '#f8ece8', border: '#b86c38', text: '#9a5530', shadow: 'rgba(184,108,56,0.15)' },
    'HTML解析':   { bg: '#e8f6f5', border: '#2a9898', text: '#1f7a7a', shadow: 'rgba(42,152,152,0.15)' },
    'JSON解析':   { bg: '#e8f2f8', border: '#2a78b8', text: '#1f6298', shadow: 'rgba(42,120,184,0.15)' },
    '正则清洗':   { bg: '#f2f0ed', border: '#7a7068', text: '#5e564e', shadow: 'rgba(122,112,104,0.15)' },
    '字段映射':   { bg: '#f8e8e8', border: '#b85050', text: '#983c3c', shadow: 'rgba(184,80,80,0.15)' },
    '保存到文件':  { bg: '#f8eaf0', border: '#b85098', text: '#9a3c80', shadow: 'rgba(184,80,152,0.15)' },
    '人机验证':   { bg: '#f8ecf0', border: '#b850b8', text: '#983c98', shadow: 'rgba(184,80,184,0.15)' },
  } as Record<string, { bg: string; border: string; text: string; shadow: string }>,

  // Spacing
  sp:  4,
  sp1: 8,
  sp2: 12,
  sp3: 16,
  sp4: 24,
  sp5: 32,

  // Radii
  radiusSm:   4,
  radiusMd:   8,
  radiusLg:   12,
  radiusXl:   16,
  radiusPill: '9999px',

  // Typography
  fontMono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Shadows — soft, paper-like
  shadowSm: '0 1px 3px rgba(60,50,40,0.08)',
  shadowMd: '0 4px 12px rgba(60,50,40,0.10)',
  shadowLg: '0 8px 24px rgba(60,50,40,0.12)',
  shadowNode: '0 2px 8px rgba(60,50,40,0.10)',

  // React Flow overrides
  flowBg:     '#faf5e8',
  flowDot:    '#e0d5b8',
  flowControlsBg:   '#fffdf5',
  flowControlsBorder: '#e0d5b8',
} as const;
