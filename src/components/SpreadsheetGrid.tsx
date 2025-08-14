import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface SpreadsheetData {
  [key: string]: string;
}

interface SpreadsheetGridProps {
  data?: SpreadsheetData;
  onCellChange?: (cellId: string, value: string) => void;
  selectedCell?: string;
  onCellSelect?: (cellId: string) => void;
}

export function SpreadsheetGrid({ 
  data = {}, 
  onCellChange, 
  selectedCell = "A1", 
  onCellSelect 
}: SpreadsheetGridProps) {
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  const getCellId = (col: string, row: number) => `${col}${row}`;
  
  const handleCellChange = (cellId: string, value: string) => {
    onCellChange?.(cellId, value);
  };

  const handleCellClick = (cellId: string) => {
    onCellSelect?.(cellId);
  };

  const getColumnWidth = (col: string) => {
    return columnWidths[col] || 120;
  };

  const startResize = (col: string) => {
    setIsResizing(col);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const headerEl = document.querySelector(`[data-column="${isResizing}"]`);
    if (!headerEl) return;
    
    const rect = headerEl.getBoundingClientRect();
    const newWidth = Math.max(50, e.clientX - rect.left);
    
    setColumnWidths(prev => ({
      ...prev,
      [isResizing]: newWidth
    }));
  };

  const stopResize = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing]);

  return (
    <div className="flex-1 overflow-auto bg-background border border-border rounded-lg" ref={gridRef}>
      <div className="inline-block min-w-full">
        {/* Column Headers */}
        <div className="flex sticky top-0 z-20 bg-muted border-b border-border">
          <div className="w-12 h-8 border-r border-border bg-muted flex items-center justify-center text-xs font-medium sticky left-0 z-30">
            
          </div>
          {columns.map((col) => (
            <div 
              key={col} 
              data-column={col}
              className="h-8 border-r border-border bg-muted flex items-center justify-center text-xs font-medium relative group"
              style={{ width: getColumnWidth(col) }}
            >
              <span className="select-none">{col}</span>
              <div 
                className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary/50 group-hover:bg-primary/30"
                onMouseDown={() => startResize(col)}
              />
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div key={row} className="flex hover:bg-muted/50">
            {/* Row Header */}
            <div className="w-12 h-8 border-r border-b border-border bg-muted flex items-center justify-center text-xs font-medium sticky left-0 z-10">
              {row}
            </div>
            
            {/* Cells */}
            {columns.map((col) => {
              const cellId = getCellId(col, row);
              const isSelected = selectedCell === cellId;
              
              return (
                <div 
                  key={cellId} 
                  className={`h-8 border-r border-b border-border relative bg-background hover:bg-muted/30 ${
                    isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''
                  }`}
                  style={{ width: getColumnWidth(col) }}
                  onClick={() => handleCellClick(cellId)}
                >
                  <Input
                    value={data[cellId] || ""}
                    onChange={(e) => handleCellChange(cellId, e.target.value)}
                    className="w-full h-full border-none rounded-none bg-transparent text-xs px-2 focus:outline-none focus:ring-0 focus:border-none"
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}