// components/LinkChecker.jsx
import { useState } from "react";
import { FiLink, FiAlertTriangle, FiCheckCircle, FiShield } from "react-icons/fi";

// ---- Config -----------------------------------------------------------

const TRUSTED_DOMAINS = [
  "sars.gov.za",
  "gov.za",
  "fnb.co.za",
  "absa.co.za",
  "standardbank.co.za",
  "nedbank.co.za",
  "capitecbank.co.za",
  "discovery.co.za",
  "investec.com",
  "tymebank.co.za",
  "africanbank.co.za",
  "homeaffairs.gov.za",
  "saps.gov.za",
  "postoffice.co.za",
];

const SHORTENER_DOMAINS = [
  "bit.ly", "tinyurl.com", "t.co", "shorturl.at", "is.gd", "goo.gl", "ow.ly", "rb.gy", "cutt.ly",
];

// Weighted signals instead of a flat "any match = danger" list.
// weight is added to a running score; verdict is derived from the total.
const SIGNALS = [
  {
    test: (full) => /sars-?refund/i.test(full),
    weight: 5,
    reason: "Uses SARS-refund style wording common in tax scam messages.",
  },
  {
    test: (full) => /banking.*verify.*account/i.test(full),
    weight: 4,
    reason: "Uses 'verify your account' phrasing common in banking phishing.",
  },
  {
    test: (full) => /(fnb|absa|standardbank|nedbank|capitec).*-.*\.(com|net|xyz|info)/i.test(full),
    weight: 5,
    reason: "Mimics a South African bank name on a domain the bank doesn't own.",
  },
  {
    test: (full) => /(login|secure|verify|update).*-.*\.(xyz|top|info|club|online)/i.test(full),
    weight: 4,
    reason: "Combines security-related wording with a domain ending often used for scam pages.",
  },
  {
    test: (full) => /whatsapp.*(gift|win)/i.test(full),
    weight: 4,
    reason: "Matches a pattern common in fake WhatsApp prize messages.",
  },
  {
    test: (full) => /(homeaffairs|traffic.?fine|licence.?disc).*\.(xyz|top|info|club|online|com)/i.test(full),
    weight: 4,
    reason: "Mimics a government or traffic-fine service on a non-official domain.",
  },
  {
    test: (full) => /sars.*(refund|efile|payment)/i.test(full) && !/sars\.gov\.za/i.test(full),
    weight: 5,
    reason: "Uses SARS wording off the official sars.gov.za domain.",
  },
];

// ---- Helpers ------------------------------------------------------------

// Small Levenshtein distance implementation for typosquat detection.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function findClosestTrustedDomain(hostname) {
  let best = null;
  let bestDist = Infinity;
  for (const domain of TRUSTED_DOMAINS) {
    const dist = levenshtein(hostname, domain);
    if (dist < bestDist) {
      bestDist = dist;
      best = domain;
    }
  }
  return { domain: best, distance: bestDist };
}

function hasHomographRisk(hostname) {
  // Punycode-encoded labels (xn--) indicate non-ASCII characters in the domain,
  // frequently used to visually mimic a trusted brand.
  if (hostname.split(".").some((label) => label.startsWith("xn--"))) return true;
  // Mixed script (e.g. Cyrillic 'а' next to Latin letters) after normalizing
  // punycode isn't reliably detectable client-side without a full IDN library,
  // so we surface the xn-- signal above as the primary indicator.
  return false;
}

function normalizeUrl(rawInput) {
  const trimmed = rawInput.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withScheme);
}

// ---- Core analysis --------------------------------------------------------

