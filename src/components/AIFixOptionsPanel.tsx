import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Database, Trash2, CheckCircle, Sparkles } from 'lucide-react';

interface AIFixOptionsPanelProps {
  isOpen: boolean;
  onBack: () => void;
}

export function AIFixOptionsPanel({ isOpen, onBack }: AIFixOptionsPanelProps) {
  const [numericMethod, setNumericMethod] = useState('mean');
  const [textMethod, setTextMethod] = useState('na');
  const [dateMethod, setDateMethod] = useState('today');

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
                <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                  <Trash2 className="h-4 w-4" />
                  Remove Rows with Null Values
                </Button>
                <Button className="w-full gap-2" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Handle ALL with AI
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
              <Button variant="destructive" className="w-full gap-2" size="lg">
                <Trash2 className="h-4 w-4" />
                Remove Duplicates
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
              <Button className="w-full gap-2" size="lg">
                <CheckCircle className="h-4 w-4" />
                Auto-correct Column Data Types
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
