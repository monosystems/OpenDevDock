import { useCallback } from "react";

interface ResizerProps {
  onResize: (newWidth: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function Resizer({ onResize, minWidth = 200, maxWidth = 400 }: ResizerProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, moveEvent.clientX));
        onResize(newWidth);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResize, minWidth, maxWidth]
  );

  return <div className="resizer" onMouseDown={handleMouseDown} />;
}
