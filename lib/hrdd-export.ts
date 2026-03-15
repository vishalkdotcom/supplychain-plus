import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Supplier, EvidenceLink } from "@/types";

/** jspdf-autotable adds `lastAutoTable` to the jsPDF instance at runtime but doesn't ship type augmentations (v5.0.7) */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

interface HRDDReportData {
  supplier: Supplier;
  generatedDate: string;
  auditorName: string;
  narrative?: string;
  frameworkName?: string;
  evidence?: EvidenceLink[];
}

export const generateHRDDReport = (data: HRDDReportData) => {
  const doc = new jsPDF();
  const { supplier, generatedDate, auditorName, narrative, frameworkName, evidence } = data;

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
  const riskY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 15;
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
    const reasonY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 15;
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

  // Supporting Evidence
  if (evidence && evidence.length > 0) {
    const evidenceY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Supporting Evidence", 14, evidenceY);

    const moduleLabel: Record<string, string> = {
      connect: "Connect (Cases)",
      engage: "Engage (Surveys)",
      educate: "Educate (Training)",
    };

    const evidenceData = evidence.map((e) => [
      moduleLabel[e.module] || e.module,
      e.referenceId,
      e.title,
      e.date,
      e.relevance,
    ]);

    autoTable(doc, {
      startY: evidenceY + 5,
      head: [["Module", "Ref ID", "Title", "Date", "Relevance"]],
      body: evidenceData,
      styles: { fontSize: 7 },
      columnStyles: { 2: { cellWidth: 50 }, 4: { cellWidth: 45 } },
      headStyles: { fillColor: [40, 167, 69] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
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
