import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileImportProps {
  onDataImport: (data: string[][], projectId?: string) => void;
  onClose: () => void;
  isOpen: boolean;
  uploadComplete?: boolean;
}

export function FileImport({ onDataImport, onClose, isOpen, uploadComplete }: FileImportProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) return;

    setUploading(true);
    
    try {
      // Parse the file data
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      // Filter out completely empty rows
      const filteredData = jsonData.filter(row => 
        row.some(cell => cell !== undefined && cell !== null && cell !== '')
      );

      // Create project in database
      const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          filename: file.name,
          file_path: '', // Will be updated after file upload
          file_size: file.size,
          spreadsheet_data: filteredData
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        return;
      }

      // Upload file to Supabase Storage
      const filePath = `${user.id}/${project.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Clean up the project if file upload fails
        await supabase.from('projects').delete().eq('id', project.id);
        toast.error('Failed to upload file');
        return;
      }

      // Update project with file path
      const { error: updateError } = await supabase
        .from('projects')
        .update({ file_path: filePath })
        .eq('id', project.id);

      if (updateError) {
        console.error('Error updating project:', updateError);
      }

      toast.success('Project created successfully!');
      onDataImport(filteredData, project.id);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please make sure it\'s a valid CSV or Excel file.');
    } finally {
      setUploading(false);
    }
  }, [onDataImport, user]);

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
                {uploading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                ) : isDragActive ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {uploading ? 'Creating project...' : isDragActive ? 'Drop the file here' : 'Choose file or drag & drop'}
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