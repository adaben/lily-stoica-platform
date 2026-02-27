import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { apiAIChat, apiAIStatus, type AIMessage } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const WELCOME_MESSAGE: AIMessage = {
  role: "assistant",
  content:
    "Hello, I am Lily's virtual assistant. I can help you understand the services offered, answer questions about neurocoaching or hypnotherapy, or guide you towards booking a session. What would you like to know?",
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: apiAIStatus,
    retry: false,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!aiStatus?.enabled) return null;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: AIMessage = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await apiAIChat(trimmed);
      setMessages([...updated, { role: "assistant", content: res.message }]);
    } catch {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content:
            "I am sorry, I was not able to process that. Please try again or contact Lily directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] bg-white rounded-2xl shadow-xl border border-border/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Lily's Assistant</p>
                <p className="text-[10px] text-muted-foreground">
                  AI-powered guidance on services and bookings
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[360px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[260px] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-muted-foreground text-center mt-1.5">
              AI assistant. For urgent concerns, please contact Lily directly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
