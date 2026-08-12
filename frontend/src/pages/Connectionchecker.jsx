// src/pages/ConnectionChecker.jsx
//
// CyberSafe - Connection Safety Checker
//
// Important:
// Browsers cannot directly determine whether a Wi-Fi network is public,
// malicious, or being intercepted. This checker therefore combines:
// 1. Browser-detectable security signals
// 2. Network information when the browser exposes it
// 3. User-provided information about the network
//
// Everything runs locally in the browser.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wifi,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  LockOpen,
  CheckCircle2,
  Circle,
  Info,
  RefreshCw,
  Globe,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

const CHECKLIST = [
  {
    id: "publicLocation",
    label:
      "This is a shared network such as a café, airport, hotel, mall, library, or coworking space.",
    weight: 2,
  },
  {
    id: "noPassword",
    label:
      "The Wi-Fi connected without a password, or the password is publicly displayed.",
    weight: 2,
  },
  {
    id: "genericName",
    label:
      'The Wi-Fi name is generic or unverified, such as "Free_WiFi" or "Airport_Guest".',
    weight: 2,
  },
  {
    id: "sensitiveTasks",
    label:
      "You plan to use banking, email, school, work, or other sensitive accounts on this connection.",
    weight: 2,
  },
  {
    id: "noVpn",
    label:
      "You are not using a VPN while using this network.",
    weight: 1,
  },
  {
    id: "certWarning",
    label:
      'Your browser has shown a "connection is not private" or certificate warning today.',
    weight: 4,
  },
];

function getNetworkInfo() {
  const nav =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!nav) {
    return null;
  }

  return {
    type: nav.type || null,
    effectiveType: nav.effectiveType || null,
    downlink:
      typeof nav.downlink === "number" ? nav.downlink : null,
    rtt: typeof nav.rtt === "number" ? nav.rtt : null,
    saveData: Boolean(nav.saveData),
  };
}

function performSecurityChecks() {
  const protocol =
    typeof window !== "undefined"
      ? window.location.protocol
      : "";

  const isHttps = protocol === "https:";

  const isSecureContext =
    typeof window !== "undefined"
      ? window.isSecureContext
      : false;

  const isOnline =
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true;

  let insecureResources = [];

  try {
    const resources =
      performance.getEntriesByType("resource") || [];

    insecureResources = resources.filter((entry) => {
      try {
        return entry.name.startsWith("http://");
      } catch {
        return false;
      }
    });
  } catch {
    insecureResources = [];
  }

  const mixedContentCount = insecureResources.length;

  const isFramed =
    typeof window !== "undefined"
      ? window.self !== window.top
      : false;

  return {
    isHttps,
    isSecureContext,
    isOnline,
    mixedContentCount,
    isFramed,
    checkedAt: new Date(),
  };
}

