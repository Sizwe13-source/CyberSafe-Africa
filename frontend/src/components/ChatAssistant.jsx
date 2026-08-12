// src/components/ChatAssistant.jsx
//
// Floating "AI cybersecurity assistant" widget. Matches the app's existing
// dark theme (bg-[#090e20], rgba(255,255,255,0.1) borders, same style the
// Toaster in App.jsx already uses).
//
// Talks to your own backend at POST /api/chat — never calls an AI provider
// directly from the browser, since that would expose your API key. See
// server/chat.js for a matching Express route.

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I'm the CyberSafe assistant. Ask me about phishing, password safety, a suspicious message you received, identity theft, or your POPIA rights — I'll help you figure out what to do next.",
};

const SUGGESTIONS = [
  "I got a text saying my bank account is locked",
  "How do I create a strong password?",
  "Someone is using my ID number online, help",
  "What is POPIA and does it protect me?",
];

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "I couldn't form a reply — try the Scam Checker or Incident Report.",
        },
      ]);
    } catch (err) {
      toast.error("The assistant couldn't respond — please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong reaching the assistant on my end. Please try again in a moment — if it's urgent, use the Scam Checker or Report an Incident directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div
          className="mb-3 w-[22rem] max-w-[calc(100vw-2.5rem)] h-[32rem] max-h-[70vh] flex flex-col rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
          role="dialog"
          aria-label="CyberSafe AI assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1220]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15">
                <ShieldAlert className="h-4 w-4 text-cyan-300" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">CyberSafe Assistant</p>
                <p className="text-[11px] text-white/50 leading-tight">AI guidance, not a legal or emergency service</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-cyan-500/90 text-[#04121a] rounded-br-sm"
                      : "bg-white/5 text-white/90 border border-white/10 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl rounded-bl-sm bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="pt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs text-cyan-200/90 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 p-3 bg-[#0b1220]">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what's going on…"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[#04121a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-300 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close CyberSafe assistant" : "Open CyberSafe assistant"}
        className="flex items-center gap-2 rounded-full bg-cyan-400 text-[#04121a] pl-4 pr-5 py-3 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 transition-colors font-medium text-sm"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        {open ? "Close" : "Ask CyberSafe AI"}
      </button>
    </div>
  );
}