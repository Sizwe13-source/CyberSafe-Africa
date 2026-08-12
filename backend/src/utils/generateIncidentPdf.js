// src/utils/generateIncidentPdf.js
//
// Builds a formatted POPIA incident report PDF from a filed report object
// and triggers a browser download. Requires jsPDF:
//   npm install jspdf
import jsPDF from "jspdf";

const PAGE_MARGIN = 15;
const LINE_HEIGHT = 6;

function drawSectionHeading(doc, text, y) {
  doc.setFillColor(9, 14, 32); // #090e20 — matches app navy
  doc.rect(PAGE_MARGIN, y, 180, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text(text, PAGE_MARGIN + 3, y + 5.5);
  doc.setTextColor(20, 20, 20);
  doc.setFont(undefined, "normal");
  return y + 8 + 4;
}

function drawField(doc, label, value, x, y, width) {
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text(label, x, y);
  doc.setFont(undefined, "normal");
  const lines = doc.splitTextToSize(value || "—", width);
  doc.text(lines, x, y + LINE_HEIGHT);
  return y + LINE_HEIGHT + lines.length * LINE_HEIGHT + 2;
}

function drawWrappedBlock(doc, label, value, y) {
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text(label, PAGE_MARGIN, y);
  doc.setFont(undefined, "normal");
  const lines = doc.splitTextToSize(value || "—", 180);
  doc.text(lines, PAGE_MARGIN, y + LINE_HEIGHT);
  return y + LINE_HEIGHT + lines.length * LINE_HEIGHT + 4;
}

function ensureSpace(doc, y, needed) {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

/**
 * report: {
 *   reportId, dateFiled,
 *   incidentDate, incidentTime, locationOfIncident,
 *   supervisorName, supervisorPosition, supervisorEmail,
 *   employeeName, employeePosition, employeeDepartment,
 *   violationType,        // e.g. "Unauthorised disclosure"
 *   popiaConditions,      // array of selected condition labels
 *   description,
 *   dataSubjectsAffected, // free text: who / how many
 *   personalInfoInvolved, // what categories of personal info
 *   immediateActionTaken,
 *   recommendedAction,
 *   severity,             // "Low" | "Medium" | "High" | "Critical"
 *   reportedToRegulator,  // boolean
 *   supervisorConfirmed,  // boolean — declaration checkbox
 * }
 */
export function generateIncidentPdf(report) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(9, 14, 32);
  doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Cybersafe — POPIA Incident Report", PAGE_MARGIN, 12);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(
    "Protection of Personal Information Act, 2013 — internal violation report",
    PAGE_MARGIN,
    18
  );
  doc.setFontSize(8);
  doc.text(`Report ID: ${report.reportId}`, PAGE_MARGIN, 23);
  doc.text(`Filed: ${report.dateFiled}`, 140, 23);

  doc.setTextColor(20, 20, 20);
  let y = 34;

  // Severity flag
  const severityColors = {
    Low: [34, 197, 94],
    Medium: [234, 179, 8],
    High: [249, 115, 22],
    Critical: [239, 68, 68],
  };
  const sevColor = severityColors[report.severity] || [107, 114, 128];
  doc.setFillColor(...sevColor);
  doc.roundedRect(150, 30, 45, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text(`Severity: ${report.severity}`, 152, 35.5);
  doc.setTextColor(20, 20, 20);
  doc.setFont(undefined, "normal");

  y = drawSectionHeading(doc, "1. Incident Details", y);
  let colY = drawField(doc, "Date of incident", report.incidentDate, PAGE_MARGIN, y, 85);
  drawField(doc, "Time of incident", report.incidentTime, 110, y, 85);
  y = colY;
  y = drawWrappedBlock(doc, "Location", report.locationOfIncident, y);

  y = ensureSpace(doc, y, 30);
  y = drawSectionHeading(doc, "2. Reporting Supervisor", y);
  colY = drawField(doc, "Name", report.supervisorName, PAGE_MARGIN, y, 85);
  drawField(doc, "Position", report.supervisorPosition, 110, y, 85);
  y = colY;
  y = drawField(doc, "Contact email", report.supervisorEmail, PAGE_MARGIN, y, 180);

  y = ensureSpace(doc, y, 30);
  y = drawSectionHeading(doc, "3. Individual Involved", y);
  colY = drawField(doc, "Name", report.employeeName, PAGE_MARGIN, y, 85);
  drawField(doc, "Position", report.employeePosition, 110, y, 85);
  y = colY;
  y = drawField(doc, "Department", report.employeeDepartment, PAGE_MARGIN, y, 180);

  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, "4. Nature of Violation", y);
  y = drawField(doc, "Violation type", report.violationType, PAGE_MARGIN, y, 180);
  y = drawWrappedBlock(
    doc,
    "POPIA condition(s) implicated",
    (report.popiaConditions || []).join(", "),
    y
  );
  y = drawWrappedBlock(doc, "Personal information involved", report.personalInfoInvolved, y);
  y = drawWrappedBlock(doc, "Data subjects affected", report.dataSubjectsAffected, y);

  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, "5. Description of Incident", y);
  y = drawWrappedBlock(doc, "", report.description, y);

  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, "6. Response", y);
  y = drawWrappedBlock(doc, "Immediate action taken", report.immediateActionTaken, y);
  y = drawWrappedBlock(doc, "Recommended corrective action", report.recommendedAction, y);
  y = drawField(
    doc,
    "Reported to the Information Regulator?",
    report.reportedToRegulator ? "Yes" : "No",
    PAGE_MARGIN,
    y,
    180
  );

  y = ensureSpace(doc, y, 30);
  y = drawSectionHeading(doc, "7. Declaration", y);
  doc.setFontSize(9);
  const declaration = report.supervisorConfirmed
    ? `I, ${report.supervisorName}, confirm that the information in this report is accurate to the best of my knowledge.`
    : "Not confirmed by supervisor.";
  y = drawWrappedBlock(doc, "", declaration, y);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Generated by Cybersafe · This document may contain personal information — handle and store in line with your POPIA policy.",
    PAGE_MARGIN,
    290
  );

  doc.save(`incident-report-${report.reportId}.pdf`);
}
