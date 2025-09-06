"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Save,
  ChevronLeft,
  ChevronRight,
  Type,
  Pencil,
  RotateCcw,
} from "lucide-react";

import PhotoCapture from "@/components/photo-capture";
import StickerLibrary from "@/components/sticker-library";
import SwipeableCanvas from "@/components/swipeable-canvas";
import ThumbnailStrip from "@/components/thumbnail-strip";
import PageThumbnail from "@/components/page-thumbnail";
import { Image as ImageIcon, BadgePlus } from "lucide-react";

const STORAGE_KEY = "photoAlbums";

function loadAlbums(): Record<string, Album> {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    // 壊れていたら一旦クリアして空オブジェクトを返す
    console.warn("Invalid photoAlbums JSON. Resetting.", e);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return {};
  }
}

function saveAlbums(map: Record<string, Album>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to save photoAlbums", e);
  }
}

interface AlbumPage {
  id: string;
  photos: Array<{
    id: string;
    src: string;
    caption: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  stickers: Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  texts?: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
  }>;
}

interface Album {
  id: string;
  name: string;
  pages: AlbumPage[];
  createdAt: Date;
}

export default function AlbumEditor() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = params.id as string;
  const isQuickPhoto = searchParams.get("quickPhoto") === "true";

  const [album, setAlbum] = useState<Album | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showPageManager, setShowPageManager] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const newPage = {
    photos: [],
    texts: [],
    stickers: [], // ← これを追加
  };

  // ✅ クリックしたらその場で入力→追加
  const startText = () => {
    const v = window.prompt("テキストを入力");
    if (v && v.trim()) addText(v.trim());
  };

  // ✅ 手書きはトグルで切替
  const startDraw = () => setDrawingMode((v) => !v);

  // ファイル参照
  const fileRef = useRef<HTMLInputElement>(null);
  const openPhoto = () => fileRef.current?.click();

  const openSticker = () => setStickerPickerOpen(true);

  // 一つ前の要素を取り消す（例: elements 配列の最後を削除）

  // 保存（既存の保存関数があればそれを呼ぶ）
  const handleSave = () => saveAlbum();

  const undoLast = () => {
    setAlbum((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const page = next.pages[currentPageIndex];
      if (!page) return prev;

      if (page.stickers?.length) page.stickers.pop();
      else if (page.photos?.length) page.photos.pop();
      else if (page.texts?.length) page.texts.pop();

      saveAlbums({ ...loadAlbums(), [next.id]: next });
      setIsSaved(false);
      return next;
    });
  };

  function addSticker(src: string) {
    if (!album) return;
    const id = "st-" + Date.now();
    const sticker = { id, src, x: 50, y: 50, width: 140, height: 140 };

    const next = {
      ...album,
      pages: album.pages.map((p, i) =>
        i === currentPageIndex
          ? { ...p, stickers: [...(p.stickers || []), sticker] }
          : p
      ),
    };
    setAlbum(next);
    const saved = loadAlbums();
    saved[next.id] = next;
    saveAlbums(saved);
    setIsSaved(false);
  }

  useEffect(() => {
    const savedAlbums = JSON.parse(localStorage.getItem("photoAlbums") || "{}");

    if (savedAlbums[albumId]) {
      const a = savedAlbums[albumId];

      // ページ補完
      if (!Array.isArray(a.pages) || a.pages.length === 0) {
        a.pages = [{ id: "page-1", photos: [], stickers: [], texts: [] }];
      } else {
        // 各ページに texts を補完
        a.pages = a.pages.map((p: any) => ({
          ...p,
          texts: Array.isArray(p.texts) ? p.texts : [],
        }));
      }

      savedAlbums[albumId] = a;
      localStorage.setItem("photoAlbums", JSON.stringify(savedAlbums));

      setAlbum(a);
      setEditedName(a.name);
    } else {
      const mockAlbum: Album = {
        id: albumId,
        name:
          albumId === "1"
            ? "Family Vacation"
            : albumId === "2"
            ? "Birthday Party"
            : `Quick Photo ${new Date().toLocaleDateString()}`,
        // ← texts: [] を入れておく
        pages: [{ id: "page-1", photos: [], stickers: [], texts: [] }],
        createdAt: new Date(),
      };
      setAlbum(mockAlbum);
      setEditedName(mockAlbum.name);
      if (isQuickPhoto) setShowPhotoCapture(true);
    }
  }, [albumId, isQuickPhoto]);

  // 現在の useState 群のすぐ下に追加
  const canPrev = currentPageIndex > 0;
  const canNext = album?.pages && currentPageIndex < album.pages.length - 1;

  const goPrev = () => setCurrentPageIndex((i) => (i > 0 ? i - 1 : 0));

  const goNext = () => {
    if (!album) return;
    const lastIndex = (album.pages?.length ?? 1) - 1;

    if (currentPageIndex < lastIndex) {
      setCurrentPageIndex((i) => i + 1);
      return;
    }

    // 最後のページなら新規ページを作成して進む
    const newPage: AlbumPage = {
      id: `page-${Date.now()}`,
      photos: [],
      stickers: [],
      texts: [],
    };
    const next = { ...album, pages: [...album.pages, newPage] };
    setAlbum(next);
    setCurrentPageIndex(lastIndex + 1);

    const saved = JSON.parse(localStorage.getItem("photoAlbums") || "{}");
    saved[album.id] = next;
    localStorage.setItem("photoAlbums", JSON.stringify(saved));
  };

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !album) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const photo = {
        id: "ph-" + Date.now(),
        src,
        x: 50,
        y: 50, // 位置（%ベースのままでOK）
        width: 220,
        height: 220,
      };

      const next = {
        ...album,
        pages: album.pages.map((p, i) =>
          i === currentPageIndex ? { ...p, photos: [...p.photos, photo] } : p
        ),
      };
      setAlbum(next);
      const saved = loadAlbums();
      saved[next.id] = next;
      saveAlbums(saved);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = ""; // 同じファイルを連続選択しても発火するようにリセット
  };

  // ← キーボードでも動かしたい場合（任意）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) goPrev();
      if (e.key === "ArrowRight" && canNext) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPrev, canNext]);

  const saveAlbum = (isAutoSave = false) => {
    if (!album) return;

    if (isAutoSave) {
      setIsAutoSaving(true);
    }

    const savedAlbums = JSON.parse(localStorage.getItem("photoAlbums") || "{}");
    savedAlbums[albumId] = album;
    localStorage.setItem("photoAlbums", JSON.stringify(savedAlbums));

    setIsSaved(true);

    if (isAutoSave) {
      setTimeout(() => setIsAutoSaving(false), 1000);
    }
  };

  const markUnsaved = () => {
    setIsSaved(false);
  };

  const addNewPage = () => {
    if (!album) return;

    const newPage: AlbumPage = {
      id: `page-${Date.now()}`,
      photos: [],
      stickers: [],
      texts: [],
    };

    setAlbum({
      ...album,
      pages: [...album.pages, newPage],
    });
    setCurrentPageIndex(album.pages.length);
    markUnsaved();
  };

  const deletePage = (pageIndex: number) => {
    if (!album || album.pages.length <= 1) return;

    const newPages = album.pages.filter((_, index) => index !== pageIndex);
    setAlbum({
      ...album,
      pages: newPages,
    });

    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
    markUnsaved();
  };

  const updateAlbumName = () => {
    if (!album || !editedName.trim()) return;

    setAlbum({
      ...album,
      name: editedName.trim(),
    });
    setIsEditingName(false);
    markUnsaved();
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
    setShowPageManager(false);
  };

  const addPhotoToPage = (photoSrc: string) => {
    if (!album) return;

    const newPhoto = {
      id: `photo-${Date.now()}`,
      src: photoSrc,
      caption: "",
      x: 50,
      y: 50,
      width: 150,
      height: 150,
    };

    const updatedPages = [...album.pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      photos: [...updatedPages[currentPageIndex].photos, newPhoto],
    };

    setAlbum({
      ...album,
      pages: updatedPages,
    });
    markUnsaved();
  };

  const updateElement = (
    id: string,
    kind: "photo" | "text" | "sticker",
    updates: any
  ) => {
    if (!album) return;
    const key =
      kind === "photo" ? "photos" : kind === "text" ? "texts" : "stickers";
    const next = {
      ...album,
      pages: album.pages.map((p, i) =>
        i === currentPageIndex
          ? {
              ...p,
              [key]: (p as any)[key].map((el: any) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            }
          : p
      ),
    };
    setAlbum(next);
    const saved = loadAlbums();
    saved[next.id] = next;
    saveAlbums(saved);
    setIsSaved(false);
  };

  const deleteElement = (id: string, kind: "photo" | "text" | "sticker") => {
    if (!album) return;
    const key =
      kind === "photo" ? "photos" : kind === "text" ? "texts" : "stickers";
    const next = {
      ...album,
      pages: album.pages.map((p, i) =>
        i === currentPageIndex
          ? { ...p, [key]: (p as any)[key].filter((el: any) => el.id !== id) }
          : p
      ),
    };
    setAlbum(next);
    const saved = loadAlbums();
    saved[next.id] = next;
    saveAlbums(saved);
    setIsSaved(false);
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading album...</p>
        </div>
      </div>
    );
  }

  const currentPage = album.pages[currentPageIndex];

  type TextElement = {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
  };

  // 既存アルバム読み込みが終わったあと、各ページに texts を補完（どこかの useEffect 内で）
  /*
album.pages.forEach(p => { if (!Array.isArray(p.texts)) p.texts = []; });
*/

  // 既存の onUpdateElement/onDeleteElement はそのまま利用

  const addText = (value: string) => {
    if (!album) return;
    const idx = currentPageIndex;
    const t: TextElement = {
      id: "text-" + Date.now(),
      text: value,
      x: 50,
      y: 50,
      width: 160,
      height: 60,
      fontSize: 20,
      color: "#222",
    };
    const next = { ...album };
    next.pages[idx].texts = [...(next.pages[idx].texts || []), t];
    setAlbum(next);
    const saved = JSON.parse(localStorage.getItem("photoAlbums") || "{}");
    saved[album.id] = next;
    localStorage.setItem("photoAlbums", JSON.stringify(saved));
    setIsSaved(false);
  };

  const deleteText = (textId: string) => {
    if (!album) return;
    const next = { ...album };
    const page = next.pages[currentPageIndex];
    page.texts = (page.texts || []).filter((t) => t.id !== textId);
    setAlbum(next);

    const saved = JSON.parse(localStorage.getItem("photoAlbums") || "{}");
    saved[album.id] = next;
    localStorage.setItem("photoAlbums", JSON.stringify(saved));
    setIsSaved(false); // 変更ありマーク
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* 左端：戻る */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="p-2 rounded hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* 中央：ツールバー */}
          <div className="flex items-center gap-5">
            <button
              title="テキスト"
              onClick={startText}
              className="p-2 rounded hover:bg-muted"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              title="手書き"
              onClick={startDraw}
              className="p-2 rounded hover:bg-muted"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              title="写真追加"
              onClick={openPhoto}
              className="p-2 rounded hover:bg-muted"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              title="スタンプ"
              onClick={openSticker}
              className="p-2 rounded hover:bg-muted"
            >
              <BadgePlus className="w-5 h-5" />
            </button>
            <button
              title="ひとつ戻す"
              onClick={undoLast}
              className="p-2 rounded hover:bg-muted"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* 右端：セーブ（少し離して配置） */}
          <div className="ml-auto">
          <button
              type="button"
              aria-label="Save"
              onClick={handleSave}
              className="p-2 -mr-1 rounded-md text-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
              <Save className="w-6 h-6" />
          </button>
          </div>
          </div>

      </header>

      {/* Enhanced Page Manager Overlay */}
      {showPageManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-card w-full max-h-[70vh] rounded-t-xl p-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Manage Pages
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPageManager(false)}
                >
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

              <Button
                onClick={addNewPage}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
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
          {/* タイトル編集バー */}
          <div className="px-4 pt-4 pb-2">
            <input
              value={album.title ?? ""}
              onChange={(e) => {
                const title = e.target.value;
                setAlbum((prev) => {
                  if (!prev) return prev;
                  const next = { ...prev, title };
                  // 永続化（localStorage）
                  const storeKey = "photoAlbums"; // 既存のキー名に合わせる
                  const saved = JSON.parse(
                    localStorage.getItem(storeKey) || "{}"
                  );
                  saved[next.id] = next;
                  localStorage.setItem(storeKey, JSON.stringify(saved));
                  // もし setIsSaved があるなら、未保存扱いに
                  // setIsSaved(false);
                  return next;
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="アルバム名を入力"
              className="mx-auto block w-full max-w-xs text-center text-lg font-medium bg-transparent outline-none
               border-b border-transparent focus:border-b-zinc-300 transition"
            />
          </div>

          {/* Album Page Canvas */}

          {/* Action Buttons */}
          <section className="px-3 py-2">
            {/* キャンバスだけを中央配置（左右矢印も縦ツールも無し） */}
            <div className="flex items-center justify-center min-h-[420px]">
              <div className="relative">
                <SwipeableCanvas
                  pages={album.pages}
                  currentPageIndex={currentPageIndex}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                  drawingMode={drawingMode}
                  onFinishDrawing={(dataUrl, w, h) => {
                    const photo = {
                      id: "draw-" + Date.now(),
                      src: dataUrl,
                      x: 50,
                      y: 50,
                      width: w,
                      height: h,
                    };
                    const next = {
                      ...album,
                      pages: album.pages.map((p, i) =>
                        i === currentPageIndex
                          ? { ...p, photos: [...p.photos, photo] }
                          : p
                      ),
                    };
                    setAlbum(next);
                    const saved = JSON.parse(
                      localStorage.getItem("photoAlbums") || "{}"
                    );
                    saved[album.id] = next;
                    localStorage.setItem("photoAlbums", JSON.stringify(saved));
                    setDrawingMode(false);
                  }}
                  onClearDrawing={() => {}}
                />
              </div>
            </div>
          </section>
          {/* ---- Footer pager ---- */}
          <footer className="sticky bottom-0 z-30 bg-white/90 backdrop-blur border-t">
            <div className="h-12 px-4 flex items-center justify-center gap-6">
              <button
                onClick={goPrev}
                disabled={!canPrev}
                aria-label="Previous page"
                className={`p-2 rounded hover:bg-zinc-100 ${
                  !canPrev ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <span className="min-w-[72px] text-center tabular-nums text-sm">
                {currentPageIndex + 1} / {album.pages.length}
              </span>

              <button
                onClick={goNext}
                aria-label="Next page"
                className="p-2 rounded hover:bg-zinc-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </footer>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickPhoto}
      />

      <StickerLibrary
        open={stickerPickerOpen}
        onStickerSelected={(sticker) => {
          // sticker は Emoji や画像の src 文字列を想定
          addSticker(sticker as string);
          setStickerPickerOpen(false);
        }}
        onClose={() => setStickerPickerOpen(false)}
      />
    </div>
  );
}
