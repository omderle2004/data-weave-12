import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload?: (data: any[][]) => void;
  accept?: string;
}

export function FileUpload({ onFileUpload, accept = ".csv,.xlsx,.xls" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n');
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    }).filter(row => row.some(cell => cell.length > 0));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        onFileUpload?.(data);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please ensure it\'s a valid CSV file.');
      }
    };

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      alert('Please upload a CSV file. Excel files (.xlsx, .xls) parsing requires additional libraries.');
    }

    // Reset the input
    event.target.value = '';
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFileClick}
        className="h-8"
      >
        <Upload className="h-4 w-4 mr-1" />
        Import Data
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}