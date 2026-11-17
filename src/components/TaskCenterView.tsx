import React, { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Note } from '../types/note';

interface TaskCenterViewProps {
  notes: Note[];
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onAddChecklistItem: (
    noteId: string,
    text: string,
    priority: 'normal' | 'high',
    dueDate?: string
  ) => void;
  onDeleteChecklistItem: (noteId: string, itemId: string) => void;
  onToggleBlockTodo: (noteId: string, blockId: string) => void;
  onOpenNote: (noteId: string) => void;
}

type TaskFilter = 'all' | 'pending' | 'completed' | 'high';

export const TaskCenterView: React.FC<TaskCenterViewProps> = ({
  notes,
  onToggleChecklistItem,
  onAddChecklistItem,
  onDeleteChecklistItem,
  onToggleBlockTodo,
  onOpenNote,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [targetNoteId, setTargetNoteId] = useState<string>(notes[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'normal' | 'high'>('normal');
  const [newTaskDue, setNewTaskDue] = useState('');

  const unifiedTasks = useMemo(() => {
    const list: {
      id: string;
      noteId: string;
      noteTitle: string;
      text: string;
      completed: boolean;
      priority: 'normal' | 'high';
      dueDate?: string;
      source: 'checklist' | 'block';
    }[] = [];

    notes.forEach((note) => {
      note.checklist.forEach((item) => {
        list.push({
          id: item.id,
          noteId: note.id,
          noteTitle: note.title,
          text: item.text,
          completed: item.completed,
          priority: item.priority,
          dueDate: item.dueDate,
          source: 'checklist',
        });
      });

      note.blocks
        .filter((b) => b.type === 'todo' && b.content.trim())
        .forEach((b) => {
          list.push({
            id: b.id,
            noteId: note.id,
            noteTitle: note.title,
            text: b.content,
            completed: Boolean(b.checked),
            priority: 'normal',
            source: 'block',
          });
        });
    });

    return list;
  }, [notes]);

  const filteredTasks = useMemo(() => {
    return unifiedTasks.filter((t) => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'high') return t.priority === 'high';
      return true;
    });
  }, [unifiedTasks, filter]);

  const metrics = useMemo(() => {
    const total = unifiedTasks.length;
    const completed = unifiedTasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [unifiedTasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const noteId = targetNoteId || notes[0]?.id;
    if (!newTaskText.trim() || !noteId) return;
    onAddChecklistItem(noteId, newTaskText.trim(), newTaskPriority, newTaskDue || undefined);
    setNewTaskText('');
    setNewTaskDue('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FAF9F5] dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Quantitative Metrics Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              Manajemen Tindak Lanjut Lintas Catatan
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Pusat Tugas & Daftar Periksa
            </h1>
          </div>

          <div className="flex items-center gap-6 font-mono-tabular text-xs text-stone-600 dark:text-slate-300">
            <div>
              <span className="text-stone-400 dark:text-slate-500 block">Total Tugas</span>
              <span className="text-lg font-bold text-stone-900 dark:text-white">
                {metrics.total}
              </span>
            </div>
            <div>
              <span className="text-stone-400 dark:text-slate-500 block">Selesai</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.completed}
              </span>
            </div>
            <div>
              <span className="text-stone-400 dark:text-slate-500 block">Tertunda</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {metrics.pending}
              </span>
            </div>
            <div>
              <span className="text-stone-400 dark:text-slate-500 block">Progres</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {metrics.rate}%
              </span>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <form
          onSubmit={handleCreateTask}
          className="rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Tambahkan item tugas atau tindak lanjut baru..."
            className="flex-1 text-sm bg-transparent text-stone-900 dark:text-white px-2 py-1.5 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={targetNoteId || notes[0]?.id || ''}
              onChange={(e) => setTargetNoteId(e.target.value)}
              className="text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 px-2.5 py-2 focus:outline-none max-w-[200px] truncate"
            >
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  Catatan: {n.title}
                </option>
              ))}
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as 'normal' | 'high')}
              className="text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 px-2.5 py-2 focus:outline-none"
            >
              <option value="normal">Prioritas Normal</option>
              <option value="high">Prioritas Tinggi</option>
            </select>

            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="text-xs font-mono-tabular rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 px-2.5 py-1.5 focus:outline-none"
            />

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </form>

        {/* Segmented Filter Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-200/70 dark:bg-slate-900">
            {(
              [
                { id: 'all', label: `Semua (${unifiedTasks.length})` },
                { id: 'pending', label: `Belum Selesai (${metrics.pending})` },
                { id: 'completed', label: `Selesai (${metrics.completed})` },
                { id: 'high', label: 'Prioritas Tinggi' },
              ] as { id: TaskFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Task List */}
        <div className="rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-stone-200/70 dark:divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-sm text-stone-500 dark:text-slate-400">
              Tidak ada tugas pada kategori filter ini.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={`${task.source}-${task.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      task.source === 'checklist'
                        ? onToggleChecklistItem(task.noteId, task.id)
                        : onToggleBlockTodo(task.noteId, task.id)
                    }
                    className="mt-0.5 text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'line-through text-stone-400 dark:text-slate-500'
                          : 'text-stone-900 dark:text-slate-100'
                      }`}
                    >
                      {task.text}
                    </p>
                    {/* Unboxed Metadata with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
                      <button
                        type="button"
                        onClick={() => onOpenNote(task.noteId)}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[260px]"
                      >
                        <span>{task.noteTitle}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </button>
                      {task.priority === 'high' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            Prioritas Tinggi
                          </span>
                        </>
                      )}
                      {task.dueDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Tenggat {task.dueDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {task.source === 'checklist' && (
                  <button
                    type="button"
                    onClick={() => onDeleteChecklistItem(task.noteId, task.id)}
                    title="Hapus Tugas"
                    className="p-1.5 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
