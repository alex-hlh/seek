// Unified design tokens for Seek Crawler
export const tokens = {
  bgApp: '#0d1117',
  bgSurface: '#161b22',
  bgElevated: '#21262d',
  bgHover: '#30363d',
  bgActive: '#388bfd1a',

  borderDefault: '#30363d',
  borderMuted: '#21262d',
  borderFocus: '#58a6ff',

  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',

  accent: '#58a6ff',
  accentHover: '#79b8ff',
  accentMuted: '#388bfd33',

  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',

  nodeColors: {
    '起始URL':    { bg: '#1a3a2a', border: '#238636', text: '#3fb950' },
    'HTTP请求':   { bg: '#1a2a3a', border: '#1f6feb', text: '#58a6ff' },
    'API请求':    { bg: '#1a1f3a', border: '#3b4fbf', text: '#8b8ff5' },
    '浏览器执行':  { bg: '#2a1a3a', border: '#8957e5', text: '#bc8cff' },
    '循环':       { bg: '#2a2a1a', border: '#9e6a03', text: '#e3b341' },
    '条件分支':   { bg: '#2a1e1a', border: '#6e4030', text: '#ff9d77' },
    'HTML解析':   { bg: '#1a3a38', border: '#238c8c', text: '#39d4d4' },
    'JSON解析':   { bg: '#1a3038', border: '#006994', text: '#58c8ff' },
    '正则清洗':   { bg: '#2a2830', border: '#595d68', text: '#9090a0' },
    '字段映射':   { bg: '#3a1a1a', border: '#bf3f3f', text: '#ff7070' },
    '保存到文件':  { bg: '#3a1a2a', border: '#bf3f8f', text: '#ff70bc' },
    '人机验证':   { bg: '#3a1a32', border: '#bf3faa', text: '#ff70dd' },
  } as Record<string, { bg: string; border: string; text: string }>,

  sp: 4,
  sp1: 8,
  sp2: 12,
  sp3: 16,
  sp4: 24,
  sp5: 32,

  radiusSm: 4,
  radiusMd: 6,
  radiusLg: 10,
  radiusXl: 14,

  fontMono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.5)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.6)',
} as const;
