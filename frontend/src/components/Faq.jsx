// pages/FAQ.jsx
import { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

const faqData = [
  {
    question: "What should I do if I clicked on a phishing link?",
    answer:
      "Disconnect from the internet immediately, change your passwords from a different device, run a malware scan, and report the incident through our Report Incident page.",
  },
  {
    question: "How do I know if my email account has been hacked?",
    answer:
      "Watch for signs like emails you didn't send, password reset requests you didn't trigger, login alerts from unfamiliar locations, or contacts telling you they received strange messages from you.",
  },
  {
    question: "Is public Wi-Fi safe to use?",
    answer:
      "Public Wi-Fi is generally risky for sensitive activity like banking. If you must use it, avoid logging into sensitive accounts, or use a trusted VPN to encrypt your connection.",
  },
  {
    question: "How often should I change my passwords?",
    answer:
      "Rather than changing on a fixed schedule, use strong, unique passwords per account and change them immediately if a service reports a breach. A password manager makes this easy.",
  },
  {
    question: "What is two-factor authentication (2FA) and should I use it?",
    answer:
      "2FA adds a second verification step (like a code from your phone) beyond your password. Yes — enable it wherever offered, especially for email, banking, and social accounts.",
  },
  {
    question: "How do I report a cybercrime in South Africa?",
    answer:
      "You can report it directly through our Report Incident page, and depending on severity, also file a case with the South African Police Service (SAPS) Cybercrime Unit.",
  },
];

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="border border-cyan-400/20 rounded-lg overflow-hidden bg-white/5">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base font-medium text-white">
          {item.question}
        </span>

        <FiChevronDown
          className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-slate-300 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-cyan-400/10 p-2 rounded border border-cyan-400/30">
          <FiHelpCircle className="w-6 h-6 text-cyan-400" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
          Frequently Asked <span className="text-cyan-400">Questions</span>
        </h1>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => toggle(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default FAQ;