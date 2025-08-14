import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface FileUploadProps {
  onFileUpload?: (data: any[][]) => void;
  accept?: string;
}

export function FileUpload({ onFileUpload, accept = ".csv,.xlsx,.xls" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const parseExcel = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as string[][]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSV = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data as string[][];
          const filteredData = data.filter(row => row.some(cell => cell && cell.trim().length > 0));
          resolve(filteredData);
        },
        error: reject,
        skipEmptyLines: true
      });
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let data: string[][];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 file.type === 'application/vnd.ms-excel') {
        data = await parseExcel(file);
      } else {
        alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls).');
        return;
      }

      onFileUpload?.(data);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it\'s a valid CSV or Excel file.');
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