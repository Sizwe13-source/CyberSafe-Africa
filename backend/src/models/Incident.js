import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "System AI Detection"
    },

    threatType: {
      type: String,
      required: true,
      enum: [
        "Phishing",
        "Scam",
        "Malware",
        "Data Breach",
        "Fake Website",
        "Identity Theft",
        "Social Engineering",
        "Ransomware",
        "Other"
      ]
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    confidence: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending"
    },

    location: {
      type: String,
      required: false
    },

    reason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;