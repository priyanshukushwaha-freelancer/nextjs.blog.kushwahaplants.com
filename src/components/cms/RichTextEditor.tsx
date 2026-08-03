'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  initialContent?: any;
  onChange?: (jsonContent: string) => void;
  name?: string;
}

export default function RichTextEditor({ initialContent, onChange, name = 'content' }: RichTextEditorProps) {
  const [jsonString, setJsonString] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: initialContent || '<p>Start typing editorial analysis, clinical citations, and medicinal notes here...</p>',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const stringified = JSON.stringify(json);
      setJsonString(stringified);
      if (onChange) onChange(stringified);
    },
  });

  useEffect(() => {
    if (editor) {
      const json = editor.getJSON();
      const stringified = JSON.stringify(json);
      setJsonString(stringified);
      if (onChange) onChange(stringified);
    }
  }, [editor, onChange]);

  if (!editor) {
    return (
      <div className="h-48 border border-[var(--border)] rounded-xl bg-[var(--card)] animate-pulse flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        Initializing TipTap WYSIWYG Editor...
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden focus-within:border-[var(--ring)] transition-all">
      {/* Hidden input field for HTML forms / Server Actions */}
      <input type="hidden" name={name} value={jsonString} />

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--background)]/60 text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('bold') ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('italic') ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('bulletList') ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('orderedList') ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors ${
            editor.isActive('blockquote') ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-[var(--border)] mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors text-[var(--muted-foreground)] disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[var(--border)]/50 transition-colors text-[var(--muted-foreground)] disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Editable Area */}
      <EditorContent
        editor={editor}
        className="p-4 text-sm min-h-[220px] focus:outline-none prose-editorial"
      />
    </div>
  );
}
