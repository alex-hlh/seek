import { useState, useCallback, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  type NodeMouseHandler,
} from '@xyflow/react';
import axios from 'axios';
import { tokens } from './styles/theme';
import { FlowEditor } from './components/FlowEditor';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';

let nodeCounter = 1;

type RunStatus = 'idle' | 'running' | 'done' | 'error';

const statusConfig = {
  idle:    { color: tokens.textMuted,   label: '就绪' },
  running:  { color: tokens.accent,     label: '运行中' },
  done:    { color: tokens.success,     label: '已完成' },
  error:   { color: tokens.error,      label: '出错' },
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [runMessage, setRunMessage] = useState('');
  const [workflowName, setWorkflowName] = useState('未命名工作流');
  const dragTypeRef = useRef<string | null>(null);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  function handleDragStart(event: React.DragEvent, nodeType: string) {
    dragTypeRef.current = nodeType;
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const type = dragTypeRef.current;
    if (!type) return;

    const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left - 75,
      y: event.clientY - bounds.top - 20,
    };

    const id = `node_${nodeCounter++}`;
    const newNode: Node = {
      id,
      type: 'default',
      position,
      data: { label: type, nodeType: type },
    };

    setNodes((nds) => [...nds, newNode]);
    dragTypeRef.current = null;
  }

  function handleNodeUpdate(nodeId: string, data: Record<string, unknown>) {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
    );
    setSelectedNode((prev) =>
      prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev,
    );
  }

  async function handleSave() {
    const workflow = {
      name: workflowName,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.data.nodeType as string) ?? n.id,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    };
    const res = await axios.post('/api/workflows', workflow);
    setWorkflowId(res.data.id);
  }

  async function handleLoad() {
    const res = await axios.get('/api/workflows');
    if (res.data.length === 0) return;
    const wf = await axios.get(`/api/workflows/${res.data[0].id}`);
    const data = wf.data;
    setWorkflowId(data.id);
    setWorkflowName(data.name ?? '未命名工作流');
    setNodes(
      (data.nodes ?? []).map((n: any) => ({
        id: n.id,
        type: 'default',
        position: n.position ?? { x: 0, y: 0 },
        data: { label: n.type, nodeType: n.type, ...n.data },
      })),
    );
    setEdges(
      (data.edges ?? []).map((e: any) => ({ id: e.id, source: e.source, target: e.target })),
    );
  }

  async function handleRun() {
    if (!workflowId) {
      await handleSave();
      return;
    }
    setRunStatus('running');
    setRunMessage('连接中...');

    const ws = new WebSocket(`ws://${location.host}/ws/run/${workflowId}`);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'start') setRunMessage('运行中...');
      else if (msg.type === 'complete') {
        setRunStatus('done');
        setRunMessage(`完成！共 ${msg.results_count} 条结果`);
      } else if (msg.type === 'error') {
        setRunStatus('error');
        setRunMessage(`错误: ${msg.message}`);
      }
    };
    ws.onerror = () => {
      setRunStatus('error');
      setRunMessage('连接失败');
    };
    ws.onclose = () => {
      if (runStatus === 'running') setRunStatus('idle');
    };
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: tokens.radiusMd,
    border: `1px solid ${tokens.borderDefault}`,
    background: tokens.bgElevated,
    color: tokens.textPrimary,
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: tokens.shadowSm,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: tokens.bgApp }}>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <header style={{
        height: 52,
        borderBottom: `1px solid ${tokens.borderDefault}`,
        background: tokens.bgSurface,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${tokens.sp3}px`,
        gap: tokens.sp2,
        flexShrink: 0,
        boxShadow: tokens.shadowSm,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={tokens.accent} strokeWidth="1.5"/>
            <path d="M8 12h8M12 8v8" stroke={tokens.accent} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, color: tokens.textPrimary, letterSpacing: '-0.02em' }}>
            Seek
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: tokens.borderDefault, margin: '0 4px' }} />

        {/* Workflow name */}
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: tokens.textSecondary,
            fontSize: 13,
            fontWeight: 500,
            outline: 'none',
            width: 160,
            borderBottom: `1px solid transparent`,
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = tokens.borderFocus; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = 'transparent'; }}
        />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: `${statusConfig[runStatus].color}14`,
          border: `1px solid ${statusConfig[runStatus].color}30`,
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: statusConfig[runStatus].color,
            animation: runStatus === 'running' ? 'pulse 1.2s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: statusConfig[runStatus].color }}>
            {runMessage || statusConfig[runStatus].label}
          </span>
        </div>

        {/* Action buttons */}
        <button
          onClick={handleLoad}
          style={btnBase}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = tokens.borderFocus;
            b.style.boxShadow = tokens.shadowMd;
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = tokens.borderDefault;
            b.style.boxShadow = tokens.shadowSm;
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          加载
        </button>

        <button
          onClick={handleSave}
          style={btnBase}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = tokens.borderFocus;
            b.style.boxShadow = tokens.shadowMd;
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = tokens.borderDefault;
            b.style.boxShadow = tokens.shadowSm;
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          保存
        </button>

        <button
          onClick={handleRun}
          disabled={runStatus === 'running'}
          style={{
            ...btnBase,
            background: runStatus === 'running' ? tokens.bgHover : tokens.accent,
            borderColor: runStatus === 'running' ? tokens.borderDefault : tokens.accent,
            color: runStatus === 'running' ? tokens.textMuted : '#fff',
            cursor: runStatus === 'running' ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (runStatus !== 'running') {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = tokens.accentHover;
            }
          }}
          onMouseLeave={(e) => {
            if (runStatus !== 'running') {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = tokens.accent;
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {runStatus === 'running' ? '运行中...' : '运行'}
        </button>
      </header>

      {/* ── Main ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NodePalette onDragStart={handleDragStart} />

        <FlowEditor
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onNodeClick={onNodeClick}
        />

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{
        height: 26,
        borderTop: `1px solid ${tokens.borderDefault}`,
        background: tokens.bgSurface,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${tokens.sp2}px`,
        gap: tokens.sp3,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: tokens.textMuted }}>
          {nodes.length} 个节点 · {edges.length} 条连接
        </span>
        {workflowId && (
          <>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: tokens.borderDefault }} />
            <span style={{ fontSize: 10, color: tokens.textMuted }}>ID: {workflowId}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: tokens.textMuted }}>Seek Crawler v0.1</span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
