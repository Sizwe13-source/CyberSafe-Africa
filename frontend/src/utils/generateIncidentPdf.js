// src/utils/generateIncidentPdf.js
//
// Builds a professional, letterhead-style POPIA incident report PDF and
// triggers a browser download. Requires jsPDF:
//   npm install jspdf
import jsPDF from "jspdf";

const NAVY = [9, 14, 32];       // #090e20
const TEAL = [20, 184, 166];    // accent
const GREY = [110, 116, 130];
const MARGIN = 18;

function drawLetterhead(doc, report) {
  // Top navy band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 30, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("DataPulse", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 205, 215);
  doc.text("PROTECTION OF PERSONAL INFORMATION — INCIDENT REPORT", MARGIN, 22.5);

  // Thin teal accent rule under the band
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(1);
  doc.line(0, 30, 210, 30);

  // Report meta, right-aligned
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Report ID: ${report.reportId}`, 192, 12, { align: "right" });
  doc.text(`Filed: ${report.dateFiled}`, 192, 17, { align: "right" });

  doc.setTextColor(20, 20, 20);
}

function drawSeverityBadge(doc, severity, y) {
  const colors = {
    Low: [34, 197, 94],
    Medium: [234, 179, 8],
    High: [249, 115, 22],
    Critical: [239, 68, 68],
  };
  const c = colors[severity] || GREY;
  doc.setFillColor(...c);
  doc.roundedRect(160, y, 32, 7, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(severity.toUpperCase(), 176, y + 4.8, { align: "center" });
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
}

function sectionLabel(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, 192, y + 1.5);
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  return y + 8;
}

function field(doc, label, value, x, y, width) {
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(label.toUpperCase(), x, y);
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  const lines = doc.splitTextToSize(value || "—", width);
  doc.text(lines, x, y + 5.5);
  return y + 5.5 + lines.length * 5.5 + 4;
}

function ensureSpace(doc, y, needed) {
  if (y + needed > 275) {
    doc.addPage();
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, 210, 10, "F");
    return 20;
  }
  return y;
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 285, 192, 285);
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text("DataPulse · Confidential — contains personal information", MARGIN, 289);
    doc.text(`Page ${i} of ${pageCount}`, 192, 289, { align: "right" });
  }
}

/**
 * report: {
 *   reportId, dateFiled,
 *   incidentDate,
 *   supervisorName,
 *   employeeName,
 *   violationType,
 *   description,
 *   actionTaken,
 *   severity,             // "Low" | "Medium" | "High" | "Critical"
 *   supervisorConfirmed,  // boolean
 * }
 */
export function generateIncidentPdf(report) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawLetterhead(doc, report);
  drawSeverityBadge(doc, report.severity, 36);

  let y = 50;

  y = sectionLabel(doc, "Incident", y);
  y = field(doc, "Date of incident", report.incidentDate, MARGIN, y, 170);

  y = ensureSpace(doc, y, 20);
  y = sectionLabel(doc, "People involved", y);
  const colY = field(doc, "Reporting supervisor", report.supervisorName, MARGIN, y, 80);
  field(doc, "Individual reported", report.employeeName, 108, y, 80);
  y = colY;

  y = ensureSpace(doc, y, 20);
  y = sectionLabel(doc, "Violation", y);
  y = field(doc, "Type of violation", report.violationType, MARGIN, y, 170);

  y = ensureSpace(doc, y, 30);
  y = sectionLabel(doc, "Description", y);
  y = field(doc, "", report.description, MARGIN, y, 170);

  y = ensureSpace(doc, y, 30);
  y = sectionLabel(doc, "Action taken", y);
  y = field(doc, "", report.actionTaken, MARGIN, y, 170);

  y = ensureSpace(doc, y, 35);
  y = sectionLabel(doc, "Declaration", y);
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  const declaration = report.supervisorConfirmed
    ? `I, ${report.supervisorName}, confirm that the information in this report is accurate to the best of my knowledge.`
    : "Not confirmed by supervisor.";
  const declLines = doc.splitTextToSize(declaration, 170);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * 5.5 + 14;

  // Signature line
  y = ensureSpace(doc, y, 20);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + 70, y);
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Supervisor signature", MARGIN, y + 4);

  drawFooter(doc);
  doc.save(`incident-report-${report.reportId}.pdf`);
}