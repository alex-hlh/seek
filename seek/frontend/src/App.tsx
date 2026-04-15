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
import { FlowEditor } from './components/FlowEditor';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';

let nodeCounter = 1;

type RunStatus = 'idle' | 'running' | 'done' | 'error';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [runMessage, setRunMessage] = useState('');
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
      name: 'Workflow',
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

  const statusColor: Record<RunStatus, string> = {
    idle: '#666',
    running: '#1976D2',
    done: '#2E7D32',
    error: '#C62828',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#222', marginRight: 8 }}>Seek</span>
        <button onClick={handleSave} style={btnStyle}>保存</button>
        <button onClick={handleLoad} style={btnStyle}>加载</button>
        <button
          onClick={handleRun}
          disabled={runStatus === 'running'}
          style={{ ...btnStyle, background: '#1976D2', color: '#fff' }}
        >
          {runStatus === 'running' ? '运行中...' : '▶ 运行'}
        </button>
        {workflowId && (
          <span style={{ fontSize: 12, color: '#888' }}>ID: {workflowId}</span>
        )}
        {runMessage && (
          <span style={{ fontSize: 12, color: statusColor[runStatus], marginLeft: 8 }}>
            {runMessage}
          </span>
        )}
      </div>

      {/* Main layout */}
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
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 13,
  border: '1px solid #ddd',
  borderRadius: 4,
  background: '#f5f5f5',
  cursor: 'pointer',
};
