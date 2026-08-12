// src/components/PasswordChecker.jsx
//
// Client-side password strength checker. The password never leaves the
// browser — no API call, no logging — it's scored entirely in JS.
//
// Drop into src/components/, then render <PasswordChecker /> on Tips,
// Home, or its own page.

import { useState } from "react";
import "./Passwordchecker.css";

const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "qwerty", "abc123", "letmein",
  "monkey", "111111", "iloveyou", "admin", "welcome", "password1",
  "123123", "sunshine", "princess", "football", "dragon", "master",
];

const KEYBOARD_RUNS = [
  "qwerty", "asdf", "zxcv", "1234", "0987", "qazwsx",
];

function hasSequentialChars(pw, minRun = 4) {
  const lower = pw.toLowerCase();
  let run = 1;
  for (let i = 1; i < lower.length; i++) {
    const prev = lower.charCodeAt(i - 1);
    const cur = lower.charCodeAt(i);
    if (cur === prev + 1) {
      run++;
      if (run >= minRun) return true;
    } else {
      run = 1;
    }
  }
  return false;
}

function hasRepeatedChars(pw, minRun = 4) {
  let run = 1;
  for (let i = 1; i < pw.length; i++) {
    if (pw[i] === pw[i - 1]) {
      run++;
      if (run >= minRun) return true;
    } else {
      run = 1;
    }
  }
  return false;
}

// Rough entropy estimate: log2(charsetSize) * length
function estimateEntropy(pw) {
  let charsetSize = 0;
  if (/[a-z]/.test(pw)) charsetSize += 26;
  if (/[A-Z]/.test(pw)) charsetSize += 26;
  if (/[0-9]/.test(pw)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) charsetSize += 32;
  if (charsetSize === 0) return 0;
  return Math.round(pw.length * Math.log2(charsetSize));
}

function analyzePassword(pw) {
  const checks = [];
  let score = 0;

  if (pw.length === 0) {
    return { score: 0, checks: [], entropy: 0 };
  }

  // Length
  if (pw.length < 8) {
    checks.push({ pass: false, label: "At least 8 characters", detail: `Only ${pw.length} characters — short passwords are fast to brute-force.` });
  } else if (pw.length < 12) {
    checks.push({ pass: true, label: "At least 8 characters", detail: "Meets the minimum, but 12+ is meaningfully stronger." });
    score += 15;
  } else {
    checks.push({ pass: true, label: "12+ characters", detail: "Good length — length matters more than complexity for brute-force resistance." });
    score += 25;
  }

  // Character variety
  const varietyChecks = [
    { test: /[a-z]/, label: "Contains lowercase letters" },
    { test: /[A-Z]/, label: "Contains uppercase letters" },
    { test: /[0-9]/, label: "Contains numbers" },
    { test: /[^a-zA-Z0-9]/, label: "Contains symbols" },
  ];
  let varietyCount = 0;
  varietyChecks.forEach((v) => {
    const pass = v.test.test(pw);
    if (pass) varietyCount++;
    checks.push({ pass, label: v.label, detail: pass ? "Good." : "Missing this character type reduces the search space an attacker needs to try." });
  });
  score += varietyCount * 10;

  // Common password
  const isCommon = COMMON_PASSWORDS.includes(pw.toLowerCase());
  checks.push({
    pass: !isCommon,
    label: "Not a commonly-used password",
    detail: isCommon
      ? "This is one of the most-used passwords in breach lists — it will be tried first in any attack."
      : "Not found in the common-password list checked.",
  });
  if (isCommon) score -= 40;

  // Keyboard run / sequential / repeated
  const lower = pw.toLowerCase();
  const hasKeyboardRun = KEYBOARD_RUNS.some((run) => lower.includes(run));
  const hasSeq = hasSequentialChars(pw);
  const hasRepeat = hasRepeatedChars(pw);
  const hasPattern = hasKeyboardRun || hasSeq || hasRepeat;
  checks.push({
    pass: !hasPattern,
    label: "No obvious keyboard/sequential/repeated patterns",
    detail: hasPattern
      ? "Patterns like \"qwerty\", \"1234\", or repeated characters are guessed early by cracking tools."
      : "No common patterns detected.",
  });
  if (hasPattern) score -= 20;

  score = Math.max(0, Math.min(100, score));
  return { score, checks, entropy: estimateEntropy(pw) };
}

function strengthLevel(score) {
  if (score >= 75) return { label: "Strong", className: "pw-strong" };
  if (score >= 45) return { label: "Moderate", className: "pw-moderate" };
  if (score > 0) return { label: "Weak", className: "pw-weak" };
  return { label: "Enter a password", className: "pw-empty" };
}

export default function PasswordChecker() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const { score, checks, entropy } = analyzePassword(pw);
  const level = strengthLevel(score);

  return (
    <section className="pw-checker">
      <h2>Password Strength Checker</h2>
      <p className="pw-checker-subtitle">
        Check how strong a password is before you use it. This runs entirely
        in your browser — your password is never sent anywhere or stored.
      </p>

      <div className="pw-input-row">
        <input
          type={show ? "text" : "password"}
          className="pw-checker-input"
          placeholder="Type a password to test..."
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="off"
        />
        <button type="button" className="pw-show-toggle" onClick={() => setShow((s) => !s)}>
          {show ? "Hide" : "Show"}
        </button>
      </div>

      <div className="pw-meter-track">
        <div className={`pw-meter-fill ${level.className}`} style={{ width: `${score}%` }} />
      </div>

      <div className={`pw-strength-label ${level.className}`}>
        {level.label}
        {pw.length > 0 && <span className="pw-entropy"> · ~{entropy} bits of entropy</span>}
      </div>

      {pw.length > 0 && (
        <ul className="pw-checklist">
          {checks.map((c) => (
            <li key={c.label} className={c.pass ? "pw-pass" : "pw-fail"}>
              <span className="pw-check-icon">{c.pass ? "\u2713" : "\u2715"}</span>
              <div>
                <strong>{c.label}</strong>
                <div className="pw-check-detail">{c.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}