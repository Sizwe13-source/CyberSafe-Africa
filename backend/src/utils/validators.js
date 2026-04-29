// src/utils/validators.js

// All threat-related statuses your Incident model accepts
const VALID_STATUSES = ["pending", "reviewed", "resolved", "safe"];

// Blocks common XSS and NoSQL injection patterns
const INJECTION_PATTERN = /<script[\s\S]*?>|<\/script>|javascript:|on\w+\s*=|[${}]/i;

/* ===============================
   🔍 INCIDENT INPUT VALIDATION
================================ */
export const validateIncidentInput = ({ description, location }) => {
  const errors = [];

  if (!description || typeof description !== "string") {
    errors.push("Description is required.");
  } else if (description.trim().length < 5) {
    errors.push("Description is too short (min 5 characters).");
  } else if (description.trim().length > 2000) {
    errors.push("Description is too long (max 2000 characters).");
  } else if (INJECTION_PATTERN.test(description)) {
    errors.push("Invalid input detected.");
  }

  if (location && typeof location !== "string") {
    errors.push("Location must be a valid string.");
  }

  if (location && location.length > 200) {
    errors.push("Location is too long (max 200 characters).");
  }

  return { isValid: errors.length === 0, errors };
};

/* ===============================
   ⚡ ACTIVITY INPUT VALIDATION
================================ */
const VALID_ACTIVITY_TYPES = ["text", "url", "email", "comment"];

export const validateActivityInput = ({ type, text, url }) => {
  const errors = [];

  if (!type || typeof type !== "string") {
    errors.push("Activity type is required.");
  } else if (!VALID_ACTIVITY_TYPES.includes(type)) {
    errors.push(`Type must be one of: ${VALID_ACTIVITY_TYPES.join(", ")}.`);
  }

  if (!text && !url) {
    errors.push("Either text or URL must be provided.");
  }

  if (text) {
    if (typeof text !== "string") {
      errors.push("Text must be a valid string.");
    } else if (text.length > 5000) {
      errors.push("Text is too long (max 5000 characters).");
    } else if (INJECTION_PATTERN.test(text)) {
      errors.push("Invalid text input detected.");
    }
  }

  if (url) {
    if (typeof url !== "string") {
      errors.push("URL must be a string.");
    } else if (url.length > 2000) {
      // Anything over 2000 chars is suspicious — most browsers cap here anyway
      errors.push("URL is too long (max 2000 characters).");
    } else {
      try {
        new URL(url);
      } catch {
        errors.push("Invalid URL format.");
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

/* ===============================
   🔐 STATUS VALIDATION
================================ */
export const validateStatus = (status) => {
  // "safe" was missing from the original — Incident model and
  // incidentController both use it when threatType === "Safe"
  if (!status || !VALID_STATUSES.includes(status)) {
    return {
      isValid: false,
      error:   `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
    };
  }

  return { isValid: true };
};

/* ===============================
   🔍 SEARCH QUERY VALIDATION
================================ */
export const validateSearchQuery = (query) => {
  if (!query) return true;
  if (typeof query !== "string") return false;
  if (query.length > 200) return false;
  // Block NoSQL injection and XSS chars
  if (/[${}<>]/.test(query)) return false;
  return true;
};
