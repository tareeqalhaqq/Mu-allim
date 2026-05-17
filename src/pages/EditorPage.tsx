import { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import html2pdf from 'html2pdf.js';
import { BookOpen, MessageSquareQuote, ScrollText, Moon, Sun, Download } from 'lucide-react';

const AyahBlock = Node.create({
  name: 'ayahBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return { surah: { default: '' }, ayah: { default: '' } };
  },
  parseHTML() { return [{ tag: 'div[data-type="ayah-block"]' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ayah-block', class: 'ayah-block' }), ['p', 0], ['div', { class: 'ayah-ref' }, `Surah ${HTMLAttributes.surah || '—'} : Ayah ${HTMLAttributes.ayah || '—'}`]];
  },
  addCommands() { return { setAyahBlock: () => ({ commands }) => commands.setNode(this.name) }; },
  addKeyboardShortcuts() { return { 'Mod-1': () => this.editor.commands.setAyahBlock() }; },
});

const HadithBlock = Node.create({
  name: 'hadithBlock', group: 'block', content: 'inline*', defining: true,
  addAttributes() { return { narrator: { default: 'Narrator' }, source: { default: 'Source' }, grade: { default: 'Sahih' }, translation: { default: '' } }; },
  parseHTML() { return [{ tag: 'div[data-type="hadith-block"]' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'hadith-block', class: 'hadith-block' }), ['p', 0], ['div', { class: 'hadith-meta' }, `${HTMLAttributes.narrator} • ${HTMLAttributes.source}`], ['div', { class: `hadith-grade ${String(HTMLAttributes.grade).toLowerCase()}` }, HTMLAttributes.grade], ...(HTMLAttributes.translation ? [['p', { class: 'hadith-translation' }, HTMLAttributes.translation]] : [])];
  },
  addCommands() { return { setHadithBlock: () => ({ commands }) => commands.setNode(this.name) }; },
  addKeyboardShortcuts() { return { 'Mod-2': () => this.editor.commands.setHadithBlock() }; },
});

const CommentaryBlock = Node.create({
  name: 'commentaryBlock', group: 'block', content: 'inline*', defining: true,
  parseHTML() { return [{ tag: 'div[data-type="commentary-block"]' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'commentary-block', class: 'commentary-block' }), ['p', 0]]; },
  addCommands() { return { setCommentaryBlock: () => ({ commands }) => commands.setNode(this.name) }; },
  addKeyboardShortcuts() { return { 'Mod-5': () => this.editor.commands.setCommentaryBlock() }; },
});

const STORAGE_KEY = 'muallim-editor-doc';

export function EditorPage() {
  const [dark, setDark] = useState(false);

  const extensions = useMemo(() => [StarterKit.configure({ paragraph: false }), Placeholder.configure({ placeholder: 'Begin your ta’liq…' }), AyahBlock, HadithBlock, CommentaryBlock], []);

  const editor = useEditor({
    extensions,
    content: '<div data-type="commentary-block"><p>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p></div><div data-type="commentary-block"><p>Write commentary, organize evidences, and preserve references with beauty.</p></div>',
    editorProps: { attributes: { class: 'prose prose-lg max-w-none focus:outline-none' } },
    onCreate: ({ editor }) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) editor.commands.setContent(JSON.parse(saved), false);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const i = setInterval(() => localStorage.setItem(STORAGE_KEY, editor.getJSON ? JSON.stringify(editor.getJSON()) : editor.getHTML()), 3000);
    return () => clearInterval(i);
  }, [editor]);

  const exportPdf = async () => {
    const el = document.getElementById('editor-export');
    if (!el) return;
    await html2pdf().set({ margin: [20, 18], filename: "muallim-notes.pdf", html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } }).from(el).save();
  };

  if (!editor) return null;

  return <div className={dark ? 'dark' : ''}><div className="min-h-screen bg-parchment text-stone-800 dark:bg-night dark:text-stone-200 transition-colors"><header className="sticky top-0 z-50 backdrop-blur border-b border-stone-300/50 dark:border-stone-700/40 bg-parchment/90 dark:bg-night/90"><div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between"><h1 className="font-quran text-2xl text-ayah">Mu'allim</h1><div className="flex items-center gap-2"><ToolbarButton icon={<BookOpen size={16} />} label="Ayah" onClick={() => editor.chain().focus().setAyahBlock().run()} /><ToolbarButton icon={<ScrollText size={16} />} label="Hadith" onClick={() => editor.chain().focus().setHadithBlock().run()} /><ToolbarButton icon={<MessageSquareQuote size={16} />} label="Commentary" onClick={() => editor.chain().focus().setCommentaryBlock().run()} /><button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-btn">B</button><button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-btn italic">I</button><button onClick={exportPdf} className="toolbar-btn"><Download size={14} /> PDF</button><button onClick={() => setDark((d) => !d)} className="toolbar-btn">{dark ? <Sun size={14} /> : <Moon size={14} />}</button></div></div></header><main className="mx-auto max-w-4xl px-6 py-10"><div className="mb-6 h-5 opacity-40 bg-[radial-gradient(circle,_rgba(184,134,11,0.45)_1px,_transparent_1px)] bg-[length:14px_14px]" /><article id="editor-export" className="rounded-2xl border border-stone-300/70 dark:border-stone-700 bg-white/70 dark:bg-stone-900/40 shadow-sm p-8"><EditorContent editor={editor} /></article></main></div></div>;
}

function ToolbarButton({ icon, label, onClick }: { icon: JSX.Element; label: string; onClick: () => void }) {
  return <button title={label} onClick={onClick} className="toolbar-btn">{icon}<span className="hidden md:inline">{label}</span></button>;
}
