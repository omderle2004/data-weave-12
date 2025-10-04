import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Database, Trash2, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIFixOptionsPanelProps {
  isOpen: boolean;
  onBack: () => void;
  importedData: any[][] | null;
  onDataUpdate: (data: any[][]) => void;
  projectId?: string;
  onDataCleaned?: () => void;
}

export function AIFixOptionsPanel({ isOpen, onBack, importedData, onDataUpdate, projectId, onDataCleaned }: AIFixOptionsPanelProps) {
  const [numericMethod, setNumericMethod] = useState('mean');
  const [textMethod, setTextMethod] = useState('na');
  const [dateMethod, setDateMethod] = useState('today');
  const [isProcessing, setIsProcessing] = useState(false);

  const detectColumnType = (colIndex: number): 'numeric' | 'text' | 'date' => {
    if (!importedData || importedData.length < 2) return 'text';
    
    const sampleValues = importedData.slice(1, Math.min(20, importedData.length)).map(row => row[colIndex]);
    const validValues = sampleValues.filter(v => v !== null && v !== undefined && v !== '');
    
    if (validValues.length === 0) return 'text';
    
    // Check if numeric
    const numericCount = validValues.filter(v => !isNaN(Number(v))).length;
    if (numericCount / validValues.length > 0.8) return 'numeric';
    
    // Check if date
    const dateCount = validValues.filter(v => {
      const parsed = new Date(v);
      return !isNaN(parsed.getTime());
    }).length;
    if (dateCount / validValues.length > 0.8) return 'date';
    
    return 'text';
  };

  const calculateMean = (values: number[]): number => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };

  const calculateMedian = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const calculateMode = (values: any[]): any => {
    const frequency: Record<string, number> = {};
    values.forEach(val => {
      const key = String(val);
      frequency[key] = (frequency[key] || 0) + 1;
    });
    let maxFreq = 0;
    let mode = values[0];
    Object.entries(frequency).forEach(([key, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = key;
      }
    });
    return mode;
  };

  const handleMissingValues = async (columnType: 'numeric' | 'text' | 'date', method: string) => {
    if (!importedData || importedData.length < 2) {
      toast.error('No data to process');
      return;
    }

    setIsProcessing(true);
    try {
      const headers = importedData[0];
      const cleanedData = [...importedData];

      headers.forEach((_, colIndex) => {
        const colType = detectColumnType(colIndex);
        if (colType !== columnType) return;

        const validValues = cleanedData.slice(1).map((row, rowIdx) => ({ value: row[colIndex], rowIdx: rowIdx + 1 }))
          .filter(item => item.value !== null && item.value !== undefined && item.value !== '');

        let fillValue: any;

        if (colType === 'numeric') {
          const numericValues = validValues.map(item => Number(item.value));
          switch (method) {
            case 'mean':
              fillValue = calculateMean(numericValues);
              break;
            case 'median':
              fillValue = calculateMedian(numericValues);
              break;
            case 'mode':
              fillValue = calculateMode(numericValues);
              break;
          }
        } else if (colType === 'text') {
          switch (method) {
            case 'na':
              fillValue = 'N/A';
              break;
            case 'mode':
              fillValue = calculateMode(validValues.map(item => item.value));
              break;
          }
        } else if (colType === 'date') {
          switch (method) {
            case 'today':
              fillValue = new Date().toISOString().split('T')[0];
              break;
          }
        }

        // Apply forward fill or backward fill
        if (method === 'ffill') {
          let lastValid: any = null;
          for (let i = 1; i < cleanedData.length; i++) {
            if (cleanedData[i][colIndex] !== null && cleanedData[i][colIndex] !== undefined && cleanedData[i][colIndex] !== '') {
              lastValid = cleanedData[i][colIndex];
            } else if (lastValid !== null) {
              cleanedData[i][colIndex] = lastValid;
            }
          }
        } else if (method === 'bfill') {
          let nextValid: any = null;
          for (let i = cleanedData.length - 1; i >= 1; i--) {
            if (cleanedData[i][colIndex] !== null && cleanedData[i][colIndex] !== undefined && cleanedData[i][colIndex] !== '') {
              nextValid = cleanedData[i][colIndex];
            } else if (nextValid !== null) {
              cleanedData[i][colIndex] = nextValid;
            }
          }
        } else if (method === 'interpolate' && colType === 'date') {
          // Simple linear interpolation for dates
          for (let i = 1; i < cleanedData.length; i++) {
            if (!cleanedData[i][colIndex] || cleanedData[i][colIndex] === '') {
              const prevIdx = i - 1;
              let nextIdx = i + 1;
              while (nextIdx < cleanedData.length && (!cleanedData[nextIdx][colIndex] || cleanedData[nextIdx][colIndex] === '')) {
                nextIdx++;
              }
              if (prevIdx >= 1 && nextIdx < cleanedData.length) {
                const prevDate = new Date(cleanedData[prevIdx][colIndex]);
                const nextDate = new Date(cleanedData[nextIdx][colIndex]);
                const steps = nextIdx - prevIdx;
                const interpolatedDate = new Date(prevDate.getTime() + ((nextDate.getTime() - prevDate.getTime()) / steps));
                cleanedData[i][colIndex] = interpolatedDate.toISOString().split('T')[0];
              }
            }
          }
        } else if (fillValue !== undefined) {
          // Apply calculated fill value
          for (let i = 1; i < cleanedData.length; i++) {
            if (!cleanedData[i][colIndex] || cleanedData[i][colIndex] === '') {
              cleanedData[i][colIndex] = fillValue;
            }
          }
        }
      });

      await updateDataAndDatabase(cleanedData);
      onDataCleaned?.();
      toast.success('Missing values handled successfully');
    } catch (error) {
      console.error('Error handling missing values:', error);
      toast.error('Failed to handle missing values');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRowsWithNulls = async () => {
    if (!importedData || importedData.length < 2) {
      toast.error('No data to process');
      return;
    }

    setIsProcessing(true);
    try {
      const headers = importedData[0];
      const cleanedData = [headers, ...importedData.slice(1).filter(row => 
        row.every(cell => cell !== null && cell !== undefined && cell !== '')
      )];

      await updateDataAndDatabase(cleanedData);
      onDataCleaned?.();
      toast.success(`Removed ${importedData.length - cleanedData.length} rows with null values`);
    } catch (error) {
      console.error('Error removing rows with nulls:', error);
      toast.error('Failed to remove rows with nulls');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAllWithAI = async () => {
    if (!importedData || importedData.length < 2) {
      toast.error('No data to process');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('clean-data-with-ai', {
        body: { 
          data: importedData,
          projectId,
          options: {
            numericMethod,
            textMethod,
            dateMethod
          }
        }
      });

      if (error) throw error;

      if (result.success && result.cleanedData) {
        // First, save to database permanently
        await updateDataAndDatabase(result.cleanedData);
        
        // Then trigger quality analysis refresh
        onDataCleaned?.();
        
        toast.success(`Data cleaned successfully. Quality score: ${result.qualityScore}%`);
        onBack();
      }
    } catch (error) {
      console.error('Error cleaning data with AI:', error);
      toast.error('Failed to clean data with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!importedData || importedData.length < 2) {
      toast.error('No data to process');
      return;
    }

    setIsProcessing(true);
    try {
      const headers = importedData[0];
      const seenRows = new Set<string>();
      const cleanedData = [headers];

      for (let i = 1; i < importedData.length; i++) {
        const rowString = importedData[i].join('|');
        if (!seenRows.has(rowString)) {
          seenRows.add(rowString);
          cleanedData.push(importedData[i]);
        }
      }

      await updateDataAndDatabase(cleanedData);
      onDataCleaned?.();
      toast.success(`Removed ${importedData.length - cleanedData.length} duplicate rows`);
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast.error('Failed to remove duplicates');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoCorrectDataTypes = async () => {
    if (!importedData || importedData.length < 2) {
      toast.error('No data to process');
      return;
    }

    setIsProcessing(true);
    try {
      const cleanedData = [...importedData];

      for (let colIndex = 0; colIndex < cleanedData[0].length; colIndex++) {
        const colType = detectColumnType(colIndex);

        for (let rowIndex = 1; rowIndex < cleanedData.length; rowIndex++) {
          const cell = cleanedData[rowIndex][colIndex];
          if (!cell || cell === '') continue;

          if (colType === 'numeric') {
            cleanedData[rowIndex][colIndex] = Number(cell);
          } else if (colType === 'date') {
            const parsed = new Date(cell);
            if (!isNaN(parsed.getTime())) {
              cleanedData[rowIndex][colIndex] = parsed.toISOString().split('T')[0];
            }
          }
        }
      }

      await updateDataAndDatabase(cleanedData);
      onDataCleaned?.();
      toast.success('Data types auto-corrected successfully');
    } catch (error) {
      console.error('Error auto-correcting data types:', error);
      toast.error('Failed to auto-correct data types');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateDataAndDatabase = async (cleanedData: any[][]) => {
    onDataUpdate(cleanedData);

    if (projectId) {
      const { error } = await supabase
        .from('projects')
        .update({ 
          spreadsheet_data: cleanedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onBack}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-semibold">AI Data Cleaning Options</DialogTitle>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 px-1 py-6">
          {/* Handle Missing Values */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                Handle Missing Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Numeric Columns */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Numeric Columns</h3>
                <RadioGroup value={numericMethod} onValueChange={setNumericMethod} className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="mean" id="mean" className="mt-0.5" />
                    <Label htmlFor="mean" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with Mean</p>
                      <p className="text-sm text-muted-foreground">Replace with column average</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="median" id="median" className="mt-0.5" />
                    <Label htmlFor="median" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with Median</p>
                      <p className="text-sm text-muted-foreground">Replace with middle value</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="mode" id="numeric-mode" className="mt-0.5" />
                    <Label htmlFor="numeric-mode" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with Mode</p>
                      <p className="text-sm text-muted-foreground">Use most frequent value</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="ffill" id="numeric-ffill" className="mt-0.5" />
                    <Label htmlFor="numeric-ffill" className="flex-1 cursor-pointer">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-sm text-muted-foreground">Use previous valid value</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Text Columns */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-base">Text Columns</h3>
                <RadioGroup value={textMethod} onValueChange={setTextMethod} className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="na" id="na" className="mt-0.5" />
                    <Label htmlFor="na" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with "N/A"</p>
                      <p className="text-sm text-muted-foreground">Mark as not available</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="mode" id="text-mode" className="mt-0.5" />
                    <Label htmlFor="text-mode" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with Mode</p>
                      <p className="text-sm text-muted-foreground">Use most frequent value</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="ffill" id="text-ffill" className="mt-0.5" />
                    <Label htmlFor="text-ffill" className="flex-1 cursor-pointer">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-sm text-muted-foreground">Use previous valid value</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date Columns */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-base">Date Columns</h3>
                <RadioGroup value={dateMethod} onValueChange={setDateMethod} className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="today" id="today" className="mt-0.5" />
                    <Label htmlFor="today" className="flex-1 cursor-pointer">
                      <p className="font-medium">Fill with Today</p>
                      <p className="text-sm text-muted-foreground">Use current date</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="ffill" id="date-ffill" className="mt-0.5" />
                    <Label htmlFor="date-ffill" className="flex-1 cursor-pointer">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-sm text-muted-foreground">Use previous valid date</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="interpolate" id="interpolate" className="mt-0.5" />
                    <Label htmlFor="interpolate" className="flex-1 cursor-pointer">
                      <p className="font-medium">Interpolate</p>
                      <p className="text-sm text-muted-foreground">Estimate based on trend</p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="bfill" id="bfill" className="mt-0.5" />
                    <Label htmlFor="bfill" className="flex-1 cursor-pointer">
                      <p className="font-medium">Backward Fill</p>
                      <p className="text-sm text-muted-foreground">Use next valid date</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
                  size="lg"
                  onClick={handleRemoveRowsWithNulls}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Rows with Null Values
                </Button>
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleAllWithAI}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Handle ALL with AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Handle Duplicate Records */}
          <Card className="border-destructive/20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-destructive" />
                Handle Duplicate Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full gap-2" 
                size="lg"
                onClick={handleRemoveDuplicates}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Remove Duplicates'}
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                This will keep the first occurrence and remove all duplicate rows
              </p>
            </CardContent>
          </Card>

          {/* Handle Data Type Issues */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                Handle Data Type Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleAutoCorrectDataTypes}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Auto-correct Column Data Types'}
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                AI will automatically detect and correct inconsistent data types in columns
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
