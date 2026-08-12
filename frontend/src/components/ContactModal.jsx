// components/ContactModal.jsx
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { FiX, FiMail, FiSend, FiCheck } from "react-icons/fi";

const SERVICE_ID = "service_jojr7og";
const TEMPLATE_ID = "template_qn7wdvp";
const PUBLIC_KEY = "Ro7Aa8Iqr4-A1wSXy";

function ContactModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          to_email: "support@cybersafeafrica.org",
        },
        PUBLIC_KEY
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-md bg-[#0F0F1E] border border-cyan-400/30 rounded-xl shadow-xl p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-cyan-400/10 p-2 rounded border border-cyan-400/30">
            <FiMail className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white">
            Email us directly
          </h2>
        </div>

        {status === "sent" ? (
          <div className="text-center py-6">
            <FiCheck className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <p className="text-slate-300">
              Message sent! We'll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-cyan-400/20 rounded px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <input
              type="email"
              name="email"
              required
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-cyan-400/20 rounded px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <textarea
              name="message"
              required
              rows={4}
              placeholder="Your message"
              value={form.message}
              onChange={handleChange}
              className="w-full bg-white/5 border border-cyan-400/20 rounded px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />

            {status === "error" && (
              <p className="text-sm text-red-400">
                Something went wrong — please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#0F0F1E] font-medium rounded px-4 py-2 text-sm hover:bg-cyan-300 transition disabled:opacity-60"
            >
              {status === "sending" ? (
                "Sending..."
              ) : (
                <>
                  <FiSend className="w-4 h-4" /> Send message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactModal;