import React, { useState } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function generateAnswer() {
    try {
      setIsLoading(true);
      // Add user message to chat
      setMessages(prev => [...prev, { type: 'user', content: questions }]);
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: questions }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;
      
      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      
      // Clear input after successful response
      setQuestions("");
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "Error generating response. Please try again.",
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (questions.trim() && !isLoading) {
        generateAnswer();
      }
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-3xl shadow-xl z-50 border-2 border-gray-200 flex flex-col max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-300 text-white">
            <h3 className="font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-purple-300 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === 'user' 
                    ? 'ml-auto max-w-[85%]' 
                    : 'mr-auto max-w-[85%]'
                }`}
              >
                <div
                  className={`rounded-3xl p-4 ${
                    message.type === 'user'
                      ? 'bg-green-100 rounded-br-lg'
                      : message.error
                      ? 'bg-red-100 text-red-600 rounded-bl-lg'
                      : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-3xl p-4">
                  <p className="text-sm text-gray-500">Generating response...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="flex-1 resize-none border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm min-h-[80px]"
              />
            </div>
            <button
              onClick={generateAnswer}
              disabled={isLoading || !questions.trim()}
              className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Toggle chat"
      >
        <FiMessageCircle className="w-6 h-6" />
      </button>
    </>
  );
};

export default FloatingChatButton;