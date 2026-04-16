"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const command = "npx tagthat";

export default function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center rounded-full bg-white shadow-[0_0_40px_rgba(244,114,182,0.15)] shadow-xl">
      <span className="pl-5 pr-2.5 py-2 font-mono text-sm text-neutral-950 tracking-tight select-none">
        <span className="text-neutral-400 mr-1">$</span>
        {command}
      </span>
      <div className="w-px h-4 bg-neutral-200 shrink-0" />
      <button
        onClick={handleCopy}
        aria-label="Copy command"
        className="px-2.5 py-2 cursor-pointer text-neutral-400 hover:text-pink-400 transition-colors duration-200"
      >
        {copied ? (
          <Check size={14} strokeWidth={2.5} className="text-pink-400" />
        ) : (
          <Copy size={14} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
