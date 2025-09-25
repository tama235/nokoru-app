// app/home/page.tsx — Next.js (app router) implementation for the album *home* screen
// Tech: TypeScript + Tailwind + shadcn/ui + lucide-react
// Matches your requirements: Header with hamburger menu, Highlight / Design templates / Create new shelves,
// and a floating + button for camera / gallery / new album.

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Menu as MenuIcon,
  Camera,
  ImageIcon,
  User,
  FolderOpen,
  HelpCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";

// ---- Types -----------------------------------------------------------------
export type Album = {
  id: string;
  name: string;
  coverImage?: string; // data URL or external URL
  pageCount: number;
  createdAt: Date;
};

export type Template = {
  id: string;
  title: string;
  cover: string;
};

// ---- Mock Data -------------------------------------------------------------
const mockHighlight: Album[] = [
  {
    id: "h1",
    name: "Family",
    coverImage: "/img/home/family.png",
    pageCount: 24,
    createdAt: new Date(),
  },
  {
    id: "h2",
    name: "Little",
    coverImage: "/img/home/little.png",
    pageCount: 18,
    createdAt: new Date(),
  },
  {
    id: "h3",
    name: "青",
    coverImage: "/img/home/midori.png",
    pageCount: 12,
    createdAt: new Date(),
  },
];

const mockTemplates: Template[] = [
  { id: "t1", title: "Triangle", cover: "/img/home/sannkaku.png" },
  { id: "t2", title: "Memory", cover: "/img/home/omoide.png" },
  { id: "t3", title: "Black", cover: "/img/home/black.png" },
];

const mockCreateNew: Template[] = [
  { id: "n1", title: "Blank - White", cover: "/img/home/create_white.png" },
  { id: "n2", title: "Blank - Kraft", cover: "/img/home/create_kraft.png" },
  { id: "n3", title: "Blank - Black", cover: "/img/home/create_black.png" },
];

// ---- Utilities -------------------------------------------------------------
const LS_KEY = "photoAlbums"; // あなたの既存コードと合わせています

function loadAlbumsFromLS(): Record<string, Album> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Album>;
    // revive dates
    for (const k of Object.keys(parsed)) {
      (parsed as any)[k].createdAt = new Date((parsed as any)[k].createdAt);
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveAlbumsToLS(albums: Record<string, Album>) {
  localStorage.setItem(LS_KEY, JSON.stringify(albums));
}

// ---- Small UI pieces -------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-6 pb-3">
      <h2 className="text-base font-bold text-zinc-800">{title}</h2>
    </div>
  );
}

function Shelf<T>({
  items,
  renderItem,
  testId,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  testId?: string;
}) {
  return (
    <div data-testid={testId} className="px-4 overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {items.map((it, idx) => (
          <div key={(it as any).id ?? idx}>{renderItem(it)}</div>
        ))}
      </div>
    </div>
  );
}

