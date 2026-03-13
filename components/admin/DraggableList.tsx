"use client";

import { useState, useRef, useEffect } from "react";

interface Item {
  id: string;
  sortOrder?: number;
}

interface DraggableListProps<T extends Item> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (reordered: T[]) => void;
  keyExtractor?: (item: T) => string;
}

export function DraggableList<T extends Item>({
  items,
  renderItem,
  onReorder,
  keyExtractor,
}: DraggableListProps<T>) {
  const [list, setList] = useState(items);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    setList(items);
  }, [items]);

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex.current === null || dragIndex.current === index) return;

    const next = [...list];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved!);
    dragIndex.current = index;
    setList(next);
  }

  function handleDrop() {
    onReorder(list.map((item, i) => ({ ...item, sortOrder: i })));
    dragIndex.current = null;
  }

  const getKey = keyExtractor ?? ((item: T) => item.id);

  return (
    <ul className="space-y-1">
      {list.map((item, index) => (
        <li
          key={getKey(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="dark:text-slate-600 dark:hover:text-slate-400 text-gray-300 hover:text-gray-500 text-base leading-none" title="Drag to reorder">⠇</span>
          <div className="flex-1">{renderItem(item, index)}</div>
        </li>
      ))}
    </ul>
  );
}
