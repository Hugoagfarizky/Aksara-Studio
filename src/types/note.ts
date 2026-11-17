export type NoteMode = 'unified' | 'markdown' | 'blocks' | 'sticky' | 'canvas';

export type WorkspaceView = 'notes' | 'sticky-board' | 'canvas-studio' | 'tasks' | 'templates';

export type BlockType =
  | 'h1'
  | 'h2'
  | 'paragraph'
  | 'todo'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'table';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  calloutTitle?: string;
  tableData?: string[][];
}

export type StickyTone = 'amber' | 'emerald' | 'sky' | 'rose' | 'violet' | 'stone';

export interface StickyCard {
  id: string;
  title: string;
  body: string;
  tone: StickyTone;
  pinned: boolean;
  updatedAt: string;
}

export type CanvasNodeTone = 'indigo' | 'amber' | 'emerald' | 'rose' | 'stone';

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  content: string;
  tone: CanvasNodeTone;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface CanvasStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface CanvasData {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  strokes: CanvasStroke[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'normal' | 'high';
}

export interface Note {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  mode: NoteMode;
  createdAt: string;
  updatedAt: string;
  markdownContent: string;
  blocks: NoteBlock[];
  stickyCards: StickyCard[];
  canvasData: CanvasData;
  checklist: ChecklistItem[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export type TagColorKey = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

export interface TagItem {
  id: string;
  name: string;
  colorKey: TagColorKey;
}

export interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultMode: NoteMode;
  tags: string[];
  buildNote: () => Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
}
