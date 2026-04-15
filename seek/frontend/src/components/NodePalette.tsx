import { tokens } from '../styles/theme';
import type { DragEvent } from 'react';

export interface NodeTypeInfo {
  type: string;
  label: string;
  description: string;
}

export const NODE_TYPES: NodeTypeInfo[] = [
  { type: '起始URL',    label: '起始URL',    description: '设置爬取的起始URL列表' },
  { type: 'HTTP请求',   label: 'HTTP请求',   description: '发送HTTP GET/POST请求' },
  { type: 'API请求',    label: 'API请求',    description: '带认证的API请求' },
  { type: '浏览器执行',  label: '浏览器执行',  description: '使用Playwright执行浏览器操作' },
  { type: '循环',       label: '循环',       description: '遍历URL列表或分页' },
  { type: '条件分支',   label: '条件分支',   description: '根据条件决定执行路径' },
  { type: 'HTML解析',   label: 'HTML解析',   description: '使用CSS选择器提取HTML数据' },
  { type: 'JSON解析',   label: 'JSON解析',   description: '使用JSONPath解析JSON响应' },
  { type: '正则清洗',   label: '正则清洗',   description: '用正则表达式清洗数据' },
  { type: '字段映射',   label: '字段映射',   description: '重命名或映射字段' },
  { type: '保存到文件',  label: '保存到文件',  description: '将结果保存为JSONL/JSON/CSV' },
  { type: '人机验证',   label: '人机验证',   description: '自动处理年龄验证问题' },
];

interface NodePaletteProps {
  onDragStart: (event: DragEvent, nodeType: string) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <aside style={{
      width: 220,
      background: tokens.bgSurface,
      borderRight: `1px solid ${tokens.borderMuted}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: `${tokens.sp2}px ${tokens.sp2}px`,
        borderBottom: `1px solid ${tokens.borderMuted}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.sp1,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.accent} strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.6px',
          textTransform: 'uppercase' as const,
          color: tokens.textSecondary,
        }}>
          节点
        </span>
      </div>

      {/* Node list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: `${tokens.sp1}px 0` }}>
        {NODE_TYPES.map((node) => {
          const colors = tokens.nodeColors[node.type];
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              style={{
                margin: `2px ${tokens.sp1}px`,
                padding: `${tokens.sp1 + 1}px ${tokens.sp2}px`,
                borderRadius: tokens.radiusMd,
                border: `1px solid ${colors ? `${colors.border}40` : tokens.borderMuted}`,
                background: tokens.bgElevated,
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.sp2,
                userSelect: 'none',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = colors ? `${colors.border}80` : tokens.borderDefault;
                el.style.background = tokens.bgHover;
                el.style.boxShadow = colors ? `0 2px 12px ${colors.shadow}` : tokens.shadowSm;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = colors ? `${colors.border}40` : tokens.borderMuted;
                el.style.background = tokens.bgElevated;
                el.style.boxShadow = 'none';
              }}
            >
              {/* Color dot — functional, not decorative */}
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors?.border ?? tokens.accent,
                flexShrink: 0,
              }} />

              {/* Text */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors?.text ?? tokens.textPrimary,
                  lineHeight: 1.3,
                }}>
                  {node.label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: tokens.textMuted,
                  marginTop: 1,
                  lineHeight: 1.3,
                }}>
                  {node.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: `${tokens.sp1}px ${tokens.sp2}px`,
        borderTop: `1px solid ${tokens.borderMuted}`,
        fontSize: 10,
        color: tokens.textMuted,
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        拖拽到画布添加节点
      </div>
    </aside>
  );
}
