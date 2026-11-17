import React, { useEffect, useRef, useState } from 'react';
import {
  Eraser,
  Link2,
  MousePointer,
  PenTool,
  Plus,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CanvasConnection,
  CanvasData,
  CanvasNode,
  CanvasNodeTone,
  CanvasStroke,
} from '../types/note';

interface CanvasWhiteboardProps {
  data: CanvasData;
  onChange: (nextData: CanvasData) => void;
}

type CanvasTool = 'select' | 'connect' | 'draw';

const NODE_TONE_CLASSES: Record<
  CanvasNodeTone,
  { border: string; headerBg: string; label: string }
> = {
  indigo: {
    border: 'border-indigo-300 dark:border-indigo-700',
    headerBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200',
    label: 'Indigo',
  },
  amber: {
    border: 'border-amber-300 dark:border-amber-700',
    headerBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200',
    label: 'Amber',
  },
  emerald: {
    border: 'border-emerald-300 dark:border-emerald-700',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200',
    label: 'Zamrud',
  },
  rose: {
    border: 'border-rose-300 dark:border-rose-700',
    headerBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200',
    label: 'Mawar',
  },
  stone: {
    border: 'border-stone-300 dark:border-slate-700',
    headerBg: 'bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200',
    label: 'Netral',
  },
};

