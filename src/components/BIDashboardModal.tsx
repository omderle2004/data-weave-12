import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, ArrowLeft, Database, Brain, FileText } from 'lucide-react';

interface BIDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BIDashboardModal({ isOpen, onClose }: BIDashboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">BI Dashboard</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spreadsheet
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Revenue Trends</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization will appear here</p>
                    <p className="text-sm">AI-generated based on your data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Market Share</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Pie chart visualization</p>
                    <p className="text-sm">Interactive data breakdown</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">AI-Generated Key Insights</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Growth Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      Revenue has increased 23% compared to last quarter. Consider expanding marketing efforts in high-performing regions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      85% of your data is complete. Missing values detected in customer demographics - consider data enrichment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Recommended Actions</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on customer retention strategies. Top 20% of customers generate 60% of revenue.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistical Analysis Module */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Statistical Analysis</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">$1,247.89</p>
                  <p className="text-sm text-muted-foreground">Mean Revenue</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">$1,123.84</p>
                  <p className="text-sm text-muted-foreground">Median Revenue</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">±$425.67</p>
                  <p className="text-sm text-muted-foreground">Std Deviation</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">181,190</p>
                  <p className="text-sm text-muted-foreground">Variance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Functions Module */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Predictive Analysis</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">Revenue Forecast</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on current trends, revenue is projected to increase by 15-20% next quarter.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Confidence Level: 87% | Model: Linear Regression
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-lg border border-green-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Demand Prediction</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Smartphone demand likely to peak in Q2. Consider inventory adjustments.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Confidence Level: 92% | Model: Time Series Analysis
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Database className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Data table will be generated here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Key Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Metrics overview table</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}