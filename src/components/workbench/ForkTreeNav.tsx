"use client";

import { motion } from "motion/react";
import type { ForkNode } from "./types";

type ForkTreeNavProps = {
  nodes: Record<string, ForkNode>;
  activeNodeId: string;
  onNavigate: (nodeId: string) => void;
  onFork: () => void;
};

function getAncestors(
  nodes: Record<string, ForkNode>,
  nodeId: string,
): string[] {
  const path: string[] = [];
  let current: string | null = nodeId;
  while (current) {
    path.unshift(current);
    current = nodes[current]?.parentId ?? null;
  }
  return path;
}

export function ForkTreeNav({
  nodes,
  activeNodeId,
  onNavigate,
  onFork,
}: ForkTreeNavProps) {
  const ancestorPath = getAncestors(nodes, activeNodeId);
  const activeNode = nodes[activeNodeId];
  const hasSiblings =
    activeNode?.parentId != null &&
    (nodes[activeNode.parentId]?.children.length ?? 0) > 1;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        {ancestorPath.map((nodeId, i) => {
          const isActive = nodeId === activeNodeId;
          const node = nodes[nodeId];
          const hasBranches = node.children.length > 1;
          return (
            <div key={nodeId} className="flex items-center gap-1">
              {i > 0 && (
                <svg
                  className="h-3 w-3 text-border"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              )}
              <motion.button
                type="button"
                layout
                onClick={() => onNavigate(nodeId)}
                className={`relative rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground/70"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="fork-indicator"
                    className="absolute inset-0 rounded bg-surface-raised"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">v{i + 1}</span>
                {hasBranches && (
                  <span className="relative z-10 ml-1 text-accent">
                    +{node.children.length - 1}
                  </span>
                )}
              </motion.button>

              {hasBranches && isActive && (
                <div className="flex gap-0.5 ml-1">
                  {node.children
                    .filter((cId) => cId !== activeNodeId)
                    .map((childId) => (
                      <motion.button
                        key={childId}
                        type="button"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        onClick={() => onNavigate(childId)}
                        className="h-4 w-4 rounded-sm border border-border bg-surface-raised font-mono text-[8px] text-muted hover:border-accent hover:text-accent flex items-center justify-center"
                      >
                        &bull;
                      </motion.button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasSiblings && activeNode?.parentId && (
        <div className="flex gap-0.5 ml-1 border-l border-border pl-2">
          {nodes[activeNode.parentId].children
            .filter((cId) => cId !== activeNodeId)
            .map((sibId) => (
              <motion.button
                key={sibId}
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => onNavigate(sibId)}
                className="rounded px-2 py-1 font-mono text-[10px] text-muted hover:text-foreground/70 transition-colors"
              >
                alt
              </motion.button>
            ))}
        </div>
      )}

      <div className="ml-auto">
        <motion.button
          type="button"
          onClick={onFork}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9" />
          </svg>
          Fork
        </motion.button>
      </div>
    </div>
  );
}
