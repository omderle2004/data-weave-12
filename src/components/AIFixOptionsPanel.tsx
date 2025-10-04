import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Database, Trash2, CheckCircle } from 'lucide-react';

interface AIFixOptionsPanelProps {
  isOpen: boolean;
  onBack: () => void;
}

export function AIFixOptionsPanel({ isOpen, onBack }: AIFixOptionsPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onBack}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">AI Data Cleaning Options</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 px-1">
          {/* Handle Missing Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Handle Missing Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Numeric Columns */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Numeric Columns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with Mean</p>
                      <p className="text-xs text-muted-foreground">Replace with column average</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with Median</p>
                      <p className="text-xs text-muted-foreground">Replace with middle value</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with Zero</p>
                      <p className="text-xs text-muted-foreground">Replace with 0</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-xs text-muted-foreground">Use previous valid value</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Text Columns */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Text Columns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with "N/A"</p>
                      <p className="text-xs text-muted-foreground">Mark as not available</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with Mode</p>
                      <p className="text-xs text-muted-foreground">Use most frequent value</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-xs text-muted-foreground">Use previous valid value</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Remove Rows</p>
                      <p className="text-xs text-muted-foreground">Delete incomplete rows</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Date Columns */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Date Columns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Fill with Today</p>
                      <p className="text-xs text-muted-foreground">Use current date</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Forward Fill</p>
                      <p className="text-xs text-muted-foreground">Use previous valid date</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Interpolate</p>
                      <p className="text-xs text-muted-foreground">Estimate based on trend</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="text-left">
                      <p className="font-medium">Remove Rows</p>
                      <p className="text-xs text-muted-foreground">Delete incomplete rows</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Handle ALL with AI */}
              <div className="pt-2 border-t">
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Handle ALL with AI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Handle Duplicate Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Handle Duplicate Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Duplicates
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will keep the first occurrence and remove all duplicate rows
              </p>
            </CardContent>
          </Card>

          {/* Handle Data Type Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Handle Data Type Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary hover:bg-primary-hover">
                <CheckCircle className="h-4 w-4 mr-2" />
                Auto-correct Column Data Types
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                AI will automatically detect and correct inconsistent data types in columns
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
