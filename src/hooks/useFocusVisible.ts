import { useEffect } from "react";

export function useFocusVisible(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMouseDown() {
      el.classList.remove("focus-visible-custom");
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        el.classList.add("focus-visible-custom");
      }
    }
    function handleBlur() {
      el.classList.remove("focus-visible-custom");
    }

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("blur", handleBlur);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("blur", handleBlur);
    };
  }, [ref]);
}
