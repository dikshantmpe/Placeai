import { useEffect, useRef, useState } from "react";

/**
 * Natural-feeling typewriter with per-character speed variation.
 * No layout shift — the parent reserves width via CSS (min-width or
 * font-variant-numeric: tabular-nums).
 *
 * @param {string[]} texts - Phrases to cycle through.
 * @param {object} [opts]
 * @param {number} [opts.typeSpeed=75]      - Base ms per character when typing.
 * @param {number} [opts.typeVariance=30]   - ±ms random variance on each char.
 * @param {number} [opts.deleteSpeed=40]    - Base ms per character when deleting.
 * @param {number} [opts.deleteVariance=15] - ±ms random variance on delete.
 * @param {number} [opts.pauseMs=2000]      - Base ms to pause on full phrase.
 * @param {number} [opts.pauseVariance=400] - ±ms variance on pause.
 * @param {boolean} [opts.reducedMotion=false] - Skip animation, show first phrase static.
 * @returns {{ displayedText: string, isDeleting: boolean }}
 */
export function useTypingEffect(texts, opts = {}) {
  const {
    typeSpeed = 75,
    typeVariance = 30,
    deleteSpeed = 40,
    deleteVariance = 15,
    pauseMs = 2000,
    pauseVariance = 400,
    reducedMotion = false,
  } = opts;

  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef(null);

  // Respect reduced-motion: render first phrase statically, no cycling.
  if (reducedMotion) {
    return { displayedText: texts[0] ?? "", isDeleting: false };
  }

  useEffect(() => {
    const current = texts[textIndex];
    if (!current) return;

    // Random jitter for human-feel. Clamped >= 12ms so we never go super-sonic.
    const jitter = (base, variance) =>
      Math.max(12, base + (Math.random() * 2 - 1) * variance);

    let delay;
    if (!isDeleting && charIndex < current.length) {
      delay = jitter(typeSpeed, typeVariance);
    } else if (!isDeleting && charIndex === current.length) {
      delay = jitter(pauseMs, pauseVariance);
    } else if (isDeleting && charIndex > 0) {
      delay = jitter(deleteSpeed, deleteVariance);
    } else {
      delay = 0;
    }

    timeoutRef.current = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setCharIndex((c) => c + 1);
      } else if (!isDeleting && charIndex === current.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex((c) => c - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((i) => (i + 1) % texts.length);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    charIndex,
    isDeleting,
    textIndex,
    texts,
    typeSpeed,
    typeVariance,
    deleteSpeed,
    deleteVariance,
    pauseMs,
    pauseVariance,
  ]);

  const current = texts[textIndex] ?? "";
  return {
    displayedText: current.slice(0, charIndex),
    isDeleting,
  };
}