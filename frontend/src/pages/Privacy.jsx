// src/pages/Privacy.jsx
//
// A POPIA-oriented data rights page. This is a starting point, not legal
// advice — have this reviewed before treating it as your actual compliance
// document. Update the contact details and retention period to match what
// your backend actually does.

import { useEffect, useState } from "react";
import { getConsent, hasConsentDecision, setConsent } from "../utils/analytics";

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
    <div className="text-sm leading-relaxed text-white/70">{children}</div>
  </section>
);

export default function Privacy() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasConsentDecision() ? getConsent() : false);
  }, []);

  const toggleConsent = () => {
    const next = !consented;
    setConsent(next);
    setConsented(next);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-white">
        Privacy &amp; data rights
      </h1>

      <Section title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account details you provide when you register or log in (email address, hashed password — we never store your password in readable form).</li>
          <li>Outbound link clicks, but only if you've opted in below. We never record what you type.</li>
        </ul>
      </Section>

      <Section title="Your consent for activity tracking">
        <p className="mb-3">
          Current status:{" "}
          <span className="font-medium text-white">
            {consented ? "opted in" : "opted out"}
          </span>
        </p>
        <button
          onClick={toggleConsent}
          className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          {consented ? "Opt out" : "Opt in"}
        </button>
      </Section>

      <Section title="Your rights under POPIA">
        <p className="mb-2">As a data subject, you have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Be told what personal information we hold about you, and why.</li>
          <li>Access a copy of that information.</li>
          <li>Ask us to correct information that's wrong or out of date.</li>
          <li>Ask us to delete your information, subject to any legal retention requirements.</li>
          <li>Object to processing you haven't consented to, or withdraw consent at any time.</li>
          <li>Complain to the Information Regulator if you think we've mishandled your information.</li>
        </ul>
      </Section>

      <Section title="How to exercise these rights">
        <p>
          Email our information officer at{" "}
          <a href="mailto:privacy@example.com" className="underline text-white">
            privacy@example.com
          </a>{" "}
          — replace with your real contact before going live. We'll respond within 30 days, as required by POPIA.
        </p>
      </Section>

      <Section title="Retention">
        <p>
          Account data is kept for as long as your account is active. Link-click
          activity data (if you've opted in) is kept for 90 days and then deleted —
          adjust this to match your actual retention policy.
        </p>
      </Section>
    </div>
  );
}
