'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VisualGraphData, GraphNode } from '@/services/graph';
import { Network, Leaf, BookOpen, ShieldAlert, Activity, GitCommit } from 'lucide-react';

interface KnowledgeGraphProps {
  data: VisualGraphData;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const plantNode = data.nodes.find((n) => n.type === 'plant');
  if (!plantNode) return null;

  // Position surrounding nodes in a circle around center (500x500 viewBox coordinates)
  const center = { x: 250, y: 250 };
  const radius = 160;
  const surroundingNodes = data.nodes.filter((n) => n.type !== 'plant');

  const getIcon = (type: string) => {
    switch (type) {
      case 'family':
        return <GitCommit className="h-4 w-4" />;
      case 'disease':
        return <ShieldAlert className="h-4 w-4" />;
      case 'action':
        return <Activity className="h-4 w-4" />;
      case 'part':
        return <Leaf className="h-4 w-4" />;
      case 'research':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Network className="h-4 w-4" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'family':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'disease':
        return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30';
      case 'action':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'part':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'research':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-[var(--muted)] bg-[var(--border)] border-[var(--border)]';
    }
  };

  return (
    <div
      role="region"
      aria-label="Interactive Botanical Knowledge Graph"
      className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-sans text-sm font-semibold tracking-tight">Interactive Knowledge Graph</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Click nodes to discover medicinal pathways & research.</p>
        </div>
        <Network className="h-5 w-5 text-[var(--muted)]" />
      </div>

      <div className="relative w-full aspect-square max-w-[500px] mx-auto overflow-hidden">
        {/* SVG Connections Layer with ViewBox */}
        <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full pointer-events-none">
          {surroundingNodes.map((node, index) => {
            const angle = (index * 2 * Math.PI) / surroundingNodes.length;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);

            return (
              <g key={`link-${node.id}`}>
                <line
                  x1={center.x}
                  y1={center.y}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--border)] stroke-dasharray-[4]"
                />
              </g>
            );
          })}
        </svg>

        {/* Center Plant Node */}
        <button
          type="button"
          onClick={() => setSelectedNode(plantNode)}
          aria-label={`Central plant node: ${plantNode.label}`}
          className="absolute z-10 w-[19.2%] h-[19.2%] rounded-full flex flex-col items-center justify-center p-2 text-center border-2 border-[var(--ring)] bg-[var(--background)] shadow-lg hover:scale-105 transition-all"
          style={{
            left: `${((center.x - 48) / 500) * 100}%`,
            top: `${((center.y - 48) / 500) * 100}%`,
          }}
        >
          <Leaf className="h-5 w-5 text-[var(--ring)] mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-semibold leading-tight line-clamp-2">
            {plantNode.label.split(' (')[0]}
          </span>
        </button>

        {/* Outer Nodes */}
        {surroundingNodes.map((node, index) => {
          const angle = (index * 2 * Math.PI) / surroundingNodes.length;
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);

          const colorClasses = getColorClass(node.type);

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node)}
              aria-label={`${node.type} node: ${node.label}`}
              className={`absolute z-10 w-[9.6%] h-[9.6%] rounded-full border flex items-center justify-center shadow-md hover:scale-110 transition-all ${colorClasses}`}
              style={{
                left: `${((x - 24) / 500) * 100}%`,
                top: `${((y - 24) / 500) * 100}%`,
              }}
              title={node.label}
            >
              {getIcon(node.type)}
            </button>
          );
        })}
      </div>

      {/* Selected Node Drawer / Detail View */}
      <div className="h-24 flex items-center justify-center border-t border-[var(--border)] pt-4">
        {selectedNode ? (
          <div className="w-full text-center space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getColorClass(selectedNode.type)}`}>
              {getIcon(selectedNode.type)}
              {selectedNode.type.toUpperCase()}
            </span>
            <h4 className="font-sans text-xs font-semibold">{selectedNode.label}</h4>
            {selectedNode.slug && (selectedNode.type === 'family' || selectedNode.type === 'disease') ? (
              <Link
                href={`/${selectedNode.type === 'family' ? 'families' : 'diseases'}/${selectedNode.slug}`}
                className="text-[10px] text-[var(--ring)] hover:underline font-medium"
              >
                Explore all plants related to this →
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)] italic">
            Select any node above to inspect its taxonomic details.
          </p>
        )}
      </div>
    </div>
  );
}
