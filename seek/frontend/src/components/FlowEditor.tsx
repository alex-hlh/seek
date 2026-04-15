import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { tokens } from '../styles/theme';

interface FlowEditorProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onNodeClick: NodeMouseHandler;
}

// Node type color map — functional, vivid on light
const nodeStyleMap: Record<string, { bg: string; border: string; text: string }> = {
  '起始URL':    { bg: '#eaf4ed', border: '#3d8b55', text: '#2d6e42' },
  'HTTP请求':   { bg: '#eaf0f8', border: '#3b6fa8', text: '#295a85' },
  'API请求':    { bg: '#eeecf8', border: '#5f52c0', text: '#4a40a0' },
  '浏览器执行':  { bg: '#f5ecf8', border: '#8f5bc0', text: '#7347a0' },
  '循环':       { bg: '#f8f3e8', border: '#b8882a', text: '#9a6f20' },
  '条件分支':   { bg: '#f8ece8', border: '#b86c38', text: '#9a5530' },
  'HTML解析':   { bg: '#e8f6f5', border: '#2a9898', text: '#1f7a7a' },
  'JSON解析':   { bg: '#e8f2f8', border: '#2a78b8', text: '#1f6298' },
  '正则清洗':   { bg: '#f2f0ed', border: '#7a7068', text: '#5e564e' },
  '字段映射':   { bg: '#f8e8e8', border: '#b85050', text: '#983c3c' },
  '保存到文件':  { bg: '#f8eaf0', border: '#b85098', text: '#9a3c80' },
  '人机验证':   { bg: '#f8ecf0', border: '#b850b8', text: '#983c98' },
};

function applyNodeColors(nodes: Node[]): Node[] {
  return nodes.map((node) => {
    const nodeType = (node.data?.nodeType as string) ?? '';
    const colors = nodeStyleMap[nodeType];
    if (!colors) return node;
    return {
      ...node,
      style: {
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 12,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${colors.border}25`,
        minWidth: 120,
      } as React.CSSProperties,
    };
  });
}

export function FlowEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onNodeClick,
}: FlowEditorProps) {
  const coloredNodes = applyNodeColors(nodes);

  return (
    <div
      style={{ flex: 1, height: '100%', position: 'relative' }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={coloredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        style={{ background: tokens.flowBg }}
        defaultEdgeOptions={{
          style: { stroke: '#c4bdb5', strokeWidth: 2 },
          animated: false,
        }}
      >
        <Background
          color={tokens.flowDot}
          gap={20}
          size={1.5}
        />

        <Controls
          style={{
            background: tokens.flowControlsBg,
            border: `1px solid ${tokens.flowControlsBorder}`,
            borderRadius: tokens.radiusMd,
            boxShadow: tokens.shadowMd,
          }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          gap: 12,
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4cfc8" strokeWidth="1">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 17.5h7M17.5 14v7" strokeLinecap="round"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#b0a898', marginBottom: 4 }}>
              从左侧拖拽节点开始
            </div>
            <div style={{ fontSize: 11, color: '#ccc5ba' }}>
              连接节点构建爬取流程
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
