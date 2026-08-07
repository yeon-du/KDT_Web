"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
}

/**
 * Animates a numeric value toward its target using a spring, re-rendering
 * the formatted (currency/locale-aware) string on every tick. Falls back to
 * an immediate snap on first mount so there's no "counting up from zero"
 * flash when the page loads with a non-zero default.
 */
export default function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 120, damping: 24, mass: 0.6 });
  const [display, setDisplay] = useState(() => format(value));
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      motionValue.set(value);
      setDisplay(format(value));
      return;
    }
    motionValue.set(value);
  }, [value, motionValue, format]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(format(latest));
    });
    return unsubscribe;
  }, [spring, format]);

  return <motion.span className={className}>{display}</motion.span>;
}
