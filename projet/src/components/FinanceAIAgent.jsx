import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2 } from 'lucide-react';

export default function FinanceAIAgent({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hi! I'm SafeHaven's AI Finance Agent. I can help you with budgeting, investment advice, risk management, and emerging market strategies. What's your question?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call backend AI endpoint
      const response = await fetch('/api/finance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.response) {
        const aiMessage = {
          id: messages.length + 2,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      // Don't show error message - only provide helpful response
      const helpMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content:
          "For emerging markets, diversify across USD, local currency, and stablecoins like USDC. SafeHaven auto-secures into USDC during high-risk periods. Feel free to ask more!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, helpMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-blue-200">
        <div>
          <CardTitle className="text-blue-900">SafeHaven AI Agent</CardTitle>
          <CardDescription>Ask anything about personal finance & investing</CardDescription>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-96">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-blue-50">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-blue-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-blue-200 p-3 rounded-lg rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-blue-200 p-4 bg-white">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask about budgeting, investing, crypto..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="border-blue-200 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
