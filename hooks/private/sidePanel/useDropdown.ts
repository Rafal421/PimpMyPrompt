import { useState, useEffect, useCallback } from "react";

interface UseDropdownOptions {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
}

export function useDropdown(options: UseDropdownOptions = {}) {
  const {
    initialOpen = false,
    closeOnEscape = true,
    closeOnClickOutside = true,
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, close]);

  // Handle click outside
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-dropdown]")) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeOnClickOutside, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
