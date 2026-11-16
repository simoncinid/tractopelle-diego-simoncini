"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";


export type BeatLevels = {
  energy: number;
  bass: number;
  mid: number;
  treble: number;
};

export const SILENT_BEAT: BeatLevels = {
  energy: 0,
  bass: 0,
  mid: 0,
  treble: 0,
};

type Props = {
  sectionRef: RefObject<HTMLElement | null>;
  levelsRef: RefObject<BeatLevels | null> | RefObject<BeatLevels>;
  active: boolean;
};

/** Yellow sonic field rising from the bottom, driven by live audio levels. */
export default function BookingBeatfield({
  sectionRef,
  levelsRef,
  active,
}: Props) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const smoothRef = useRef({ ...SILENT_BEAT });
  const phaseRef = useRef(0);
  const rafRef = useRef(0);

  activeRef.current = active;

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const { width, height } = parent.getBoundingClientRect();
      const target =
        activeRef.current && levelsRef.current
          ? levelsRef.current
          : SILENT_BEAT;
      const s = smoothRef.current;
      const ease = activeRef.current ? 0.2 : 0.08;
      s.energy += (target.energy - s.energy) * ease;
      s.bass += (target.bass - s.bass) * ease;
      s.mid += (target.mid - s.mid) * ease;
      s.treble += (target.treble - s.treble) * ease;

      shell.style.setProperty("--beat-energy", String(s.energy));
      shell.style.setProperty("--beat-bass", String(s.bass));
      const section = sectionRef.current;
      if (section) {
        section.style.setProperty("--beat-energy", String(s.energy));
        section.style.setProperty("--beat-bass", String(s.bass));
      }

      const speed = 0.0014 + s.bass * 0.0045 + s.energy * 0.002;
      phaseRef.current += speed * 16;
      const t = phaseRef.current;

      ctx.clearRect(0, 0, width, height);

      if (s.energy < 0.01 && !activeRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const bloom = ctx.createLinearGradient(0, height * 0.42, 0, height);
      bloom.addColorStop(0, "rgba(204,255,0,0)");
      bloom.addColorStop(0.5, `rgba(204,255,0,${0.025 + s.energy * 0.07})`);
      bloom.addColorStop(
        1,
        `rgba(204,255,0,${0.07 + s.bass * 0.14 + s.energy * 0.08})`,
      );
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      const pulse = ctx.createRadialGradient(
        width * 0.5,
        height * (1.08 - s.bass * 0.14),
        12,
        width * 0.5,
        height,
        width * (0.52 + s.energy * 0.26),
      );
      pulse.addColorStop(0, `rgba(213,255,47,${0.09 + s.bass * 0.2})`);
      pulse.addColorStop(0.45, `rgba(204,255,0,${0.045 + s.mid * 0.1})`);
      pulse.addColorStop(1, "rgba(204,255,0,0)");
      ctx.fillStyle = pulse;
      ctx.fillRect(0, 0, width, height);

      const layers = [
        {
          amp: 14 + s.bass * 52,
          freq: 1.1,
          y: 0.84 - s.bass * 0.07,
          alpha: 0.11 + s.bass * 0.16,
          thickness: 1.8,
        },
        {
          amp: 11 + s.mid * 34,
          freq: 1.9,
          y: 0.88 - s.energy * 0.06,
          alpha: 0.08 + s.mid * 0.13,
          thickness: 1.35,
        },
        {
          amp: 8 + s.treble * 26,
          freq: 2.85,
          y: 0.92 - s.treble * 0.045,
          alpha: 0.07 + s.treble * 0.1,
          thickness: 1.1,
        },
        {
          amp: 16 + s.energy * 40,
          freq: 0.72,
          y: 0.94 - s.energy * 0.08,
          alpha: 0.07 + s.energy * 0.11,
          thickness: 2,
        },
      ];

      for (const layer of layers) {
        const baseY = height * layer.y;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 3) {
          const nx = x / width;
          const wave =
            Math.sin(nx * Math.PI * 2 * layer.freq + t) * layer.amp +
            Math.sin(nx * Math.PI * 4.1 * layer.freq - t * 1.4) *
              (layer.amp * 0.38) +
            Math.sin(now * 0.0022 + nx * 7 + t * 0.45) * (7 + s.treble * 16);
          const y = baseY - wave - s.bass * 14;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const fill = ctx.createLinearGradient(0, baseY - layer.amp * 2.2, 0, height);
        fill.addColorStop(0, `rgba(204,255,0,${layer.alpha * 0.1})`);
        fill.addColorStop(0.55, `rgba(204,255,0,${layer.alpha * 0.42})`);
        fill.addColorStop(1, `rgba(204,255,0,${Math.min(0.45, layer.alpha)})`);
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const nx = x / width;
          const wave =
            Math.sin(nx * Math.PI * 2 * layer.freq + t) * layer.amp +
            Math.sin(nx * Math.PI * 4.1 * layer.freq - t * 1.4) *
              (layer.amp * 0.38);
          const y = baseY - wave - s.bass * 14;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(235,255,140,${0.14 + layer.alpha * 0.42})`;
        ctx.lineWidth = layer.thickness;
        ctx.stroke();
      }

      if (s.bass > 0.5) {
        const streaks = Math.floor(2 + s.bass * 5);
        for (let i = 0; i < streaks; i++) {
          const x = ((i * 149 + t * 55) % width + width) % width;
          const h = (34 + s.bass * 85) * (0.45 + ((i * 19) % 10) / 10);
          const g = ctx.createLinearGradient(x, height - h, x, height);
          g.addColorStop(0, "rgba(204,255,0,0)");
          g.addColorStop(1, `rgba(204,255,0,${0.055 + s.bass * 0.1})`);
          ctx.fillStyle = g;
          ctx.fillRect(x - 1.5, height - h, 3, h);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [levelsRef, reduced, sectionRef]);


  return (
    <div
      ref={shellRef}
      className={`booking-beatfield${active ? " is-live" : ""}`}
      aria-hidden="true"
      style={
        {
          "--beat-energy": 0,
          "--beat-bass": 0,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} />
      <div className="booking-beat-glow" />
      <div className="booking-beat-veil" />
    </div>
  );
}
