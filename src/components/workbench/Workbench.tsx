"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { FeatureSelector } from "./FeatureSelector";
import { TextPanel } from "./TextPanel";
import { IFramePanel } from "./IFramePanel";
import { InspoOverlay } from "./InspoOverlay";
import { ForkTreeNav } from "./ForkTreeNav";
import { ApplyBar } from "./ApplyBar";
import { SearchPanel } from "./SearchPanel";
import type {
  Changeset,
  ForkNode,
  InspoAttachment,
  InspoState,
  SearchResult,
  WorkbenchProps,
} from "./types";

function createId() {
  return Math.random().toString(36).slice(2, 9);
}

export function Workbench({
  applications,
  features,
  initialFeatureId,
  onInspoRequest,
  onForkRequest,
  onSearch,
}: WorkbenchProps) {
  const [activeFeatureId, setActiveFeatureId] = useState(initialFeatureId);
  const [inspoState, setInspoState] = useState<InspoState>(null);
  const [isForking, setIsForking] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const initialNodeId = useMemo(() => createId(), []);
  const activeFeature = features.find((f) => f.id === activeFeatureId)!;

  const [forkNodes, setForkNodes] = useState<Record<string, ForkNode>>(() => ({
    [initialNodeId]: {
      id: initialNodeId,
      parentId: null,
      applicationId: activeFeature.applicationId,
      changesets: [],
      attachments: [],
      children: [],
    },
  }));
  const [activeNodeId, setActiveNodeId] = useState(initialNodeId);

  const activeNode = forkNodes[activeNodeId];
  const activeApp = applications[activeNode.applicationId];

  const iframeUrl = useMemo(() => {
    const featureApp = applications[activeFeature.applicationId];
    return featureApp?.iframeBaseUrl ?? activeApp.iframeBaseUrl;
  }, [activeFeature, applications, activeApp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEdit = useCallback(
    (elementId: string, original: string, edited: string) => {
      setForkNodes((prev) => {
        const node = prev[activeNodeId];
        const existing = node.changesets.findIndex(
          (c) => c.elementId === elementId,
        );
        const newChangesets = [...node.changesets];
        const changeset: Changeset = { elementId, original, edited };

        if (existing >= 0) {
          if (edited === newChangesets[existing].original) {
            newChangesets.splice(existing, 1);
          } else {
            newChangesets[existing] = {
              ...newChangesets[existing],
              edited,
            };
          }
        } else {
          newChangesets.push(changeset);
        }

        return {
          ...prev,
          [activeNodeId]: { ...node, changesets: newChangesets },
        };
      });
    },
    [activeNodeId],
  );

  const handleInspoTrigger = useCallback(
    async (wordId: string, text: string) => {
      const images = await onInspoRequest(text);
      setInspoState({ wordId, text, images });
    },
    [onInspoRequest],
  );

  const handleInspoClose = useCallback(
    (selectedAttachments: InspoAttachment[]) => {
      if (selectedAttachments.length > 0) {
        setForkNodes((prev) => {
          const node = prev[activeNodeId];
          const existingUrls = new Set(node.attachments.map((a) => a.imageUrl));
          const newAttachments = selectedAttachments.filter(
            (a) => !existingUrls.has(a.imageUrl),
          );
          return {
            ...prev,
            [activeNodeId]: {
              ...node,
              attachments: [...node.attachments, ...newAttachments],
            },
          };
        });
      }
      setInspoState(null);
    },
    [activeNodeId],
  );

  const handleFork = useCallback(async () => {
    setIsForking(true);
    try {
      const newApp = await onForkRequest(activeNode);
      const newNodeId = createId();
      const newNode: ForkNode = {
        id: newNodeId,
        parentId: activeNodeId,
        applicationId: newApp.id,
        changesets: [],
        attachments: [],
        children: [],
      };
      setForkNodes((prev) => ({
        ...prev,
        [newNodeId]: newNode,
        [activeNodeId]: {
          ...prev[activeNodeId],
          children: [...prev[activeNodeId].children, newNodeId],
        },
      }));

      setTimeout(() => {
        setActiveNodeId(newNodeId);
        setIsForking(false);
      }, 600);
    } catch {
      setIsForking(false);
    }
  }, [activeNode, activeNodeId, onForkRequest]);

  const handleNavigate = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId);
  }, []);

  const handleApply = useCallback(() => {
    console.log("Applying changes:", {
      changesets: activeNode.changesets,
      attachments: activeNode.attachments,
    });
  }, [activeNode]);

  const handleFeatureSelect = useCallback((id: string) => {
    setActiveFeatureId(id);
  }, []);

  const handleSearchQuery = useCallback(
    (query: string) => {
      return onSearch(query, activeNode.applicationId);
    },
    [onSearch, activeNode.applicationId],
  );

  const handleSearchSelect = useCallback(
    async (result: SearchResult) => {
      setIsForking(true);
      try {
        const newApp = await onForkRequest(activeNode);
        const newNodeId = createId();
        const newNode: ForkNode = {
          id: newNodeId,
          parentId: activeNodeId,
          applicationId: newApp.id,
          changesets: [],
          attachments: [],
          children: [],
        };
        setForkNodes((prev) => ({
          ...prev,
          [newNodeId]: newNode,
          [activeNodeId]: {
            ...prev[activeNodeId],
            children: [...prev[activeNodeId].children, newNodeId],
          },
        }));

        setTimeout(() => {
          setActiveNodeId(newNodeId);
          setActiveFeatureId(result.featureId);
          setIsForking(false);
        }, 600);
      } catch {
        setIsForking(false);
      }
    },
    [activeNode, activeNodeId, onForkRequest],
  );

  return (
    <LayoutGroup>
      <motion.div
        animate={{
          scale: isForking ? 0.92 : 1,
          filter: isForking ? "blur(2px)" : "blur(0px)",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="flex h-screen flex-col bg-background"
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Workbench
            </h1>
            <div className="h-4 w-px bg-border" />
            <ForkTreeNav
              nodes={forkNodes}
              activeNodeId={activeNodeId}
              onNavigate={handleNavigate}
              onFork={handleFork}
            />
          </div>
          <motion.button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-foreground/20 hover:text-foreground/70"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
            <kbd className="hidden rounded border border-border px-1 py-0.5 text-[9px] sm:inline-block">
              &#8984;K
            </kbd>
          </motion.button>
        </header>

        <FeatureSelector
          features={features}
          activeId={activeFeatureId}
          onSelect={handleFeatureSelect}
        />

        <div className="flex flex-1 min-h-0">
          <div className="w-1/2 border-r border-border overflow-hidden">
            <TextPanel
              markdown={activeFeature.markdown}
              featureId={activeFeatureId}
              onEdit={handleEdit}
              onInspoTrigger={handleInspoTrigger}
              attachments={activeNode.attachments}
            />
          </div>

          <div className="w-1/2 p-4">
            <IFramePanel url={iframeUrl} featureId={activeFeatureId} />
          </div>
        </div>
      </motion.div>

      <InspoOverlay inspoState={inspoState} onClose={handleInspoClose} />

      <ApplyBar
        changeCount={activeNode.changesets.length}
        attachmentCount={activeNode.attachments.length}
        onApply={handleApply}
      />

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearchQuery}
        onSelect={handleSearchSelect}
        features={features}
      />

      {isForking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="flex items-center gap-3 rounded-full border border-accent/30 bg-surface-raised/90 px-5 py-2.5 shadow-lg backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent"
            />
            <span className="font-mono text-xs uppercase tracking-widest text-foreground">
              Forking...
            </span>
          </motion.div>
        </motion.div>
      )}
    </LayoutGroup>
  );
}
