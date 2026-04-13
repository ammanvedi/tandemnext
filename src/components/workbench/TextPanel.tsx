"use client";

import { useCallback, useRef } from "react";
import Markdown from "react-markdown";
import { motion } from "motion/react";
import { EditableText } from "./EditableText";
import { InspoText } from "./InspoText";
import type { InspoAttachment } from "./types";

type TextPanelProps = {
  markdown: string;
  featureId: string;
  onEdit: (elementId: string, original: string, edited: string) => void;
  onInspoTrigger: (wordId: string, text: string) => void;
  attachments: InspoAttachment[];
};

let editableCounter = 0;
let inspoCounter = 0;

export function TextPanel({
  markdown,
  featureId,
  onEdit,
  onInspoTrigger,
  attachments,
}: TextPanelProps) {
  const editableIdMap = useRef(new Map<string, string>());
  const inspoIdMap = useRef(new Map<string, string>());

  editableCounter = 0;
  inspoCounter = 0;

  const getEditableId = useCallback((text: string) => {
    if (!editableIdMap.current.has(text)) {
      editableIdMap.current.set(text, `edit-${editableCounter++}`);
    }
    return editableIdMap.current.get(text)!;
  }, []);

  const getInspoId = useCallback((text: string) => {
    if (!inspoIdMap.current.has(text)) {
      inspoIdMap.current.set(text, `inspo-${inspoCounter++}`);
    }
    return inspoIdMap.current.get(text)!;
  }, []);

  return (
    <motion.div
      key={featureId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="h-full overflow-y-auto px-8 py-6"
    >
      <Markdown
        components={{
          strong({ children }) {
            const text =
              typeof children === "string"
                ? children
                : Array.isArray(children)
                  ? children.join("")
                  : String(children ?? "");
            const elementId = getEditableId(text);
            return (
              <EditableText elementId={elementId} onEdit={onEdit}>
                {text}
              </EditableText>
            );
          },
          em({ children }) {
            const text =
              typeof children === "string"
                ? children
                : Array.isArray(children)
                  ? children.join("")
                  : String(children ?? "");
            const wordId = getInspoId(text);
            return (
              <InspoText
                wordId={wordId}
                onTrigger={onInspoTrigger}
                attachments={attachments}
              >
                {text}
              </InspoText>
            );
          },
          p({ children }) {
            return (
              <p className="mb-6 font-serif text-lg leading-relaxed text-muted">
                {children}
              </p>
            );
          },
          h1({ children }) {
            return (
              <h1 className="mb-8 font-serif text-4xl font-normal leading-tight text-foreground">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mb-6 mt-10 font-serif text-2xl font-normal text-foreground">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mb-4 mt-8 font-mono text-sm uppercase tracking-widest text-foreground/70">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul className="mb-6 ml-4 list-none space-y-2">{children}</ul>
            );
          },
          li({ children }) {
            return (
              <li className="flex items-start gap-3 font-serif text-lg text-muted">
                <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{children}</span>
              </li>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="mb-6 border-l-2 border-accent/40 pl-6 italic text-foreground/60">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </motion.div>
  );
}
