"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

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

interface PageThumbnailProps {
  page: AlbumPage
  pageIndex: number
  isActive: boolean
  canDelete: boolean
  onClick: () => void
  onDelete: () => void
}

export default function PageThumbnail({ page, pageIndex, isActive, canDelete, onClick, onDelete }: PageThumbnailProps) {
  return (
    <div className="relative">
      <Card
        className={`cursor-pointer transition-all ${
          isActive ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-2">
          <div className="aspect-square bg-muted/50 rounded relative overflow-hidden">
            {/* Render miniature version of page content */}
            <div className="w-full h-full relative">
              {/* Photos */}
              {page.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="absolute rounded-sm overflow-hidden border border-primary/30"
                  style={{
                    left: `${photo.x}%`,
                    top: `${photo.y}%`,
                    width: `${Math.max(8, (photo.width / 300) * 100)}%`,
                    height: `${Math.max(8, (photo.height / 300) * 100)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <img
                    src={photo.src || "/placeholder.svg"}
                    alt="Thumbnail photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Stickers */}
              {page.stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    width: `${Math.max(6, (sticker.size / 300) * 100)}%`,
                    height: `${Math.max(6, (sticker.size / 300) * 100)}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: `${Math.max(8, (sticker.size / 300) * 16)}px`,
                  }}
                >
                  {sticker.type}
                </div>
              ))}

              {/* Empty state */}
              {page.photos.length === 0 && page.stickers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Page number overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="text-[10px] text-white font-medium p-1 text-center">{pageIndex + 1}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="w-2.5 h-2.5" />
        </Button>
      )}
    </div>
  )
}
