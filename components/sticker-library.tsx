"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

interface StickerLibraryProps {
  onStickerSelected: (stickerType: string) => void
  onClose: () => void
}

const STICKER_CATEGORIES = {
  hearts: ["❤️", "💖", "💕", "💗", "💙", "💚", "💛", "🧡", "💜"],
  stars: ["⭐", "🌟", "✨", "💫", "🌠", "⚡", "🔥", "💥", "✴️"],
  nature: ["🌸", "🌺", "🌻", "🌷", "🌹", "🍀", "🌿", "🌱", "🌳"],
  fun: ["🎉", "🎊", "🎈", "🎁", "🎂", "🍰", "🧁", "🍭", "🎪"],
  animals: ["🐶", "🐱", "🐰", "🐻", "🐼", "🦊", "🐸", "🐝", "🦋"],
  shapes: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤"],
}

export default function StickerLibrary({ onStickerSelected, onClose }: StickerLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof STICKER_CATEGORIES>("hearts")

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
      <Card className="w-full max-h-[70vh] rounded-t-xl bg-card">
        <CardContent className="p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add Sticker</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {Object.keys(STICKER_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category as keyof typeof STICKER_CATEGORIES)}
                  className={`capitalize whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
              {STICKER_CATEGORIES[selectedCategory].map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => onStickerSelected(sticker)}
                  className="aspect-square bg-muted hover:bg-muted/80 rounded-lg flex items-center justify-center text-2xl transition-colors border-2 border-transparent hover:border-primary/30"
                >
                  {sticker}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">Tap a sticker to add it to your page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
