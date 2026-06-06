"use client";

import createGlobe from "cobe";
import { Pause, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGlobeStyle } from "@/lib/globe-theme";
import {
  locationToAngles,
  type GlobeVisitor,
} from "@/lib/visitor-globe-data";
import { VisitorMapName } from "@/components/dashboard/VisitorMapName";
import {
  visitorStatusColor,
  type VisitorStatusColor,
} from "@/lib/visitor-identity";

const ZOOM_FOCUS = 1.65;
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.2;
const THETA_MIN = -1.2;
const THETA_MAX = 1.2;
const DRAG_SENSITIVITY = 0.005;
const AUTO_ROTATE_SPEED = 0.002;
const FOCUS_LERP = 0.1;

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Cobe uses marker ids in CSS custom properties — colons break visibility. */
function globeMarkerId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function angleDelta(current: number, target: number) {
  let delta = target - current;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

function lerpAngle(current: number, target: number, amount: number) {
  return current + angleDelta(current, target) * amount;
}

function isCobeMarkerVisible(id: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--cobe-visible-${globeMarkerId(id)}`)
    .trim();
  return value === "N" || value === "1";
}

const STATUS_RING: Record<VisitorStatusColor, string> = {
  blue: "ring-blue-500",
  red: "ring-red-500",
  emerald: "ring-emerald-400",
  white: "ring-white",
};

function VisitorMarker({
  visitor,
  selected,
  immersive,
  onSelect,
  registerRef,
}: {
  visitor: GlobeVisitor;
  selected: boolean;
  immersive?: boolean;
  onSelect: () => void;
  registerRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const status = visitorStatusColor(visitor.id);
  const size = selected
    ? immersive
      ? "size-12 sm:size-14"
      : "size-10 sm:size-11"
    : immersive
      ? "size-10 sm:size-11"
      : "size-8 sm:size-9";

  return (
    <button
      ref={(el) => registerRef(globeMarkerId(visitor.id), el)}
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "pointer-events-auto absolute rounded-full opacity-0 transition-[width,height,opacity]",
        size,
        selected && "z-30"
      )}
      style={{
        left: 0,
        top: 0,
        transform: "translate(-50%, -50%)",
      }}
      aria-label={`${visitor.displayName}${visitor.isBot ? " Bot" : ""} on ${visitor.path}`}
    >
      <span
        className={cn(
          "relative block size-full rounded-full",
          selected &&
            `ring-2 ring-offset-2 ring-offset-zinc-100 dark:ring-offset-[#06080f] ${STATUS_RING[status]}`
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visitor.avatar}
          alt=""
          width={56}
          height={56}
          className="size-full rounded-full border-2 border-white bg-zinc-200 object-cover shadow-lg dark:border-zinc-900 dark:bg-zinc-800"
        />
        {visitor.isBot ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/icons/bot.png"
            alt=""
            width={14}
            height={14}
            className="absolute -bottom-0.5 -right-0.5 size-[34%] min-w-3 min-h-3 rounded-[2px] border border-white bg-white object-contain p-px shadow-sm dark:border-zinc-900 dark:bg-zinc-900"
            loading="lazy"
          />
        ) : null}
      </span>
    </button>
  );
}

