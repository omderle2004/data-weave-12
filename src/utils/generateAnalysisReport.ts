import jsPDF from 'jspdf';
import smartbizLogo from '@/assets/smartbiz-logo.png';

interface AIResponse {
  id: string;
  type: 'text' | 'code' | 'chart' | 'image' | 'table';
  content: string;
  timestamp: Date;
  chartData?: any[];
  chartType?: string;
  chartTitle?: string;
  chartImage?: string; // Base64 image data for embedding in PDF
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

export async function generateAnalysisReport(
  projectName: string,
  questionResponsePairs: QuestionResponsePair[]
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Add logo at the top
  try {
    const img = new Image();
    img.src = smartbizLogo;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Add logo (centered, 30x30)
    const logoSize = 30;
    const logoX = (pageWidth - logoSize) / 2;
    pdf.addImage(img, 'PNG', logoX, yPosition, logoSize, logoSize);
    yPosition += logoSize + 10;
  } catch (error) {
    console.error('Error loading logo:', error);
    yPosition += 10;
  }

  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SmartBiz Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Add project name
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Project: ${projectName}`, 20, yPosition);
  yPosition += 10;

  // Add date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(`Generated: ${currentDate}`, 20, yPosition);
  yPosition += 15;

  // Add section header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SmartBiz Output – Your Virtual Analyst', 20, yPosition);
  yPosition += 10;

  // Check if there are any responses
  if (!questionResponsePairs || questionResponsePairs.length === 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.text('No analysis found. Please ask a question to generate insights.', 20, yPosition);
  } else {
    // Add each question and response
    for (let index = 0; index < questionResponsePairs.length; index++) {
      const pair = questionResponsePairs[index];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add question number and text
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Q${index + 1}: ${pair.question}`, 20, yPosition);
      yPosition += 8;

      // Add response
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      // Split long text into lines
      const responseText = pair.response.content || 'No response';
      const lines = pdf.splitTextToSize(responseText, pageWidth - 40);
      
      for (const line of lines) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }

      // Add chart visualization if available
      if (pair.response.chartImage) {
        yPosition += 5;
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Chart Visualization:', 20, yPosition);
        yPosition += 8;
        
        try {
          // Add the chart image to PDF
          const chartWidth = pageWidth - 40;
          const chartHeight = 80; // Fixed height for charts
          pdf.addImage(pair.response.chartImage, 'PNG', 20, yPosition, chartWidth, chartHeight);
          yPosition += chartHeight + 10;
        } catch (error) {
          console.error('Error adding chart image:', error);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Chart visualization unavailable', 25, yPosition);
          yPosition += 6;
        }
      } else if (pair.response.chartType && pair.response.chartTitle) {
        // Fallback: show chart metadata if image not available
        yPosition += 5;
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Chart Recommendation:', 20, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Type: ${pair.response.chartType}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Title: ${pair.response.chartTitle}`, 25, yPosition);
        yPosition += 6;
        
        if (pair.response.chartData && pair.response.chartData.length > 0) {
          pdf.text(`Data Points: ${pair.response.chartData.length}`, 25, yPosition);
          yPosition += 6;
        }
      }

      // Add insights if available
      if (pair.response.insights && pair.response.insights.length > 0) {
        yPosition += 5;
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Insights:', 20, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');

        for (const insight of pair.response.insights) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          const insightLines = pdf.splitTextToSize(`• ${insight}`, pageWidth - 45);
          for (const line of insightLines) {
            pdf.text(line, 25, yPosition);
            yPosition += 6;
          }
        }
      }

      // Add statistics if available
      if (pair.response.statistics) {
        yPosition += 5;
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Statistics:', 20, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');

        for (const [key, value] of Object.entries(pair.response.statistics)) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${key}: ${value}`, 25, yPosition);
          yPosition += 6;
        }
      }

      // Add table data if available
      if (pair.response.tableData) {
        yPosition += 5;
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Table: ${pair.response.tableData.title || 'Data Table'}`, 20, yPosition);
        yPosition += 8;
        
        // Add table headers
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const colWidth = (pageWidth - 40) / pair.response.tableData.columns.length;
        pair.response.tableData.columns.forEach((col, colIndex) => {
          pdf.text(col, 20 + (colIndex * colWidth), yPosition);
        });
        yPosition += 6;
        
        // Add table rows (limit to first 10 rows to save space)
        pdf.setFont('helvetica', 'normal');
        const rowsToShow = pair.response.tableData.rows.slice(0, 10);
        for (const row of rowsToShow) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          row.forEach((cell, colIndex) => {
            const cellText = pdf.splitTextToSize(cell.toString(), colWidth - 2);
            pdf.text(cellText[0], 20 + (colIndex * colWidth), yPosition);
          });
          yPosition += 6;
        }
        
        if (pair.response.tableData.rows.length > 10) {
          pdf.setFont('helvetica', 'italic');
          pdf.text(`... and ${pair.response.tableData.rows.length - 10} more rows`, 20, yPosition);
          yPosition += 6;
        }
        
        pdf.setFontSize(11);
      }

      yPosition += 10; // Space between Q&A pairs
    }
  }

  // Save the PDF
  const fileName = `${projectName.replace(/\s+/g, '_')}_Analysis_Report_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
}
