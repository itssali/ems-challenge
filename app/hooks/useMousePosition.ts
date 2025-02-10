import { useEffect, useState, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(delay: number = 50): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const update = () => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    // Add a subtle delay for a smoother effect
    setTimeout(update, delay);
  }, [delay]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return mousePosition;
} 