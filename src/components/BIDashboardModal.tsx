import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart, TrendingUp, ArrowLeft, Database, Brain, FileText, Loader2, RefreshCw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { useBIAnalysis } from '@/hooks/useBIAnalysis';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BIDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[][];
  columns?: string[];
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088', '#8800ff', '#ff8800'];

export function BIDashboardModal({ isOpen, onClose, data = [], columns = [] }: BIDashboardModalProps) {
  const { analyzeData, loading, error } = useBIAnalysis();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedRevenueColumn, setSelectedRevenueColumn] = useState<string>('');
  const [selectedCategoryColumn, setSelectedCategoryColumn] = useState<string>('');
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  const [columnTypes, setColumnTypes] = useState<{numerical: string[], categorical: string[], dateTime: string[]}>({numerical: [], categorical: [], dateTime: []});
  const [isGeneratingCharts, setIsGeneratingCharts] = useState(false);
  const [customSelectedColumnX, setCustomSelectedColumnX] = useState<string>('');
  const [customSelectedColumnY, setCustomSelectedColumnY] = useState<string>('');
  const [customChartType, setCustomChartType] = useState<'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'donut' | 'stacked-bar'>('bar');
  const [isGeneratingCustomChart, setIsGeneratingCustomChart] = useState(false);
  
  // Predictive Analysis states
  const [predictiveXColumn, setPredictiveXColumn] = useState<string>('');
  const [predictiveYColumn, setPredictiveYColumn] = useState<string>('');
  const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  
  // Time Series Analysis states
  const [timeSeriesDateColumn, setTimeSeriesDateColumn] = useState<string>('');
  const [timeSeriesValueColumn, setTimeSeriesValueColumn] = useState<string>('');
  const [isGeneratingTimeSeries, setIsGeneratingTimeSeries] = useState(false);
  const [timeSeriesResult, setTimeSeriesResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && data.length > 0 && columns.length > 0) {
      classifyColumns();
      performAnalysis();
    }
  }, [isOpen, data, columns]);

  useEffect(() => {
    // Load cached selections
    const savedRevenue = localStorage.getItem('bi-selected-revenue-column');
    const savedCategory = localStorage.getItem('bi-selected-category-column');
    if (savedRevenue && columns.includes(savedRevenue)) {
      setSelectedRevenueColumn(savedRevenue);
    }
    if (savedCategory && columns.includes(savedCategory)) {
      setSelectedCategoryColumn(savedCategory);
    }
  }, [columns]);

  const classifyColumns = () => {
    if (data.length < 2) return;
    
    const numerical: string[] = [];
    const categorical: string[] = [];
    const dateTime: string[] = [];
    
    columns.forEach((col, index) => {
      const sampleValues = data.slice(1, Math.min(11, data.length)).map(row => row[index]);
      const numericCount = sampleValues.filter(val => 
        val !== null && val !== undefined && val !== '' && !isNaN(Number(val))
      ).length;
      
      // Enhanced Date/Time Detection Logic
      const dateKeywords = ['date', 'day', 'month', 'year', 'time', 'period', 'timestamp', 'created', 'updated', 'modified', 'when'];
      const hasDateKeyword = dateKeywords.some(keyword => 
        col.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Check for date/time patterns - more comprehensive
      const dateCount = sampleValues.filter(val => {
        if (!val) return false;
        
        const valStr = String(val).trim();
        if (!valStr) return false;
        
        // Extended date patterns
        const datePatterns = [
          /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD or YYYY-M-D
          /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or M/D/YY
          /^\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY or M-D-YY
          /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD or YYYY/M/D
          /^\d{1,2}\.\d{1,2}\.\d{2,4}/, // DD.MM.YYYY
          /^\d{4}\.\d{1,2}\.\d{1,2}/, // YYYY.MM.DD
          /^\d{1,2}\/\d{1,2}$/, // MM/DD (month/day only)
          /^\d{4}-\d{1,2}$/, // YYYY-MM (year-month only)
          /^\d{4}$/, // YYYY (year only)
          /^\w{3}\s+\d{1,2},?\s+\d{4}/, // Mon Jan 1, 2023 or Mon Jan 1 2023
          /^\w{3}\s+\d{1,2}/, // Mon 15 or Jan 15
          /^\d{1,2}\s+\w{3}\s+\d{4}/, // 15 Jan 2023
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // ISO datetime
          /^\d{1,2}:\d{2}/, // Time format HH:MM
          /^\d{13}$/, // Unix timestamp (milliseconds)
          /^\d{10}$/, // Unix timestamp (seconds)
        ];
        
        // Check if matches any date pattern
        const matchesPattern = datePatterns.some(pattern => pattern.test(valStr));
        
        // Try to parse as date
        const parsedDate = new Date(valStr);
        const isValidDate = !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100;
        
        return matchesPattern || isValidDate;
      }).length;
      
      // More lenient date/time classification
      const isDateTime = (dateCount > sampleValues.length * 0.5) || // 50% instead of 70%
                        (hasDateKeyword && dateCount > sampleValues.length * 0.3) || // If has keyword, only need 30%
                        (hasDateKeyword && sampleValues.length <= 3 && dateCount > 0); // For small samples with keywords
      
      if (isDateTime) {
        dateTime.push(col);
      } else if (numericCount > sampleValues.length * 0.7) {
        numerical.push(col);
      } else {
        categorical.push(col);
      }
    });
    
    setColumnTypes({ numerical, categorical, dateTime });
  };

  const performAnalysis = async () => {
    const result = await analyzeData(data, columns, selectedRevenueColumn, selectedCategoryColumn);
    if (result) {
      setAnalysisResult(result);
      // Always show column selection if we have columns
      if (columnTypes.numerical.length > 0 || columnTypes.categorical.length > 0) {
        setShowColumnSelection(true);
      }
    }
  };

  const generateCustomCharts = async () => {
    if (!selectedRevenueColumn && !selectedCategoryColumn) return;
    
    setIsGeneratingCharts(true);
    try {
      const result = await analyzeData(data, columns, selectedRevenueColumn, selectedCategoryColumn);
      if (result) {
        setAnalysisResult(result);
        // Cache selections
        if (selectedRevenueColumn) {
          localStorage.setItem('bi-selected-revenue-column', selectedRevenueColumn);
        }
        if (selectedCategoryColumn) {
          localStorage.setItem('bi-selected-category-column', selectedCategoryColumn);
        }
      }
    } finally {
      setIsGeneratingCharts(false);
    }
  };

  const resetSelections = () => {
    localStorage.removeItem('bi-selected-revenue-column');
    localStorage.removeItem('bi-selected-category-column');
    setSelectedRevenueColumn('');
    setSelectedCategoryColumn('');
    setCustomSelectedColumnX('');
    setCustomSelectedColumnY('');
    setCustomChartType('bar');
    setPredictiveXColumn('');
    setPredictiveYColumn('');
    setPredictionResult(null);
    setTimeSeriesDateColumn('');
    setTimeSeriesValueColumn('');
    setTimeSeriesResult(null);
    performAnalysis();
  };

  const generateCustomChart = async () => {
    // Support both single and bi-variate analysis
    if (!customSelectedColumnX && !customSelectedColumnY) return;
    
    setIsGeneratingCustomChart(true);
    try {
      let chartData: any[] = [];
      let chartTitle = '';
      
      if (customSelectedColumnX && customSelectedColumnY) {
        // Bi-variate analysis
        const columnIndexX = columns.indexOf(customSelectedColumnX);
        const columnIndexY = columns.indexOf(customSelectedColumnY);
        if (columnIndexX === -1 || columnIndexY === -1) return;
        
        const combinedData = data.slice(1).map(row => ({
          x: row[columnIndexX],
          y: row[columnIndexY],
          name: `${row[columnIndexX]}`
        })).filter(item => 
          item.x !== null && item.x !== undefined && item.x !== '' &&
          item.y !== null && item.y !== undefined && item.y !== ''
        );
        
        if (customChartType === 'pie' || customChartType === 'donut') {
          // Group by X-axis values and sum Y-axis values
          const grouped: { [key: string]: number } = {};
          combinedData.forEach(item => {
            const key = String(item.x);
            const value = isNaN(Number(item.y)) ? 0 : Number(item.y);
            grouped[key] = (grouped[key] || 0) + value;
          });
          chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));
        } else if (customChartType === 'scatter') {
          chartData = combinedData.map((item, index) => ({
            x: isNaN(Number(item.x)) ? index : Number(item.x),
            y: isNaN(Number(item.y)) ? 0 : Number(item.y),
            name: String(item.x)
          }));
        } else {
          // For other chart types, group by X and aggregate Y
          const grouped: { [key: string]: number[] } = {};
          combinedData.forEach(item => {
            const key = String(item.x);
            const value = isNaN(Number(item.y)) ? 0 : Number(item.y);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
          });
          
          chartData = Object.entries(grouped).map(([name, values]) => ({
            name,
            value: values.reduce((sum, val) => sum + val, 0) / values.length // Average
          }));
        }
        
        chartTitle = `${customSelectedColumnY} vs ${customSelectedColumnX}`;
      } else {
        // Single column analysis (backward compatibility)
        const selectedColumn = customSelectedColumnX || customSelectedColumnY;
        const columnIndex = columns.indexOf(selectedColumn);
        if (columnIndex === -1) return;
        
        const columnData = data.slice(1).map(row => row[columnIndex]).filter(val => val !== null && val !== undefined && val !== '');
        
        if (customChartType === 'pie' || customChartType === 'donut') {
          const counts: { [key: string]: number } = {};
          columnData.forEach(val => {
            const key = String(val);
            counts[key] = (counts[key] || 0) + 1;
          });
          chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
        } else if (customChartType === 'scatter') {
          chartData = columnData.map((value, index) => ({
            x: index + 1,
            y: isNaN(Number(value)) ? 0 : Number(value),
            name: `Point ${index + 1}`
          }));
        } else if (customChartType === 'radar') {
          chartData = columnData.slice(0, 6).map((value, index) => ({
            subject: `Metric ${index + 1}`,
            value: isNaN(Number(value)) ? 0 : Number(value),
            fullMark: Math.max(...columnData.map(v => isNaN(Number(v)) ? 0 : Number(v)))
          }));
        } else {
          chartData = columnData.map((value, index) => ({
            name: `Point ${index + 1}`,
            value: isNaN(Number(value)) ? 0 : Number(value)
          }));
        }
        
        chartTitle = `${selectedColumn}`;
      }
      
      const customChart = {
        type: customChartType,
        data: chartData,
        title: `${chartTitle} - ${customChartType.charAt(0).toUpperCase() + customChartType.slice(1)} Chart`,
        xAxis: 'name',
        yAxis: 'value'
      };
      
      // Add to existing analysis result
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          charts: [...analysisResult.charts.filter((c: any) => !c.title.includes('Custom:')), 
                   { ...customChart, title: `Custom: ${customChart.title}` }]
        });
      }
    } finally {
      setIsGeneratingCustomChart(false);
    }
  };

  // Linear Regression calculation
  const calculateLinearRegression = (xData: number[], yData: number[]) => {
    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((acc, x, i) => acc + x * yData[i], 0);
    const sumXX = xData.reduce((acc, x) => acc + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = yData.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssResidual = yData.reduce((acc, y, i) => {
      const predicted = slope * xData[i] + intercept;
      return acc + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  };

  // Generate prediction line data
  const generatePredictionLine = (xData: number[], slope: number, intercept: number) => {
    const minX = Math.min(...xData);
    const maxX = Math.max(...xData);
    const step = (maxX - minX) / 20;
    
    const lineData = [];
    for (let x = minX; x <= maxX; x += step) {
      lineData.push({
        x: x,
        y: slope * x + intercept,
        predicted: true
      });
    }
    return lineData;
  };

  // Generate AI description using OpenAI
  const generatePredictionDescription = async (slope: number, intercept: number, rSquared: number, xColumn: string, yColumn: string) => {
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('generate-prediction-description', {
        body: { slope, intercept, rSquared, xColumn, yColumn }
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      return result.description;
    } catch (error) {
      console.error('Error generating AI description:', error);
      // Fallback description
      const correlation = slope > 0 ? 'positive' : 'negative';
      const strength = rSquared > 0.7 ? 'strong' : rSquared > 0.4 ? 'moderate' : 'weak';
      return `There is a ${strength} ${correlation} correlation between ${xColumn} and ${yColumn}. The R² score is ${(rSquared * 100).toFixed(1)}%, indicating ${strength} predictive power. ${slope > 0 ? `As ${xColumn} increases, ${yColumn} tends to increase` : `As ${xColumn} increases, ${yColumn} tends to decrease`}.`;
    }
  };

  const performPredictiveAnalysis = async () => {
    if (!predictiveXColumn || !predictiveYColumn) return;
    
    setIsGeneratingPrediction(true);
    try {
      const xColumnIndex = columns.indexOf(predictiveXColumn);
      const yColumnIndex = columns.indexOf(predictiveYColumn);
      
      if (xColumnIndex === -1 || yColumnIndex === -1) return;
      
      // Extract and clean data
      const rawData = data.slice(1).map(row => ({
        x: row[xColumnIndex],
        y: row[yColumnIndex]
      })).filter(item => 
        item.x !== null && item.x !== undefined && item.x !== '' &&
        item.y !== null && item.y !== undefined && item.y !== '' &&
        !isNaN(Number(item.x)) && !isNaN(Number(item.y))
      );
      
      if (rawData.length < 2) {
        console.error('Insufficient numeric data for regression');
        return;
      }
      
      const xData = rawData.map(item => Number(item.x));
      const yData = rawData.map(item => Number(item.y));
      
      // Calculate linear regression
      const regression = calculateLinearRegression(xData, yData);
      const predictionLine = generatePredictionLine(xData, regression.slope, regression.intercept);
      
      // Generate AI description
      const description = await generatePredictionDescription(
        regression.slope, 
        regression.intercept, 
        regression.rSquared, 
        predictiveXColumn, 
        predictiveYColumn
      );
      
      // Prepare chart data
      const scatterData = rawData.map((item, index) => ({
        x: Number(item.x),
        y: Number(item.y),
        name: `Data Point ${index + 1}`,
        predicted: false
      }));
      
      const chartData = [...scatterData, ...predictionLine];
      
      setPredictionResult({
        regression,
        chartData,
        description,
        scatterData,
        predictionLine
      });
      
    } finally {
      setIsGeneratingPrediction(false);
    }
  };

  // Time Series Analysis Functions
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try various date formats
    const formats = [
      // Standard ISO format
      () => new Date(dateStr),
      // MM/DD/YYYY
      () => {
        const parts = dateStr.split('/');
        if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        return null;
      },
      // DD/MM/YYYY (if month > 12)
      () => {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parseInt(parts[0]) > 12) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return null;
      },
      // MM-DD-YYYY
      () => {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length <= 2) return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        return null;
      }
    ];
    
    for (const format of formats) {
      try {
        const date = format();
        if (date && !isNaN(date.getTime())) return date;
      } catch (e) {
        continue;
      }
    }
    
    return null;
  };

  const calculateMovingAverage = (values: number[], windowSize: number = 3): number[] => {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(values.length, i + Math.ceil(windowSize / 2));
      const sum = values.slice(start, end).reduce((a, b) => a + b, 0);
      result.push(sum / (end - start));
    }
    return result;
  };

  const generateTimeForecast = (timeData: Date[], valueData: number[], forecastPeriods: number = 6): any[] => {
    // Simple linear trend forecasting
    const timeNumbers = timeData.map(d => d.getTime());
    const regression = calculateLinearRegression(timeNumbers, valueData);
    
    const lastDate = timeData[timeData.length - 1];
    const timeInterval = timeNumbers.length > 1 ? 
      (timeNumbers[timeNumbers.length - 1] - timeNumbers[0]) / (timeNumbers.length - 1) : 
      24 * 60 * 60 * 1000; // Default to 1 day
    
    const forecast: any[] = [];
    for (let i = 1; i <= forecastPeriods; i++) {
      const futureDate = new Date(lastDate.getTime() + i * timeInterval);
      const forecastValue = regression.slope * futureDate.getTime() + regression.intercept;
      forecast.push({
        date: futureDate,
        value: forecastValue,
        isForecast: true,
        confidence: Math.max(0.1, regression.rSquared) // Use R² as confidence proxy
      });
    }
    
    return forecast;
  };

  const generateTimeSeriesDescription = async (
    trend: 'increasing' | 'decreasing' | 'stable',
    seasonality: boolean,
    forecast: any[],
    rSquared: number,
    dateColumn: string,
    valueColumn: string
  ) => {
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('generate-prediction-description', {
        body: { 
          timeSeriesAnalysis: true,
          trend,
          seasonality,
          forecast: forecast.slice(0, 3), // First 3 predictions
          rSquared,
          dateColumn,
          valueColumn
        }
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      return result.description;
    } catch (error) {
      console.error('Error generating time series description:', error);
      // Fallback description
      const trendText = trend === 'increasing' ? 'upward' : trend === 'decreasing' ? 'downward' : 'stable';
      const seasonalText = seasonality ? 'with seasonal patterns' : 'without clear seasonality';
      const confidenceText = rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'moderate' : 'low';
      
      return `The time series analysis of ${valueColumn} over ${dateColumn} shows a ${trendText} trend ${seasonalText}. Based on historical data, the forecast has ${confidenceText} confidence (R² = ${(rSquared * 100).toFixed(1)}%). ${
        trend === 'increasing' ? `${valueColumn} is expected to continue growing.` : 
        trend === 'decreasing' ? `${valueColumn} is projected to decline further.` :
        `${valueColumn} is likely to remain relatively stable.`
      }`;
    }
  };

  const performTimeSeriesAnalysis = async () => {
    if (!timeSeriesDateColumn || !timeSeriesValueColumn) return;
    
    setIsGeneratingTimeSeries(true);
    try {
      const dateColumnIndex = columns.indexOf(timeSeriesDateColumn);
      const valueColumnIndex = columns.indexOf(timeSeriesValueColumn);
      
      if (dateColumnIndex === -1 || valueColumnIndex === -1) return;
      
      // Extract and clean data
      const rawData = data.slice(1).map(row => ({
        date: row[dateColumnIndex],
        value: row[valueColumnIndex]
      })).filter(item => 
        item.date !== null && item.date !== undefined && item.date !== '' &&
        item.value !== null && item.value !== undefined && item.value !== '' &&
        !isNaN(Number(item.value))
      );
      
      if (rawData.length < 3) {
        console.error('Insufficient data for time series analysis');
        return;
      }
      
      // Parse dates and sort by date
      const parsedData = rawData.map(item => ({
        date: parseDate(String(item.date)),
        value: Number(item.value)
      })).filter(item => item.date !== null);
      
      parsedData.sort((a, b) => a.date!.getTime() - b.date!.getTime());
      
      const dates = parsedData.map(item => item.date!);
      const values = parsedData.map(item => item.value);
      
      // Calculate trend
      const timeNumbers = dates.map(d => d.getTime());
      const regression = calculateLinearRegression(timeNumbers, values);
      const trend = regression.slope > 0.01 ? 'increasing' : regression.slope < -0.01 ? 'decreasing' : 'stable';
      
      // Simple seasonality detection (check for recurring patterns)
      const seasonality = values.length > 12 && Math.abs(regression.rSquared) < 0.8; // If not well explained by linear trend
      
      // Generate forecast
      const forecast = generateTimeForecast(dates, values, 6);
      
      // Calculate moving average for smoothing
      const smoothedValues = calculateMovingAverage(values, 3);
      
      // Prepare chart data
      const historicalData = parsedData.map((item, index) => ({
        date: item.date!.toISOString().split('T')[0],
        value: item.value,
        smoothed: smoothedValues[index],
        isForecast: false
      }));
      
      const forecastData = forecast.map(item => ({
        date: item.date.toISOString().split('T')[0],
        value: item.value,
        isForecast: true,
        confidence: item.confidence
      }));
      
      const chartData = [...historicalData, ...forecastData];
      
      // Generate AI description
      const description = await generateTimeSeriesDescription(
        trend,
        seasonality,
        forecast,
        regression.rSquared,
        timeSeriesDateColumn,
        timeSeriesValueColumn
      );
      
      setTimeSeriesResult({
        chartData,
        historicalData,
        forecastData,
        trend,
        seasonality,
        regression,
        description,
        stats: {
          totalPoints: parsedData.length,
          forecastPoints: forecast.length,
          confidenceScore: regression.rSquared
        }
      });
      
    } finally {
      setIsGeneratingTimeSeries(false);
    }
  };

  const renderChart = (chart: any) => {
    const commonProps = {
      width: '100%',
      height: 200,
      data: chart.data
    };

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={chart.yAxis || 'value'} stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.yAxis || 'value'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey={chart.yAxis || 'value'} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chart.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'stacked-bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.yAxis || 'value'} stackId="a" fill="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />;
      case 'quality': return <Database className="h-5 w-5 text-blue-500 mt-0.5" />;
      case 'action': return <FileText className="h-5 w-5 text-purple-500 mt-0.5" />;
      default: return <Brain className="h-5 w-5 text-primary mt-0.5" />;
    }
  };

  const exportBIReport = async () => {
    if (!analysisResult) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 20;
      
      // Add logo
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = '/lovable-uploads/f8953591-fc49-4dd1-9fdf-6d69cf74426b.png';
        });
        
        // Add logo to PDF (centered, small size)
        const logoSize = 15; // 15mm
        const logoX = (pageWidth - logoSize) / 2;
        pdf.addImage(logoImg, 'PNG', logoX, yOffset - 5, logoSize, logoSize);
        yOffset += logoSize + 5;
      } catch (error) {
        console.log('Could not load logo for PDF');
      }
      
      // Header with branding
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SmartBiz AI – BI Dashboard Report', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 15;
      
      // Metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const timestamp = new Date().toLocaleString();
      const filename = `Report_${new Date().toISOString().split('T')[0]}`;
      pdf.text(`Generated: ${timestamp}`, 20, yOffset);
      yOffset += 5;
      pdf.text(`Filename: ${filename}`, 20, yOffset);
      yOffset += 5;
      pdf.text(`Dataset: ${analysisResult.statistics?.totalRecords || data.length - 1} records, ${columns.length} columns`, 20, yOffset);
      yOffset += 15;
      
      // AI-Generated Key Insights
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI-Generated Key Insights', 20, yOffset);
      yOffset += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (analysisResult.insights) {
        analysisResult.insights.forEach((insight: any) => {
          const lines = pdf.splitTextToSize(`• ${insight.text}`, pageWidth - 40);
          pdf.text(lines, 25, yOffset);
          yOffset += lines.length * 5;
          if (yOffset > pageHeight - 20) {
            pdf.addPage();
            yOffset = 20;
          }
        });
      }
      yOffset += 10;
      
      // Statistical Analysis
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Statistical Analysis', 20, yOffset);
      yOffset += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (analysisResult.statistics) {
        const stats = analysisResult.statistics;
        pdf.text(`Total Records: ${stats.totalRecords || 'N/A'}`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Data Quality Score: ${analysisResult.qualityScore || 'N/A'}%`, 25, yOffset);
        yOffset += 5;
        
        if (stats.numericalStats) {
          Object.entries(stats.numericalStats).forEach(([column, data]: [string, any]) => {
            pdf.text(`${column}: Mean=${data.mean?.toFixed(2)}, Median=${data.median?.toFixed(2)}, Std Dev=${data.standardDeviation?.toFixed(2)}`, 25, yOffset);
            yOffset += 5;
            if (yOffset > pageHeight - 20) {
              pdf.addPage();
              yOffset = 20;
            }
          });
        }
      }
      yOffset += 10;
      
      // Charts section
      if (analysisResult.charts && analysisResult.charts.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Charts & Visualizations', 20, yOffset);
        yOffset += 10;
        
        // Capture chart screenshots
        const chartElements = document.querySelectorAll('[data-chart-container]');
        for (let i = 0; i < chartElements.length && i < analysisResult.charts.length; i++) {
          try {
            if (yOffset > pageHeight - 80) {
              pdf.addPage();
              yOffset = 20;
            }
            
            const canvas = await html2canvas(chartElements[i] as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 1.5
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 160;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(analysisResult.charts[i].title || `Chart ${i + 1}`, 20, yOffset);
            yOffset += 8;
            
            pdf.addImage(imgData, 'PNG', 25, yOffset, imgWidth, Math.min(imgHeight, 100));
            yOffset += Math.min(imgHeight, 100) + 15;
          } catch (error) {
            console.warn('Failed to capture chart:', error);
            pdf.setFontSize(10);
            pdf.text(`Chart: ${analysisResult.charts[i].title || `Chart ${i + 1}`} (Preview not available)`, 25, yOffset);
            yOffset += 10;
          }
        }
      }
      
      // Predictive Analysis section
      if (predictionResult) {
        if (yOffset > pageHeight - 60) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Predictive Analysis (Linear Regression)', 20, yOffset);
        yOffset += 10;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Variables: ${predictiveYColumn} vs ${predictiveXColumn}`, 20, yOffset);
        yOffset += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`R² Score: ${(predictionResult.regression.rSquared * 100).toFixed(1)}%`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Slope: ${predictionResult.regression.slope.toFixed(3)}`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Intercept: ${predictionResult.regression.intercept.toFixed(3)}`, 25, yOffset);
        yOffset += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Analysis:', 25, yOffset);
        yOffset += 5;
        
        pdf.setFont('helvetica', 'normal');
        const predictionLines = pdf.splitTextToSize(predictionResult.description, pageWidth - 50);
        pdf.text(predictionLines, 25, yOffset);
        yOffset += predictionLines.length * 4 + 15;
      }
      
      // Time Series Analysis section
      if (timeSeriesResult) {
        if (yOffset > pageHeight - 60) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📈 Time Series Analysis & Forecasting', 20, yOffset);
        yOffset += 10;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Variables: ${timeSeriesValueColumn} over ${timeSeriesDateColumn}`, 20, yOffset);
        yOffset += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Trend: ${timeSeriesResult.trend}`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Confidence: ${(timeSeriesResult.regression.rSquared * 100).toFixed(1)}%`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Data Points: ${timeSeriesResult.stats.totalPoints}`, 25, yOffset);
        yOffset += 5;
        pdf.text(`Forecasted Points: ${timeSeriesResult.stats.forecastPoints}`, 25, yOffset);
        yOffset += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Analysis:', 25, yOffset);
        yOffset += 5;
        
        pdf.setFont('helvetica', 'normal');
        const timeSeriesLines = pdf.splitTextToSize(timeSeriesResult.description, pageWidth - 50);
        pdf.text(timeSeriesLines, 25, yOffset);
        yOffset += timeSeriesLines.length * 4 + 10;
        
        // Forecast Summary
        if (timeSeriesResult.forecastData && timeSeriesResult.forecastData.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Forecast Summary (Next 3 Periods):', 25, yOffset);
          yOffset += 5;
          
          pdf.setFont('helvetica', 'normal');
          timeSeriesResult.forecastData.slice(0, 3).forEach((forecast: any) => {
            pdf.text(`${forecast.date}: ${forecast.value.toFixed(2)} (${(forecast.confidence * 100).toFixed(0)}% confidence)`, 30, yOffset);
            yOffset += 4;
          });
          yOffset += 10;
        }
      } else if (columnTypes.dateTime.length === 0) {
        if (yOffset > pageHeight - 30) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📈 Time Series Analysis & Forecasting', 20, yOffset);
        yOffset += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        if (columnTypes.dateTime.length === 0) {
          pdf.text('❌ No date/time columns detected automatically.', 25, yOffset);
          yOffset += 5;
          pdf.text('💡 Manual selection required: Choose a column containing dates/times in the dashboard.', 25, yOffset);
          yOffset += 5;
          pdf.text('📋 Supported formats: YYYY-MM-DD, MM/DD/YYYY, timestamps, etc.', 25, yOffset);
        } else {
          pdf.text('⚠️ Time series analysis not configured (requires column selection in dashboard).', 25, yOffset);
        }
        yOffset += 15;
      }
      
      // Custom Charts section
      const customChartsData = analysisResult.charts.filter((chart: any) => chart.title.includes('Custom:'));
      if (customChartsData.length > 0) {
        if (yOffset > pageHeight - 40) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Custom Visualizations', 20, yOffset);
        yOffset += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        customChartsData.forEach((chart: any, index: number) => {
          pdf.text(`${index + 1}. ${chart.title} (${chart.type} chart)`, 25, yOffset);
          if (chart.xAxis && chart.yAxis) {
            pdf.text(`   X-Axis: ${chart.xAxis}, Y-Axis: ${chart.yAxis}`, 25, yOffset + 4);
            yOffset += 8;
          } else {
            yOffset += 5;
          }
          
          if (yOffset > pageHeight - 20) {
            pdf.addPage();
            yOffset = 20;
          }
        });
        yOffset += 10;
      }
      pdf.save(`smartbiz-ai-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      // Fallback to JSON export
      const report = {
        title: 'SmartBiz AI - BI Analysis Report',
        generatedAt: new Date().toISOString(),
        datasetInfo: {
          totalRecords: analysisResult.statistics?.totalRecords || data.length - 1,
          totalColumns: columns.length,
          columns: columns
        },
        statistics: analysisResult.statistics,
        qualityScore: analysisResult.qualityScore,
        insights: analysisResult.insights,
        charts: analysisResult.charts.map((chart: any) => ({
          title: chart.title,
          type: chart.type,
          dataPoints: chart.data?.length || 0
        }))
      };
      
      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartbiz-ai-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">BI Dashboard</DialogTitle>
          <div className="flex items-center gap-2">
            {analysisResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportBIReport}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-2" />
                Export BI Report
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Spreadsheet
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <div className="text-center">
                <p className="text-lg font-medium">⚡ SmartBiz AI is analyzing your data</p>
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p>Error analyzing data: {error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && data.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-2" />
                  <p>No data uploaded yet</p>
                  <p className="text-sm">Upload data first to see AI-powered insights</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && !loading && (
            <>
              {/* Charts Section */}
              <div className={`grid gap-6 ${
                analysisResult.charts.length === 1 
                  ? 'grid-cols-1 place-items-center' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                {analysisResult.charts.map((chart: any, index: number) => (
                  <Card key={index} className={analysisResult.charts.length === 1 ? 'w-full max-w-2xl' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">{chart.title}</CardTitle>
                      {chart.type === 'pie' ? (
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="h-48" data-chart-container>
                        {renderChart(chart)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && analysisResult && (
            <>
              {/* Column Selection Interface */}
              {showColumnSelection && (
                <Card className="border-dashed border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Select Columns for Visualization
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose columns to generate dynamic charts and insights
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Revenue Column Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Revenue Trends</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select a numerical column to visualize as Revenue Trends
                        </p>
                        <Select value={selectedRevenueColumn} onValueChange={setSelectedRevenueColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose numerical column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {columnTypes.numerical.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category Column Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Market Share</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select a categorical column to visualize Market Share
                        </p>
                        <Select value={selectedCategoryColumn} onValueChange={setSelectedCategoryColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose categorical column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {columnTypes.categorical.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={generateCustomCharts}
                        disabled={!selectedRevenueColumn && !selectedCategoryColumn || isGeneratingCharts}
                        className="flex-1"
                      >
                        {isGeneratingCharts ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Charts...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Visualizations
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetSelections}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Visualization Section - Centered Layout */}
              {showColumnSelection && (
                <div className="flex justify-center">
                  <Card className="border-2 border-dashed border-accent/30 w-full max-w-4xl">
                    <CardHeader>
                      <CardTitle className="text-base font-medium flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Custom Visualization
                      </CardTitle>
                       <p className="text-sm text-muted-foreground text-center">
                         Create custom charts by selecting columns for bi-variate analysis (e.g., Revenue vs Region, Sales vs Month)
                       </p>
                    </CardHeader>
                     <CardContent className="space-y-6">
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         <div className="space-y-3">
                           <h4 className="font-medium text-center">Column 1 (X-Axis / Grouping)</h4>
                           <Select value={customSelectedColumnX} onValueChange={setCustomSelectedColumnX}>
                             <SelectTrigger>
                               <SelectValue placeholder="Choose X-axis column..." />
                             </SelectTrigger>
                             <SelectContent>
                               {columns.map((col) => (
                                 <SelectItem key={col} value={col}>{col}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>

                         <div className="space-y-3">
                           <h4 className="font-medium text-center">Column 2 (Y-Axis / Metric)</h4>
                           <Select value={customSelectedColumnY} onValueChange={setCustomSelectedColumnY}>
                             <SelectTrigger>
                               <SelectValue placeholder="Choose Y-axis column..." />
                             </SelectTrigger>
                             <SelectContent>
                               {columns.map((col) => (
                                 <SelectItem key={col} value={col}>{col}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         
                         <div className="space-y-3">
                           <h4 className="font-medium text-center">Chart Type</h4>
                           <Select value={customChartType} onValueChange={(value) => setCustomChartType(value as any)}>
                             <SelectTrigger>
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="bar">Bar Chart</SelectItem>
                               <SelectItem value="line">Line Chart</SelectItem>
                               <SelectItem value="pie">Pie Chart</SelectItem>
                               <SelectItem value="area">Area Chart</SelectItem>
                               <SelectItem value="scatter">Scatter Plot</SelectItem>
                               <SelectItem value="radar">Radar Chart</SelectItem>
                               <SelectItem value="donut">Donut Chart</SelectItem>
                               <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                       
                       <div className="flex justify-center">
                         <Button 
                           onClick={generateCustomChart}
                           disabled={(!customSelectedColumnX && !customSelectedColumnY) || isGeneratingCustomChart}
                           className="w-full max-w-md"
                         >
                          {isGeneratingCustomChart ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating Chart...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Generate Custom Chart
                            </>
                          )}
                        </Button>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Predictive Analysis Section */}
              {showColumnSelection && (
                <div className="flex justify-center">
                  <Card className="border-2 border-dashed border-accent/30 w-full max-w-4xl">
                    <CardHeader>
                      <CardTitle className="text-base font-medium flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Predictive Analysis
                      </CardTitle>
                      <p className="text-sm text-muted-foreground text-center">
                        Perform linear regression analysis to predict relationships between numerical variables
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-center">X-Axis (Independent Variable)</h4>
                          <Select value={predictiveXColumn} onValueChange={setPredictiveXColumn}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select predictor column..." />
                            </SelectTrigger>
                            <SelectContent>
                              {columnTypes.numerical.map((col) => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-center">Y-Axis (Dependent Variable)</h4>
                          <Select value={predictiveYColumn} onValueChange={setPredictiveYColumn}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target column..." />
                            </SelectTrigger>
                            <SelectContent>
                              {columnTypes.numerical.map((col) => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          onClick={performPredictiveAnalysis}
                          disabled={!predictiveXColumn || !predictiveYColumn || isGeneratingPrediction}
                          className="w-full max-w-md"
                        >
                          {isGeneratingPrediction ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Generate Prediction
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Predictive Analysis Results */}
              {predictionResult && (
                <div className="flex justify-center">
                  <Card className="w-full max-w-4xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-center">
                        Linear Regression: {predictiveYColumn} vs {predictiveXColumn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Description */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Brain className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium mb-2">AI Analysis</h4>
                            <p className="text-sm text-muted-foreground">{predictionResult.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Regression Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {(predictionResult.regression.rSquared * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">R² Score</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {predictionResult.regression.slope.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground">Slope</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {predictionResult.regression.intercept.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground">Intercept</div>
                        </div>
                      </div>

                      {/* Scatter Plot with Regression Line */}
                      <div data-chart-container className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={predictionResult.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="x" 
                              type="number" 
                              domain={['dataMin', 'dataMax']}
                              name={predictiveXColumn}
                            />
                            <YAxis 
                              dataKey="y" 
                              type="number" 
                              domain={['dataMin', 'dataMax']}
                              name={predictiveYColumn}
                            />
                            <Tooltip 
                              formatter={(value, name) => [
                                typeof value === 'number' ? value.toFixed(2) : value, 
                                name === 'y' ? predictiveYColumn : predictiveXColumn
                              ]}
                            />
                            {/* Data points */}
                            <Scatter 
                              dataKey="y" 
                              fill="#8884d8" 
                              data={predictionResult.scatterData}
                              name="Actual Data"
                            />
                            {/* Regression line */}
                            <Line 
                              type="monotone" 
                              dataKey="y" 
                              stroke="#ff7300" 
                              strokeWidth={2}
                              dot={false}
                              data={predictionResult.predictionLine}
                              name="Regression Line"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Time Series Analysis Section - Always Visible */}
              <div className="flex justify-center">
                <Card className="border-2 border-dashed border-accent/30 w-full max-w-4xl">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Time Series Analysis (Forecasting)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                      Analyze trends over time and generate forecasts for future periods
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {columnTypes.dateTime.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No date column detected. Please upload data with a Date/Time column to run Time Series Analysis.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-center">Date/Time Column</h4>
                            <Select value={timeSeriesDateColumn} onValueChange={setTimeSeriesDateColumn}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date column..." />
                              </SelectTrigger>
                              <SelectContent>
                                {columnTypes.dateTime.map((col) => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium text-center">Value Column (Metric)</h4>
                            <Select value={timeSeriesValueColumn} onValueChange={setTimeSeriesValueColumn}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select metric column..." />
                              </SelectTrigger>
                              <SelectContent>
                                {columnTypes.numerical.map((col) => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <Button 
                            onClick={performTimeSeriesAnalysis}
                            disabled={!timeSeriesDateColumn || !timeSeriesValueColumn || isGeneratingTimeSeries}
                            className="w-full max-w-md"
                          >
                            {isGeneratingTimeSeries ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing & Forecasting...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Generate Time Series Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Time Series Analysis Results */}
              {timeSeriesResult && (
                <div className="flex justify-center">
                  <Card className="w-full max-w-5xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-center">
                        Time Series Forecast: {timeSeriesValueColumn} over {timeSeriesDateColumn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Description */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Brain className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium mb-2">AI Time Series Analysis</h4>
                            <p className="text-sm text-muted-foreground">{timeSeriesResult.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Time Series Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {timeSeriesResult.trend === 'increasing' ? '↗️' : timeSeriesResult.trend === 'decreasing' ? '↘️' : '➡️'}
                          </div>
                          <div className="text-sm text-muted-foreground">Trend</div>
                          <div className="text-xs font-medium mt-1 capitalize">{timeSeriesResult.trend}</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {(timeSeriesResult.regression.rSquared * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {timeSeriesResult.stats.totalPoints}
                          </div>
                          <div className="text-sm text-muted-foreground">Data Points</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-primary">
                            {timeSeriesResult.stats.forecastPoints}
                          </div>
                          <div className="text-sm text-muted-foreground">Forecasted</div>
                        </div>
                      </div>

                      {/* Time Series Chart */}
                      <div data-chart-container className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={timeSeriesResult.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              type="category"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              name={timeSeriesValueColumn}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              formatter={(value, name) => [
                                typeof value === 'number' ? value.toFixed(2) : value, 
                                name === 'value' ? timeSeriesValueColumn : name
                              ]}
                              labelFormatter={(date) => `Date: ${date}`}
                            />
                            {/* Historical data line */}
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              connectNulls={false}
                              name="Historical Data"
                            />
                            {/* Smoothed trend line */}
                            <Line 
                              type="monotone" 
                              dataKey="smoothed" 
                              stroke="#82ca9d" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                              connectNulls={false}
                              name="Trend (Smoothed)"
                            />
                            {/* Forecast data */}
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#ff7300" 
                              strokeWidth={2}
                              strokeDasharray="8 4"
                              dot={{ r: 4, fill: '#ff7300' }}
                              connectNulls={false}
                              name="Forecast"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Forecast Summary */}
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 text-center">Forecast Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {timeSeriesResult.forecastData.slice(0, 3).map((forecast: any, index: number) => (
                            <div key={index} className="text-center p-2 bg-background rounded border">
                              <div className="font-medium">{forecast.date}</div>
                              <div className="text-lg font-bold text-primary">{forecast.value.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                Confidence: {(forecast.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* No data available placeholder */}
              {analysisResult.charts.length === 0 && !showColumnSelection && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                          <p>No numerical data detected</p>
                          <p className="text-sm">Upload data with numerical columns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Market Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <PieChart className="h-12 w-12 mx-auto mb-2" />
                          <p>No categorical data detected</p>
                          <p className="text-sm">Upload data with text/category columns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">AI-Generated Key Insights</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.insights.map((insight: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">AI-Generated Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Statistical Analysis</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisResult.statistics.mean ? `$${analysisResult.statistics.mean.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Mean Value</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {analysisResult.statistics.median ? `$${analysisResult.statistics.median.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Median Value</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {analysisResult.statistics.stdDev ? `±${analysisResult.statistics.stdDev.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Std Deviation</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResult.statistics.totalRecords}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                </div>
                <div className="mt-4 text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {analysisResult.qualityScore}%
                  </p>
                  <p className="text-sm text-muted-foreground">Data Quality Score</p>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-8 w-20 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Data Summary</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Dataset Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Rows:</span>
                        <span className="font-medium">{analysisResult.statistics.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Columns:</span>
                        <span className="font-medium">{columns.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Quality:</span>
                        <span className="font-medium text-primary">{analysisResult.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Column Names</h4>
                    <div className="max-h-24 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {columns.slice(0, 10).map((col, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                            {col}
                          </span>
                        ))}
                        {columns.length > 10 && (
                          <span className="text-xs text-muted-foreground">
                            +{columns.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}