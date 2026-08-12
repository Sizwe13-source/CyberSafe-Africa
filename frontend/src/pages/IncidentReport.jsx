// src/pages/IncidentReport.jsx
//
// Simple form for a supervisor to log a POPIA violation committed by an
// individual at the business. On filing, generates a branded PDF for
// download, and — if severity is High or Critical — emails the supervisor
// an alert via EmailJS.

import { useState } from "react";
import toast from "react-hot-toast";
import { generateIncidentPdf } from "../utils/generateIncidentPdf";
import { sendSupervisorAlert, shouldAlert } from "../utils/SendIncidentAlert";

const VIOLATION_TYPES = [
  "Unauthorised access",
  "Unauthorised disclosure / sharing",
  "Loss or theft of personal information",
  "Improper storage or disposal",
  "Processing without consent",
  "Other",
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const EMPTY_FORM = {
  incidentDate: "",
  supervisorName: "",
  supervisorEmail: "",
  employeeName: "",
  violationType: "",
  description: "",
  actionTaken: "",
  severity: "Medium",
  supervisorConfirmed: false,
};

const REQUIRED_FIELDS = [
  "incidentDate",
  "supervisorName",
  "supervisorEmail",
  "employeeName",
  "violationType",
  "description",
  "actionTaken",
];

function inputClass() {
  return "w-full rounded-lg bg-[#0f172a] border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500";
}

function labelClass() {
  return "block text-xs font-medium text-white/70 mb-1";
}

export default function IncidentReport() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    for (const f of REQUIRED_FIELDS) {
      if (!String(form[f] || "").trim()) return false;
    }
    return form.supervisorConfirmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(
        "Fill in all fields and confirm the declaration before filing."
      );
      return;
    }

    setSubmitting(true);
    try {
      const reportId = `POPIA-${Date.now().toString(36).toUpperCase()}`;
      const report = {
        ...form,
        reportId,
        dateFiled: new Date().toLocaleString("en-ZA"),
      };

      generateIncidentPdf(report);

      if (shouldAlert(report.severity)) {
        try {
          await sendSupervisorAlert(report);
          toast.success(`Report ${reportId} filed. Supervisor alerted by email.`);
        } catch (alertErr) {
          console.error("Alert email failed:", alertErr);
          toast.error(
            "Report filed and downloaded, but the alert email failed to send."
          );
        }
      } else {
        toast.success(`Report ${reportId} filed and downloaded.`);
      }

      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong generating the report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-white">
      <h1 className="text-2xl font-bold mb-1">File a POPIA Incident Report</h1>
      <p className="text-white/60 text-sm mb-8">
        Log a suspected POPIA violation by an individual at the business.
        Filing generates a PDF record for download. High or Critical
        severity reports also email the supervisor immediately.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass()}>Date of incident *</label>
          <input
            type="date"
            className={inputClass()}
            value={form.incidentDate}
            onChange={update("incidentDate")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Your name (supervisor) *</label>
          <input
            type="text"
            className={inputClass()}
            value={form.supervisorName}
            onChange={update("supervisorName")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Your email (supervisor) *</label>
          <input
            type="email"
            className={inputClass()}
            placeholder="DataPulse@gmail.org"
            value={form.supervisorEmail}
            onChange={update("supervisorEmail")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Individual reported *</label>
          <input
            type="text"
            className={inputClass()}
            value={form.employeeName}
            onChange={update("employeeName")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Type of violation *</label>
          <select
            className={inputClass()}
            value={form.violationType}
            onChange={update("violationType")}
            required
          >
            <option value="">Select…</option>
            {VIOLATION_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>What happened? *</label>
          <textarea
            rows={4}
            className={inputClass()}
            value={form.description}
            onChange={update("description")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Action taken *</label>
          <textarea
            rows={3}
            className={inputClass()}
            value={form.actionTaken}
            onChange={update("actionTaken")}
            required
          />
        </div>

        <div>
          <label className={labelClass()}>Severity</label>
          <select
            className={inputClass()}
            value={form.severity}
            onChange={update("severity")}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {shouldAlert(form.severity) && (
            <p className="text-xs text-amber-400 mt-1">
              This severity will trigger an immediate email alert on filing.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-white/80 pt-2">
          <input
            type="checkbox"
            checked={form.supervisorConfirmed}
            onChange={update("supervisorConfirmed")}
            className="rounded border-white/20 bg-[#0f172a] mt-0.5"
            required
          />
          I confirm this information is accurate to the best of my knowledge.
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#090e20] font-semibold py-3 transition-colors"
        >
          {submitting ? "Filing report…" : "File report & download PDF"}
        </button>
      </form>
    </div>
  );
}