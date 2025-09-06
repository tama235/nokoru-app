"use client";
import * as React from "react";

type Props = {
  open: boolean;
  onStickerSelected: (emoji: string) => void;
  onClose: () => void;
};

// カテゴリ別の絵文字だけ
const EMOJI = {
  hearts: ["❤️","💖","💕","💗","💙","💚","💛","🧡","💜"],
  stars:  ["⭐","🌟","✨","💫","🌠","⚡","🔥","💥","✴️"],
  nature: ["🌸","🌺","🌻","🌷","🌹","🍀","🌿","🌱","🌳"],
  fun:    ["🎉","🎊","🎈","🎁","🎂","🍰","🧁","🍭","🎪"],
  animals:["🐶","🐱","🐰","🐻","🐼","🦊","🐸","🐝","🦋"],
  shapes: ["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤"],
} as const;

const CATS = [
  { key: "hearts",  label: "Hearts" },
  { key: "stars",   label: "Stars"  },
  { key: "nature",  label: "Nature" },
  { key: "fun",     label: "Fun"    },
  { key: "animals", label: "Animals"},
  { key: "shapes",  label: "Shapes" },
] as const;

export default function StickerLibrary({ open, onStickerSelected, onClose }: Props) {
  if (!open) return null;

  const [active, setActive] = React.useState<(typeof CATS)[number]["key"]>("hearts");

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full bg-white rounded-t-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Stickers</h2>
          <button className="text-sm px-3 py-1 rounded hover:bg-zinc-100" onClick={onClose}>Close</button>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {CATS.map(c => (
            <button
              key={c.key}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${active===c.key ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* グリッド */}
        <div className="grid grid-cols-6 gap-2 max-h-[40vh] overflow-y-auto">
          {EMOJI[active].map((emoji, i) => (
            <button
              key={`${active}-${i}`}
              onClick={() => onStickerSelected(emoji)}
              className="aspect-square rounded-lg bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-3xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
