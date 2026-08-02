import React from 'react';

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface TiptapRendererProps {
  content: any; // Raw JSON block node from database
}

export default function TiptapRenderer({ content }: TiptapRendererProps) {
  if (!content) return null;

  const node = typeof content === 'string' ? JSON.parse(content) : content;

  // Render lists of nodes recursively
  const renderNodes = (nodes?: TiptapNode[]): React.ReactNode => {
    if (!nodes) return null;
    return nodes.map((n, i) => renderNode(n, i));
  };

  // Render text marks (bold, italic, links, etc.)
  const renderTextWithMarks = (textNode: TiptapNode): React.ReactNode => {
    let result: React.ReactNode = textNode.text || '';
    if (!textNode.marks) return result;

    // Apply marks in order
    for (const mark of textNode.marks) {
      if (mark.type === 'bold') {
        result = <strong key={mark.type}>{result}</strong>;
      } else if (mark.type === 'italic') {
        result = <em key={mark.type}>{result}</em>;
      } else if (mark.type === 'link') {
        result = (
          <a
            key={mark.type}
            href={mark.attrs?.href}
            target={mark.attrs?.target || '_blank'}
            rel="noopener noreferrer"
            className="text-[var(--ring)] hover:underline"
          >
            {result}
          </a>
        );
      } else if (mark.type === 'code') {
        result = (
          <code key={mark.type} className="bg-[var(--border)]/55 px-1.5 py-0.5 rounded text-xs font-mono">
            {result}
          </code>
        );
      }
    }
    return result;
  };

  // Render individual block nodes
  const renderNode = (node: TiptapNode, index: number): React.ReactNode => {
    switch (node.type) {
      case 'doc':
        return <div key={index} className="space-y-6">{renderNodes(node.content)}</div>;

      case 'paragraph':
        return (
          <p key={index} className="text-sm md:text-base leading-relaxed text-[var(--foreground)]">
            {node.content ? node.content.map((child, i) => (child.type === 'text' ? renderTextWithMarks(child) : renderNode(child, i))) : <br />}
          </p>
        );

      case 'heading':
        const level = node.attrs?.level || 2;
        const text = node.content?.map((c) => c.text).join('') || '';
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `heading-${index}`;

        const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const sizeClasses = level === 1 
          ? 'text-2xl md:text-3xl' 
          : level === 2 
          ? 'text-xl md:text-2xl border-b border-[var(--border)] pb-2 pt-6' 
          : 'text-lg pt-4';

        return (
          <HeadingTag
            key={index}
            id={id}
            className={`font-sans font-semibold tracking-tight text-[var(--foreground)] scroll-mt-20 ${sizeClasses}`}
          >
            {renderNodes(node.content)}
          </HeadingTag>
        );

      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-[var(--ring)] pl-4 italic text-[var(--muted-foreground)] text-sm my-4"
          >
            {renderNodes(node.content)}
          </blockquote>
        );

      case 'bulletList':
        return (
          <ul key={index} className="list-disc list-inside space-y-2 text-sm pl-4">
            {renderNodes(node.content)}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 text-sm pl-4">
            {renderNodes(node.content)}
          </ol>
        );

      case 'listItem':
        return <li key={index}>{renderNodes(node.content)}</li>;

      case 'text':
        return renderTextWithMarks(node);

      case 'horizontalRule':
        return <hr key={index} className="my-8 border-t border-[var(--border)]" />;

      default:
        console.warn(`Unhandled block rendering type: ${node.type}`);
        return null;
    }
  };

  return <div className="prose-editorial">{renderNode(node, 0)}</div>;
}
