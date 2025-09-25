// components/draggable-element.tsx
"use client";
import React, { useRef, useState } from "react";

const isImageLike = (s?: string) =>
  !!s && (s.startsWith("data:") || s.startsWith("/") || s.startsWith("http"));

type BaseProps = {
  id: string;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
  width: number; // px
  height: number; // px
  containerRef: React.RefObject<HTMLDivElement>;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
};

type PhotoProps = BaseProps & { type: "photo"; src: string; caption?: string };
type TextProps = BaseProps & {
  type: "text";
  content: string;
  fontSize: number;
  color: string;
};
type StickerProps = BaseProps & { type: "sticker"; src: string };
type Props = PhotoProps | TextProps | StickerProps;

export default function DraggableElement(props: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // ← ここが “1-B で足す state”
  const [mode, setMode] = useState<"idle" | "drag" | "resize">("idle");
  const [corner, setCorner] = useState<"se" | "sw" | "ne" | "nw" | null>(null);
  const startRef = useRef({
    x: 0,
    y: 0, // pointer start
    w: 0,
    h: 0, // size start
    pxX: 0,
    pxY: 0, // center (px) start
    boxW: 0,
    boxH: 0, // container size
  });
  const showUI = mode !== "idle";

  // --- Drag start (本体をつまんで移動) ---
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === "resize") return; // リサイズ中はドラッグ開始しない
    e.preventDefault();

    const box = props.containerRef.current?.getBoundingClientRect();
    if (!box) return;

    const boxW = box.width,
      boxH = box.height;

    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: props.width,
      h: props.height,
      pxX: (props.x / 100) * boxW,
      pxY: (props.y / 100) * boxH,
      boxW,
      boxH,
    };

    setMode("drag");
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const move = (ev: PointerEvent) => {
      const { pxX, pxY, boxW, boxH } = startRef.current;
      let nx = pxX + (ev.clientX - startRef.current.x);
      let ny = pxY + (ev.clientY - startRef.current.y);

      // はみ出さないように中心基準でクリップ
      const halfW = props.width / 2;
      const halfH = props.height / 2;
      nx = Math.max(halfW, Math.min(boxW - halfW, nx));
      ny = Math.max(halfH, Math.min(boxH - halfH, ny));

      props.onUpdate(props.id, { x: (nx / boxW) * 100, y: (ny / boxH) * 100 });
    };

    const up = () => {
      setMode("idle");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // --- Resize start (四隅のハンドルでサイズ変更) ---
  const onResizeStart = (
    e: React.PointerEvent,
    c: "se" | "sw" | "ne" | "nw"
  ) => {
    e.stopPropagation(); // 親のドラッグ開始を止める
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setMode("resize");
    setCorner(c);
    startRef.current = {
      ...startRef.current,
      x: e.clientX,
      y: e.clientY,
      w: props.width,
      h: props.height,
    };
  };

  // リサイズ進行中の追従
  const onWrapperPointerMove = (e: React.PointerEvent) => {
    if (mode !== "resize" || !corner) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    let w = startRef.current.w + (corner.includes("e") ? dx : -dx);
    let h = startRef.current.h + (corner.includes("s") ? dy : -dy);
    w = Math.max(24, w);
    h = Math.max(24, h);

    props.onUpdate(props.id, { width: w, height: h });
  };

  const onWrapperPointerUp = (e: React.PointerEvent) => {
    if (mode === "resize") {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      setMode("idle");
      setCorner(null);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="absolute group"
      style={{
        left: `${props.x}%`,
        top: `${props.y}%`,
        transform: "translate(-50%,-50%)",
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
      onPointerDown={onDragStart}
      onPointerMove={onWrapperPointerMove}
      onPointerUp={onWrapperPointerUp}
    >
      {/* 中身の描画：写真は背景なし、スタンプは絵文字もOK */}
      {props.type === "sticker" ? (
        isImageLike((props as any).src) ? (
          <img
            src={(props as any).src}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center pointer-events-none select-none"
            style={{
              fontSize: `${Math.min(props.width, props.height)}px`,
              lineHeight: 1,
            }}
          >
            {(props as any).src}
          </div>
        )
      ) : props.type === "photo" ? (
        <img
          src={(props as any).src}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-center bg-transparent cursor-move"
          style={{
            fontSize: (props as any).fontSize,
            color: (props as any).color,
            lineHeight: 1.2,
            whiteSpace: "pre-wrap",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            const current = (props as any).content ?? "";
            const next = prompt("テキストを編集", current);
            if (next !== null) props.onUpdate(props.id, { content: next });
          }}
        >
          {(props as any).content}
        </div>
      )}

      {/* リサイズ用ハンドル（四隅） */}
      <span
        onPointerDown={(e) => onResizeStart(e, "se")}
        className={`absolute -right-2 -bottom-2 w-3 h-3 bg-white border rounded-sm shadow-sm cursor-se-resize
              transition-opacity ${
                showUI ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
      />
      <span
        onPointerDown={(e) => onResizeStart(e, "sw")}
        className={`absolute -left-2 -bottom-2 w-3 h-3 bg-white border rounded-sm shadow-sm cursor-sw-resize
              transition-opacity ${
                showUI ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
      />
      <span
        onPointerDown={(e) => onResizeStart(e, "ne")}
        className={`absolute -right-2 -top-2 w-3 h-3 bg-white border rounded-sm shadow-sm cursor-ne-resize
              transition-opacity ${
                showUI ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
      />
      <span
        onPointerDown={(e) => onResizeStart(e, "nw")}
        className={`absolute -left-2 -top-2 w-3 h-3 bg-white border rounded-sm shadow-sm cursor-nw-resize
              transition-opacity ${
                showUI ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
      />

      {/* 削除ボタン */}
      <button
        className={`absolute -right-2 -top-2 w-5 h-5 rounded-full bg-white border text-red-600 leading-none
              transition-opacity ${
                showUI ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          props.onDelete(props.id);
        }}
        title="削除"
      >
        ×
      </button>
    </div>
  );
}
