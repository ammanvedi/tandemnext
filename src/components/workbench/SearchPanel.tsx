"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Feature, SearchResult } from "./types";

type SearchPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  features: Feature[];
};

export function SearchPanel({
  isOpen,
  onClose,
  onSearch,
  onSelect,
  features,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(0);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await onSearch(value.trim());
          setResults(res);
        } catch {
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 250);
    },
    [onSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        onSelect(results[selectedIndex]);
        onClose();
      }
    },
    [results, selectedIndex, onSelect, onClose],
  );

  const featureLabel = (id: string) =>
    features.find((f) => f.id === id)?.label ?? id;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50"
        >
          <div
            className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />

          <div className="absolute inset-x-0 top-[15%] z-10 mx-auto w-full max-w-xl px-4">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-2xl shadow-foreground/5"
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <svg
                  className="h-4 w-4 shrink-0 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search across features..."
                  className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted outline-none"
                />
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-accent border-t-transparent"
                  />
                )}
                <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
                  ESC
                </kbd>
              </div>

              {results.length > 0 && (
                <ul className="max-h-80 overflow-y-auto py-2">
                  {results.map((result, i) => (
                    <li key={`${result.featureId}-${result.matchText}-${i}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(result);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`flex w-full flex-col gap-1 px-4 py-2.5 text-left transition-colors ${
                          i === selectedIndex
                            ? "bg-accent/10"
                            : "hover:bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                            {featureLabel(result.featureId)}
                          </span>
                          <span className="font-serif text-sm font-medium text-foreground">
                            {result.matchText}
                          </span>
                        </div>
                        <p className="font-serif text-xs leading-relaxed text-muted line-clamp-2">
                          {result.context}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {query.length >= 2 && !isLoading && results.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="font-mono text-xs text-muted">
                    No results found
                  </p>
                </div>
              )}

              {query.length < 2 && (
                <div className="px-4 py-6 text-center">
                  <p className="font-mono text-[11px] text-muted">
                    Type to search across all features
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