function AlbumCard({
  album,
  onClick,
  onDelete,
}: {
  album: Album;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card
      className="relative w-[140px] rounded-xl overflow-hidden shadow-sm"
      onClick={onClick}
    >
      {onDelete && (
        <button
          aria-label="削除"
          title="削除"
          className="absolute right-2 top-2 z-10 rounded-full border bg-white/90 hover:bg-white p-1"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      )}
      <CardContent className="p-0">
        <div className="relative w-full h-[160px] bg-zinc-200">
          {/* next/image keeps aspect ratio & lazy loads */}
          {album.coverImage && (
            <Image
              src={album.coverImage}
              alt={album.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="px-3 py-2">
          <p className="text-sm font-medium line-clamp-1">{album.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCard({ tpl, onUse }: { tpl: Template; onUse?: () => void }) {
  return (
    <Card
      className="w-[140px] rounded-xl overflow-hidden shadow-sm cursor-pointer"
      onClick={onUse}
    >
      <CardContent className="p-0">
        <div className="relative w-full h-[160px] bg-zinc-200">
          <img
            src={tpl.cover}
            alt={tpl.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-3 py-2">
          <p className="text-sm font-medium line-clamp-1">{tpl.title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Header({
  onSelectMenu,
}: {
  onSelectMenu: (k: "account" | "albums" | "faq") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="h-14 px-4 flex items-center justify-between relative">
        <Link href="/home" aria-label="ノコル" className="flex items-center">
          <Image
            src="/img/home/nokoru-logo.png" // ← 置いたパスに合わせて
            alt="ノコル"
            width={80}
            height={20}
            priority
          />
        </Link>

        <Button
          variant="ghost"
          size="icon"
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        {open && (
          <>
            {/* 背景クリックで閉じる */}
            <button
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border bg-white shadow-lg">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left"
                onClick={() => {
                  onSelectMenu("account");
                  setOpen(false);
                }}
              >
                <User className="h-4 w-4" /> アカウント
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left"
                onClick={() => {
                  onSelectMenu("albums");
                  setOpen(false);
                }}
              >
                <FolderOpen className="h-4 w-4" /> アルバム一覧
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left"
                onClick={() => {
                  onSelectMenu("faq");
                  setOpen(false);
                }}
              >
                <HelpCircle className="h-4 w-4" /> よくある質問
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function Fab({
  onCamera,
  onGallery,
  onNew,
}: {
  onCamera: () => void;
  onGallery: () => void;
  onNew: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-6 flex flex-col items-end gap-3 select-none">
      {open && (
        <>
          <Button
            variant="secondary"
            className="rounded-full w-11 h-11 p-0"
            onClick={onGallery}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            className="rounded-full w-11 h-11 p-0"
            onClick={onCamera}
          >
            <Camera className="w-5 h-5" />
          </Button>
        </>
      )}
      <Button
        className="rounded-full w-14 h-14 p-0 shadow-xl bg-orange-500 hover:bg-orange-500/90"
        onClick={() => (open ? (onNew(), setOpen(false)) : setOpen(true))}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}

// ---- Page ------------------------------------------------------------------
export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const saved = loadAlbumsFromLS();
    const list = Object.values(saved) as Album[];
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAlbums(list);
  }, []);

  const createNewAlbum = (name?: string, coverImage?: string) => {
    const saved = loadAlbumsFromLS();
    const id = Date.now().toString();
    const album: Album = {
      id,
      name: name?.trim() || "New Album",
      pageCount: 1,
      createdAt: new Date(),
      coverImage,
    };
    saved[id] = album;
    saveAlbumsToLS(saved);
    setAlbums((prev) => [album, ...prev]);
    router.push(`/album/${id}`); // ルーティング先は必要に応じて用意
  };

  // Menu selection
  const onSelectMenu = (key: "account" | "albums" | "faq") => {
    if (key === "account") router.push("/account");
    if (key === "albums") router.push("/home"); // このホームへ
    if (key === "faq") router.push("/faq");
  };

  // FAB actions
  const onCamera = () => {
    // Mobile Safari/Chrome: input capture を使う
    fileInputRef.current?.setAttribute("capture", "environment");
    fileInputRef.current?.click();
  };
  const onGallery = () => {
    fileInputRef.current?.removeAttribute("capture");
    fileInputRef.current?.click();
  };
  const onNew = () => createNewAlbum();

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      createNewAlbum("New Album", dataUrl);
      e.currentTarget.value = ""; // reset
    };
    reader.readAsDataURL(file);
  };

  const deleteAlbum = (id: string) => {
    if (!confirm("このアルバムを削除しますか？（元に戻せません）")) return;
    const saved = loadAlbumsFromLS();
    delete saved[id]; // 1) LS から消す
    saveAlbumsToLS(saved); // 2) 保存
    setAlbums((prev) => prev.filter((a) => a.id !== id)); // 3) 画面を更新
  };

  return (
    <main className="min-h-dvh bg-white">
      <Header onSelectMenu={onSelectMenu} />

      {/* Hidden file input for camera/gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickFile}
      />

      {/* Highlight */}
      <SectionHeader title="Highlight" />
      <Shelf
        items={albums}
        testId="highlight"
        renderItem={(alb) => (
          <AlbumCard
            album={alb as Album}
            onClick={() => router.push(`/album/${(alb as Album).id}`)}
            onDelete={() => deleteAlbum((alb as Album).id)} // ★ 追加
          />
        )}
      />

      {/* Design templates */}
      <SectionHeader title="Design templates" />
      <Shelf
        items={mockTemplates}
        testId="templates"
        renderItem={(tpl) => (
          <TemplateCard
            tpl={tpl as Template}
            onUse={() =>
              createNewAlbum((tpl as Template).title, (tpl as Template).cover)
            }
          />
        )}
      />

      {/* Create new */}
      <SectionHeader title="Create new" />
      <Shelf
        items={mockCreateNew}
        testId="createNew"
        renderItem={(tpl) => (
          <TemplateCard tpl={tpl as Template} onUse={() => createNewAlbum()} />
        )}
      />

      <Fab onCamera={onCamera} onGallery={onGallery} onNew={onNew} />
    </main>
  );
}
