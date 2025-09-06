// components/swipeable-canvas.tsx
"use client";
import { useEffect, useRef } from "react";
import DraggableElement from "./draggable-element";

export default function SwipeableCanvas({
  pages,
  currentPageIndex,
  onUpdateElement,
  onDeleteElement,
  drawingMode = false,
  onFinishDrawing, // dataUrl を返す
  onClearDrawing,
}: {
  pages: any[];
  currentPageIndex: number;
  onUpdateElement: (
    id: string,
    kind: "photo" | "text" | "sticker",
    u: any
  ) => void;
  onDeleteElement: (id: string, kind: "photo" | "text" | "sticker") => void;
  drawingMode?: boolean;
  onFinishDrawing?: (dataUrl: string, width: number, height: number) => void;
  onClearDrawing?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- キャンバスをコンテナのサイズにピクセル等倍で合わせる（DPR 対応）
  const resizeCanvas = () => {
    const el = containerRef.current,
      cv = canvasRef.current;
    if (!el || !cv) return;
    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    cv.width = Math.max(1, Math.floor(el.clientWidth * dpr));
    cv.height = Math.max(1, Math.floor(el.clientHeight * dpr));
    const ctx = cv.getContext("2d")!;
    // 論理座標を CSS ピクセルに合わせる
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ページ切替・描画開始時にサイズを合わせる
  useEffect(() => {
    resizeCanvas();
  }, [currentPageIndex, drawingMode]);
  useEffect(() => {
    resizeCanvas();
    const onWinResize = () => resizeCanvas();
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [currentPageIndex, drawingMode]);

  const page = pages[currentPageIndex];

  // --- 手書き（overlay canvas）
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";

    // pointer capture で up/cancel を確実に受け取る
    try {
      (cv as any).setPointerCapture?.(e.pointerId);
    } catch {}

    let drawing = true;
    const rect = cv.getBoundingClientRect();
    let prevX = e.clientX - rect.left;
    let prevY = e.clientY - rect.top;

    const move = (ev: PointerEvent) => {
      if (!drawing) return;
      const r = cv.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      prevX = x;
      prevY = y;
    };

    const end = () => {
      drawing = false;
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", end);
      cv.removeEventListener("pointercancel", end);
      try {
        (cv as any).releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
  };

  const clearOverlay = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height); // 透明に戻す（白で塗らない）
  };

  return (
    <div
      ref={containerRef}
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
      className="relative overflow-hidden w-[300px] h-[360px] bg-[url('/img/home/create_kraft.png')] bg-cover rounded-xl shadow-inner"
    >
      {(page.photos ?? []).map((p: any) => (
        <DraggableElement
          key={p.id}
          type="photo"
          id={p.id}
          src={p.src}
          caption={p.caption}
          x={p.x}
          y={p.y}
          width={p.width}
          height={p.height}
          onUpdate={(id, u) => onUpdateElement(id, "photo", u)}
          onDelete={(id) => onDeleteElement(id, "photo")}
          containerRef={containerRef}
        />
      ))}

      {(page.stickers ?? []).map((st: any) => (
        <DraggableElement
          key={st.id}
          id={st.id}
          type="sticker"
          x={st.x}
          y={st.y}
          width={st.width}
          height={st.height}
          src={st.src}
          onUpdate={(id, u) => onUpdateElement(id, "sticker", u)}
          onDelete={(id) => onDeleteElement(id, "sticker")}
          containerRef={containerRef}
        />
      ))}

      {(page.texts ?? []).map((t: any) => (
        <DraggableElement
          key={t.id}
          type="text"
          id={t.id}
          content={t.text}
          fontSize={t.fontSize}
          color={t.color}
          x={t.x}
          y={t.y}
          width={t.width}
          height={t.height}
          onUpdate={(id, u) => onUpdateElement(id, "text", u)}
          onDelete={(id) => onDeleteElement(id, "text")}
          containerRef={containerRef}
        />
      ))}

      {/* overlay は drawingMode の時だけ表示＆操作可能 */}
      <div
        className="absolute inset-0 z-20"
        style={{
          pointerEvents: drawingMode ? "auto" : "none",
          opacity: drawingMode ? 1 : 0,
          transition: "opacity .15s",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ backgroundColor: "transparent" }}
          onPointerDown={onPointerDown}
        />
        {drawingMode && (
          <div className="absolute right-2 bottom-2 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-white border"
              onClick={() => {
                clearOverlay();
                onClearDrawing?.(); // 親側で drawingMode=false など
              }}
            >
              Clear
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white"
              onClick={() => {
                const url = canvasRef.current?.toDataURL("image/png");
                if (url && canvasRef.current) {
                  // ← キャンバスの見た目サイズ（CSS px）をそのまま渡す
                  const cw = canvasRef.current.clientWidth;
                  const ch = canvasRef.current.clientHeight;
                  onFinishDrawing?.(url, cw, ch);
                }
                clearOverlay(); // overlay は毎回透明に戻す
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
