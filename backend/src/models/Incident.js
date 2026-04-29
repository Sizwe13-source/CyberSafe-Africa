// src/models/Incident.js
import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    name: {
      type:    String,
      default: "System AI Detection",
      trim:    true,
    },

    // Must match exactly what your controllers produce.
    // Controllers: Phishing, Scam, Malware, Threat, Bullying, Safe, Other
    threatType: {
      type:     String,
      required: true,
      enum:     ["Phishing", "Scam", "Malware", "Threat", "Bullying", "Safe", "Other"],
      default:  "Other",
    },

    description: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 2000,
    },

    confidence: {
      type:    Number,
      default: 0,
      min:     0,
      max:     100,
    },

    status: {
      type:    String,
      enum:    ["pending", "reviewed", "resolved", "safe"],
      default: "pending",
    },

    location: {
      type:    String,
      trim:    true,
      default: "Unknown",
    },

    reason: {
      type:    String,
      trim:    true,
      default: "",
    },

    // Which surface the activity came from (comment, url, email, etc.)
    source: {
      type:    String,
      trim:    true,
      default: "Unknown",
    },

    recommendation: {
      type:    String,
      trim:    true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index the fields you filter/sort on most — speeds up dashboard queries
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ threatType: 1 });
incidentSchema.index({ status: 1 });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;