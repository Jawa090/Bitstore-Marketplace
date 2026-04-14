import { useState, useCallback, DragEvent } from "react";

export function useDragReorder<T>(items: T[], onReorder: (items: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => (e: DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((index: number) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }, []);

  const handleDrop = useCallback((index: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const updated = [...items];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onReorder(updated);
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const getDragProps = useCallback((index: number) => ({
    draggable: true,
    onDragStart: handleDragStart(index),
    onDragOver: handleDragOver(index),
    onDrop: handleDrop(index),
    onDragEnd: handleDragEnd,
    className: `transition-opacity ${dragIndex === index ? "opacity-40" : ""} ${overIndex === index && dragIndex !== index ? "ring-2 ring-primary rounded-lg" : ""}`,
  }), [handleDragStart, handleDragOver, handleDrop, handleDragEnd, dragIndex, overIndex]);

  return { getDragProps };
}
