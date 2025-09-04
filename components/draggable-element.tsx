"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2 } from "lucide-react"

interface DraggableElementProps {
  id: string
  type: "photo" | "sticker"
  src?: string
  content?: string
  x: number
  y: number
  width: number
  height: number
  caption?: string
  onUpdate: (id: string, updates: { x?: number; y?: number; width?: number; height?: number; caption?: string }) => void
  onDelete: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export default function DraggableElement({
  id,
  type,
  src,
  content,
  x,
  y,
  width,
  height,
  caption,
  onUpdate,
  onDelete,
  containerRef,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 })
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [editedCaption, setEditedCaption] = useState(caption || "")

  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setIsSelected(false)
        setIsEditingCaption(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditingCaption) return

    e.preventDefault()
    setIsSelected(true)
    setIsDragging(true)

    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    const clientY = e.clientY || (e as any).touches?.[0]?.clientY || 0

    setDragStart({ x: clientX, y: clientY })
    setElementStart({ x, y })
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !containerRef.current) return

    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    const clientY = e.clientY || (e as any).touches?.[0]?.clientY || 0

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y

    const containerRect = containerRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(100, elementStart.x + (deltaX / containerRect.width) * 100))
    const newY = Math.max(0, Math.min(100, elementStart.y + (deltaY / containerRect.height) * 100))

    onUpdate(id, { x: newX, y: newY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove)
      document.addEventListener("pointerup", handlePointerUp)
      return () => {
        document.removeEventListener("pointermove", handlePointerMove)
        document.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }, [isDragging, dragStart, elementStart])

  const handleResize = (direction: string, e: React.PointerEvent) => {
    e.stopPropagation()
    setIsResizing(true)

    const startSize = { width, height }
    const startPos = {
      x: e.clientX || (e as any).touches?.[0]?.clientX || 0,
      y: e.clientY || (e as any).touches?.[0]?.clientY || 0,
    }

    const handleResizeMove = (e: PointerEvent) => {
      const currentX = e.clientX || (e as any).touches?.[0]?.clientX || 0
      const currentY = e.clientY || (e as any).touches?.[0]?.clientY || 0

      const deltaX = currentX - startPos.x
      const deltaY = currentY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height

      if (direction.includes("right")) newWidth = Math.max(50, startSize.width + deltaX)
      if (direction.includes("left")) newWidth = Math.max(50, startSize.width - deltaX)
      if (direction.includes("bottom")) newHeight = Math.max(50, startSize.height + deltaY)
      if (direction.includes("top")) newHeight = Math.max(50, startSize.height - deltaY)

      onUpdate(id, { width: newWidth, height: newHeight })
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      document.removeEventListener("pointermove", handleResizeMove)
      document.removeEventListener("pointerup", handleResizeEnd)
    }

    document.addEventListener("pointermove", handleResizeMove)
    document.addEventListener("pointerup", handleResizeEnd)
  }

  const saveCaption = () => {
    onUpdate(id, { caption: editedCaption })
    setIsEditingCaption(false)
  }

  return (
    <div
      ref={elementRef}
      className={`absolute select-none touch-none ${
        isSelected ? "z-10" : "z-0"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}px`,
        height: `${height}px`,
        transform: "translate(-50%, -50%)",
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Main Content */}
      <div className={`w-full h-full relative ${isSelected ? "ring-2 ring-primary" : ""} rounded`}>
        {type === "photo" && src && (
          <img
            src={src || "/placeholder.svg"}
            alt="Album photo"
            className="w-full h-full object-cover rounded"
            draggable={false}
          />
        )}

        {type === "sticker" && content && (
          <div className="w-full h-full flex items-center justify-center text-4xl">{content}</div>
        )}

        {/* Selection Controls */}
        {isSelected && (
          <>
            {/* Resize Handles */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
              onPointerDown={(e) => handleResize("top-right", e)}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
              onPointerDown={(e) => handleResize("bottom-right", e)}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
              onPointerDown={(e) => handleResize("bottom-left", e)}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
              onPointerDown={(e) => handleResize("top-left", e)}
            />

            {/* Action Buttons */}
            <div className="absolute -top-8 left-0 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(id)
                }}
                className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Caption */}
      {type === "photo" && (
        <div className="absolute -bottom-8 left-0 right-0">
          {isEditingCaption ? (
            <input
              type="text"
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              onBlur={saveCaption}
              onKeyDown={(e) => e.key === "Enter" && saveCaption()}
              className="w-full text-xs text-center bg-background/90 border border-border rounded px-1 py-0.5"
              maxLength={20}
              placeholder="Add caption..."
              autoFocus
            />
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingCaption(true)
                setEditedCaption(caption || "")
              }}
              className="text-xs text-center text-foreground bg-background/80 rounded px-1 py-0.5 cursor-text hover:bg-background/90"
            >
              {caption || "Add caption..."}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
