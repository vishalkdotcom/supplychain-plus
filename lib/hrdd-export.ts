/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Supplier } from "@/types";

interface HRDDReportData {
  supplier: Supplier;
  generatedDate: string;
  auditorName: string;
  narrative?: string;
  frameworkName?: string;
}

export const generateHRDDReport = (data: HRDDReportData) => {
  const doc = new jsPDF();
  const { supplier, generatedDate, auditorName, narrative, frameworkName } = data;

  // Title
  doc.setFontSize(20);
  doc.text(frameworkName ? `${frameworkName} Compliance Report` : "HRDD Compliance Report", 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${generatedDate}`, 14, 30);
  doc.text(`Auditor: ${auditorName}`, 14, 35);

  let currentY = 45;

  // AI Narrative Section
  if (narrative) {
    doc.setDrawColor(200);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Executive Summary (AI Generated)", 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(50);
    
    // Split text to fit width
    const splitText = doc.splitTextToSize(narrative, 180);
    doc.text(splitText, 14, currentY);
    
    // Calculate new Y based on number of lines
    currentY += (splitText.length * 5) + 10;
  }

  // Supplier Info
  doc.setDrawColor(200);
  doc.line(14, currentY, 196, currentY);
  currentY += 10;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Supplier Profile", 14, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Field", "Value"]],
    body: [
      ["Name", supplier.name],
      ["Location", supplier.location],
      ["Risk Level", supplier.riskLevel.toUpperCase()],
      ["Risk Score", supplier.riskScore.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [63, 81, 181] },
  });

  // Risk Analysis
  const riskY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("Risk Analysis", 14, riskY);

  const riskData = [
    ["Cases", supplier.riskBreakdown.caseScore.toString()],
    ["Surveys", supplier.riskBreakdown.surveyScore.toString()],
    ["Training", supplier.riskBreakdown.trainingScore.toString()],
    ["Engagement", supplier.riskBreakdown.engagementScore.toString()],
  ];

  autoTable(doc, {
    startY: riskY + 5,
    head: [["Module", "Score"]],
    body: riskData,
    theme: "grid",
    headStyles: { fillColor: [220, 53, 69] }, // Red for risk
  });

  // Contributing Factors
  if (supplier.riskBreakdown.reasons.length > 0) {
    const reasonY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Contributing Factors", 14, reasonY);

    const reasonsData = supplier.riskBreakdown.reasons.map((r) => [
      r.factor,
      r.description,
      r.impact.toUpperCase(),
      r.module,
    ]);

    autoTable(doc, {
      startY: reasonY + 5,
      head: [["Factor", "Description", "Impact", "Source"]],
      body: reasonsData,
      styles: { fontSize: 8 },
      columnStyles: { 1: { cellWidth: 80 } },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Confidential - Internal Use Only", 14, 285);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
  }

  doc.save(
    `HRDD_Report_${supplier.name.replace(/\s+/g, "_")}_${generatedDate.replace(/\//g, "-")}.pdf`,
  );
};
