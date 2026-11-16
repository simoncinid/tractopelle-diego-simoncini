"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useEffect } from "react";


/** One delegated pointer listener and one observer for the whole page. */
export default function VisualEffects() {
  const reduced = useReducedMotion();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".section-heading, .path-card, .artist-card, .release-card, .collab-copy, .collab-visual, .collab-tags, .booking-visual, .booking-copy, .demo-panel > div, .community-head > div, .community-head > p, .community-grid > div, .community-bottom, .footer-top, .footer-columns > div",
      ),
    );
    let observer: IntersectionObserver | undefined;
    function clear() {
      observer?.disconnect();
      elements.forEach((element) => {
        element.classList.remove("reveal-ready", "is-revealed");
        delete element.dataset.reveal;
        element.style.removeProperty("--reveal-delay");
      });
    }
    function setup() {
      clear();
      if (preference.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
      );
      elements.forEach((element) => {
        const isCard = element.matches(
          ".path-card, .artist-card, .release-card, .community-grid > div, .footer-columns > div",
        );
        const siblings = element.parentElement
          ? Array.from(element.parentElement.children)
          : [];
        const columns = window.innerWidth < 541 ? 2 : 6;
        const delay = isCard ? (siblings.indexOf(element) % columns) * 85 : 0;
        element.style.setProperty("--reveal-delay", `${delay}ms`);
        element.dataset.reveal = element.matches(
          ".booking-visual, .collab-visual",
        )
          ? "sculpture"
          : element.matches(".section-heading")
            ? "heading"
            : "rise";
        element.classList.add("reveal-ready");
        observer?.observe(element);
      });
    }
    setup();
    preference.addEventListener("change", setup);
    return () => {
      clear();
      preference.removeEventListener("change", setup);
    };
  }, []);
  useEffect(() => {
    if (reduced) return;
    let active: HTMLElement | null = null;
    let frame = 0;
    function reset() {
      if (active) {
        delete active.dataset.pointer;
        active.style.setProperty("--rx", "0deg");
        active.style.setProperty("--ry", "0deg");
      }
      active = null;
    }
    function move(event: PointerEvent) {
      if (
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      )
        return;
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              ".path-card, .artist-card, .release-card, .collab-panel, .demo-panel, .btn",
            )
          : null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (target !== active) reset();
        if (!target) return;
        active = target;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left,
          y = event.clientY - rect.top;
        target.style.setProperty("--mx", `${x}px`);
        target.style.setProperty("--my", `${y}px`);
        target.style.setProperty("--rx", `${(y / rect.height - 0.5) * -5}deg`);
        target.style.setProperty("--ry", `${(x / rect.width - 0.5) * 6}deg`);
        target.dataset.pointer = "true";
      });
    }
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(frame);
      reset();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [reduced]);
  return null;
}
