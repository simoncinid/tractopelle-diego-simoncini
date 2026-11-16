"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

type Props = { src: string; className?: string; priority?: boolean };
/** Decorative generated art. Pointer movement changes perspective, never content. */
export default function ArtScene({
  src,
  className = "",
  priority = false,
}: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 130, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 130, damping: 22 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [9, -9]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const bounds = surface.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }
  return (
    <div
      ref={surface}
      className={`art-scene ${className}`}
      aria-hidden="true"
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className="art-scene-halo" />
      <motion.div
        className="art-scene-object"
        style={
          reduced
            ? undefined
            : { rotateX, rotateY, x: translateX, y: translateY }
        }
      >
        <img
          src={src}
          alt=""
          width="1000"
          height="1000"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
        />
      </motion.div>
      <span className="art-scene-cross cross-top" />
      <span className="art-scene-cross cross-bottom" />
    </div>
  );
}
