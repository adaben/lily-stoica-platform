import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { apiAIChat, apiAIStatus, type AIMessage } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const WELCOME_MESSAGE: AIMessage = {
  role: "assistant",
  content:
    "Hello! I'm Lily's virtual assistant. I can help with questions about services, pricing, booking or how sessions work. What would you like to know?",
};

/**
 * Lightweight inline markdown → React nodes.
 * Handles: **bold**, *italic*, `code`, \n line breaks, - bullet lists.
 * No external library needed.
 */
function renderMarkdown(text: string) {
  // Split into paragraphs on double newlines
  const blocks = text.split(/\n{2,}/);
  const elements: React.ReactNode[] = [];

  const inlineFormat = (line: string, key: string): React.ReactNode => {
    // Process bold, italic, code spans
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let pi = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.slice(lastIdx, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={`${key}-b${pi}`} className="font-semibold">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={`${key}-i${pi}`}>{match[3]}</em>);
      } else if (match[4]) {
        parts.push(<code key={`${key}-c${pi}`} className="text-xs bg-black/5 rounded px-0.5">{match[4]}</code>);
      }
      lastIdx = match.index + match[0].length;
      pi++;
    }
    if (lastIdx < line.length) parts.push(line.slice(lastIdx));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  blocks.forEach((block, bi) => {
    const lines = block.split("\n");
    // Check if it's a bullet list
    const isList = lines.every(l => /^\s*[-•*]\s/.test(l) || l.trim() === "");
    if (isList) {
      const items = lines.filter(l => l.trim());
      elements.push(
        <ul key={`bl-${bi}`} className="list-disc list-inside space-y-0.5 my-1">
          {items.map((item, ii) => (
            <li key={ii} className="text-[13px]">{inlineFormat(item.replace(/^\s*[-•*]\s*/, ""), `${bi}-${ii}`)}</li>
          ))}
        </ul>
      );
    } else {
      // Regular paragraph — render with line breaks
      elements.push(
        <p key={`p-${bi}`} className="my-0.5">
          {lines.map((line, li) => (
            <span key={li}>
              {inlineFormat(line, `${bi}-${li}`)}
              {li < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    }
  });

  return elements;
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const rendered = useMemo(() => (isUser ? content : renderMarkdown(content)), [content, isUser]);
  return <>{rendered}</>;
}

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
            "I'm sorry, I wasn't able to process that. Please try again or contact Lily directly at hello@lilystoica.co.uk.",
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
                  Questions about services, pricing &amp; booking
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
                  <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
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
                placeholder="Ask about services, pricing..."
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
              AI assistant — for urgent concerns, call Samaritans 116 123 or NHS 111.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
