
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot, LoaderCircle } from "lucide-react";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm the CampusConnect AI Assistant. Ask me anything!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const userMessage = message.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://campusconnect-backend-r9m6.onrender.com/api/chat",
        { message: userMessage }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: response.data.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm unable to respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(500px,70dvh)] w-[min(360px,calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6">
          <div className="flex items-center justify-between bg-blue-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h2 className="font-semibold">CampusConnect AI</h2>
                <p className="text-xs text-blue-100">
                  Your event assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-blue-600"
              aria-label="Close chatbot"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    item.role === "user"
                      ? "rounded-br-sm bg-blue-700 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-gray-500">
                  <LoaderCircle size={16} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t bg-white p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me something..."
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:scale-105 hover:bg-blue-800 sm:right-6"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
}

export default Chatbot;
