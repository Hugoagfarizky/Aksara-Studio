import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Columns,
  Download,
  FileDown,
  FileText,
  FolderIcon,
  FolderPlus,
  Layers,
  LayoutGrid,
  Maximize2,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BlockWikiEditor } from './components/BlockWikiEditor';
import { CanvasWhiteboard } from './components/CanvasWhiteboard';
import { MarkdownEditor } from './components/MarkdownEditor';
import { QuickSearchModal } from './components/QuickSearchModal';
import { StickyNotesBoard } from './components/StickyNotesBoard';
import { TaskCenterView } from './components/TaskCenterView';
import { TemplateGalleryView } from './components/TemplateGalleryView';
import {
  INITIAL_FOLDERS,
  INITIAL_NOTES,
  INITIAL_TAGS,
} from './data/initialData';
import {
  CanvasNode,
  ChecklistItem,
  Folder,
  Note,
  NoteBlock,
  NoteMode,
  NoteTemplate,
  StickyCard,
  TagColorKey,
  TagItem,
  WorkspaceView,
} from './types/note';
import {
  blocksToMarkdown,
  canvasNodeToStickyCard,
  canvasToWikiBlocks,
  markdownToBlocks,
  stickyCardToCanvasNode,
} from './utils/noteSync';

const STORAGE_KEYS = {
  NOTES: 'aksara_studio_notes_v2',
  FOLDERS: 'aksara_studio_folders_v2',
  TAGS: 'aksara_studio_tags_v2',
  THEME: 'aksara_studio_theme_v1',
};

const TAG_DOT_COLORS: Record<TagColorKey, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
};

const MODE_LABELS: Record<NoteMode, string> = {
  unified: 'Terpadu 4-in-1',
  markdown: 'Markdown',
  blocks: 'Blok Wiki',
  sticky: 'Papan Sticky',
  canvas: 'Kanvas Visual',
};

