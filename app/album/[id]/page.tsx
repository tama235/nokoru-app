"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Settings, Edit3, Save, Check } from "lucide-react"
import PhotoCapture from "@/components/photo-capture"
import StickerLibrary from "@/components/sticker-library"
import SwipeableCanvas from "@/components/swipeable-canvas"
import ThumbnailStrip from "@/components/thumbnail-strip"
import PageThumbnail from "@/components/page-thumbnail"

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

interface Album {
  id: string
  name: string
  pages: AlbumPage[]
  createdAt: Date
}

export default function AlbumEditor() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const albumId = params.id as string
  const isQuickPhoto = searchParams.get("quickPhoto") === "true"

  const [album, setAlbum] = useState<Album | null>(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [showPageManager, setShowPageManager] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showStickerLibrary, setShowStickerLibrary] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  useEffect(() => {
    const savedAlbums = JSON.parse(localStorage.getItem("photoAlbums") || "{}")

    if (savedAlbums[albumId]) {
      setAlbum(savedAlbums[albumId])
      setEditedName(savedAlbums[albumId].name)
    } else {
      const mockAlbum: Album = {
        id: albumId,
        name:
          albumId === "1"
            ? "Family Vacation"
            : albumId === "2"
              ? "Birthday Party"
              : `Quick Photo ${new Date().toLocaleDateString()}`,
        pages: [
          {
            id: "page-1",
            photos: [],
            stickers: [],
          },
        ],
        createdAt: new Date(),
      }
      setAlbum(mockAlbum)
      setEditedName(mockAlbum.name)

      if (isQuickPhoto) {
        setShowPhotoCapture(true)
      }
    }
  }, [albumId, isQuickPhoto])

  useEffect(() => {
    if (!album || isSaved) return

    const autoSaveTimer = setTimeout(() => {
      saveAlbum(true)
    }, 2000)

    return () => clearTimeout(autoSaveTimer)
  }, [album, isSaved])

  const saveAlbum = (isAutoSave = false) => {
    if (!album) return

    if (isAutoSave) {
      setIsAutoSaving(true)
    }

    const savedAlbums = JSON.parse(localStorage.getItem("photoAlbums") || "{}")
    savedAlbums[albumId] = album
    localStorage.setItem("photoAlbums", JSON.stringify(savedAlbums))

    setIsSaved(true)

    if (isAutoSave) {
      setTimeout(() => setIsAutoSaving(false), 1000)
    }
  }

  const markUnsaved = () => {
    setIsSaved(false)
  }

  const addNewPage = () => {
    if (!album) return

    const newPage: AlbumPage = {
      id: `page-${Date.now()}`,
      photos: [],
      stickers: [],
    }

    setAlbum({
      ...album,
      pages: [...album.pages, newPage],
    })
    setCurrentPageIndex(album.pages.length)
    markUnsaved()
  }

  const deletePage = (pageIndex: number) => {
    if (!album || album.pages.length <= 1) return

    const newPages = album.pages.filter((_, index) => index !== pageIndex)
    setAlbum({
      ...album,
      pages: newPages,
    })

    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1)
    }
    markUnsaved()
  }

  const updateAlbumName = () => {
    if (!album || !editedName.trim()) return

    setAlbum({
      ...album,
      name: editedName.trim(),
    })
    setIsEditingName(false)
    markUnsaved()
  }

  const goToPage = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex)
    setShowPageManager(false)
  }

  const addPhotoToPage = (photoSrc: string) => {
    if (!album) return

    const newPhoto = {
      id: `photo-${Date.now()}`,
      src: photoSrc,
      caption: "",
      x: 50,
      y: 50,
      width: 150,
      height: 150,
    }

    const updatedPages = [...album.pages]
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      photos: [...updatedPages[currentPageIndex].photos, newPhoto],
    }

    setAlbum({
      ...album,
      pages: updatedPages,
    })
    markUnsaved()
  }

  const addStickerToPage = (stickerType: string) => {
    if (!album) return

    const newSticker = {
      id: `sticker-${Date.now()}`,
      type: stickerType,
      x: 50,
      y: 50,
      size: 60,
    }

    const updatedPages = [...album.pages]
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      stickers: [...updatedPages[currentPageIndex].stickers, newSticker],
    }

    setAlbum({
      ...album,
      pages: updatedPages,
    })
    setShowStickerLibrary(false)
    markUnsaved()
  }

  const updateElement = (elementId: string, updates: any) => {
    if (!album) return

    const updatedPages = [...album.pages]
    const currentPage = updatedPages[currentPageIndex]

    const photoIndex = currentPage.photos.findIndex((p) => p.id === elementId)
    if (photoIndex !== -1) {
      currentPage.photos[photoIndex] = { ...currentPage.photos[photoIndex], ...updates }
    }

    const stickerIndex = currentPage.stickers.findIndex((s) => s.id === elementId)
    if (stickerIndex !== -1) {
      currentPage.stickers[stickerIndex] = { ...currentPage.stickers[stickerIndex], ...updates }
    }

    setAlbum({
      ...album,
      pages: updatedPages,
    })
    markUnsaved()
  }

  const deleteElement = (elementId: string) => {
    if (!album) return

    const updatedPages = [...album.pages]
    const currentPage = updatedPages[currentPageIndex]

    currentPage.photos = currentPage.photos.filter((p) => p.id !== elementId)
    currentPage.stickers = currentPage.stickers.filter((s) => s.id !== elementId)

    setAlbum({
      ...album,
      pages: updatedPages,
    })
    markUnsaved()
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading album...</p>
        </div>
      </div>
    )
  }

  const currentPage = album.pages[currentPageIndex]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-foreground hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex-1 mx-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 text-center font-semibold bg-transparent border-b border-primary focus:outline-none"
                  maxLength={30}
                  onBlur={updateAlbumName}
                  onKeyDown={(e) => e.key === "Enter" && updateAlbumName()}
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-lg font-semibold text-center text-foreground cursor-pointer hover:text-primary"
                onClick={() => setIsEditingName(true)}
              >
                {album.name}
                <Edit3 className="w-3 h-3 inline ml-1 opacity-50" />
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Saving...
              </div>
            )}

            <Button
              variant={isSaved ? "ghost" : "default"}
              size="sm"
              onClick={() => saveAlbum()}
              className={
                isSaved ? "text-green-600 hover:bg-muted" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPageManager(!showPageManager)}
              className="text-foreground hover:bg-muted"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Page Manager Overlay */}
      {showPageManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-card w-full max-h-[70vh] rounded-t-xl p-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Manage Pages</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPageManager(false)}>
                  Done
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 max-h-60 overflow-y-auto">
                {album.pages.map((page, index) => (
                  <PageThumbnail
                    key={page.id}
                    page={page}
                    pageIndex={index}
                    isActive={index === currentPageIndex}
                    canDelete={album.pages.length > 1}
                    onClick={() => goToPage(index)}
                    onDelete={() => deletePage(index)}
                  />
                ))}
              </div>

              <Button onClick={addNewPage} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add New Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          {/* Page Counter */}
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPageIndex + 1} of {album.pages.length}
            </span>
            <div className="text-xs text-muted-foreground/70 mt-1">Swipe left or right to navigate</div>
          </div>

          {/* Album Page Canvas */}
          <div className="mb-6">
            <SwipeableCanvas
              pages={album.pages}
              currentPageIndex={currentPageIndex}
              onPageChange={setCurrentPageIndex}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={() => setShowPhotoCapture(true)}
              variant="outline"
              className="h-12 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>

            <Button
              onClick={() => setShowStickerLibrary(true)}
              variant="outline"
              className="h-12 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sticker
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      <ThumbnailStrip
        pages={album.pages}
        currentPageIndex={currentPageIndex}
        onPageSelect={setCurrentPageIndex}
        onAddPage={addNewPage}
        onDeletePage={deletePage}
      />

      {/* PhotoCapture component */}
      {showPhotoCapture && <PhotoCapture onPhotoSelected={addPhotoToPage} onClose={() => setShowPhotoCapture(false)} />}

      {/* StickerLibrary component */}
      {showStickerLibrary && (
        <StickerLibrary onStickerSelected={addStickerToPage} onClose={() => setShowStickerLibrary(false)} />
      )}
    </div>
  )
}
