# Aksara Studio — Multi-Mode Digital Note-Taking Platform

**Aksara Studio** is a versatile digital note-taking workspace that unifies four note-taking styles (**Rich Text & Markdown Editor**, **Structured Block Documents à la Wiki**, **Sticky Notes Board**, and **Freeform 2D Visual Canvas**) in a calm, fast editorial interface that autosaves to local storage with no login required.

---

## Main features

### 1. Four unified note-taking modes
Every note in Aksara Studio can be opened or switched at any time to one of 4 working modes:
- **Mode 1 — Rich Text & Markdown Editor**:
  - Full formatting toolbar (Heading, Bold, Italic, Quote, Bullet List, Checklist, Table, and Code Block).
  - Three view modes: **Write**, **Side-by-side (Split View)**, and **Preview**.
  - Interactive checkboxes that can be clicked directly from the Preview panel.
  - Typography toggle between **Modern Sans (`DM Sans`)** and **Editorial Serif (`Source Serif 4`)** for comfortable long-form reading.
  - Real-time word count, character count, and estimated reading time.
- **Mode 2 — Structured Block Documents à la Wiki**:
  - Compose documents from independent blocks: *Large Title (H1)*, *Subtitle (H2)*, *Paragraph*, *Task Item*, *Info Callout*, *Quote*, *Code Block*, *Interactive Matrix Table*, and *Divider*.
  - Reorder blocks (move up/down), duplicate blocks, insert blocks at any position, and change block type instantly.
- **Mode 3 — Sticky Notes Board**:
  - Grid of short idea cards with 6 paper color choices (*Amber Yellow*, *Sage Green*, *Sky Blue*, *Soft Rose*, *Lavender Purple*, *Neutral Paper*).
  - Pin important cards to the top, search card contents, and filter by color.
  - One-click button to promote a sticky note card into a full note document.
- **Mode 4 — Freeform Canvas & Visual Whiteboard**:
  - Interactive 2D workspace for mapping concepts and system flows.
  - *Drag-and-drop* card node positioning, drawing connecting arrows between nodes, and freehand sketching with colorful pens.
  - Zoom controls (*Zoom In / Zoom Out / Reset*).

### 2. Organization & productivity
- **Nested Folders & Sub-Folders**: group notes with an unlimited hierarchical tree structure.
- **Colored Label Tags**: cross-folder tagging with semantic color indicators.
- **Quick Search (`⌘K` / `Ctrl + K`)**: instant search palette scanning titles, Markdown content, Wiki blocks, sticky cards, and label tags.
- **Unified Task Center**: dedicated page collecting all checklists and To-Do blocks from every note, with priority indicators, due dates, and completion progress percentage.
- **Ready-to-use Template Gallery**: create a new note in one click from *Meeting Minutes*, *Daily Reflection Journal*, *Product Specification (PRD)*, *Sticky Brainstorming*, or *Concept Map Canvas* templates.

### 3. Privacy & independent local storage
- **Instant Autosave**: all changes are saved automatically to the browser's local storage (`localStorage`).
- **JSON Export & Import**: download a backup of the entire workspace as `.json` and restore it anytime on another device.
- **Markdown Download (`.md`)**: export the active document to standard Markdown.
- **Light & Dark Mode**: full support for *Warm Paper* (Light) and *Deep Carbon Slate* (Dark) themes.

---

## Keyboard shortcuts

| Shortcut | Function |
| :--- | :--- |
| `Cmd + K` / `Ctrl + K` | Open or close the cross-note Quick Search modal |

---

## Tech stack

- **Frontend Framework**: React 19 + TypeScript
- **Styling & Theme**: Tailwind CSS v4 (`@tailwindcss/vite`) with editorial typography variables (`Plus Jakarta Sans`, `DM Sans`, `Source Serif 4`, and `JetBrains Mono`)
- **Iconography**: Lucide React
- **Build Tool**: Vite

---

## Running locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run the development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```

---

## Roadmap & suggested future development

1. **Bi-directional Wiki Links `[[Note Title]]` & Knowledge Graph**:
   - Let users type `[[Note Name]]` inside the editor to link two documents directly and display a knowledge graph network visualization.
2. **Version History / Snapshots**:
   - Store periodic recovery points in `IndexedDB` so users can view change diffs and restore notes to a previous version.
3. **Local Image Attachments & Voice Memo Support (`IndexedDB`)**:
   - Move from `localStorage` to `IndexedDB` to store high-resolution image attachments, canvas sketches as PNG, and short voice memos.
4. **Optional Cloud Sync & Real-Time Collaboration**:
   - Add optional sync to Firebase Firestore or Google Drive so users can still work offline (*offline-first*), with data auto-syncing across devices when online.
5. **PDF & Canvas Image Export (PNG/SVG)**:
   - Provide print/export of documents with book-style typography and direct download of Visual Canvas diagrams as presentation-ready PNG/SVG images.
6. **Task Reminders & Calendar View**:
   - Add monthly/weekly calendar views in the **Task Center** based on the due date of each checklist item.