export default function App() {
  // Persistent State Initialization
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty initial notes
    }
    return INITIAL_NOTES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_FOLDERS;
  });

  const [tags, setTags] = useState<TagItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_TAGS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
    } catch {
      return false;
    }
  });

  // Navigation & Active Selection State
  const [activeView, setActiveView] = useState<WorkspaceView>('notes');
  const [activeNoteId, setActiveNoteId] = useState<string>(
    () => notes[0]?.id || ''
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'pinned'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [checklistDrawerOpen, setChecklistDrawerOpen] = useState<boolean>(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState<boolean>(false);

  // Inline Folder & Tag Creation UI State
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<TagColorKey>('indigo');

  // Inline Note Checklist Input
  const [drawerTaskText, setDrawerTaskText] = useState<string>('');
  const [drawerTaskPriority, setDrawerTaskPriority] = useState<'normal' | 'high'>('normal');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Clear legacy v1 sample keys on mount
  useEffect(() => {
    try {
      localStorage.removeItem('aksara_studio_notes_v1');
      localStorage.removeItem('aksara_studio_folders_v1');
      localStorage.removeItem('aksara_studio_tags_v1');
    } catch {
      // Ignore
    }
  }, []);

  // Sync Dark Mode with <html class="dark">
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [darkMode]);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch {
      // Ignore quota errors
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch {
      // Ignore
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch {
      // Ignore
    }
  }, [tags]);

  // Keyboard Shortcut: Cmd/Ctrl + K for Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getFolderAndDescendantIds = (folderId: string): string[] => {
    const result = [folderId];
    const children = folders.filter((f) => f.parentId === folderId);
    children.forEach((child) => {
      result.push(...getFolderAndDescendantIds(child.id));
    });
    return result;
  };

  const filteredNotes = useMemo(() => {
    return [...notes]
      .filter((note) => {
        if (selectedFolderId === 'pinned') return note.isPinned;
        if (selectedFolderId !== 'all') {
          const validIds = getFolderAndDescendantIds(selectedFolderId);
          if (!note.folderId || !validIds.includes(note.folderId)) return false;
        }
        return true;
      })
      .filter((note) => {
        if (!selectedTag) return true;
        return note.tags.includes(selectedTag);
      })
      .filter((note) => {
        const q = listSearch.trim().toLowerCase();
        if (!q) return true;
        return (
          note.title.toLowerCase().includes(q) ||
          note.markdownContent.toLowerCase().includes(q) ||
          note.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, folders, selectedFolderId, selectedTag, listSearch]);

  const activeNote = useMemo(() => {
    return (
      notes.find((n) => n.id === activeNoteId) ||
      filteredNotes[0] ||
      notes[0] ||
      null
    );
  }, [notes, activeNoteId, filteredNotes]);

  const updateActiveNote = (patch: Partial<Note>) => {
    if (!activeNote) return;
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, ...patch, updatedAt: now } : n
      )
    );
  };

  // Create a Unified Note containing all 4 connected spaces
  const createNewNote = (initialFocusMode: NoteMode = 'unified') => {
    const now = new Date().toISOString();
    const targetFolder =
      selectedFolderId !== 'all' && selectedFolderId !== 'pinned'
        ? selectedFolderId
        : null;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      folderId: targetFolder,
      tags: selectedTag ? [selectedTag] : [],
      isPinned: false,
      mode: initialFocusMode,
      createdAt: now,
      updatedAt: now,
      markdownContent: '',
      blocks: [{ id: `blk-${Date.now()}-1`, type: 'paragraph', content: '' }],
      stickyCards: [],
      canvasData: {
        nodes: [],
        connections: [],
        strokes: [],
      },
      checklist: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView('notes');
    showToast('Catatan baru (berisi Markdown, Blok Wiki, Papan Sticky & Kanvas) dibuat');
  };

  const applyTemplate = (template: NoteTemplate) => {
    const now = new Date().toISOString();
    const payload = template.buildNote();
    const newNote: Note = {
      ...payload,
      mode: 'unified',
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView('notes');
    showToast(`Templat "${template.name}" diterapkan ke catatan terpadu`);
  };

  const deleteNote = (noteId: string) => {
    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (activeNoteId === noteId) {
      setActiveNoteId(remaining[0]?.id || '');
    }
    showToast('Catatan dihapus');
  };

  // =========================================================================
  // CROSS-LAYER CONNECTION HANDLERS (Connecting Markdown <-> Blocks <-> Sticky <-> Canvas)
  // =========================================================================

  // 1. Markdown -> Wiki Blocks
  const handleSyncMarkdownToBlocks = () => {
    if (!activeNote) return;
    const parsedBlocks = markdownToBlocks(activeNote.markdownContent);
    updateActiveNote({ blocks: parsedBlocks });
    showToast('Isi Markdown berhasil disinkronkan menjadi Blok Wiki');
  };

  // 2. Wiki Blocks -> Markdown
  const handleSyncBlocksToMarkdown = () => {
    if (!activeNote) return;
    const md = blocksToMarkdown(activeNote.blocks);
    updateActiveNote({ markdownContent: md });
    showToast('Susunan Blok Wiki berhasil disinkronkan ke Markdown');
  };

  // 3. Markdown snippet -> Sticky Card
  const handleSendMarkdownToSticky = (title: string, body: string) => {
    if (!activeNote) return;
    const newCard: StickyCard = {
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title,
      body,
      tone: 'amber',
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    updateActiveNote({ stickyCards: [newCard, ...activeNote.stickyCards] });
    showToast('Cuplikan Markdown ditambahkan ke Papan Sticky catatan ini');
  };

  // 4. Wiki Block -> Sticky Card
  const handleSendBlockToSticky = (block: NoteBlock) => {
    if (!activeNote) return;
    const newCard: StickyCard = {
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title:
        block.calloutTitle ||
        (block.type === 'h1' || block.type === 'h2'
          ? block.content
          : `Blok ${block.type.toUpperCase()}`),
      body: block.content || '',
      tone: block.type === 'callout' ? 'sky' : block.type === 'todo' ? 'emerald' : 'amber',
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    updateActiveNote({ stickyCards: [newCard, ...activeNote.stickyCards] });
    showToast('Blok Wiki dikirim ke Papan Sticky catatan ini');
  };

  // 5. Wiki Block -> Canvas Node
  const handleSendBlockToCanvas = (block: NoteBlock) => {
    if (!activeNote) return;
    const existingCount = activeNote.canvasData.nodes.length;
    const col = existingCount % 3;
    const row = Math.floor(existingCount / 3);
    const newNode: CanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      x: 60 + col * 290,
      y: 60 + row * 180,
      width: 250,
      title:
        block.calloutTitle ||
        (block.type === 'h1' || block.type === 'h2'
          ? block.content
          : `Konsep Blok`),
      content: block.content || '',
      tone: 'indigo',
    };
    updateActiveNote({
      canvasData: {
        ...activeNote.canvasData,
        nodes: [...activeNote.canvasData.nodes, newNode],
      },
    });
    showToast('Blok Wiki ditambahkan sebagai Node di Kanvas Visual');
  };

  // 6. Sticky Card -> Canvas Node
  const handleSendStickyCardToCanvas = (card: StickyCard) => {
    if (!activeNote) return;
    const newNode = stickyCardToCanvasNode(
      card,
      activeNote.canvasData.nodes.length
    );
    updateActiveNote({
      canvasData: {
        ...activeNote.canvasData,
        nodes: [...activeNote.canvasData.nodes, newNode],
      },
    });
    showToast(`Kartu "${card.title || 'Sticky'}" dikirim ke Kanvas Visual`);
  };

  // 7. All Sticky Cards -> Canvas Nodes
  const handleSendAllStickyToCanvas = () => {
    if (!activeNote || activeNote.stickyCards.length === 0) return;
    const baseCount = activeNote.canvasData.nodes.length;
    const newNodes = activeNote.stickyCards.map((c, idx) =>
      stickyCardToCanvasNode(c, baseCount + idx)
    );
    updateActiveNote({
      canvasData: {
        ...activeNote.canvasData,
        nodes: [...activeNote.canvasData.nodes, ...newNodes],
      },
    });
    showToast(`${newNodes.length} Kartu Sticky dikirim ke Kanvas Visual`);
  };

  // 8. Sticky Card -> Wiki Blocks
  const handleSendStickyCardToBlocks = (card: StickyCard) => {
    if (!activeNote) return;
    const newBlocks: NoteBlock[] = [];
    if (card.title.trim()) {
      newBlocks.push({
        id: `blk-${Date.now()}-h`,
        type: 'h2',
        content: card.title.trim(),
      });
    }
    newBlocks.push({
      id: `blk-${Date.now()}-p`,
      type: 'paragraph',
      content: card.body,
    });
    const cleanExisting =
      activeNote.blocks.length === 1 && !activeNote.blocks[0].content.trim()
        ? []
        : activeNote.blocks;
    updateActiveNote({ blocks: [...cleanExisting, ...newBlocks] });
    showToast(`Kartu "${card.title || 'Sticky'}" ditambahkan ke Blok Wiki`);
  };

  // 9. Sticky Card -> Markdown
  const handleSendStickyCardToMarkdown = (card: StickyCard) => {
    if (!activeNote) return;
    const section = [
      card.title.trim() ? `## ${card.title.trim()}` : '',
      card.body.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');
    const nextMd = activeNote.markdownContent.trim()
      ? `${activeNote.markdownContent.trim()}\n\n${section}`
      : section;
    updateActiveNote({ markdownContent: nextMd });
    showToast(`Kartu "${card.title || 'Sticky'}" ditambahkan ke Markdown`);
  };

  // 10. Canvas Node -> Sticky Card
  const handleSendCanvasNodeToSticky = (node: CanvasNode) => {
    if (!activeNote) return;
    const newCard = canvasNodeToStickyCard(node);
    updateActiveNote({ stickyCards: [newCard, ...activeNote.stickyCards] });
    showToast(`Node "${node.title || 'Kanvas'}" dikirim ke Papan Sticky`);
  };

  // 11. Canvas Node -> Wiki Block
  const handleSendCanvasNodeToBlocks = (node: CanvasNode) => {
    if (!activeNote) return;
    const added: NoteBlock[] = [
      {
        id: `blk-${Date.now()}-nh`,
        type: 'h2',
        content: node.title || 'Node Kanvas',
      },
      {
        id: `blk-${Date.now()}-np`,
        type: 'paragraph',
        content: node.content || '',
      },
    ];
    const cleanExisting =
      activeNote.blocks.length === 1 && !activeNote.blocks[0].content.trim()
        ? []
        : activeNote.blocks;
    updateActiveNote({ blocks: [...cleanExisting, ...added] });
    showToast(`Node "${node.title || 'Kanvas'}" dikirim ke Blok Wiki`);
  };

  // 12. Full Canvas Flow -> Wiki Blocks & Markdown
  const handleSyncCanvasToDoc = () => {
    if (!activeNote || activeNote.canvasData.nodes.length === 0) return;
    const generatedBlocks = canvasToWikiBlocks(activeNote.canvasData);
    const cleanExisting =
      activeNote.blocks.length === 1 && !activeNote.blocks[0].content.trim()
        ? []
        : activeNote.blocks;
    const combinedBlocks = [...cleanExisting, ...generatedBlocks];
    const nextMd = blocksToMarkdown(combinedBlocks);
    updateActiveNote({
      blocks: combinedBlocks,
      markdownContent: nextMd,
    });
    showToast('Alur Kanvas Visual berhasil disusun ke Blok Wiki & Markdown');
  };

  // Folder & Tag Management
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFld: Folder = {
      id: `fld-${Date.now()}`,
      name: newFolderName.trim(),
      parentId: newFolderParentId || null,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFld]);
    if (newFolderParentId) {
      setExpandedFolders((prev) => ({ ...prev, [newFolderParentId]: true }));
    }
    setNewFolderName('');
    setNewFolderParentId('');
    setIsAddingFolder(false);
    showToast(`Folder "${newFld.name}" ditambahkan`);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.trim();
    if (!clean) return;
    if (tags.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      showToast('Label tag tersebut sudah ada');
      return;
    }
    const newTag: TagItem = {
      id: `tag-${Date.now()}`,
      name: clean,
      colorKey: newTagColor,
    };
    setTags((prev) => [...prev, newTag]);
    setNewTagName('');
    setIsAddingTag(false);
    showToast(`Label #${clean} ditambahkan`);
  };

  const toggleNoteTag = (tagName: string) => {
    if (!activeNote) return;
    const exists = activeNote.tags.includes(tagName);
    const nextTags = exists
      ? activeNote.tags.filter((t) => t !== tagName)
      : [...activeNote.tags, tagName];
    updateActiveNote({ tags: nextTags });
  };

  // Checklist Handlers
  const toggleChecklistItem = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          updatedAt: new Date().toISOString(),
          checklist: n.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      })
    );
  };

  const addChecklistItem = (
    noteId: string,
    text: string,
    priority: 'normal' | 'high',
    dueDate?: string
  ) => {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      text,
      completed: false,
      priority,
      dueDate,
    };
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: new Date().toISOString(),
              checklist: [...n.checklist, newItem],
            }
          : n
      )
    );
  };

  const deleteChecklistItem = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: new Date().toISOString(),
              checklist: n.checklist.filter((c) => c.id !== itemId),
            }
          : n
      )
    );
  };

  const toggleBlockTodo = (noteId: string, blockId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: new Date().toISOString(),
              blocks: n.blocks.map((b) =>
                b.id === blockId ? { ...b, checked: !b.checked } : b
              ),
            }
          : n
      )
    );
  };

  // Export & Import Handlers
  const handleExportWorkspaceJson = () => {
    const payload = {
      app: 'Aksara Studio',
      exportedAt: new Date().toISOString(),
      notes,
      folders,
      tags,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksara-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan ruang kerja (.json) berhasil diunduh');
  };

  const handleDownloadActiveMarkdown = () => {
    if (!activeNote) return;
    const contentToDownload =
      activeNote.markdownContent.trim() || blocksToMarkdown(activeNote.blocks);
    const blob = new Blob([contentToDownload], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = activeNote.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    a.download = `${safeName || 'catatan'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Dokumen "${activeNote.title || 'catatan'}.md" diunduh`);
  };

  const handleImportWorkspaceJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '{}'));
        if (Array.isArray(parsed.notes)) {
          setNotes(parsed.notes);
          setActiveNoteId(parsed.notes[0]?.id || '');
        }
        if (Array.isArray(parsed.folders)) setFolders(parsed.folders);
        if (Array.isArray(parsed.tags)) setTags(parsed.tags);
        showToast('Data ruang kerja berhasil dipulihkan');
      } catch {
        showToast('Format berkas JSON tidak valid');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Recursive Folder Tree Renderer
  const renderFolderTree = (parentId: string | null = null, depth = 0) => {
    const items = folders.filter((f) => f.parentId === parentId);
    return items.map((folder) => {
      const hasChildren = folders.some((f) => f.parentId === folder.id);
      const isExpanded = Boolean(expandedFolders[folder.id]);
      const isSelected = selectedFolderId === folder.id && activeView === 'notes';
      const validIds = getFolderAndDescendantIds(folder.id);
      const count = notes.filter((n) => n.folderId && validIds.includes(n.folderId)).length;

      return (
        <div key={folder.id}>
          <div
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className={`flex items-center justify-between pr-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'text-stone-700 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800/80'
            }`}
            onClick={() => {
              setSelectedFolderId(folder.id);
              setActiveView('notes');
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders((prev) => ({
                      ...prev,
                      [folder.id]: !prev[folder.id],
                    }));
                  }}
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <FolderIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span className="truncate">{folder.name}</span>
            </div>
            <span
              className={`font-mono-tabular text-[11px] ${
                isSelected ? 'text-indigo-100' : 'text-stone-400 dark:text-slate-500'
              }`}
            >
              {count}
            </span>
          </div>
          {hasChildren && isExpanded && renderFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Tanpa Folder';
    return folders.find((f) => f.id === folderId)?.name || 'Tanpa Folder';
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAF9F5] dark:bg-slate-950 text-stone-900 dark:text-slate-100 overflow-hidden">
      {/* Mandatory 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-stone-200/90 dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-950 shrink-0">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('notes');
          }}
          className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-white whitespace-nowrap shrink-0"
        >
          Aksara Studio
        </a>

        {/* Zone 2: Concise Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              setActiveView('notes');
              if (activeNote) updateActiveNote({ mode: 'unified' });
            }}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'notes'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Ruang Catatan (4-in-1)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('tasks')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'tasks'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Pusat Tugas
          </button>
          <button
            type="button"
            onClick={() => setActiveView('templates')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'templates'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Templat
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => createNewNote('unified')}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            + Catatan Baru
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 border-r border-stone-200/80 dark:border-slate-800 bg-[#F3F1EC] dark:bg-slate-900/90 flex flex-col justify-between overflow-y-auto">
            <div className="p-3.5 space-y-5">
              {/* Quick Search & Theme Switch Row */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickSearchOpen(true)}
                  className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-stone-200/90 dark:border-slate-700 hover:border-indigo-500 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Cari Cepat...</span>
                  </span>
                  <kbd className="font-mono-tabular text-[10px] text-stone-400">⌘K</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-stone-200/90 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:border-indigo-500 transition-colors shrink-0"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Primary Library Views */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId('all');
                    setSelectedTag(null);
                    setActiveView('notes');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedFolderId === 'all' && !selectedTag && activeView === 'notes'
                      ? 'bg-indigo-600 text-white'
                      : 'text-stone-700 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Semua Catatan</span>
                  </span>
                  <span className="font-mono-tabular text-[11px] opacity-80">
                    {notes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId('pinned');
                    setSelectedTag(null);
                    setActiveView('notes');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedFolderId === 'pinned' && activeView === 'notes'
                      ? 'bg-indigo-600 text-white'
                      : 'text-stone-700 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Pin className="w-3.5 h-3.5" />
                    <span>Catatan Disematkan</span>
                  </span>
                  <span className="font-mono-tabular text-[11px] opacity-80">
                    {notes.filter((n) => n.isPinned).length}
                  </span>
                </button>
              </div>

              {/* Multi-Level Folder Hierarchy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                    Folder Bertingkat
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingFolder(!isAddingFolder)}
                    title="Tambah Folder atau Sub-folder"
                    className="p-1 rounded text-stone-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isAddingFolder && (
                  <form
                    onSubmit={handleCreateFolder}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2"
                  >
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nama folder baru..."
                      className="w-full text-xs px-2 py-1.5 rounded border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 focus:outline-none"
                    />
                    <select
                      value={newFolderParentId}
                      onChange={(e) => setNewFolderParentId(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 focus:outline-none"
                    >
                      <option value="">Induk: Folder Utama (Root)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          Sub-folder dari: {f.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingFolder(false)}
                        className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-0.5">{renderFolderTree(null, 0)}</div>
              </div>

              {/* Color Tag Filters */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                    Label Tag Kategori
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(!isAddingTag)}
                    title="Tambah Label Tag Baru"
                    className="p-1 rounded text-stone-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isAddingTag && (
                  <form
                    onSubmit={handleCreateTag}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2"
                  >
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Nama label tag..."
                      className="w-full text-xs px-2 py-1.5 rounded border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {(Object.keys(TAG_DOT_COLORS) as TagColorKey[]).map((ck) => (
                          <button
                            key={ck}
                            type="button"
                            onClick={() => setNewTagColor(ck)}
                            className={`w-3.5 h-3.5 rounded-full ${TAG_DOT_COLORS[ck]} ${
                              newTagColor === ck ? 'ring-2 ring-offset-1 ring-stone-800' : ''
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded text-xs font-medium bg-indigo-600 text-white"
                      >
                        Tambah
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-0.5">
                  {tags.map((tag) => {
                    const isSelected = selectedTag === tag.name && activeView === 'notes';
                    const count = notes.filter((n) => n.tags.includes(tag.name)).length;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedTag(selectedTag === tag.name ? null : tag.name);
                          setActiveView('notes');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'text-stone-700 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              TAG_DOT_COLORS[tag.colorKey]
                            }`}
                          />
                          <span className="truncate">#{tag.name}</span>
                        </span>
                        <span className="font-mono-tabular text-[11px] opacity-80">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Footer: Local Backup Export / Import */}
            <div className="p-3.5 border-t border-stone-200/80 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleExportWorkspaceJson}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportWorkspaceJson}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 text-center font-mono-tabular">
                Tersimpan otomatis di perangkat lokal
              </p>
            </div>
          </aside>
        )}

        {/* Active View Content Switcher */}
        {activeView === 'tasks' && (
          <TaskCenterView
            notes={notes}
            onToggleChecklistItem={toggleChecklistItem}
            onAddChecklistItem={addChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
            onToggleBlockTodo={toggleBlockTodo}
            onOpenNote={(noteId) => {
              setActiveNoteId(noteId);
              setActiveView('notes');
            }}
          />
        )}

        {activeView === 'templates' && (
          <TemplateGalleryView
            onApplyTemplate={applyTemplate}
            onCreateBlankWithMode={(mode) => createNewNote(mode)}
          />
        )}

        {activeView === 'notes' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Middle Column: Notes List showing connected 4-in-1 contents */}
            <div className="w-64 lg:w-72 shrink-0 border-r border-stone-200/80 dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/40 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-stone-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
                    className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/70 dark:text-slate-400 dark:hover:bg-slate-800 shrink-0"
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose className="w-4 h-4" />
                    ) : (
                      <PanelLeftOpen className="w-4 h-4" />
                    )}
                  </button>
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder="Filter catatan..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes Cards List (Showing connected 4-layer counts) */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-200/70 dark:divide-slate-800/80">
                {filteredNotes.length === 0 ? (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs text-stone-500 dark:text-slate-400">
                      Belum ada catatan. Setiap catatan baru otomatis memuat Markdown, Blok Wiki, Papan Sticky, dan Kanvas Visual yang saling terhubung.
                    </p>
                    <button
                      type="button"
                      onClick={() => createNewNote('unified')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      + Buat Catatan Baru
                    </button>
                  </div>
                ) : (
                  filteredNotes.map((note) => {
                    const isActive = activeNote?.id === note.id;
                    const mdWords = note.markdownContent.trim()
                      ? note.markdownContent.trim().split(/\s+/).length
                      : 0;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => setActiveNoteId(note.id)}
                        className={`w-full text-left p-3.5 transition-colors ${
                          isActive
                            ? 'bg-white dark:bg-slate-900'
                            : 'hover:bg-stone-100/70 dark:hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`font-display text-sm font-semibold leading-snug line-clamp-1 ${
                              isActive
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {note.title || 'Catatan Tanpa Judul'}
                          </h3>
                          {note.isPinned && (
                            <Pin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          )}
                        </div>

                        {/* Connected 4-Layer Summary Metadata (Zero-Pill Unboxed) */}
                        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-stone-500 dark:text-slate-400 font-mono-tabular mt-1">
                          <span>{mdWords} kata MD</span>
                          <span aria-hidden="true">·</span>
                          <span>{note.blocks.length} blok</span>
                          <span aria-hidden="true">·</span>
                          <span>{note.stickyCards.length} sticky</span>
                          <span aria-hidden="true">·</span>
                          <span>{note.canvasData.nodes.length} kanvas</span>
                        </div>

                        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-stone-400 dark:text-slate-500 font-mono-tabular mt-1">
                          <span className="truncate max-w-[120px]">
                            {getFolderName(note.folderId)}
                          </span>
                          {note.tags.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>#{note.tags[0]}</span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Note Unified 4-in-1 Connected Workspace */}
            {activeNote ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
                {/* Note Metadata & Connected 4-in-1 View Switcher Header */}
                <div className="px-6 py-3.5 border-b border-stone-200/80 dark:border-slate-800 space-y-2.5">
                  {/* Top Row: Folder Select, Unboxed Timestamp, Global Sync & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 font-mono-tabular">
                      <FolderIcon className="w-3.5 h-3.5 text-stone-400" />
                      <select
                        value={activeNote.folderId || ''}
                        onChange={(e) =>
                          updateActiveNote({ folderId: e.target.value || null })
                        }
                        className="bg-transparent font-sans font-medium text-stone-700 dark:text-slate-300 focus:outline-none cursor-pointer hover:text-indigo-600"
                      >
                        <option value="">Tanpa Folder</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.parentId ? `↳ ${f.name}` : f.name}
                          </option>
                        ))}
                      </select>
                      <span aria-hidden="true">·</span>
                      <span>
                        Diperbarui{' '}
                        {new Date(activeNote.updatedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveNote({ isPinned: !activeNote.isPinned })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.isPinned
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{activeNote.isPinned ? 'Disematkan' : 'Sematkan'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChecklistDrawerOpen(!checklistDrawerOpen)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          checklistDrawerOpen
                            ? 'bg-indigo-600 text-white'
                            : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span className="font-mono-tabular">
                          Tugas ({activeNote.checklist.filter((c) => c.completed).length}/
                          {activeNote.checklist.length})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadActiveMarkdown}
                        title="Unduh sebagai berkas Markdown (.md)"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Unduh .md</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNote(activeNote.id)}
                        title="Hapus Catatan Ini"
                        className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note Title Input + Connected 4-in-1 Switcher */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => updateActiveNote({ title: e.target.value })}
                      placeholder="Ketik judul catatan..."
                      className="w-full font-display text-xl lg:text-2xl font-bold tracking-tight bg-transparent text-stone-900 dark:text-white focus:outline-none"
                    />

                    {/* Connected 4-in-1 Layout Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shrink-0 self-start xl:self-auto overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'unified' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'unified'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-stone-700 dark:text-slate-300 hover:text-stone-900'
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>Semua 4 Ruang (Terpadu)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'markdown' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'markdown'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Markdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'blocks' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'blocks'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Blok Wiki ({activeNote.blocks.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'sticky' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'sticky'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Sticky ({activeNote.stickyCards.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'canvas' })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'canvas'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>Kanvas ({activeNote.canvasData.nodes.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Tag Bar */}
                  {tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-slate-500 mr-1">
                        <Tag className="w-3 h-3" />
                        <span>Label:</span>
                      </span>
                      {tags.map((t) => {
                        const active = activeNote.tags.includes(t.name);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleNoteTag(t.name)}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              active
                                ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                            }`}
                          >
                            #{t.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Active Editor Body: Either 4-in-1 Unified Grid OR Focused Single Pane */}
                <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    {activeNote.mode === 'unified' && (
                      <div className="h-full overflow-y-auto p-4 lg:p-5 bg-[#FAF9F5]/60 dark:bg-slate-950 space-y-4">
                        {/* Connected Flow Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                          <div className="flex items-center gap-2 text-stone-600 dark:text-slate-300">
                            <span className="font-semibold text-stone-900 dark:text-white">
                              4 Ruang Catatan Terhubung:
                            </span>
                            <span>
                              Ide di <strong>Papan Sticky</strong> & <strong>Kanvas Visual</strong> dapat langsung dikirim ke <strong>Blok Wiki</strong> & <strong>Markdown</strong>.
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleSyncMarkdownToBlocks}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors whitespace-nowrap"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Markdown → Blok Wiki</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSyncBlocksToMarkdown}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors whitespace-nowrap"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Blok Wiki → Markdown</span>
                            </button>
                          </div>
                        </div>

                        {/* 2x2 Connected Workspace Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {/* Panel 1: Markdown */}
                          <section className="flex flex-col h-[480px] rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 dark:border-slate-800 bg-stone-100/70 dark:bg-slate-900">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                                  01. Editor Teks & Markdown
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateActiveNote({ mode: 'markdown' })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Fokus Layar Penuh</span>
                              </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <MarkdownEditor
                                content={activeNote.markdownContent}
                                onChange={(nextMd) =>
                                  updateActiveNote({ markdownContent: nextMd })
                                }
                                onSyncToBlocks={handleSyncMarkdownToBlocks}
                                onPullFromBlocks={handleSyncBlocksToMarkdown}
                                onSendToSticky={handleSendMarkdownToSticky}
                              />
                            </div>
                          </section>

                          {/* Panel 2: Blok Wiki */}
                          <section className="flex flex-col h-[480px] rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 dark:border-slate-800 bg-stone-100/70 dark:bg-slate-900">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                                  02. Sistem Blok Wiki ({activeNote.blocks.length} blok)
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateActiveNote({ mode: 'blocks' })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Fokus Layar Penuh</span>
                              </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <BlockWikiEditor
                                blocks={activeNote.blocks}
                                onChange={(nextBlocks) =>
                                  updateActiveNote({ blocks: nextBlocks })
                                }
                                onSyncToMarkdown={handleSyncBlocksToMarkdown}
                                onSendBlockToSticky={handleSendBlockToSticky}
                                onSendBlockToCanvas={handleSendBlockToCanvas}
                              />
                            </div>
                          </section>

                          {/* Panel 3: Papan Sticky */}
                          <section className="flex flex-col h-[480px] rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 dark:border-slate-800 bg-stone-100/70 dark:bg-slate-900">
                              <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                                  03. Papan Kartu Sticky ({activeNote.stickyCards.length} kartu)
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateActiveNote({ mode: 'sticky' })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Fokus Layar Penuh</span>
                              </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <StickyNotesBoard
                                cards={activeNote.stickyCards}
                                onChange={(nextCards) =>
                                  updateActiveNote({ stickyCards: nextCards })
                                }
                                onSendCardToCanvas={handleSendStickyCardToCanvas}
                                onSendCardToBlocks={handleSendStickyCardToBlocks}
                                onSendCardToMarkdown={handleSendStickyCardToMarkdown}
                                onSendAllToCanvas={handleSendAllStickyToCanvas}
                              />
                            </div>
                          </section>

                          {/* Panel 4: Kanvas Visual */}
                          <section className="flex flex-col h-[480px] rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 dark:border-slate-800 bg-stone-100/70 dark:bg-slate-900">
                              <div className="flex items-center gap-2">
                                <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                                  04. Kanvas Papan Tulis Visual ({activeNote.canvasData.nodes.length} node)
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateActiveNote({ mode: 'canvas' })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Fokus Layar Penuh</span>
                              </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <CanvasWhiteboard
                                data={activeNote.canvasData}
                                onChange={(nextCanvas) =>
                                  updateActiveNote({ canvasData: nextCanvas })
                                }
                                onSendNodeToSticky={handleSendCanvasNodeToSticky}
                                onSendNodeToBlocks={handleSendCanvasNodeToBlocks}
                                onSyncCanvasToDoc={handleSyncCanvasToDoc}
                              />
                            </div>
                          </section>
                        </div>
                      </div>
                    )}

                    {activeNote.mode === 'markdown' && (
                      <MarkdownEditor
                        content={activeNote.markdownContent}
                        onChange={(nextMd) =>
                          updateActiveNote({ markdownContent: nextMd })
                        }
                        onSyncToBlocks={handleSyncMarkdownToBlocks}
                        onPullFromBlocks={handleSyncBlocksToMarkdown}
                        onSendToSticky={handleSendMarkdownToSticky}
                      />
                    )}

                    {activeNote.mode === 'blocks' && (
                      <BlockWikiEditor
                        blocks={activeNote.blocks}
                        onChange={(nextBlocks) =>
                          updateActiveNote({ blocks: nextBlocks })
                        }
                        onSyncToMarkdown={handleSyncBlocksToMarkdown}
                        onSendBlockToSticky={handleSendBlockToSticky}
                        onSendBlockToCanvas={handleSendBlockToCanvas}
                      />
                    )}

                    {activeNote.mode === 'sticky' && (
                      <StickyNotesBoard
                        cards={activeNote.stickyCards}
                        onChange={(nextCards) =>
                          updateActiveNote({ stickyCards: nextCards })
                        }
                        onSendCardToCanvas={handleSendStickyCardToCanvas}
                        onSendCardToBlocks={handleSendStickyCardToBlocks}
                        onSendCardToMarkdown={handleSendStickyCardToMarkdown}
                        onSendAllToCanvas={handleSendAllStickyToCanvas}
                      />
                    )}

                    {activeNote.mode === 'canvas' && (
                      <CanvasWhiteboard
                        data={activeNote.canvasData}
                        onChange={(nextCanvas) =>
                          updateActiveNote({ canvasData: nextCanvas })
                        }
                        onSendNodeToSticky={handleSendCanvasNodeToSticky}
                        onSendNodeToBlocks={handleSendCanvasNodeToBlocks}
                        onSyncCanvasToDoc={handleSyncCanvasToDoc}
                      />
                    )}
                  </div>

                  {/* Collapsible Per-Note Task Checklist Drawer */}
                  {checklistDrawerOpen && (
                    <div className="w-80 shrink-0 border-l border-stone-200/80 dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/70 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 dark:border-slate-800">
                        <span className="text-xs font-semibold text-stone-900 dark:text-white">
                          Daftar Tugas Catatan Ini
                        </span>
                        <button
                          type="button"
                          onClick={() => setChecklistDrawerOpen(false)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!drawerTaskText.trim()) return;
                          addChecklistItem(
                            activeNote.id,
                            drawerTaskText.trim(),
                            drawerTaskPriority
                          );
                          setDrawerTaskText('');
                        }}
                        className="p-3 border-b border-stone-200/80 dark:border-slate-800 space-y-2"
                      >
                        <input
                          type="text"
                          value={drawerTaskText}
                          onChange={(e) => setDrawerTaskText(e.target.value)}
                          placeholder="Tambah item checklist..."
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={drawerTaskPriority}
                            onChange={(e) =>
                              setDrawerTaskPriority(
                                e.target.value as 'normal' | 'high'
                              )
                            }
                            className="text-xs px-2 py-1 rounded border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <option value="normal">Normal</option>
                            <option value="high">Prioritas Tinggi</option>
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            + Tambah
                          </button>
                        </div>
                      </form>

                      <div className="flex-1 overflow-y-auto divide-y divide-stone-200/60 dark:divide-slate-800">
                        {activeNote.checklist.length === 0 ? (
                          <div className="p-6 text-center text-xs text-stone-500 dark:text-slate-400">
                            Belum ada daftar periksa di catatan ini.
                          </div>
                        ) : (
                          activeNote.checklist.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-2 p-3 hover:bg-stone-100/60 dark:hover:bg-slate-800/40"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleChecklistItem(activeNote.id, item.id)
                                }
                                className="flex items-start gap-2.5 text-left min-w-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <p
                                    className={`text-xs leading-relaxed ${
                                      item.completed
                                        ? 'line-through text-stone-400 dark:text-slate-500'
                                        : 'text-stone-800 dark:text-slate-200'
                                    }`}
                                  >
                                    {item.text}
                                  </p>
                                  {item.priority === 'high' && (
                                    <span className="text-[10px] font-mono-tabular text-amber-600 dark:text-amber-400">
                                      Prioritas Tinggi
                                    </span>
                                  )}
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteChecklistItem(activeNote.id, item.id)
                                }
                                className="p-1 text-stone-400 hover:text-rose-600 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
                <div className="max-w-md text-center space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-white">
                      Ruang Kerja Masih Kosong
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-slate-400 leading-relaxed">
                      Setiap catatan yang Anda buat otomatis menyatukan <strong>Markdown</strong>, <strong>Blok Wiki</strong>, <strong>Papan Sticky</strong>, dan <strong>Kanvas Visual</strong> yang saling terhubung dalam satu dokumen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => createNewNote('unified')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Catatan Terpadu (4-in-1) Pertama</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Search Modal (Cmd/Ctrl + K) */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        notes={notes}
        folders={folders}
        onClose={() => setQuickSearchOpen(false)}
        onSelectNote={(noteId) => {
          setActiveNoteId(noteId);
          setActiveView('notes');
        }}
        onCreateNoteWithMode={(mode) => createNewNote(mode)}
      />

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg border border-stone-700 dark:border-stone-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
