import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface FileImportProps {
  onDataImport: (data: string[][]) => void;
  onClose: () => void;
  isOpen: boolean;
  uploadComplete?: boolean;
}

export function FileImport({ onDataImport, onClose, isOpen, uploadComplete }: FileImportProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        let parsedData: string[][] = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const text = data as string;
          parsedData = text.split('\n').map(row => 
            row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
          );
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        // Filter out empty rows
        parsedData = parsedData.filter(row => row.some(cell => cell && cell.toString().trim()));

        onDataImport(parsedData);
        toast.success(`Successfully imported ${parsedData.length} rows from ${file.name}`);
        onClose();
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the format.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }, [onDataImport, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Import Data</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Upload File</h4>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {isDragActive ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isDragActive ? 'Drop the file here' : 'Choose file or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports CSV, XLSX, XLS files
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Supported Formats</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>CSV files (.csv)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Excel files (.xlsx, .xls)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}