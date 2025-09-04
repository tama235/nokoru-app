"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, FolderOpen, Camera } from "lucide-react"

interface Album {
  id: string
  name: string
  coverImage?: string
  pageCount: number
  createdAt: Date
}

export default function HomePage() {
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([
    {
      id: "1",
      name: "Family Vacation",
      coverImage: "/family-vacation-photos.jpg",
      pageCount: 5,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Birthday Party",
      coverImage: "/birthday-party.png",
      pageCount: 3,
      createdAt: new Date("2024-02-10"),
    },
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState("")

  const createNewAlbum = () => {
    if (newAlbumName.trim()) {
      const newAlbum: Album = {
        id: Date.now().toString(),
        name: newAlbumName.trim(),
        pageCount: 1,
        createdAt: new Date(),
      }
      setAlbums([newAlbum, ...albums])
      setNewAlbumName("")
      setShowCreateForm(false)
      router.push(`/album/${newAlbum.id}`)
    }
  }

  const openAlbum = (albumId: string) => {
    router.push(`/album/${albumId}`)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Photo Albums</h1>
          <p className="text-muted-foreground">Create and edit your digital photo collections</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">New Album</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-xl flex flex-col items-center justify-center gap-2 bg-transparent"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm font-medium">Quick Photo</span>
          </Button>
        </div>

        {/* Create Album Form */}
        {showCreateForm && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Create New Album</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Album name (e.g., Summer Trip)"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={30}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={createNewAlbum}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Create Album
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewAlbumName("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Albums Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Albums</h2>

          {albums.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="p-8 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No albums yet</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create Your First Album
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {albums.map((album) => (
                <Card
                  key={album.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border border-border"
                  onClick={() => openAlbum(album.id)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      {album.coverImage ? (
                        <img
                          src={album.coverImage || "/placeholder.svg"}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-foreground truncate mb-1">{album.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {album.pageCount} page{album.pageCount !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
