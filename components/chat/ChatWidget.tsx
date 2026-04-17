"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface Props {
  role: "STUDENT" | "PARENT";
}

const STUDENT_QUICK = [
  "I'm stuck 😕",
  "I got it! ✅",
  "Can you check? 👀",
  "Done! 🎉",
  "This is hard 😓",
  "I need help 🙋",
];

const PARENT_QUICK = [
  "Well done! 🏆",
  "Keep trying! 💪",
  "I'm proud of you ⭐",
  "You can do it! 🔥",
  "Take a break 😊",
  "Let's look together 📚",
];

export function ChatWidget({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async (markRead = false) => {
    try {
      const res = await fetch("/api/chat");
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
      if (!open) setUnread(data.unread ?? 0);
      if (markRead && data.unread > 0) {
        fetch("/api/chat/read", { method: "PATCH" });
        setUnread(0);
      }
    } catch {}
  }, [open]);

  // Poll — faster when open
  useEffect(() => {
    fetchMessages(open);
    const interval = setInterval(() => fetchMessages(open), open ? 3000 : 6000);
    pollRef.current = interval;
    return () => clearInterval(interval);
  }, [open, fetchMessages]);

  // Scroll to bottom when messages update and panel is open
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  // Mark read when opening
  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    fetch("/api/chat/read", { method: "PATCH" });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const send = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);
    setInput("");
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await fetchMessages(false);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const quickReplies = role === "STUDENT" ? STUDENT_QUICK : PARENT_QUICK;

  const isStudent = role === "STUDENT";
  const accentColor = isStudent ? "#CC0000" : "#FFD700";
  const accentBg = isStudent ? "bg-[#CC0000]" : "bg-[#FFD700]";
  const accentBorder = isStudent ? "border-[#CC0000]/40" : "border-[#FFD700]/40";
  const accentText = isStudent ? "text-white" : "text-black";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full ${accentBg} shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer`}
          style={{ boxShadow: `0 0 24px ${accentColor}60` }}
        >
          <MessageCircle className={`w-6 h-6 ${accentText}`} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-black rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl border ${accentBorder} bg-[#0d0d0d] shadow-2xl overflow-hidden`}
          style={{ maxHeight: "520px", boxShadow: `0 0 40px ${accentColor}30` }}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${accentBg}`}>
            <div className="flex items-center gap-2">
              <MessageCircle className={`w-4 h-4 ${accentText}`} />
              <span className={`font-bold text-sm ${accentText}`}>
                {isStudent ? "Message Dad 👨" : "Message Yousif ⚽"}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className={`${accentText} opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "200px", maxHeight: "300px" }}>
            {messages.length === 0 && (
              <div className="text-center text-white/30 text-sm py-8">
                <div className="text-3xl mb-2">💬</div>
                <div>{isStudent ? "Say hi to Dad!" : "Send Yousif a message!"}</div>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.senderRole === role;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? `${accentBg} ${accentText} rounded-br-sm`
                      : "bg-white/10 text-white rounded-bl-sm"
                  }`}>
                    <p className="leading-snug">{m.content}</p>
                    <p className={`text-xs mt-0.5 ${mine ? `${accentText} opacity-60` : "text-white/30"}`}>
                      {formatTime(m.createdAt)}
                      {mine && !m.readAt && <span className="ml-1">•</span>}
                      {mine && m.readAt && <span className="ml-1">✓</span>}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 pb-1 flex gap-1.5 flex-wrap">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={sending}
                className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white/90 transition-all cursor-pointer disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-white/10">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStudent ? "Type a message..." : "Type a message..."}
              className="flex-1 bg-[#1a1a1a] border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              style={{ color: "#ffffff", backgroundColor: "#1a1a1a" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || sending}
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg} disabled:opacity-30 hover:brightness-110 transition-all cursor-pointer flex-shrink-0`}
            >
              <Send className={`w-4 h-4 ${accentText}`} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