function VisitorInfoPopup({
  visitor,
  style,
}: {
  visitor: GlobeVisitor;
  style: React.CSSProperties;
}) {
  const flagCode =
    visitor.countryCode.length === 2 ? visitor.countryCode : "xx";

  return (
    <div
      className="pointer-events-none absolute z-20 max-w-[160px] rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-left shadow-md dark:border-zinc-700 dark:bg-zinc-900"
      style={style}
    >
      <p className="truncate text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
        <VisitorMapName visitor={visitor} />
      </p>
      <p className="truncate font-mono text-[10px] text-zinc-500">
        {visitor.path}
      </p>
      <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w20/${flagCode}.png`}
          alt=""
          width={14}
          height={10}
          className="h-2.5 w-3.5 shrink-0 rounded-[1px] object-cover"
        />
        <span className="truncate">{visitor.country}</span>
      </div>
      <p className="mt-0.5 truncate text-[9px] text-zinc-400">
        {visitor.browserLabel} · {visitor.deviceLabel} · {visitor.source}
      </p>
    </div>
  );
}

export function VisitorGlobe({
  visitors,
  variant = "default",
  selectedVisitorId: selectedVisitorIdProp,
  onSelectedVisitorChange,
  isRotating: isRotatingProp,
  onRotatingChange,
  hidePlaybackControl = false,
}: {
  visitors: GlobeVisitor[];
  variant?: "default" | "immersive";
  selectedVisitorId?: string | null;
  onSelectedVisitorChange?: (id: string | null) => void;
  isRotating?: boolean;
  onRotatingChange?: (rotating: boolean) => void;
  /** Ẩn nút play/pause trên globe (đặt ở overlay header) */
  hidePlaybackControl?: boolean;
}) {
  const immersive = variant === "immersive";
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const globeStyle = getGlobeStyle(immersive, isDark);
  const globeStyleRef = useRef(globeStyle);
  globeStyleRef.current = globeStyle;
  const outerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const zoomRef = useRef(1);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const focusTargetRef = useRef<{
    phi: number;
    theta: number;
    zoom: number;
  } | null>(null);

  const selectionControlled = onSelectedVisitorChange != null;
  const rotationControlled = onRotatingChange != null;

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  );
  const [internalRotating, setInternalRotating] = useState(true);

  const selectedId = selectionControlled
    ? (selectedVisitorIdProp ?? null)
    : internalSelectedId;
  const isRotating = rotationControlled
    ? (isRotatingProp ?? true)
    : internalRotating;

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  const visitorsRef = useRef(visitors);
  visitorsRef.current = visitors;

  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const setSelectedId = useCallback(
    (id: string | null) => {
      selectedIdRef.current = id;
      if (selectionControlled) onSelectedVisitorChange!(id);
      else setInternalSelectedId(id);
    },
    [selectionControlled, onSelectedVisitorChange]
  );

  const setRotating = useCallback(
    (rotating: boolean) => {
      isRotatingRef.current = rotating;
      if (rotationControlled) onRotatingChange!(rotating);
      else setInternalRotating(rotating);
    },
    [rotationControlled, onRotatingChange]
  );

  const [popupPos, setPopupPos] = useState<{
    left: number;
    top: number;
    visible: boolean;
  } | null>(null);

  const selected = visitors.find((v) => v.id === selectedId);

  const orderedVisitors = useMemo(() => {
    if (!selectedId) return visitors;
    return [
      ...visitors.filter((v) => v.id !== selectedId),
      ...visitors.filter((v) => v.id === selectedId),
    ];
  }, [selectedId, visitors]);

  const registerMarkerRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) markerRefs.current.set(id, el);
      else markerRefs.current.delete(id);
    },
    []
  );

  const resetView = useCallback(() => {
    setPopupPos(null);
    if (Math.abs(zoomRef.current - ZOOM_MIN) < 0.02) {
      focusTargetRef.current = null;
    } else {
      focusTargetRef.current = {
        phi: phiRef.current,
        theta: thetaRef.current,
        zoom: ZOOM_MIN,
      };
    }
  }, []);

  const clearFocus = useCallback(() => {
    setSelectedId(null);
    resetView();
  }, [setSelectedId, resetView]);

  const focusVisitor = useCallback(
    (visitor: GlobeVisitor) => {
      const angles = locationToAngles(visitor.location);
      focusTargetRef.current = {
        phi: angles.phi,
        theta: angles.theta,
        zoom: ZOOM_FOCUS,
      };
      setSelectedId(visitor.id);
      setRotating(false);
    },
    [setSelectedId, setRotating]
  );

  useEffect(() => {
    if (selectedId && !visitors.some((v) => v.id === selectedId)) {
      clearFocus();
    }
  }, [selectedId, visitors, clearFocus]);

  useEffect(() => {
    if (!selectionControlled || selectedVisitorIdProp == null) return;
    const visitor = visitors.find((v) => v.id === selectedVisitorIdProp);
    if (visitor) focusVisitor(visitor);
  }, [selectedVisitorIdProp, visitors, selectionControlled, focusVisitor]);

  useEffect(() => {
    if (selectionControlled && selectedVisitorIdProp === null) {
      resetView();
    }
  }, [selectedVisitorIdProp, selectionControlled, resetView]);

  const getBaseSize = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return 500;
    return Math.min(Math.max(outer.offsetWidth, 320), 560);
  }, []);

  const handleSelect = useCallback(
    (visitor: GlobeVisitor) => {
      focusVisitor(visitor);
    },
    [focusVisitor]
  );

  const updateMarkerPositions = useCallback(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const anchorRoot = canvas.parentElement;
    if (!anchorRoot) return;

    const stageRect = stage.getBoundingClientRect();

    for (const child of anchorRoot.children) {
      if (child === canvas) continue;

      const anchor = child as HTMLElement;
      const anchorMatch = anchor.style.cssText.match(
        /anchor-name:\s*(--cobe-[^;]+)/
      );
      const id = anchorMatch?.[1]?.replace("--cobe-", "") ?? "";
      if (!id) continue;

      const btn = markerRefs.current.get(id);
      if (!btn) continue;

      const anchorRect = anchor.getBoundingClientRect();
      const x = anchorRect.left - stageRect.left + anchorRect.width / 2;
      const y = anchorRect.top - stageRect.top + anchorRect.height / 2;
      const visible = isCobeMarkerVisible(id);

      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
      btn.style.opacity = visible ? "1" : "0";
      btn.style.pointerEvents = visible ? "auto" : "none";
      btn.style.zIndex =
        globeMarkerId(selectedIdRef.current ?? "") === id ? "30" : "10";
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPopupPos(null);
      return;
    }

    let frame = 0;

    const updatePopupPosition = () => {
      const outer = outerRef.current;
      const marker = markerRefs.current.get(globeMarkerId(selectedId));
      if (!outer || !marker) {
        frame = requestAnimationFrame(updatePopupPosition);
        return;
      }

      const opacity = Number.parseFloat(getComputedStyle(marker).opacity);
      if (opacity < 0.15) {
        setPopupPos((prev) =>
          prev?.visible === false ? prev : { left: 0, top: 0, visible: false }
        );
        frame = requestAnimationFrame(updatePopupPosition);
        return;
      }

      const markerRect = marker.getBoundingClientRect();
      const outerRect = outer.getBoundingClientRect();

      setPopupPos({
        left: markerRect.left - outerRect.left + markerRect.width / 2,
        top: markerRect.bottom - outerRect.top + 10,
        visible: true,
      });
      frame = requestAnimationFrame(updatePopupPosition);
    };

    updatePopupPosition();
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  useEffect(() => {
    const layer = interactionRef.current;
    if (!layer) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, zoomRef.current - e.deltaY * 0.001)
      );
      focusTargetRef.current = null;
    };

    layer.addEventListener("wheel", onWheel, { passive: false });
    return () => layer.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const globeWrap = globeWrapRef.current;
    const outer = outerRef.current;
    if (!canvas || !stage || !globeWrap || !outer) return;

    let baseSize = getBaseSize();
    let frame = 0;

    const applyStageLayout = (size: number, zoom: number) => {
      stage.style.width = `${size}px`;
      stage.style.height = `${size}px`;
      globeWrap.style.width = `${size}px`;
      globeWrap.style.height = `${size}px`;
      globeWrap.style.transform = `scale(${zoom})`;
      globeWrap.style.transformOrigin = "center center";
    };

    applyStageLayout(baseSize, zoomRef.current);

    const style = globeStyleRef.current;
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: baseSize * 2,
      height: baseSize * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: style.dark,
      diffuse: style.diffuse,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: style.mapBrightness,
      baseColor: style.baseColor,
      markerColor: style.markerColor,
      glowColor: style.glowColor,
      markers: visitorsRef.current.map((v) => ({
        location: v.location,
        size: 0.04,
        id: globeMarkerId(v.id),
      })),
    });

    const onResize = () => {
      baseSize = getBaseSize();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(outer);

    const tick = () => {
      const focus = focusTargetRef.current;
      if (focus) {
        phiRef.current = lerpAngle(phiRef.current, focus.phi, FOCUS_LERP);
        thetaRef.current += (focus.theta - thetaRef.current) * FOCUS_LERP;
        thetaRef.current = Math.min(
          THETA_MAX,
          Math.max(THETA_MIN, thetaRef.current)
        );
        zoomRef.current += (focus.zoom - zoomRef.current) * FOCUS_LERP;

        const focusDone =
          Math.abs(angleDelta(phiRef.current, focus.phi)) < 0.01 &&
          Math.abs(focus.theta - thetaRef.current) < 0.01 &&
          Math.abs(focus.zoom - zoomRef.current) < 0.02;

        if (focusDone && !selectedIdRef.current) {
          focusTargetRef.current = null;
        }
      } else if (isRotatingRef.current && !draggingRef.current) {
        phiRef.current += AUTO_ROTATE_SPEED;
      }

      applyStageLayout(baseSize, zoomRef.current);

      const s = globeStyleRef.current;
      globe.update({
        width: baseSize * 2,
        height: baseSize * 2,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: s.dark,
        diffuse: s.diffuse,
        mapBrightness: s.mapBrightness,
        baseColor: s.baseColor,
        markerColor: s.markerColor,
        glowColor: s.glowColor,
        markers: visitorsRef.current.map((v) => ({
          location: v.location,
          size: selectedIdRef.current === v.id ? 0.06 : 0.04,
          id: globeMarkerId(v.id),
        })),
      });

      updateMarkerPositions();
      frame = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      globe.destroy();
      markerRefs.current.clear();
    };
  }, [getBaseSize, updateMarkerPositions, immersive, resolvedTheme]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        immersive ? "bg-transparent" : "bg-[#f8f9fc] dark:bg-zinc-900"
      )}
      onClick={clearFocus}
      role="presentation"
    >
      <div ref={outerRef} className="relative h-full w-full min-h-[400px]">
        <div
          ref={interactionRef}
          className="absolute inset-0 flex cursor-grab items-center justify-center active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            draggingRef.current = true;
            lastPointerRef.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            draggingRef.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            draggingRef.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onLostPointerCapture={() => {
            draggingRef.current = false;
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            const deltaX = e.clientX - lastPointerRef.current.x;
            const deltaY = e.clientY - lastPointerRef.current.y;
            lastPointerRef.current = { x: e.clientX, y: e.clientY };
            phiRef.current += deltaX * DRAG_SENSITIVITY;
            thetaRef.current = Math.min(
              THETA_MAX,
              Math.max(THETA_MIN, thetaRef.current + deltaY * DRAG_SENSITIVITY)
            );
            focusTargetRef.current = null;
          }}
        >
          <div
            ref={stageRef}
            className={cn(
              "relative shrink-0",
              immersive ? "size-[min(720px,95vh)]" : "size-[min(560px,100%)]"
            )}
          >
            <div
              ref={globeWrapRef}
              className="relative size-full origin-center will-change-transform"
            >
              <canvas
                ref={canvasRef}
                className="block size-full"
                onMouseEnter={() => setRotating(false)}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10">
              {orderedVisitors.map((visitor) => (
                <VisitorMarker
                  key={visitor.id}
                  visitor={visitor}
                  immersive={immersive}
                  selected={selectedId === visitor.id}
                  onSelect={() => handleSelect(visitor)}
                  registerRef={registerMarkerRef}
                />
              ))}
            </div>
          </div>
        </div>

        {selected && popupPos?.visible && (
          <VisitorInfoPopup
            visitor={selected}
            style={{
              left: popupPos.left,
              top: popupPos.top,
              transform: "translateX(-50%)",
            }}
          />
        )}

        {!immersive && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isRotating) {
                  clearFocus();
                  setRotating(false);
                } else {
                  clearFocus();
                  setRotating(true);
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 z-30 flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              aria-label={isRotating ? "Pause rotation" : "Rotate globe"}
            >
              {isRotating ? (
                <Pause className="size-4" strokeWidth={2} />
              ) : (
                <Play className="size-4" strokeWidth={2} />
              )}
            </button>
            {selected && (
              <p className="pointer-events-none absolute bottom-4 left-0 right-14 z-10 text-center text-[10px] text-zinc-400">
                Click background to reset view
              </p>
            )}
          </>
        )}

        {immersive && !hidePlaybackControl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isRotating) {
                clearFocus();
                setRotating(false);
              } else {
                clearFocus();
                setRotating(true);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-5 right-5 z-30 flex size-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-600 backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            aria-label={isRotating ? "Pause rotation" : "Rotate globe"}
          >
            {isRotating ? (
              <Pause className="size-4" strokeWidth={2} />
            ) : (
              <Play className="size-4" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
