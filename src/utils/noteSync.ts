import {
  CanvasData,
  CanvasNode,
  NoteBlock,
  StickyCard,
} from '../types/note';

/**
 * Converts an array of structured Wiki Blocks into a Markdown string.
 */
export function blocksToMarkdown(blocks: NoteBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'h1':
          return `# ${block.content}`;
        case 'h2':
          return `## ${block.content}`;
        case 'todo':
          return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
        case 'quote':
          return `> ${block.content}`;
        case 'callout':
          return `> **${block.calloutTitle || 'Catatan'}**: ${block.content}`;
        case 'code':
          return `\`\`\`${block.language || 'typescript'}\n${block.content}\n\`\`\``;
        case 'divider':
          return `---`;
        case 'table': {
          const rows = block.tableData || [];
          if (rows.length === 0) return '';
          const header = `| ${rows[0].join(' | ')} |`;
          const sep = `| ${rows[0].map(() => ':---').join(' | ')} |`;
          const body = rows
            .slice(1)
            .map((r) => `| ${r.join(' | ')} |`)
            .join('\n');
          return [header, sep, body].filter(Boolean).join('\n');
        }
        case 'paragraph':
        default:
          return block.content;
      }
    })
    .filter((segment) => segment.trim().length > 0)
    .join('\n\n');
}

/**
 * Parses a Markdown string into structured Wiki Blocks.
 */
export function markdownToBlocks(markdown: string): NoteBlock[] {
  const lines = markdown.split('\n');
  const blocks: NoteBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'typescript';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'code',
        language: lang,
        content: codeLines.join('\n'),
      });
      i++;
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const headers = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      i += 2;
      const rows: string[][] = [headers];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(
          lines[i]
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean)
        );
        i++;
      }
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'table',
        content: 'Tabel',
        tableData: rows,
      });
      continue;
    }

    // Divider
    if (line.trim() === '---') {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'divider',
        content: '',
      });
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'h1',
        content: line.slice(2).trim(),
      });
      i++;
      continue;
    }

    // H2 / H3
    if (line.startsWith('## ') || line.startsWith('### ')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'h2',
        content: line.replace(/^#{2,3}\s+/, '').trim(),
      });
      i++;
      continue;
    }

    // Todo
    const todoMatch = line.match(/^\s*-\s*\[([ xX])\]\s+(.*)$/);
    if (todoMatch) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'todo',
        checked: todoMatch[1].toLowerCase() === 'x',
        content: todoMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Quote / Callout
    if (line.startsWith('> ')) {
      const clean = line.slice(2).trim();
      const calloutMatch = clean.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);
      if (calloutMatch) {
        blocks.push({
          id: `blk-${Date.now()}-${blocks.length}`,
          type: 'callout',
          calloutTitle: calloutMatch[1],
          content: calloutMatch[2],
        });
      } else {
        blocks.push({
          id: `blk-${Date.now()}-${blocks.length}`,
          type: 'quote',
          content: clean,
        });
      }
      i++;
      continue;
    }

    // Paragraph
    blocks.push({
      id: `blk-${Date.now()}-${blocks.length}`,
      type: 'paragraph',
      content: line,
    });
    i++;
  }

  if (blocks.length === 0) {
    return [{ id: `blk-${Date.now()}-0`, type: 'paragraph', content: '' }];
  }

  return blocks;
}

/**
 * Converts a StickyCard to a CanvasNode positioned neatly on the canvas.
 */
export function stickyCardToCanvasNode(
  card: StickyCard,
  existingCount: number
): CanvasNode {
  const col = existingCount % 3;
  const row = Math.floor(existingCount / 3);
  const toneMap: Record<StickyCard['tone'], CanvasNode['tone']> = {
    amber: 'amber',
    emerald: 'emerald',
    sky: 'indigo',
    rose: 'rose',
    violet: 'indigo',
    stone: 'stone',
  };

  return {
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    x: 60 + col * 290,
    y: 60 + row * 180,
    width: 250,
    title: card.title || 'Kartu Sticky',
    content: card.body || '',
    tone: toneMap[card.tone] || 'amber',
  };
}

/**
 * Converts a CanvasNode into a StickyCard.
 */
export function canvasNodeToStickyCard(node: CanvasNode): StickyCard {
  const toneMap: Record<CanvasNode['tone'], StickyCard['tone']> = {
    indigo: 'sky',
    amber: 'amber',
    emerald: 'emerald',
    rose: 'rose',
    stone: 'stone',
  };

  return {
    id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: node.title || 'Node Kanvas',
    body: node.content || '',
    tone: toneMap[node.tone] || 'amber',
    pinned: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Converts CanvasData nodes & connections into Wiki Blocks.
 */
export function canvasToWikiBlocks(canvasData: CanvasData): NoteBlock[] {
  const result: NoteBlock[] = [];
  canvasData.nodes.forEach((node) => {
    const outgoing = canvasData.connections
      .filter((c) => c.fromId === node.id)
      .map((c) => {
        const target = canvasData.nodes.find((n) => n.id === c.toId);
        return target ? `→ ${c.label || 'Terhubung ke'}: ${target.title}` : null;
      })
      .filter(Boolean)
      .join('\n');

    result.push({
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'h2',
      content: node.title,
    });
    result.push({
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'paragraph',
      content: [node.content, outgoing].filter(Boolean).join('\n'),
    });
  });
  return result;
}
