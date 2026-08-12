// src/utils/sendIncidentAlert.js
//
// Sends an email alert to the supervisor via EmailJS when a report is
// High or Critical severity. Requires: npm install @emailjs/browser
//
// Fill in your own IDs from https://dashboard.emailjs.com below.
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_jojr7og";
const EMAILJS_TEMPLATE_ID = "template_qn7wdvp";
const EMAILJS_PUBLIC_KEY = "Ro7Aa8Iqr4-A1wSXy";

const ALERT_SEVERITIES = ["High", "Critical"];

export function shouldAlert(severity) {
  return ALERT_SEVERITIES.includes(severity);
}

export async function sendSupervisorAlert(report) {
  if (!shouldAlert(report.severity)) return;

  const templateParams = {
    email: report.supervisorEmail,
    name: "DataPulse Incident Alerts",
    to_name: report.supervisorName,
    report_id: report.reportId,
    severity: report.severity,
    incident_date: report.incidentDate,
    employee_name: report.employeeName,
    violation_type: report.violationType,
    description: report.description,
  };

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    { publicKey: EMAILJS_PUBLIC_KEY }
  );
}