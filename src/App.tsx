import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  FileDown,
  FileText,
  FolderIcon,
  FolderPlus,
  Layers,
  LayoutGrid,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
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
  ChecklistItem,
  Folder,
  Note,
  NoteMode,
  NoteTemplate,
  StickyCard,
  TagColorKey,
  TagItem,
  WorkspaceView,
} from './types/note';

const STORAGE_KEYS = {
  NOTES: 'aksara_studio_notes_v1',
  FOLDERS: 'aksara_studio_folders_v1',
  TAGS: 'aksara_studio_tags_v1',
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial seed notes
    }
    return INITIAL_NOTES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  const [selectedModeFilter, setSelectedModeFilter] = useState<NoteMode | 'all'>('all');
  const [listSearch, setListSearch] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [checklistDrawerOpen, setChecklistDrawerOpen] = useState<boolean>(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState<boolean>(false);

  // Inline Folder & Tag Creation UI State
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'fld-work': true,
    'fld-personal': true,
  });

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

  // Helper: Get Folder & Descendant Folder IDs for Nested Filtering
  const getFolderAndDescendantIds = (folderId: string): string[] => {
    const result = [folderId];
    const children = folders.filter((f) => f.parentId === folderId);
    children.forEach((child) => {
      result.push(...getFolderAndDescendantIds(child.id));
    });
    return result;
  };

  // Filtered Notes List
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
        if (selectedModeFilter === 'all') return true;
        return note.mode === selectedModeFilter;
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
  }, [notes, folders, selectedFolderId, selectedTag, selectedModeFilter, listSearch]);

  const activeNote = useMemo(() => {
    return (
      notes.find((n) => n.id === activeNoteId) ||
      filteredNotes[0] ||
      notes[0] ||
      null
    );
  }, [notes, activeNoteId, filteredNotes]);

  // Note CRUD Operations
  const updateActiveNote = (patch: Partial<Note>) => {
    if (!activeNote) return;
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, ...patch, updatedAt: now } : n
      )
    );
  };

  const createNewNote = (mode: NoteMode = 'markdown') => {
    const now = new Date().toISOString();
    const targetFolder =
      selectedFolderId !== 'all' && selectedFolderId !== 'pinned'
        ? selectedFolderId
        : folders[0]?.id || null;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: `Catatan ${MODE_LABELS[mode]} Baru`,
      folderId: targetFolder,
      tags: selectedTag ? [selectedTag] : [],
      isPinned: false,
      mode,
      createdAt: now,
      updatedAt: now,
      markdownContent: `# Catatan Baru\n\nMulai tuliskan pemikiran, rencana, atau dokumentasi Anda di sini.`,
      blocks: [
        { id: `blk-${Date.now()}-1`, type: 'h1', content: 'Judul Dokumen Baru' },
        {
          id: `blk-${Date.now()}-2`,
          type: 'paragraph',
          content: 'Ketik isi blok atau tambahkan blok baru menggunakan tombol di atas.',
        },
      ],
      stickyCards: [
        {
          id: `stk-${Date.now()}`,
          title: 'Ide Utama',
          body: 'Tuliskan gagasan singkat pada kartu ini...',
          tone: 'amber',
          pinned: true,
          updatedAt: now,
        },
      ],
      canvasData: {
        nodes: [
          {
            id: `cn-${Date.now()}`,
            x: 120,
            y: 110,
            width: 250,
            title: 'Gagasan Inti',
            content: 'Geser kartu ini atau hubungkan dengan node baru di kanvas.',
            tone: 'indigo',
          },
        ],
        connections: [],
        strokes: [],
      },
      checklist: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView('notes');
    showToast(`Catatan baru (${MODE_LABELS[mode]}) berhasil dibuat`);
  };

  const applyTemplate = (template: NoteTemplate) => {
    const now = new Date().toISOString();
    const payload = template.buildNote();
    const newNote: Note = {
      ...payload,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView('notes');
    showToast(`Templat "${template.name}" diterapkan`);
  };

  const deleteNote = (noteId: string) => {
    if (notes.length <= 1) {
      showToast('Setidaknya satu catatan harus tetap tersimpan di ruang kerja');
      return;
    }
    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (activeNoteId === noteId) {
      setActiveNoteId(remaining[0]?.id || '');
    }
    showToast('Catatan dihapus');
  };

  const promoteStickyToNote = (card: StickyCard) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: card.title || 'Catatan dari Kartu Sticky',
      folderId: activeNote?.folderId || folders[0]?.id || null,
      tags: ['Ide Kilat'],
      isPinned: false,
      mode: 'markdown',
      createdAt: now,
      updatedAt: now,
      markdownContent: `# ${card.title}\n\n${card.body}`,
      blocks: [
        { id: `b-${Date.now()}-1`, type: 'h1', content: card.title },
        { id: `b-${Date.now()}-2`, type: 'paragraph', content: card.body },
      ],
      stickyCards: [card],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView('notes');
    showToast(`Kartu "${card.title}" dijadikan dokumen utuh`);
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
    const blob = new Blob([activeNote.markdownContent], {
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
    showToast(`Dokumen "${activeNote.title}.md" diunduh`);
  };

  const handleImportWorkspaceJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '{}'));
        if (Array.isArray(parsed.notes) && parsed.notes.length > 0) {
          setNotes(parsed.notes);
          setActiveNoteId(parsed.notes[0].id);
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

        {/* Zone 2: 5 Concise Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveView('notes')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'notes'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Ruang Catatan
          </button>
          <button
            type="button"
            onClick={() => setActiveView('sticky-board')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'sticky-board'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Papan Sticky
          </button>
          <button
            type="button"
            onClick={() => setActiveView('canvas-studio')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'canvas-studio'
                ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Kanvas Visual
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
            onClick={() => createNewNote('markdown')}
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

              {/* Mobile View Switcher */}
              <div className="grid grid-cols-2 gap-1 md:hidden">
                {(
                  [
                    { id: 'notes', label: 'Catatan' },
                    { id: 'sticky-board', label: 'Sticky' },
                    { id: 'canvas-studio', label: 'Kanvas' },
                    { id: 'tasks', label: 'Tugas' },
                    { id: 'templates', label: 'Templat' },
                  ] as { id: WorkspaceView; label: string }[]
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveView(v.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left ${
                      activeView === v.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-stone-700 dark:text-slate-300'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
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

        {activeView === 'sticky-board' && activeNote && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <StickyNotesBoard
              cards={activeNote.stickyCards}
              onChange={(nextCards) => updateActiveNote({ stickyCards: nextCards })}
              onPromoteToNote={promoteStickyToNote}
              boardTitle={`Papan Sticky: ${activeNote.title}`}
            />
          </div>
        )}

        {activeView === 'canvas-studio' && activeNote && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <CanvasWhiteboard
              data={activeNote.canvasData}
              onChange={(nextCanvas) => updateActiveNote({ canvasData: nextCanvas })}
            />
          </div>
        )}

        {activeView === 'notes' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Middle Column: Filterable Notes List */}
            <div className="w-72 lg:w-80 shrink-0 border-r border-stone-200/80 dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/40 flex flex-col overflow-hidden">
              {/* List Search & Mode Filter Header */}
              <div className="p-3.5 border-b border-stone-200/80 dark:border-slate-800 space-y-2.5">
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
                      placeholder="Filter daftar catatan..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Mode Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {(
                    [
                      { id: 'all', label: 'Semua' },
                      { id: 'markdown', label: 'Markdown' },
                      { id: 'blocks', label: 'Blok' },
                      { id: 'sticky', label: 'Sticky' },
                      { id: 'canvas', label: 'Kanvas' },
                    ] as { id: NoteMode | 'all'; label: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModeFilter(m.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedModeFilter === m.id
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Cards List (Zero-Pill Unboxed Metadata) */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-200/70 dark:divide-slate-800/80">
                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-xs text-stone-500 dark:text-slate-400">
                      Tidak ada catatan pada filter ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => createNewNote('markdown')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      + Buat Catatan Baru
                    </button>
                  </div>
                ) : (
                  filteredNotes.map((note) => {
                    const isActive = activeNote?.id === note.id;
                    const snippet =
                      note.markdownContent
                        .replace(/[#>*`_-]/g, '')
                        .trim()
                        .slice(0, 90) || 'Dokumen catatan...';

                    return (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => setActiveNoteId(note.id)}
                        className={`w-full text-left p-4 transition-colors ${
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

                        <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                          {snippet}
                        </p>

                        {/* Clean Unboxed Metadata with Typographic Separators */}
                        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-stone-400 dark:text-slate-500 font-mono-tabular">
                          <span>{MODE_LABELS[note.mode]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[110px]">
                            {getFolderName(note.folderId)}
                          </span>
                          {note.tags.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-stone-500 dark:text-slate-400">
                                #{note.tags[0]}
                                {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Note Multi-Mode Workspace */}
            {activeNote ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
                {/* Note Metadata & Mode Switcher Header */}
                <div className="px-6 py-4 border-b border-stone-200/80 dark:border-slate-800 space-y-3">
                  {/* Top Row: Folder Select, Unboxed Timestamp, Actions */}
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
                        {new Date(activeNote.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
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

                  {/* Note Title Input + 4-Mode Switcher */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => updateActiveNote({ title: e.target.value })}
                      placeholder="Judul catatan..."
                      className="w-full font-display text-xl lg:text-2xl font-bold tracking-tight bg-transparent text-stone-900 dark:text-white focus:outline-none"
                    />

                    {/* 4-Mode Interactive Segmented Control */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shrink-0 self-start xl:self-auto">
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'markdown' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'markdown'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>1. Markdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'blocks' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'blocks'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>2. Blok Wiki</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'sticky' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'sticky'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>3. Sticky Notes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveNote({ mode: 'canvas' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          activeNote.mode === 'canvas'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>4. Kanvas Visual</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Tag Assignment Bar */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
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
                </div>

                {/* Active Editor Body + Optional Checklist Side Drawer */}
                <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    {activeNote.mode === 'markdown' && (
                      <MarkdownEditor
                        content={activeNote.markdownContent}
                        onChange={(nextMd) =>
                          updateActiveNote({ markdownContent: nextMd })
                        }
                      />
                    )}

                    {activeNote.mode === 'blocks' && (
                      <BlockWikiEditor
                        blocks={activeNote.blocks}
                        onChange={(nextBlocks) =>
                          updateActiveNote({ blocks: nextBlocks })
                        }
                      />
                    )}

                    {activeNote.mode === 'sticky' && (
                      <StickyNotesBoard
                        cards={activeNote.stickyCards}
                        onChange={(nextCards) =>
                          updateActiveNote({ stickyCards: nextCards })
                        }
                        onPromoteToNote={promoteStickyToNote}
                      />
                    )}

                    {activeNote.mode === 'canvas' && (
                      <CanvasWhiteboard
                        data={activeNote.canvasData}
                        onChange={(nextCanvas) =>
                          updateActiveNote({ canvasData: nextCanvas })
                        }
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
            ) : null}
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
