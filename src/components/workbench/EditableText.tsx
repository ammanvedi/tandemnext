"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { ShimmerText } from "./ShimmerText";

type EditableTextProps = {
  elementId: string;
  children: string;
  onEdit: (elementId: string, original: string, edited: string) => void;
};

export function EditableText({
  elementId,
  children,
  onEdit,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(children);
  const originalRef = useRef(children);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleClick = useCallback(() => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      if (spanRef.current) {
        spanRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(spanRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const newText = spanRef.current?.textContent ?? currentText;
    setCurrentText(newText);
    if (newText !== originalRef.current) {
      onEdit(elementId, originalRef.current, newText);
    }
  }, [elementId, currentText, onEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        spanRef.current?.blur();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (spanRef.current) {
          spanRef.current.textContent = currentText;
        }
        spanRef.current?.blur();
      }
    },
    [currentText],
  );

  const hasBeenEdited = currentText !== originalRef.current;

  return (
    <motion.span
      className="relative inline cursor-text"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {isEditing ? (
        <span
          ref={spanRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="relative inline rounded-sm bg-accent/10 px-0.5 font-serif text-foreground outline-none ring-1 ring-accent/30 focus:ring-accent/60"
          style={{ WebkitTextFillColor: "var(--foreground)" }}
        >
          {currentText}
        </span>
      ) : (
        <span
          onClick={handleClick}
          onKeyDown={(e) => e.key === "Enter" && handleClick()}
          role="button"
          tabIndex={0}
          className="relative inline"
        >
          <ShimmerText className="font-serif font-bold">
            {currentText}
          </ShimmerText>
          {hasBeenEdited && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-2 -top-1 inline-block h-1.5 w-1.5 rounded-full bg-accent"
            />
          )}
        </span>
      )}
    </motion.span>
  );
}
