import React, { useEffect, useRef, useState } from "react";

function Message({ sender, content }) {
  const isBot = sender === "bot";
  const senderClassName = isBot ? "text-purple-600" : "text-blue-500";

  return (
    <div className={`flex justify-${isBot ? "start" : "end"} mb-2 items-end`}>
      <div
        className={`max-w-md rounded-lg py-2 px-4 ${
          isBot ? "bg-purple-100 text-right" : "bg-blue-100 text-left"
        }`}
      >
        <p className={`text-sm ${senderClassName}`}>{content}</p>
      </div>
    </div>
  );
}
function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [header, setHeader] = useState("Ask a question");
  const chatContainerRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001/chat");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.sender === "bot") {
        switch (data.type) {
          case "start":
            setHeader("Computing answer...");
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "bot",
                content: "Chatbot: ",
              },
            ]);
            break;
          case "stream":
            setHeader("Chatbot is typing...");
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (data.message === "\n") {
                lastMessage.content += "<br>";
              } else {
                lastMessage.content += data.message;
              }
              return [...prevMessages];
            });
            break;
          case "info":
            setHeader(data.message);
            break;
          case "end":
            setHeader("Ask a question");
            break;
          case "error":
            setHeader("Ask a question");
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              lastMessage.content += data.message;
              return [...prevMessages];
            });
            break;
          default:
            break;
        }
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: data.sender,
            content: `You: ${data.message}`,
          },
        ]);
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  useEffect(() => {
    const chatContainer = chatContainerRef?.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="h-screen flex flex-col justify-end items-end p-4 space-y-4">
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
        onClick={toggleChat}
      >
        {isOpen ? "X" : "Chat"}
      </button>
      {isOpen && (
        <div
          className={`origin-bottom-right transition-transform duration-300 w-96 h-80 bg-white p-4 rounded-lg shadow-lg flex flex-col space-y-4 absolute bottom-16 right-4 overflow-hidden`}
        >
          <h2 className="text-xl font-semibold">{header}</h2>
          <div
            className="flex-1 bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto"
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <Message
                key={index}
                sender={message.sender}
                content={message.content}
              />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              className="rounded-lg border border-gray-300 p-2 w-full"
              placeholder="Type your message"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  handleSendMessage(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button
              className="bg-blue-500 text-white ml-2 px-4 py-2 rounded-lg"
              onClick={() => {
                const input = document.querySelector("input[type=text]");
                if (input.value) {
                  handleSendMessage(input.value);
                  input.value = "";
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