export const CanvasWhiteboard: React.FC<CanvasWhiteboardProps> = ({ data, onChange }) => {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [zoom, setZoom] = useState<number>(1);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectStartId, setConnectStartId] = useState<string | null>(null);
  const [penColor, setPenColor] = useState<string>('#4F46E5');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const nodes = data?.nodes || [];
  const connections = data?.connections || [];
  const strokes = data?.strokes || [];

  // Render freehand strokes onto the HTML5 canvas layer
  useEffect(() => {
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes: CanvasStroke[] = [
      ...strokes,
      ...(currentStroke.length > 1
        ? [{ id: 'temp', points: currentStroke, color: penColor, size: 3 }]
        : []),
    ];

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, penColor]);

  const addNode = (tone: CanvasNodeTone = 'indigo') => {
    const offset = (nodes.length % 5) * 32;
    const newNode: CanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      x: 100 + offset,
      y: 90 + offset,
      width: 250,
      title: `Node Konsep #${nodes.length + 1}`,
      content: 'Ketik ide atau langkah alur kerja di sini. Tarik header untuk memindahkan posisi.',
      tone,
    };
    onChange({
      ...data,
      nodes: [...nodes, newNode],
    });
    setActiveTool('select');
  };

  const updateNode = (id: string, patch: Partial<CanvasNode>) => {
    onChange({
      ...data,
      nodes: nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });
  };

  const deleteNode = (id: string) => {
    onChange({
      ...data,
      nodes: nodes.filter((n) => n.id !== id),
      connections: connections.filter((c) => c.fromId !== id && c.toId !== id),
    });
  };

  const deleteConnection = (id: string) => {
    onChange({
      ...data,
      connections: connections.filter((c) => c.id !== id),
    });
  };

  const handleNodeHeaderMouseDown = (
    e: React.MouseEvent,
    node: CanvasNode
  ) => {
    e.stopPropagation();
    if (activeTool === 'connect') {
      if (!connectStartId) {
        setConnectStartId(node.id);
      } else if (connectStartId !== node.id) {
        const exists = connections.some(
          (c) => c.fromId === connectStartId && c.toId === node.id
        );
        if (!exists) {
          const newConn: CanvasConnection = {
            id: `conn-${Date.now()}`,
            fromId: connectStartId,
            toId: node.id,
            label: 'Alur',
          };
          onChange({
            ...data,
            connections: [...connections, newConn],
          });
        }
        setConnectStartId(null);
      }
      return;
    }

    if (activeTool !== 'select') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointerX = (e.clientX - rect.left) / zoom;
    const pointerY = (e.clientY - rect.top) / zoom;
    setDraggingNodeId(node.id);
    setDragOffset({ x: pointerX - node.x, y: pointerY - node.y });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'draw') {
      setConnectStartId(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (draggingNodeId && activeTool === 'select') {
      const nextX = Math.max(16, Math.round(x - dragOffset.x));
      const nextY = Math.max(16, Math.round(y - dragOffset.y));
      updateNode(draggingNodeId, { x: nextX, y: nextY });
      return;
    }

    if (isDrawing && activeTool === 'draw') {
      setCurrentStroke((prev) => [...prev, { x, y }]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
    if (isDrawing && currentStroke.length > 1) {
      const newStroke: CanvasStroke = {
        id: `str-${Date.now()}`,
        points: currentStroke,
        color: penColor,
        size: 3,
      };
      onChange({
        ...data,
        strokes: [...strokes, newStroke],
      });
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const clearStrokes = () => {
    onChange({
      ...data,
      strokes: [],
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Canvas Studio Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-b border-stone-200/80 dark:border-slate-800 bg-[#F3F1EC]/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-stone-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTool('select');
                setConnectStartId(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTool === 'select'
                  ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Pilih & Geser</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('connect')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTool === 'connect'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>
                {connectStartId ? 'Klik Node Tujuan...' : 'Hubungkan Node'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTool('draw');
                setConnectStartId(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTool === 'draw'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Coretan Pena</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => addNode('indigo')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kartu Kanvas</span>
          </button>

          {activeTool === 'draw' && (
            <div className="flex items-center gap-1.5 ml-2">
              {['#4F46E5', '#D97706', '#16A34A', '#E11D48', '#334155'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPenColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-4 h-4 rounded-full ${
                    penColor === c ? 'ring-2 ring-offset-1 ring-stone-900 dark:ring-white' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Zoom & Canvas Reset Controls */}
        <div className="flex items-center gap-1.5">
          {strokes.length > 0 && (
            <button
              type="button"
              onClick={clearStrokes}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Hapus Coretan</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
            title="Perkecil"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono-tabular text-xs text-stone-600 dark:text-slate-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            title="Perbesar"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive 2D Spatial Canvas */}
      <div className="flex-1 overflow-auto relative bg-[#FAF9F5] dark:bg-slate-950">
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: '1600px',
            height: '960px',
            backgroundImage:
              'radial-gradient(rgba(120, 113, 108, 0.22) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          className={`relative ${
            activeTool === 'draw' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
              </marker>
            </defs>
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromId);
              const toNode = nodes.find((n) => n.id === conn.toId);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + fromNode.width / 2;
              const y1 = fromNode.y + 70;
              const x2 = toNode.x + toNode.width / 2;
              const y2 = toNode.y + 70;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={conn.id} className="pointer-events-auto">
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowhead)"
                  />
                  <g
                    transform={`translate(${midX - 42}, ${midY - 12})`}
                    onClick={() => deleteConnection(conn.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      width="84"
                      height="22"
                      rx="6"
                      className="fill-white dark:fill-slate-900 stroke-indigo-300 dark:stroke-indigo-700"
                    />
                    <text
                      x="42"
                      y="14"
                      textAnchor="middle"
                      className="text-[10px] fill-indigo-700 dark:fill-indigo-300 font-medium"
                    >
                      {conn.label || 'Alur'} ✕
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Freehand Drawing Layer */}
          <canvas
            ref={sketchCanvasRef}
            width={1600}
            height={960}
            className="absolute inset-0 pointer-events-none z-20"
          />

          {/* Spatial Nodes Layer */}
          {nodes.map((node) => {
            const toneStyle = NODE_TONE_CLASSES[node.tone] || NODE_TONE_CLASSES.indigo;
            const isConnectSource = connectStartId === node.id;

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                }}
                className={`absolute z-30 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-shadow ${
                  toneStyle.border
                } ${
                  isConnectSource
                    ? 'ring-2 ring-indigo-600 shadow-md'
                    : 'hover:shadow-md'
                }`}
              >
                {/* Draggable / Connectable Header */}
                <div
                  onMouseDown={(e) => handleNodeHeaderMouseDown(e, node)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl cursor-grab active:cursor-grabbing border-b border-black/5 dark:border-white/5 ${toneStyle.headerBg}`}
                >
                  <input
                    type="text"
                    value={node.title}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => updateNode(node.id, { title: e.target.value })}
                    className="w-full text-xs font-bold bg-transparent focus:outline-none"
                  />
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <select
                      value={node.tone}
                      onChange={(e) =>
                        updateNode(node.id, {
                          tone: e.target.value as CanvasNodeTone,
                        })
                      }
                      className="text-[10px] bg-white/80 dark:bg-slate-800 rounded px-1 py-0.5 focus:outline-none"
                    >
                      {(Object.keys(NODE_TONE_CLASSES) as CanvasNodeTone[]).map((t) => (
                        <option key={t} value={t}>
                          {NODE_TONE_CLASSES[t].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteNode(node.id)}
                      title="Hapus Node"
                      className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Node Content */}
                <div className="p-3">
                  <textarea
                    rows={3}
                    value={node.content}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => updateNode(node.id, { content: e.target.value })}
                    placeholder="Tulis detail konsep..."
                    className="w-full bg-transparent resize-y text-xs leading-relaxed text-stone-700 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-stone-200/80 dark:border-slate-800 text-xs text-stone-500 dark:text-slate-400 font-mono-tabular">
        <div className="flex items-center gap-2">
          <span>{nodes.length} node spasial</span>
          <span aria-hidden="true">·</span>
          <span>{connections.length} garis penghubung</span>
          <span aria-hidden="true">·</span>
          <span>{strokes.length} coretan gambar</span>
        </div>
        <div>
          Tip: Pilih &quot;Hubungkan Node&quot; lalu klik header 2 kartu untuk membuat garis alur
        </div>
      </div>
    </div>
  );
};
