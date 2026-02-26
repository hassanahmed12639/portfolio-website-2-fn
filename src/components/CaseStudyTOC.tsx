"use client";

import { useState } from "react";

type Item = { id: string; label: string };

export default function CaseStudyTOC({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center justify-between w-full hover:text-[var(--color-accent)] transition-colors"
      >
        Table of Contents
        <span className="text-[var(--color-text)]/60 transition-transform" aria-hidden>
          <svg
            className={`w-4 h-4 ${open ? "rotate-180" : ""}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </span>
      </button>
      {open && (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-[var(--color-text)]/60 hover:text-[var(--color-accent)] hover:underline underline-offset-2"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
