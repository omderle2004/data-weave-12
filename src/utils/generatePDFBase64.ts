import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AIResponse {
  id: string;
  type: 'text' | 'code' | 'chart' | 'image' | 'table';
  content: string;
  timestamp: Date;
  chartData?: any[];
  chartType?: string;
  chartTitle?: string;
  insights?: string[];
  statistics?: any;
  tableData?: {
    title: string;
    columns: string[];
    rows: string[][];
  };
  intent?: string;
}

interface QuestionResponsePair {
  question: string;
  response: AIResponse;
}

async function captureChartImage(responseId: string): Promise<string | null> {
  const chartElement = document.querySelector(`[data-chart-id="${responseId}"]`);
  
  if (!chartElement) {
    console.log('Chart element not found for ID:', responseId);
    return null;
  }

  try {
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
}

export async function generatePDFBase64(
  projectName: string,
  questionResponsePairs: QuestionResponsePair[]
): Promise<string> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = margin;

  // Add logo and title
  pdf.setFontSize(24);
  pdf.setTextColor(51, 122, 183);
  pdf.text('SmartBiz Analysis Report', margin, yPosition);
  yPosition += 15;

  // Add project name
  pdf.setFontSize(14);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Project: ${projectName}`, margin, yPosition);
  yPosition += 10;

  // Add generation date
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 15;

  // Add separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Loop through each question-response pair
  for (let i = 0; i < questionResponsePairs.length; i++) {
    const { question, response } = questionResponsePairs[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // Add question
    pdf.setFontSize(12);
    pdf.setTextColor(51, 122, 183);
    pdf.text(`Q${i + 1}: ${question}`, margin, yPosition);
    yPosition += 10;

    // Add response content
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const lines = pdf.splitTextToSize(response.content, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Add chart if available
    if (response.type === 'chart' && response.chartData) {
      const chartImage = await captureChartImage(response.id);
      
      if (chartImage) {
        // Check if we need a new page for the chart
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        const imgWidth = contentWidth;
        const imgHeight = 80;
        
        pdf.addImage(chartImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }
    }

    // Add insights if available
    if (response.insights && response.insights.length > 0) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(40, 167, 69);
      pdf.text('Key Insights:', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      response.insights.forEach((insight) => {
        const insightLines = pdf.splitTextToSize(`• ${insight}`, contentWidth - 5);
        insightLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
      });
      yPosition += 5;
    }

    // Add statistics if available
    if (response.statistics) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(255, 152, 0);
      pdf.text('Statistics:', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      Object.entries(response.statistics).forEach(([key, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(`${key}: ${value}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Add table data if available
    if (response.tableData) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(153, 102, 255);
      pdf.text(response.tableData.title || 'Data Table:', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      
      // Add table headers
      const colWidth = contentWidth / response.tableData.columns.length;
      response.tableData.columns.forEach((col, idx) => {
        pdf.text(col, margin + (idx * colWidth), yPosition);
      });
      yPosition += 6;

      // Add table rows (limit to first 10 rows)
      const maxRows = Math.min(response.tableData.rows.length, 10);
      for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        
        response.tableData.rows[rowIdx].forEach((cell, colIdx) => {
          const cellText = String(cell).substring(0, 20);
          pdf.text(cellText, margin + (colIdx * colWidth), yPosition);
        });
        yPosition += 5;
      }
      
      if (response.tableData.rows.length > maxRows) {
        pdf.text(`... and ${response.tableData.rows.length - maxRows} more rows`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Add separator between Q&A pairs
    if (i < questionResponsePairs.length - 1) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }
  }

  // Return PDF as base64
  return pdf.output('datauristring');
}