export function analyzeLink(rawUrl) {
  let url;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return { verdict: "invalid", score: 0, reasons: ["That doesn't look like a valid URL."] };
  }

  const hostname = url.hostname.toLowerCase();
  const full = rawUrl.toLowerCase();
  const reasons = [];
  let score = 0;

  // Userinfo obfuscation: https://fnb.co.za@evil.com actually goes to evil.com.
  if (url.username || url.password) {
    reasons.push("Link contains an '@' before the real domain — the visible name is not where you'd actually land.");
    score += 6;
  }

  const isTrusted = TRUSTED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  if (isTrusted && !url.username && !url.password) {
    return { verdict: "safe", score: 0, reasons: ["This domain matches a known official South African organisation."] };
  }

  // Typosquat check: very close to a trusted domain but not an exact/subdomain match.
  const { domain: closest, distance } = findClosestTrustedDomain(hostname);
  if (closest && distance > 0 && distance <= 2 && hostname.length > 4) {
    reasons.push(`Very similar to the trusted domain "${closest}" but not an exact match — a common typosquatting trick.`);
    score += 6;
  }

  if (hasHomographRisk(hostname)) {
    reasons.push("Domain contains encoded international characters, sometimes used to visually mimic a trusted brand.");
    score += 5;
  }

  if (hostname.includes("sars") && !hostname.endsWith("sars.gov.za")) {
    reasons.push("Claims to be SARS but isn't on the official sars.gov.za domain.");
    score += 6;
  }

  if (/\d{1,3}(\.\d{1,3}){3}/.test(hostname)) {
    reasons.push("Uses a raw IP address instead of a proper domain name — a common scam trait.");
    score += 4;
  }

  if ((hostname.match(/-/g) || []).length >= 3) {
    reasons.push("Domain has unusually many hyphens, often used to mimic real brand names.");
    score += 2;
  }

  if ((hostname.match(/\./g) || []).length >= 4) {
    reasons.push("Unusually many subdomains, sometimes used to hide the real domain.");
    score += 2;
  }

  if (!url.protocol.startsWith("https")) {
    reasons.push("Connection isn't secured with HTTPS.");
    score += 1;
  }

  for (const signal of SIGNALS) {
    if (signal.test(full)) {
      reasons.push(signal.reason);
      score += signal.weight;
    }
  }

  const isShortener = SHORTENER_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  if (isShortener) {
    return {
      verdict: "unknown",
      score,
      reasons: [
        "This is a shortened link, so the real destination is hidden.",
        "Shortened links aren't inherently scams, but we can't verify where this one leads without visiting it.",
        ...reasons,
      ],
    };
  }

  if (score === 0) {
    return {
      verdict: "unknown",
      score,
      reasons: ["No obvious red flags found, but we can't fully verify this domain. Stay cautious."],
    };
  }

  if (score >= 5) {
    return { verdict: "danger", score, reasons };
  }

  return {
    verdict: "unknown",
    score,
    reasons: ["Some minor red flags found — not conclusive, but worth double-checking before you click.", ...reasons],
  };
}

// ---- Component ------------------------------------------------------------

function LinkChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setResult(analyzeLink(input.trim()));
  };

  const verdictStyles = {
    safe:    { bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-400", Icon: FiCheckCircle,   label: "Looks safe" },
    unknown: { bg: "bg-amber-500/10",   border: "border-amber-400/30",   text: "text-amber-400",   Icon: FiShield,        label: "Unverified — be cautious" },
    danger:  { bg: "bg-red-500/10",     border: "border-red-400/30",     text: "text-red-400",     Icon: FiAlertTriangle, label: "Likely a scam" },
    invalid: { bg: "bg-slate-500/10",   border: "border-slate-400/30",   text: "text-slate-400",   Icon: FiAlertTriangle, label: "Invalid link" },
  };

  const v = result ? verdictStyles[result.verdict] : null;

  return (
    <div className="bg-white/5 border border-cyan-400/20 rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <FiLink className="w-5 h-5 text-cyan-400" />
        <h3 className="font-heading text-lg text-white">Check a suspicious link</h3>
      </div>
      <p className="text-sm text-slate-400 mb-5">
        Paste a link from an SMS, email, or WhatsApp message before you click it.
      </p>

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. www.mediaonafrica.com"
          className="flex-1 bg-[#0F0F1E] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60"
        />
        <button
          type="submit"
          className="bg-cyan-400 text-[#0F0F1E] font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cyan-300 transition"
        >
          Check link
        </button>
      </form>

      {result && v && (
        <div className={`mt-5 ${v.bg} border ${v.border} rounded-lg p-4`}>
          <div className={`flex items-center gap-2 font-medium text-sm mb-2 ${v.text}`}>
            <v.Icon className="w-4 h-4" />
            {v.label}
          </div>
          <ul className="space-y-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-500">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">
        This is a check, not a guarantee. When in doubt, contact the organisation directly using a number or link you already trust.
      </p>
    </div>
  );
}

export default LinkChecker;