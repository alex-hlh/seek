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
  return (
    <div
      style={{ flex: 1, height: '100%', position: 'relative' }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        style={{ background: '#f5f3ef' }}
        defaultEdgeOptions={{
          style: { stroke: '#c4bdb5', strokeWidth: 2 },
          animated: false,
        }}
      >
        {/* Paper-like dot grid */}
        <Background
          color="#ddd8d0"
          gap={20}
          size={1.5}
        />

        <Controls
          style={{
            background: '#ffffff',
            border: '1px solid #e0dbd4',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(60,50,40,0.08)',
          }}
        />
      </ReactFlow>

      {/* Empty state */}
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
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d4cfc8" strokeWidth="1">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 17.5h7M17.5 14v7" strokeLinecap="round"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#b0a898', marginBottom: 4 }}>
              从左侧拖拽节点开始
            </div>
            <div style={{ fontSize: 12, color: '#ccc5ba' }}>
              连接节点构建爬取流程
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
