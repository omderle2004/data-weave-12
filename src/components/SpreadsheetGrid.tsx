import React, { useState, useEffect } from "react";
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
  const columns = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const getCellId = (col: string, row: number) => `${col}${row}`;
  
  const handleCellChange = (cellId: string, value: string) => {
    onCellChange?.(cellId, value);
  };

  const handleCellClick = (cellId: string) => {
    onCellSelect?.(cellId);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="inline-block min-w-full">
        {/* Column Headers */}
        <div className="flex sticky top-0 z-20 bg-grid-header border-b border-border">
          <div className="w-12 h-8 border-r border-border bg-grid-header flex items-center justify-center text-xs font-medium">
            
          </div>
          {columns.map((col) => (
            <div 
              key={col} 
              className="w-24 h-8 border-r border-border bg-grid-header flex items-center justify-center text-xs font-medium"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div key={row} className="flex">
            {/* Row Header */}
            <div className="w-12 h-8 border-r border-b border-border bg-grid-header flex items-center justify-center text-xs font-medium sticky left-0 z-10">
              {row}
            </div>
            
            {/* Cells */}
            {columns.map((col) => {
              const cellId = getCellId(col, row);
              const isSelected = selectedCell === cellId;
              
              return (
                <div 
                  key={cellId} 
                  className={`w-24 h-8 border-r border-b border-border relative ${
                    isSelected ? 'ring-2 ring-primary ring-inset' : ''
                  }`}
                  onClick={() => handleCellClick(cellId)}
                >
                  <Input
                    value={data[cellId] || ""}
                    onChange={(e) => handleCellChange(cellId, e.target.value)}
                    className="w-full h-full border-none rounded-none bg-transparent text-xs px-1 focus:outline-none focus:ring-0"
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