import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
        style={{ background: '#0d1117' }}
        defaultEdgeOptions={{
          style: { stroke: '#30363d', strokeWidth: 1.5 },
          animated: false,
        }}
      >
        <Background
          color="#21262d"
          gap={20}
          size={1}
        />
        <Controls
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            const colors = (window as any).__seekNodeColors?.[node.type as string];
            return colors?.border ?? '#30363d';
          }}
          maskColor="rgba(13, 17, 23, 0.8)"
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#30363d" strokeWidth="1">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 17.5h7M17.5 14v7"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#30363d', marginBottom: 4 }}>
              从左侧拖拽节点开始
            </div>
            <div style={{ fontSize: 12, color: '#21262d' }}>
              或双击画布快速添加
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
