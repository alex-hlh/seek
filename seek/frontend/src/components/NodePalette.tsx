import React from 'react';

export interface NodeTypeInfo {
  type: string;
  label: string;
  description: string;
  color: string;
}

export const NODE_TYPES: NodeTypeInfo[] = [
  { type: '起始URL', label: '起始URL', description: '设置爬取的起始URL列表', color: '#4CAF50' },
  { type: 'HTTP请求', label: 'HTTP请求', description: '发送HTTP GET/POST请求', color: '#2196F3' },
  { type: 'API请求', label: 'API请求', description: '带认证的API请求', color: '#3F51B5' },
  { type: '浏览器执行', label: '浏览器执行', description: '使用Playwright执行浏览器操作', color: '#9C27B0' },
  { type: '循环', label: '循环', description: '遍历URL列表或分页', color: '#FF9800' },
  { type: '条件分支', label: '条件分支', description: '根据条件决定执行路径', color: '#795548' },
  { type: 'HTML解析', label: 'HTML解析', description: '使用CSS选择器提取HTML数据', color: '#009688' },
  { type: 'JSON解析', label: 'JSON解析', description: '使用JSONPath解析JSON响应', color: '#00BCD4' },
  { type: '正则清洗', label: '正则清洗', description: '用正则表达式清洗数据', color: '#607D8B' },
  { type: '字段映射', label: '字段映射', description: '重命名或映射字段', color: '#FF5722' },
  { type: '保存到文件', label: '保存到文件', description: '将结果保存为JSONL/JSON/CSV', color: '#F44336' },
  { type: '人机验证', label: '人机验证', description: '自动处理年龄验证问题', color: '#E91E63' },
];

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <aside style={{
      width: 200,
      borderRight: '1px solid #e0e0e0',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        fontWeight: 600,
        fontSize: 13,
        color: '#333',
        borderBottom: '1px solid #e0e0e0',
        background: '#fff',
      }}>
        节点类型
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            style={{
              margin: '4px 8px',
              padding: '8px 10px',
              borderRadius: 6,
              border: `1px solid ${node.color}22`,
              background: '#fff',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              userSelect: 'none',
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: node.color,
              flexShrink: 0,
              marginTop: 3,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{node.label}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2, lineHeight: 1.3 }}>
                {node.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
