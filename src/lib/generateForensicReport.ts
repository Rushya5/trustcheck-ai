import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tables } from '@/integrations/supabase/types';

type AnalysisResult = Tables<'analysis_results'>;

interface ReportOptions {
  analysis: AnalysisResult;
  caseName?: string;
  mediaFileName?: string;
}

export async function generateForensicReport({ analysis, caseName, mediaFileName }: ReportOptions): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FORENSIC ANALYSIS REPORT', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toISOString()}`, margin, 35);
  doc.text(`Report ID: ${analysis.id.substring(0, 8).toUpperCase()}`, pageWidth - margin - 50, 35);

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Case Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const caseInfo = [
    ['Case Name', caseName || 'N/A'],
    ['Media File', mediaFileName || 'N/A'],
    ['Analysis ID', analysis.id],
    ['Status', analysis.status.toUpperCase()],
    ['Started', analysis.processing_started_at ? new Date(analysis.processing_started_at).toLocaleString() : 'N/A'],
    ['Completed', analysis.completed_at ? new Date(analysis.completed_at).toLocaleString() : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: caseInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Credibility Assessment Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CREDIBILITY ASSESSMENT', margin, yPosition);
  yPosition += 8;

  doc.setDrawColor(59, 130, 246);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Credibility Score Box
  const credScore = Number(analysis.credibility_score) || 0;
  const scoreColor = credScore >= 70 ? [34, 197, 94] : credScore >= 40 ? [251, 191, 36] : [239, 68, 68];
  
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(margin, yPosition, 50, 30, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${credScore}%`, margin + 25, yPosition + 18, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Credibility Level: ${(analysis.credibility_level || 'unknown').toUpperCase()}`, margin + 60, yPosition + 10);
  
  const levelDescription = analysis.credibility_level === 'likely_authentic' 
    ? 'This media appears to be authentic with no significant manipulation detected.'
    : analysis.credibility_level === 'uncertain'
    ? 'This media contains elements that warrant further investigation.'
    : 'This media shows clear signs of manipulation or synthesis.';
  
  doc.text(levelDescription, margin + 60, yPosition + 20, { maxWidth: pageWidth - margin - 80 });
  
  yPosition += 40;

  // Analysis Results Section
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILED ANALYSIS RESULTS', margin, yPosition);
  yPosition += 8;

  doc.setDrawColor(59, 130, 246);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Visual Analysis
  const visualStatus = analysis.visual_manipulation_detected ? 'DETECTED' : 'NOT DETECTED';
  const visualColor: [number, number, number] = analysis.visual_manipulation_detected ? [239, 68, 68] : [34, 197, 94];
  const visualArtifacts = (analysis.visual_artifacts as string[]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: [['Visual Analysis', 'Status', 'Confidence']],
    body: [
      ['Manipulation Detection', visualStatus, `${((Number(analysis.visual_confidence) || 0) * 100).toFixed(1)}%`]
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      1: { textColor: visualColor }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 5;

  if (visualArtifacts.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Findings:', margin, yPosition);
    yPosition += 5;
    visualArtifacts.forEach((artifact) => {
      doc.text(`• ${artifact}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Audio Analysis
  checkPageBreak(40);
  const audioStatus = analysis.audio_manipulation_detected ? 'DETECTED' : 'NOT DETECTED';
  const audioColor: [number, number, number] = analysis.audio_manipulation_detected ? [239, 68, 68] : [34, 197, 94];
  const audioArtifacts = (analysis.audio_artifacts as string[]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: [['Audio Analysis', 'Status', 'Confidence']],
    body: [
      ['Manipulation Detection', audioStatus, `${((Number(analysis.audio_confidence) || 0) * 100).toFixed(1)}%`]
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      1: { textColor: audioColor }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 5;

  if (audioArtifacts.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Findings:', margin, yPosition);
    yPosition += 5;
    audioArtifacts.forEach((artifact) => {
      doc.text(`• ${artifact}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Metadata Analysis
  checkPageBreak(60);
  const metadataIssues = (analysis.metadata_issues as string[]) || [];
  const exifData = (analysis.exif_data as Record<string, string>) || {};

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Metadata Analysis', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Integrity Score: ${((Number(analysis.metadata_integrity_score) || 0) * 100).toFixed(1)}%`, margin, yPosition);
  yPosition += 8;

  if (Object.keys(exifData).length > 0) {
    const exifRows = Object.entries(exifData).map(([key, value]) => [key, String(value)]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['EXIF Property', 'Value']],
      body: exifRows,
      headStyles: { fillColor: [100, 116, 139], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  if (metadataIssues.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Issues Found:', margin, yPosition);
    yPosition += 5;
    metadataIssues.forEach((issue) => {
      doc.text(`• ${issue}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Explanations Section
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYSIS EXPLANATIONS', margin, yPosition);
  yPosition += 8;

  doc.setDrawColor(59, 130, 246);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  if (analysis.plain_explanation) {
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Plain Language Summary', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const plainLines = doc.splitTextToSize(analysis.plain_explanation, pageWidth - margin * 2);
    doc.text(plainLines, margin, yPosition);
    yPosition += plainLines.length * 5 + 10;
  }

  if (analysis.technical_explanation) {
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Analysis', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const techLines = doc.splitTextToSize(analysis.technical_explanation, pageWidth - margin * 2);
    doc.text(techLines, margin, yPosition);
    yPosition += techLines.length * 5 + 10;
  }

  if (analysis.legal_explanation) {
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Legal Considerations', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const legalLines = doc.splitTextToSize(analysis.legal_explanation, pageWidth - margin * 2);
    doc.text(legalLines, margin, yPosition);
    yPosition += legalLines.length * 5 + 10;
  }

  // Blockchain Verification Section
  if (analysis.blockchain_tx_id || analysis.sha256_hash) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BLOCKCHAIN VERIFICATION', margin, yPosition);
    yPosition += 8;

    doc.setDrawColor(34, 197, 94);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 40, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (analysis.sha256_hash) {
      doc.setFont('helvetica', 'bold');
      doc.text('SHA-256 Hash:', margin + 5, yPosition + 10);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text(analysis.sha256_hash, margin + 5, yPosition + 18);
    }
    
    if (analysis.blockchain_tx_id) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Transaction ID:', margin + 5, yPosition + 28);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text(analysis.blockchain_tx_id, margin + 5, yPosition + 36);
    }

    yPosition += 50;

    if (analysis.blockchain_verified_at) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Verified on: ${new Date(analysis.blockchain_verified_at).toLocaleString()}`, margin, yPosition);
    }
  }

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Forensic Analysis Report | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `forensic-report-${analysis.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