function useConnectionChecks() {
  const [checks, setChecks] = useState(() =>
    performSecurityChecks()
  );

  const [networkInfo, setNetworkInfo] = useState(() =>
    getNetworkInfo()
  );

  const [isChecking, setIsChecking] = useState(false);

  const runChecks = useCallback(() => {
    setIsChecking(true);

    // Give the browser a moment to refresh performance/network state.
    setTimeout(() => {
      setChecks(performSecurityChecks());
      setNetworkInfo(getNetworkInfo());
      setIsChecking(false);
    }, 300);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setChecks((previous) => ({
        ...previous,
        isOnline: true,
      }));
    };

    const handleOffline = () => {
      setChecks((previous) => ({
        ...previous,
        isOnline: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection?.addEventListener) {
      connection.addEventListener("change", runChecks);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (connection?.removeEventListener) {
        connection.removeEventListener("change", runChecks);
      }
    };
  }, [runChecks]);

  return {
    ...checks,
    networkInfo,
    isChecking,
    runChecks,
  };
}

function calculateRisk({
  isHttps,
  isSecureContext,
  mixedContentCount,
  isOnline,
  answers,
}) {
  let score = 0;

  // Page security
  if (!isHttps) score += 5;

  if (!isSecureContext) score += 3;

  // Mixed content is a page security issue.
  // It does NOT prove that the Wi-Fi itself is malicious.
  if (mixedContentCount > 0) {
    score += Math.min(3, mixedContentCount);
  }

  // User-reported network conditions
  CHECKLIST.forEach((item) => {
    if (answers[item.id]) {
      score += item.weight;
    }
  });

  // Being offline isn't a security risk, so it should not
  // increase the risk score.
  if (!isOnline) {
    score = Math.max(0, score - 1);
  }

  return score;
}

function getRiskLevel(score) {
  if (score >= 9) {
    return {
      label: "High risk",
      description:
        "There are significant warning signs. Avoid sensitive activity until the connection or page is safer.",
      color: "text-red-300",
      bg: "bg-red-500/10",
      border: "border-red-400/30",
      bar: "bg-red-400",
      Icon: ShieldX,
    };
  }

  if (score >= 5) {
    return {
      label: "Medium risk",
      description:
        "Some warning signs were detected. Be cautious with sensitive accounts and consider switching networks.",
      color: "text-amber-300",
      bg: "bg-amber-500/10",
      border: "border-amber-400/30",
      bar: "bg-amber-400",
      Icon: ShieldAlert,
    };
  }

  return {
    label: "Low risk",
    description:
      "No major browser-detectable warning signs were found. This does not prove that the Wi-Fi network itself is trustworthy.",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
    bar: "bg-emerald-400",
    Icon: ShieldCheck,
  };
}

function buildRecommendations({
  isHttps,
  isSecureContext,
  mixedContentCount,
  isOnline,
  answers,
}) {
  const recommendations = [];

  if (!isHttps) {
    recommendations.push(
      "Do not enter passwords, banking information, card numbers, or other sensitive information on this page because it is not using HTTPS."
    );
  }

  if (!isSecureContext) {
    recommendations.push(
      "This page is not running in a browser secure context. Prefer a properly configured HTTPS version of the site."
    );
  }

  if (mixedContentCount > 0) {
    recommendations.push(
      "This page requested some resources over HTTP. This is a website security problem and does not by itself prove that someone is attacking your Wi-Fi."
    );
  }

  if (answers.certWarning) {
    recommendations.push(
      "If your browser displayed a certificate or privacy warning, do not bypass it. Leave the page and use a trusted connection."
    );
  }

  if (
    answers.publicLocation &&
    answers.sensitiveTasks
  ) {
    recommendations.push(
      "Avoid sensitive logins on this shared network if possible. Use mobile data or another trusted connection."
    );
  }

  if (
    answers.noPassword &&
    answers.publicLocation
  ) {
    recommendations.push(
      "Treat an open/shared Wi-Fi network as untrusted. Confirm the exact network name with the venue before connecting."
    );
  }

  if (
    answers.genericName
  ) {
    recommendations.push(
      "Confirm the exact Wi-Fi name with staff. Lookalike networks can use names similar to legitimate public hotspots."
    );
  }

  if (
    answers.noVpn &&
    answers.sensitiveTasks
  ) {
    recommendations.push(
      "If your organization provides a VPN, consider using it before performing sensitive work on an untrusted network."
    );
  }

  if (!isOnline) {
    recommendations.push(
      "Your browser currently reports that it is offline."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "No immediate browser-detectable problems were found. Continue using HTTPS and avoid sensitive activity on networks you do not trust."
    );
  }

  return recommendations;
}

export default function ConnectionChecker() {
  const {
    isHttps,
    isSecureContext,
    mixedContentCount,
    isOnline,
    isFramed,
    networkInfo,
    isChecking,
    runChecks,
  } = useConnectionChecks();

  const [answers, setAnswers] = useState({});

  function toggle(id) {
    setAnswers((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }

  const totalScore = useMemo(
    () =>
      calculateRisk({
        isHttps,
        isSecureContext,
        mixedContentCount,
        isOnline,
        answers,
      }),
    [
      isHttps,
      isSecureContext,
      mixedContentCount,
      isOnline,
      answers,
    ]
  );

  const maxScore =
    CHECKLIST.reduce(
      (sum, item) => sum + item.weight,
      0
    ) + 11;

  const risk = getRiskLevel(totalScore);

  const recommendations = useMemo(
    () =>
      buildRecommendations({
        isHttps,
        isSecureContext,
        mixedContentCount,
        isOnline,
        answers,
      }),
    [
      isHttps,
      isSecureContext,
      mixedContentCount,
      isOnline,
      answers,
    ]
  );

  const answeredAny =
    Object.values(answers).some(Boolean);

  const scorePercentage = Math.min(
    100,
    Math.round((totalScore / maxScore) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/15">
            <Wifi className="h-5 w-5 text-cyan-300" />
          </span>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Connection Safety Checker
            </h1>

            <p className="text-xs text-white/40 mt-1">
              Client-side security assessment
            </p>
          </div>
        </div>

        <button
          onClick={runChecks}
          disabled={isChecking}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isChecking ? "animate-spin" : ""
            }`}
          />

          Re-check
        </button>
      </div>

      <p className="text-white/60 mb-8 leading-relaxed">
        Check the security of this browser session before
        performing sensitive activities.
      </p>

      {/* Important limitation */}
      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5 mb-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />

          <div>
            <h2 className="text-sm font-semibold text-cyan-200 mb-1">
              What this checker can actually detect
            </h2>

            <p className="text-sm text-white/60 leading-relaxed">
              Your browser cannot directly prove whether a Wi-Fi
              network is public, malicious, or being monitored.
              CyberSafe therefore combines browser security signals
              with information you provide about the network.
            </p>
          </div>
        </div>
      </section>

      {/* Automatic checks */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-white/50" />

          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Automatic browser checks
          </h2>
        </div>

        <div className="space-y-3">

          <CheckRow
            ok={isHttps}
            okText="This page is using HTTPS."
            badText="This page is using HTTP. Do not enter sensitive information."
          />

          <CheckRow
            ok={isSecureContext}
            okText="The browser reports this as a secure context."
            badText="The browser does not consider this page a secure context."
          />

          <CheckRow
            ok={mixedContentCount === 0}
            okText="No HTTP resources were detected among loaded performance entries."
            badText={`${mixedContentCount} HTTP resource${
              mixedContentCount === 1 ? "" : "s"
            } detected.`}
          />

          <CheckRow
            ok={isOnline}
            okText="The browser reports that you are online."
            badText="The browser reports that you are currently offline."
          />

          {isFramed && (
            <div className="flex items-start gap-2.5 text-sm text-amber-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />

              <span>
                This page appears to be running inside an iframe.
                This is not automatically dangerous, but only use
                sensitive information when you trust the website.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Network information */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-4 w-4 text-white/50" />

          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Browser network information
          </h2>
        </div>

        {networkInfo ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <InfoCard
              label="Type"
              value={networkInfo.type || "Unknown"}
            />

            <InfoCard
              label="Connection"
              value={
                networkInfo.effectiveType ||
                "Unknown"
              }
            />

            <InfoCard
              label="Downlink"
              value={
                networkInfo.downlink !== null
                  ? `${networkInfo.downlink} Mbps`
                  : "Unknown"
              }
            />

            <InfoCard
              label="Latency"
              value={
                networkInfo.rtt !== null
                  ? `${networkInfo.rtt} ms`
                  : "Unknown"
              }
            />
          </div>
        ) : (
          <p className="text-sm text-white/50 leading-relaxed">
            Your browser does not expose network information
            through the Network Information API. This is normal
            and does not indicate a security problem.
          </p>
        )}
      </section>

      {/* User checklist */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">

        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-1">
          Tell us about this network
        </h2>

        <p className="text-xs text-white/40 mb-4">
          These questions cannot be detected automatically by a
          browser. Your answers are processed locally.
        </p>

        <div className="space-y-2.5">
          {CHECKLIST.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-start gap-3 text-left rounded-xl border px-3.5 py-3 transition-colors ${
                answers[item.id]
                  ? "border-cyan-400/40 bg-cyan-400/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              {answers[item.id] ? (
                <CheckCircle2 className="h-4.5 w-4.5 mt-0.5 shrink-0 text-cyan-300" />
              ) : (
                <Circle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-white/25" />
              )}

              <span className="text-sm text-white/80 leading-relaxed">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Result */}
      <section
        className={`rounded-2xl border p-5 ${risk.bg} ${risk.border}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <risk.Icon
            className={`h-6 w-6 ${risk.color}`}
          />

          <span
            className={`text-lg font-bold ${risk.color}`}
          >
            {risk.label}
          </span>
        </div>

        <p className="text-sm text-white/60 mb-4 leading-relaxed">
          {risk.description}
        </p>

        {answeredAny && (
          <p className="text-xs text-white/40 mb-4">
            Your checklist answers are included in this
            assessment.
          </p>
        )}

        {/* Score */}
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>Risk score</span>
          <span>{scorePercentage}%</span>
        </div>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all ${risk.bar}`}
            style={{
              width: `${scorePercentage}%`,
            }}
          />
        </div>

        <h3 className="text-sm font-semibold text-white/80 mb-2">
          Recommended actions
        </h3>

        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-white/75 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/30 shrink-0" />

              {recommendation}
            </li>
          ))}
        </ul>
      </section>

      {/* Good habits */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-white/50" />

          <h2 className="text-sm font-semibold text-white/80">
            Good habits on public networks
          </h2>
        </div>

        <ul className="space-y-2 text-sm text-white/60 leading-relaxed">
          <li>
            • Check that sensitive websites use HTTPS.
          </li>

          <li>
            • Confirm public Wi-Fi names with venue staff.
          </li>

          <li>
            • Disable automatic connection to unknown networks.
          </li>

          <li>
            • Avoid sensitive activities on networks you do not trust.
          </li>

          <li>
            • Do not bypass browser certificate warnings.
          </li>

          <li>
            • Forget public networks when you no longer need them.
          </li>
        </ul>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-white/30 text-center mt-6 leading-relaxed">
        CyberSafe provides a browser-based risk assessment.
        A low-risk result does not guarantee that a Wi-Fi network
        is secure or free from malicious activity.
      </p>
    </div>
  );
}

function CheckRow({
  ok,
  okText,
  badText,
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      {ok ? (
        <ShieldCheck className="h-4.5 w-4.5 mt-0.5 shrink-0 text-emerald-400" />
      ) : (
        <LockOpen className="h-4.5 w-4.5 mt-0.5 shrink-0 text-red-400" />
      )}

      <span
        className={
          ok
            ? "text-white/70"
            : "text-red-200"
        }
      >
        {ok ? okText : badText}
      </span>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-xs text-white/40 mb-1">
        {label}
      </div>

      <div className="text-sm font-medium text-white/80 capitalize">
        {value}
      </div>
    </div>
  );
}

