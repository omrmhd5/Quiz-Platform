"use client";

import { useEffect, useState } from "react";

export function useModalMotion(open: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);

  return visible;
}
