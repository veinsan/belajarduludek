"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RevealTag = "div" | "section" | "li";

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
};

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  once = true,
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return React.createElement(
    as,
    {
      ref,
      className: cn("reveal-motion", visible && "is-visible", className),
      style: { ...style, transitionDelay: `${delay}ms` },
      ...props,
    },
    children
  );
}
