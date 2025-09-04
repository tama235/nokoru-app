"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import PageThumbnail from "./page-thumbnail"

interface AlbumPage {
  id: string
  photos: Array<{
    id: string
    src: string
    caption: string
    x: number
    y: number
    width: number
    height: number
  }>
  stickers: Array<{
    id: string
    type: string
    x: number
    y: number
    size: number
  }>
}

interface ThumbnailStripProps {
  pages: AlbumPage[]
  currentPageIndex: number
  onPageSelect: (index: number) => void
  onAddPage: () => void
  onDeletePage: (index: number) => void
}

export default function ThumbnailStrip({
  pages,
  currentPageIndex,
  onPageSelect,
  onAddPage,
  onDeletePage,
}: ThumbnailStripProps) {
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: "smooth" })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowScrollButtons(scrollWidth > clientWidth)
    }
  }

  return (
    <div className="bg-card border-t border-border p-3">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Pages</h3>
          <Button
            onClick={onAddPage}
            size="sm"
            className="h-7 px-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="relative">
          {/* Scroll buttons */}
          {showScrollButtons && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 p-0 bg-background/80 hover:bg-background"
                onClick={scrollLeft}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 p-0 bg-background/80 hover:bg-background"
                onClick={scrollRight}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </>
          )}

          {/* Thumbnail container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            onScroll={handleScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {pages.map((page, index) => (
              <div key={page.id} className="flex-shrink-0 w-16">
                <PageThumbnail
                  page={page}
                  pageIndex={index}
                  isActive={index === currentPageIndex}
                  canDelete={pages.length > 1}
                  onClick={() => onPageSelect(index)}
                  onDelete={() => onDeletePage(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Page indicator */}
        <div className="flex justify-center mt-3">
          <div className="flex gap-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => onPageSelect(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentPageIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
