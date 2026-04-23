// src/utils/validators.js

/* ===============================
   🔍 INCIDENT INPUT VALIDATION
================================ */
export const validateIncidentInput = ({ description, location }) => {
  const errors = [];

  // 🔥 DESCRIPTION
  if (!description || description.trim().length === 0) {
    errors.push("Description is required.");
  } else if (description.trim().length < 5) {
    errors.push("Description is too short.");
  }

  // 🔥 LOCATION (optional but must be valid)
  if (location && typeof location !== "string") {
    errors.push("Location must be a valid string.");
  }

  // 🔥 BASIC SECURITY (prevent script injection)
  if (description && /<script>|<\/script>/i.test(description)) {
    errors.push("Invalid input detected.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


/* ===============================
   ⚡ ACTIVITY VALIDATION (FOR REAL-TIME DETECTION)
================================ */
export const validateActivityInput = ({ type, text, url }) => {
  const errors = [];

  // 🔥 TYPE
  if (!type || typeof type !== "string") {
    errors.push("Activity type is required.");
  }

  // 🔥 TEXT OR URL REQUIRED
  if (!text && !url) {
    errors.push("Either text or URL must be provided.");
  }

  // 🔥 TEXT VALIDATION
  if (text && typeof text !== "string") {
    errors.push("Text must be a valid string.");
  }

  // 🔥 URL VALIDATION
  if (url) {
    try {
      new URL(url);
    } catch {
      errors.push("Invalid URL format.");
    }
  }

  // 🔥 SECURITY CHECK
  if (text && /<script>|<\/script>/i.test(text)) {
    errors.push("Invalid text input detected.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


/* ===============================
   🔐 STATUS VALIDATION
================================ */
export const validateStatus = (status) => {
  const allowed = ["pending", "reviewed", "resolved"];

  if (!allowed.includes(status)) {
    return {
      isValid: false,
      error: "Invalid status value.",
    };
  }

  return { isValid: true };
};


/* ===============================
   🔍 SEARCH VALIDATION
================================ */
export const validateSearchQuery = (query) => {
  if (!query) return true;

  // 🔥 prevent injection-like patterns
  if (/[<>$]/.test(query)) {
    return false;
  }

  return true;
};