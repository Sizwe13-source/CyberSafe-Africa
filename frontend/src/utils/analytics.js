// src/utils/analytics.js
//
// Replaces the old blanket document-level click + input listeners in App.jsx.
//
// What changed and why:
// - The old `input` listener sent a copy of anything typed (10+ chars) into
//   ANY field on the site to /activity. That's a keylogger, full stop — it
//   doesn't matter that password fields were excluded, since it still
//   captured emails, security answers, free-text form fields, etc. It has
//   been removed entirely, not gated. There's no consent flow that makes
//   silently capturing arbitrary typed text acceptable on a site whose
//   whole purpose is protecting people from exactly this kind of behavior.
// - The old `click` listener reported every outbound link click, with no
//   disclosure to the user. That's a legitimate thing for a scam-awareness
//   product to want (e.g. "which suspicious links are people clicking"),
//   so it's kept — but now it only fires after explicit opt-in via
//   ConsentBanner, matching POPIA's consent requirement for this kind of
//   processing.

import api from "../services/api";

const CONSENT_KEY = "analytics_consent";

export function getConsent() {
  return localStorage.getItem(CONSENT_KEY) === "granted";
}

export function setConsent(granted) {
  localStorage.setItem(CONSENT_KEY, granted ? "granted" : "declined");
  window.dispatchEvent(new Event("consent-changed"));
}

export function hasConsentDecision() {
  return localStorage.getItem(CONSENT_KEY) !== null;
}

const isInternalLink = (href) => {
  try {
    return new URL(href).origin === window.location.origin;
  } catch {
    return true;
  }
};

// Fire-and-forget, consent-gated. Only ever reports the outbound URL —
// never page content, form values, or anything the user typed.
export function reportOutboundLinkClick(url) {
  if (!getConsent()) return;
  api.post("/activity", { type: "url", url }).catch(() => {});
}

export function attachOutboundLinkTracking() {
  const handleClick = (e) => {
    const link = e.target.closest("a");
    if (!link?.href) return;
    if (isInternalLink(link.href)) return;
    reportOutboundLinkClick(link.href);
  };
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}
