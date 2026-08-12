import { useState, useMemo } from "react";
import "./scamchecker.css";

const RULES = [
  {
    test: /\b(act now|urgent|immediately|expires? (today|soon)|final notice|last chance|within 24 hours)\b/i,
    points: 15,
    label: "Artificial urgency",
    reason: "Scammers create time pressure so you act before thinking it through.",
  },
  {
    test: /\b(verify your account|confirm your identity|suspended|unusual activity|reactivate|locked account)\b/i,
    points: 15,
    label: "Fake account-security threat",
    reason: "Real companies rarely threaten account suspension over email/SMS.",
  },
  {
    test: /\b(gift card|itunes card|wire transfer|western union|crypto(currency)?|bitcoin|airtime)\b/i,
    points: 25,
    label: "Untraceable payment request",
    reason: "Legitimate businesses never demand payment via gift cards, crypto, wire transfer, or airtime.",
  },
  {
    test: /\b(social security|ssn|one[- ]time password|otp|pin number|cvv|full card number|id number|sa id)\b/i,
    points: 25,
    label: "Requests sensitive personal/financial info",
    reason: "No legitimate service asks you to send these details via message or email.",
  },
  {
    test: /\b(congratulations|you('|)ve won|winner|claim your prize|selected to receive)\b/i,
    points: 15,
    label: "Unsolicited prize/winnings",
    reason: "You can't win a contest you never entered — a classic lottery-scam hook.",
  },
  {
    test: /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|shorturl\.at|ow\.ly)\S*/i,
    points: 15,
    label: "Shortened/masked link",
    reason: "URL shorteners hide the real destination, which is often a lookalike phishing site.",
  },
  {
    test: /https?:\/\/(\d{1,3}\.){3}\d{1,3}/,
    points: 20,
    label: "Raw IP-address link",
    reason: "Legitimate businesses use a named domain, not a bare numeric IP address.",
  },
  {
    test: /[A-Z]{4,}.*[A-Z]{4,}/,
    points: 5,
    label: "Excessive capitalization",
    reason: "ALL-CAPS blocks are a common manipulation tactic to grab attention/create alarm.",
  },
  {
    test: /!{2,}/,
    points: 5,
    label: "Excessive punctuation",
    reason: "Multiple exclamation marks are often used to manufacture excitement or urgency.",
  },
  {
    test: /\bdear (customer|user|valued member|sir\/madam|client)\b/i,
    points: 10,
    label: "Generic greeting",
    reason: "Real organizations you have an account with usually address you by name.",
  },
  // South Africa–focused signals
  {
    test: /\bsars\b.*\b(refund|owe|debt|penalty|efile|e-filing)\b|\b(refund|owe|debt)\b.*\bsars\b/i,
    points: 22,
    label: "SARS impersonation",
    reason: "SARS refund / debt scams are common. Use official eFiling — never links from SMS.",
  },
  {
    test: /\b(fnb|absa|nedbank|capitec|standard\s*bank|discovery bank)\b.*\b(otp|pin|password|verify|login)\b/i,
    points: 22,
    label: "SA bank credential request",
    reason: "Banks never ask for OTP, PIN, or password by SMS/WhatsApp/email.",
  },
  {
    test: /\*\d{3,5}#|\bussd\b/i,
    points: 12,
    label: "USSD / shortcode pressure",
    reason: "Scammers push victims onto USSD codes to approve fraudulent transactions.",
  },
  {
    test: /\bwhatsapp\b.*\b(gift|win|prize|claim|free)\b/i,
    points: 18,
    label: "WhatsApp prize scam pattern",
    reason: "Fake WhatsApp giveaways are a frequent mobile scam in Southern Africa.",
  },
  {
    test: /\b(home affairs|traffic fine|licence disc|license disc)\b.*\b(pay|click|link)\b/i,
    points: 16,
    label: "Government / fine impersonation",
    reason: "Fake traffic-fine and Home Affairs messages often lead to phishing pages.",
  },
  {
    test: /\b(please send|share|forward).{0,20}\b(otp|pin)\b/i,
    points: 28,
    label: "Asks you to share an OTP/PIN",
    reason: "Anyone who asks you to forward an OTP is trying to take over your account.",
  },
];

function scoreMessage(text) {
  const hits = RULES.filter((rule) => rule.test.test(text));
  const rawScore = hits.reduce((sum, rule) => sum + rule.points, 0);
  const score = Math.min(100, rawScore);
  return { score, hits };
}

function riskLevel(score) {
  if (score >= 56) return { label: "High risk", className: "risk-high" };
  if (score >= 26) return { label: "Medium risk", className: "risk-medium" };
  if (score > 0) return { label: "Low risk", className: "risk-low" };
  return { label: "No red flags detected", className: "risk-none" };
}

function nextSteps(score) {
  if (score >= 56) {
    return [
      "Do not click links or reply with OTPs, PINs, or ID numbers.",
      "Contact your bank/SARS only via the official app or a number you already trust.",
      "Preserve the message (screenshot) and report it via Incident Report if needed.",
    ];
  }
  if (score >= 26) {
    return [
      "Verify the sender independently — do not use contact details from the message.",
      "Open official websites by typing the address yourself.",
      "If unsure, ask a trusted person or use the CyberSafe assistant.",
    ];
  }
  return [
    "No strong scam patterns found — stay cautious with unexpected money or login requests.",
    "When in doubt, use the Link Checker before opening any URL.",
  ];
}

export default function ScamChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const risk = useMemo(
    () => (result ? riskLevel(result.score) : null),
    [result]
  );

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setResult(scoreMessage(text));
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  return (
    <section className="scam-checker">
      <h2>Scam Message Checker</h2>
      <p className="scam-checker-subtitle">
        Paste a suspicious email, SMS, or WhatsApp message to see which common
        scam tactics it uses — tuned for South African banks, SARS, and mobile scams.
        Analysis runs in your browser; nothing is uploaded.
      </p>

      <textarea
        className="scam-checker-input"
        rows={6}
        placeholder="Paste the message here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAnalyze();
        }}
      />

      <div className="scam-checker-actions">
        <button onClick={handleAnalyze} disabled={!text.trim()}>
          Analyze
        </button>
        <button className="secondary" onClick={handleClear} type="button">
          Clear
        </button>
      </div>

      {result && risk && (
        <div className="scam-checker-result">
          <div className={`risk-badge ${risk.className}`}>
            {risk.label} — {result.score}/100
          </div>

          {result.hits.length > 0 ? (
            <ul className="flag-list">
              {result.hits.map((hit) => (
                <li key={hit.label}>
                  <strong>{hit.label}</strong>
                  <span className="flag-reason">{hit.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-flags">
              No common scam patterns detected — but stay cautious with any
              unexpected message asking for money or personal info.
            </p>
          )}

          <div className="mt-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-2">
              Recommended next steps
            </p>
            <ul className="space-y-1.5 text-sm text-white/70 list-disc pl-5">
              {nextSteps(result.score).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
