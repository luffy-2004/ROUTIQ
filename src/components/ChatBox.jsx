import { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function sendMessage(msg) {
    if (!msg.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: msg }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { user: msg, bot: data.reply }
    ]);
  }

  return (
    <div>
      {/* Messages */}
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <p><strong>You:</strong> {m.user}</p>
            <p><strong>Bot:</strong> {m.bot}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />

      <button onClick={() => {
        sendMessage(input);
        setInput("");
      }}>
        Send
      </button>
    </div>
  );
}

export default ChatBox;