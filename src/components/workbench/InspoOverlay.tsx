"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { InspoAttachment, InspoState } from "./types";

type InspoOverlayProps = {
  inspoState: InspoState;
  onClose: (selectedAttachments: InspoAttachment[]) => void;
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateEdgePosition(rand: () => number) {
  const edge = Math.floor(rand() * 4);
  const off = 900;
  switch (edge) {
    case 0:
      return { x: (rand() - 0.5) * 500, y: -off, rotate: (rand() - 0.5) * 50 };
    case 1:
      return { x: off, y: (rand() - 0.5) * 500, rotate: (rand() - 0.5) * 50 };
    case 2:
      return { x: (rand() - 0.5) * 500, y: off, rotate: (rand() - 0.5) * 50 };
    default:
      return { x: -off, y: (rand() - 0.5) * 500, rotate: (rand() - 0.5) * 50 };
  }
}

function generatePilePositions(total: number, rand: () => number) {
  const cols = Math.min(total, 3);
  const cardW = 270;
  const cardH = 220;
  const gapX = 20;
  const gapY = 20;

  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const gridW = cols * cardW + (cols - 1) * gapX;
    const rows = Math.ceil(total / cols);
    const gridH = rows * cardH + (rows - 1) * gapY;
    const baseX = col * (cardW + gapX) - gridW / 2 + cardW / 2;
    const baseY = row * (cardH + gapY) - gridH / 2 + cardH / 2;
    return {
      x: baseX + (rand() - 0.5) * 20,
      y: baseY + (rand() - 0.5) * 15,
      rotate: (rand() - 0.5) * 6,
    };
  });
}

function InspoCardInline({
  imageUrl,
  index,
  edge,
  rest,
  comment,
  onCommentChange,
  isSelected,
  onToggle,
}: {
  imageUrl: string;
  index: number;
  edge: { x: number; y: number; rotate: number };
  rest: { x: number; y: number; rotate: number };
  comment: string;
  onCommentChange: (url: string, c: string) => void;
  isSelected: boolean;
  onToggle: (url: string) => void;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{
        x: edge.x,
        y: edge.y,
        rotate: edge.rotate,
        opacity: 0,
        scale: 0.3,
      }}
      animate={{
        x: rest.x,
        y: rest.y,
        rotate: rest.rotate,
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.6,
        transition: { duration: 0.25 },
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 14,
        delay: index * 0.07,
      }}
      whileHover={{ scale: 1.04, zIndex: 50 }}
      whileDrag={{ scale: 1.08, zIndex: 100 }}
      className="absolute cursor-grab select-none"
      style={{ zIndex: 10 + index, marginLeft: -135, marginTop: -110 }}
    >
      <div
        className={`relative w-[270px] overflow-hidden rounded-lg border-2 transition-colors ${
          isSelected ? "border-accent" : "border-foreground/10 hover:border-foreground/25"
        }`}
        style={{
          boxShadow: isSelected
            ? "0 20px 50px rgba(26,95,122,0.2), 0 8px 20px rgba(0,0,0,0.15)"
            : "0 20px 50px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none block h-[180px] w-full object-cover"
          draggable={false}
        />
        <div className="flex items-center justify-between bg-surface-raised px-3 py-2 border-t border-border">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(imageUrl);
            }}
            className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
              isSelected
                ? "bg-accent text-white font-semibold"
                : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowNote((p) => !p);
            }}
            className="rounded-full bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/60 hover:bg-foreground/10"
          >
            Note
          </button>
        </div>
        {showNote && (
          <div className="border-t border-border bg-surface">
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(imageUrl, e.target.value)}
              placeholder="Add a note..."
              className="w-full resize-none bg-transparent p-3 font-mono text-xs text-foreground/80 placeholder:text-muted outline-none"
              rows={2}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function InspoOverlay({ inspoState, onClose }: InspoOverlayProps) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const positions = useMemo(() => {
    if (!inspoState) return { edges: [] as ReturnType<typeof generateEdgePosition>[], piles: [] as ReturnType<typeof generateEdgePosition>[] };
    const total = inspoState.images.length;
    const seed = inspoState.text.length * 997 + total * 31;
    const rand = seededRandom(seed);
    return {
      edges: inspoState.images.map(() => generateEdgePosition(rand)),
      piles: generatePilePositions(total, rand),
    };
  }, [inspoState]);

  const handleCommentChange = useCallback(
    (imageUrl: string, comment: string) => {
      setComments((prev) => ({ ...prev, [imageUrl]: comment }));
      if (comment.length > 0) {
        setSelected((prev) => new Set(prev).add(imageUrl));
      }
    },
    [],
  );

  const handleToggle = useCallback((imageUrl: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(imageUrl)) next.delete(imageUrl);
      else next.add(imageUrl);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!inspoState) return;
    const attachments: InspoAttachment[] = Array.from(selected).map(
      (imageUrl) => ({
        wordId: inspoState.wordId,
        imageUrl,
        comment: comments[imageUrl] ?? "",
      }),
    );
    setComments({});
    setSelected(new Set());
    onClose(attachments);
  }, [inspoState, selected, comments, onClose]);

  return (
    <AnimatePresence mode="wait">
      {inspoState && (
        <motion.div
          key="inspo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50"
        >
          <div
            className="absolute inset-0 bg-foreground/70 backdrop-blur-lg"
            onClick={handleClose}
            onKeyDown={(e) => e.key === "Escape" && handleClose()}
            role="button"
            tabIndex={-1}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
            className="absolute top-8 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/60">
              Inspiration for
            </p>
            <p className="font-serif text-2xl italic text-background">
              &ldquo;{inspoState.text}&rdquo;
            </p>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative pointer-events-auto">
              {inspoState.images.map((url, i) => (
                <InspoCardInline
                  key={url}
                  imageUrl={url}
                  index={i}
                  edge={positions.edges[i]}
                  rest={positions.piles[i]}
                  comment={comments[url] ?? ""}
                  onCommentChange={handleCommentChange}
                  isSelected={selected.has(url)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="absolute bottom-8 left-0 right-0 z-50 flex justify-center"
          >
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-background/20 bg-background/90 px-8 py-3 font-mono text-xs uppercase tracking-widest text-foreground shadow-xl backdrop-blur-sm transition-all hover:border-accent hover:bg-accent hover:text-white"
            >
              {selected.size > 0
                ? `Attach ${selected.size} image${selected.size > 1 ? "s" : ""}`
                : "Close"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
