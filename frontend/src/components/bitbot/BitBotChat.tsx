import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BitBotProductCard from "./BitBotProductCard";
import BitBotCompareTable from "./BitBotCompareTable";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  compareProducts?: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  original_price?: number | null;
  currency: string;
  image_url?: string | null;
  condition: string;
  ram?: string | null;
  storage?: string | null;
  camera?: string | null;
  battery?: string | null;
  display_size?: string | null;
  processor?: string | null;
}

const QUICK_REPLIES = [
  "Best Camera Phone 2026",
  "Phones under 2000 AED",
  "Compare iPhone vs Samsung",
  "Best battery life phones",
  "Gaming phones",
];

const GREETING =
  "Welcome to BitStores! 👋 I'm **BitBot**, your AI Tech Assistant. I can help you find the perfect phone, compare devices, or pick accessories. What are you looking for today?";

function parseResponse(raw: string): {
  text: string;
  products: Product[];
  compareProducts: Product[];
} {
  let text = raw;
  let products: Product[] = [];
  let compareProducts: Product[] = [];

  const productMatch = raw.match(/\[PRODUCTS\]([\s\S]*?)\[\/PRODUCTS\]/);
  if (productMatch) {
    try {
      products = JSON.parse(productMatch[1]);
    } catch {}
    text = text.replace(/\[PRODUCTS\][\s\S]*?\[\/PRODUCTS\]/, "").trim();
  }

  const compareMatch = raw.match(/\[COMPARE\]([\s\S]*?)\[\/COMPARE\]/);
  if (compareMatch) {
    try {
      compareProducts = JSON.parse(compareMatch[1]);
    } catch {}
    text = text.replace(/\[COMPARE\][\s\S]*?\[\/COMPARE\]/, "").trim();
  }

  return { text, products, compareProducts };
}

const BitBotChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("bitbot-chat", {
        body: { message: text.trim(), history },
      });

      if (error) throw error;

      const { text: cleanText, products, compareProducts } = parseResponse(data.reply);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: cleanText,
        products: products.length > 0 ? products : undefined,
        compareProducts: compareProducts.length > 0 ? compareProducts : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("BitBot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = (product: Product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const next = [...prev, product];
      if (next.length === 2) {
        sendMessage(`Compare ${next[0].name} vs ${next[1].name}`);
        return [];
      }
      return next;
    });
  };

  const showQuickReplies = messages.length <= 1;

  return (
    <>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Product Cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.products.map((product) => (
                    <BitBotProductCard
                      key={product.id}
                      product={product}
                      onCompare={() => handleCompare(product)}
                      isComparing={!!compareList.find((p) => p.id === product.id)}
                    />
                  ))}
                </div>
              )}

              {/* Compare Table */}
              {msg.compareProducts && msg.compareProducts.length === 2 && (
                <div className="mt-3">
                  <BitBotCompareTable products={msg.compareProducts} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {showQuickReplies && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {compareList.length === 1 && (
          <div className="text-xs text-center text-primary animate-pulse">
            Select one more product to compare with <strong>{compareList[0].name}</strong>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BitBot anything..."
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
};

export default BitBotChat;
