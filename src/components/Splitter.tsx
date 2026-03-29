import { useState, useRef, useEffect } from 'react';

interface SplitterProps {
  defaultRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  children: [React.ReactNode, React.ReactNode];
}

export function Splitter({ defaultRatio = 0.5, minRatio = 0.2, maxRatio = 0.8, children }: SplitterProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      setRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minRatio, maxRatio]);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      <div style={{ width: `${ratio * 100}%` }} className="overflow-hidden">
        {children[0]}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-[var(--border)] hover:bg-[var(--accent)] cursor-col-resize transition-colors flex-shrink-0"
      />
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="overflow-hidden">
        {children[1]}
      </div>
    </div>
  );
}
