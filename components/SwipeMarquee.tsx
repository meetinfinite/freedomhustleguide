"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";

/**
 * Auto-scrolling photo strip that people can also swipe or drag - flick it
 * to go faster, or drag back to see a photo again (Valeria, 2026-10-23).
 * The items render twice and the offset wraps at the width of one copy,
 * so it loops forever in both directions.
 */
export function SwipeMarquee({
  children,
  secondsPerItem
}: {
  children: ReactNode;
  /** Auto-scroll pace: how long each card takes to pass */
  secondsPerItem: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const count = items.length;

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const copy = copyRef.current;
    if (!viewport || !track || !copy || !count) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Width of one copy, including the gap before the second copy
    let loop = copy.offsetWidth;
    const resize = new ResizeObserver(() => {
      loop = copy.offsetWidth;
    });
    resize.observe(copy);

    let offset = 0;
    let momentum = 0; // px/ms left over from a flick, eases back to 0
    let dragging = false;
    let hovered = false;
    let pointerId = -1;
    let lastX = 0;
    let lastMove = 0;
    let velocity = 0;

    const render = () => {
      if (loop > 0) offset = ((offset % loop) + loop) % loop;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    let prev = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      // Cap the step so it doesn't jump after the tab was in the background
      const dt = Math.min(now - prev, 50);
      prev = now;
      if (!dragging && loop > 0) {
        const auto =
          reduceMotion || hovered ? 0 : loop / count / (secondsPerItem * 1000);
        offset += (auto + momentum) * dt;
        momentum *= Math.pow(0.95, dt / 16.7);
        if (Math.abs(momentum) < 0.001) momentum = 0;
        render();
      }
      frame = requestAnimationFrame(tick);
    });

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        if (e.button !== 0) return;
        e.preventDefault(); // no native image drag
      }
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastMove = e.timeStamp;
      velocity = 0;
      momentum = 0;
      viewport.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      const dt = e.timeStamp - lastMove;
      offset -= dx;
      if (dt > 0) velocity = 0.8 * (-dx / dt) + 0.2 * velocity;
      lastX = e.clientX;
      lastMove = e.timeStamp;
      render();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      // Held still before letting go = no flick
      const fresh = e.type === "pointerup" && e.timeStamp - lastMove < 100;
      momentum = fresh ? Math.max(-3, Math.min(3, velocity)) : 0;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = false;
    };
    // Sideways trackpad swipes on laptops
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      offset += e.deltaX;
      render();
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [count, secondsPerItem]);

  return (
    // touch-pan-y: vertical swipes still scroll the page, sideways ones
    // move the strip
    <div
      ref={viewportRef}
      className="relative overflow-hidden marquee-mask touch-pan-y select-none cursor-grab active:cursor-grabbing"
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div ref={copyRef} className="flex gap-4 pr-4">
          {items}
        </div>
        <div className="flex gap-4 pr-4" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}
