"use client";

import { useState, useCallback } from "react";

export function useSidebar(initialOpen: boolean = true) {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    toggle,
    close,
    open,
  };
}
