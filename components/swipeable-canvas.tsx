"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import DraggableElement from "./draggable-element"

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

interface SwipeableCanvasProps {
  pages: AlbumPage[]
  currentPageIndex: number
  onPageChange: (newIndex: number) => void
  onUpdateElement: (elementId: string, updates: any) => void
  onDeleteElement: (elementId: string) => void
}

export default function SwipeableCanvas({
  pages,
  currentPageIndex,
  onPageChange,
  onUpdateElement,
  onDeleteElement,
}: SwipeableCanvasProps) {
  const [isSwipingEnabled, setIsSwipingEnabled] = useState(true)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const swipeDirection = useRef<"horizontal" | "vertical" | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipingEnabled || isAnimating) return

    const touch = e.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    isDragging.current = true
    swipeDirection.current = null
    setSwipeOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !isSwipingEnabled || isAnimating) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX.current
    const deltaY = touch.clientY - startY.current

    // Determine swipe direction on first significant movement
    if (!swipeDirection.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      swipeDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical"
    }

    // Only handle horizontal swipes for page navigation
    if (swipeDirection.current === "horizontal") {
      e.preventDefault()

      // Limit swipe range
      const maxOffset = containerRef.current?.offsetWidth || 300
      const clampedOffset = Math.max(-maxOffset * 0.8, Math.min(maxOffset * 0.8, deltaX))

      // Add resistance at boundaries
      let finalOffset = clampedOffset
      if ((currentPageIndex === 0 && deltaX > 0) || (currentPageIndex === pages.length - 1 && deltaX < 0)) {
        finalOffset = clampedOffset * 0.3 // Reduced movement at boundaries
      }

      setSwipeOffset(finalOffset)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current || !isSwipingEnabled) return

    isDragging.current = false

    if (swipeDirection.current === "horizontal") {
      const threshold = (containerRef.current?.offsetWidth || 300) * 0.25

      if (Math.abs(swipeOffset) > threshold) {
        // Trigger page change
        setIsAnimating(true)

        if (swipeOffset > 0 && currentPageIndex > 0) {
          // Swipe right - go to previous page
          onPageChange(currentPageIndex - 1)
        } else if (swipeOffset < 0 && currentPageIndex < pages.length - 1) {
          // Swipe left - go to next page
          onPageChange(currentPageIndex + 1)
        }

        // Animate back to center
        setTimeout(() => {
          setSwipeOffset(0)
          setIsAnimating(false)
        }, 300)
      } else {
        // Snap back to original position
        setIsAnimating(true)
        setSwipeOffset(0)
        setTimeout(() => setIsAnimating(false), 200)
      }
    } else {
      setSwipeOffset(0)
    }

    swipeDirection.current = null
  }

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSwipingEnabled || isAnimating) return

    startX.current = e.clientX
    startY.current = e.clientY
    isDragging.current = true
    swipeDirection.current = null
    setSwipeOffset(0)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !isSwipingEnabled || isAnimating) return

    const deltaX = e.clientX - startX.current
    const deltaY = e.clientY - startY.current

    if (!swipeDirection.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      swipeDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical"
    }

    if (swipeDirection.current === "horizontal") {
      const maxOffset = containerRef.current?.offsetWidth || 300
      const clampedOffset = Math.max(-maxOffset * 0.8, Math.min(maxOffset * 0.8, deltaX))

      let finalOffset = clampedOffset
      if ((currentPageIndex === 0 && deltaX > 0) || (currentPageIndex === pages.length - 1 && deltaX < 0)) {
        finalOffset = clampedOffset * 0.3
      }

      setSwipeOffset(finalOffset)
    }
  }

  const handleMouseUp = () => {
    if (!isDragging.current || !isSwipingEnabled) return

    isDragging.current = false

    if (swipeDirection.current === "horizontal") {
      const threshold = (containerRef.current?.offsetWidth || 300) * 0.25

      if (Math.abs(swipeOffset) > threshold) {
        setIsAnimating(true)

        if (swipeOffset > 0 && currentPageIndex > 0) {
          onPageChange(currentPageIndex - 1)
        } else if (swipeOffset < 0 && currentPageIndex < pages.length - 1) {
          onPageChange(currentPageIndex + 1)
        }

        setTimeout(() => {
          setSwipeOffset(0)
          setIsAnimating(false)
        }, 300)
      } else {
        setIsAnimating(true)
        setSwipeOffset(0)
        setTimeout(() => setIsAnimating(false), 200)
      }
    } else {
      setSwipeOffset(0)
    }

    swipeDirection.current = null
  }

  useEffect(() => {
    if (isDragging.current) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [swipeOffset, currentPageIndex, pages.length])

  // Reset swipe offset when page changes externally
  useEffect(() => {
    setSwipeOffset(0)
  }, [currentPageIndex])

  const currentPage = pages[currentPageIndex]

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-6">
          <div
            ref={canvasRef}
            className="aspect-square bg-muted/30 rounded-lg relative min-h-[300px] overflow-hidden select-none"
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition: isAnimating ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}
            onMouseDown={(e) => {
              // Disable swipe when interacting with draggable elements
              const target = e.target as HTMLElement
              if (target.closest("[data-draggable]")) {
                setIsSwipingEnabled(false)
                setTimeout(() => setIsSwipingEnabled(true), 100)
              }
            }}
          >
            {currentPage.photos.length === 0 && currentPage.stickers.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Empty page</p>
                  <p className="text-xs text-muted-foreground">Add photos and stickers to get started</p>
                </div>
              </div>
            ) : null}

            {/* Render Photos */}
            {currentPage.photos.map((photo) => (
              <div key={photo.id} data-draggable>
                <DraggableElement
                  id={photo.id}
                  type="photo"
                  src={photo.src}
                  x={photo.x}
                  y={photo.y}
                  width={photo.width}
                  height={photo.height}
                  caption={photo.caption}
                  onUpdate={onUpdateElement}
                  onDelete={onDeleteElement}
                  containerRef={canvasRef}
                />
              </div>
            ))}

            {/* Render Stickers */}
            {currentPage.stickers.map((sticker) => (
              <div key={sticker.id} data-draggable>
                <DraggableElement
                  id={sticker.id}
                  type="sticker"
                  content={sticker.type}
                  x={sticker.x}
                  y={sticker.y}
                  width={sticker.size}
                  height={sticker.size}
                  onUpdate={onUpdateElement}
                  onDelete={onDeleteElement}
                  containerRef={canvasRef}
                />
              </div>
            ))}

            {/* Swipe Indicator */}
            {Math.abs(swipeOffset) > 20 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {swipeOffset > 0
                    ? currentPageIndex > 0
                      ? "← Previous Page"
                      : "← First Page"
                    : currentPageIndex < pages.length - 1
                      ? "Next Page →"
                      : "Last Page →"}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Page Transition Preview */}
      {Math.abs(swipeOffset) > 50 && (
        <div className="absolute top-0 bottom-0 w-full pointer-events-none">
          {swipeOffset > 0 && currentPageIndex > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-card/80 border-r border-border flex items-center justify-center"
              style={{
                width: `${Math.min(100, (swipeOffset / (containerRef.current?.offsetWidth || 300)) * 200)}%`,
                transform: `translateX(-100%)`,
              }}
            >
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground">Page {currentPageIndex}</p>
              </div>
            </div>
          )}

          {swipeOffset < 0 && currentPageIndex < pages.length - 1 && (
            <div
              className="absolute right-0 top-0 bottom-0 bg-card/80 border-l border-border flex items-center justify-center"
              style={{
                width: `${Math.min(100, (Math.abs(swipeOffset) / (containerRef.current?.offsetWidth || 300)) * 200)}%`,
                transform: `translateX(100%)`,
              }}
            >
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground">Page {currentPageIndex + 2}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
